import { argon2id } from "hash-wasm";
import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { db } from "./db.js";

export interface AdminUser {
  id: string;
  username: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
  status: "active" | "disabled";
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface AuthenticatedSession {
  sessionId: string;
  user: AdminUser;
  expiresAt: string;
}

// ========================================================
// 1. ARGON2ID SECURE PASSWORD HASHING
// ========================================================

/**
 * Computes an RFC 9106 compliant Argon2id password hash string.
 * Format: $argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>
 */
export async function hashPasswordArgon2id(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const hashString = await argon2id({
    password,
    salt,
    iterations: 3,
    memorySize: 65536, // 64 MB
    parallelism: 1,
    hashLength: 32,
    outputType: "encoded"
  });

  return hashString;
}

/**
 * Verifies a plaintext password against an Argon2id encoded string.
 * Never stores or leaks plaintext passcodes.
 */
export async function verifyPasswordArgon2id(password: string, encodedHash: string): Promise<boolean> {
  try {
    if (!encodedHash || !encodedHash.startsWith("$argon2id$")) {
      return false;
    }

    const parts = encodedHash.split("$");
    if (parts.length < 6) return false;

    // parts[2]: v=19
    // parts[3]: m=...,t=...,p=...
    // parts[4]: salt base64
    // parts[5]: hash base64
    const rawParams = parts[3].split(",");
    const paramsMap: Record<string, number> = {};
    for (const p of rawParams) {
      const [k, v] = p.split("=");
      paramsMap[k] = parseInt(v, 10);
    }

    const memorySize = paramsMap.m || 65536;
    const iterations = paramsMap.t || 3;
    const parallelism = paramsMap.p || 1;

    // Decode salt from base64
    const saltBuf = Buffer.from(parts[4], "base64");

    const recomputed = await argon2id({
      password,
      salt: saltBuf,
      iterations,
      memorySize,
      parallelism,
      hashLength: 32,
      outputType: "encoded"
    });

    // Constant-time comparison to prevent timing side-channel attacks
    const bufA = Buffer.from(encodedHash);
    const bufB = Buffer.from(recomputed);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    console.error("Argon2id verification error:", err);
    return false;
  }
}

// ========================================================
// 2. RATE LIMITING & BRUTE FORCE PROTECTION
// ========================================================

interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    const remaining = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: remaining };
  }

  // Reset if window passed
  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    const remaining = Math.ceil(LOCKOUT_MS / 1000);
    return { allowed: false, retryAfterSeconds: remaining };
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { attempts: 1, firstAttempt: now });
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }
}

export function resetFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// ========================================================
// 3. SECURE SESSION MANAGEMENT (HTTP-ONLY COOKIES)
// ========================================================

const COOKIE_NAME = "portfolio_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export function createSession(userId: string, ip: string, userAgent: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString();

  db.prepare(`
    INSERT INTO admin_sessions (id, user_id, session_token, ip_address, user_agent, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, token, ip, userAgent, expiresAt, now.toISOString());

  // Update user's last_login_at
  db.prepare("UPDATE admin_users SET last_login_at = ? WHERE id = ?").run(now.toISOString(), userId);

  return token;
}

export function validateSession(token: string): AuthenticatedSession | null {
  if (!token || token.length < 32) return null;

  const now = new Date().toISOString();
  const row = db.prepare(`
    SELECT s.id as session_id, s.expires_at,
           u.id as user_id, u.username, u.role, u.status, u.created_at, u.updated_at, u.last_login_at
    FROM admin_sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.session_token = ? AND s.expires_at > ? AND u.status = 'active'
  `).get(token, now) as {
    session_id: string;
    expires_at: string;
    user_id: string;
    username: string;
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER";
    status: "active" | "disabled";
    created_at: string;
    updated_at: string;
    last_login_at?: string;
  } | undefined;

  if (!row) return null;

  return {
    sessionId: row.session_id,
    expiresAt: row.expires_at,
    user: {
      id: row.user_id,
      username: row.username,
      role: row.role,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      last_login_at: row.last_login_at
    }
  };
}

export function revokeSession(token: string): void {
  db.prepare("DELETE FROM admin_sessions WHERE session_token = ?").run(token);
}

export function revokeAllUserSessions(userId: string): void {
  db.prepare("DELETE FROM admin_sessions WHERE user_id = ?").run(userId);
}

// ========================================================
// 4. COOKIE HANDLING
// ========================================================

export function getSessionTokenFromRequest(req: IncomingMessage): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${COOKIE_NAME}=`)) {
      return cookie.slice(COOKIE_NAME.length + 1);
    }
  }
  return null;
}

export function setSessionCookie(res: ServerResponse, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  const flags = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    "HttpOnly",
    "SameSite=Lax",
    isProd ? "Secure" : ""
  ].filter(Boolean).join("; ");

  res.setHeader("Set-Cookie", flags);
}

export function clearSessionCookie(res: ServerResponse): void {
  const flags = `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
  res.setHeader("Set-Cookie", flags);
}

// ========================================================
// 5. SECURITY AUDIT LOGGING
// ========================================================

export function logActivity(
  action: string,
  resource: string,
  userId: string | null = null,
  resourceId: string | null = null,
  success: boolean = true,
  metadata: Record<string, unknown> = {}
): void {
  try {
    // Sanitization: NEVER log passwords, hashes, tokens, keys
    const safeMeta = { ...metadata };
    delete safeMeta.password;
    delete safeMeta.passcode;
    delete safeMeta.password_hash;
    delete safeMeta.token;
    delete safeMeta.session_token;
    delete safeMeta.secret;

    const id = crypto.randomUUID();
    const ts = new Date().toISOString();

    db.prepare(`
      INSERT INTO activity_logs (id, user_id, action, resource, resource_id, success, metadata, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, action, resource, resourceId, success ? 1 : 0, JSON.stringify(safeMeta), ts);
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}
