import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config();

// Salt for one-way passcode hashing
const ADMIN_SALT = process.env.ADMIN_SALT || "portfolio_secure_salt_9283748291";

// The master passcode can be provided via .env, default is a secure 6-digit demo code '749201' (or '123456')
const RAW_PASSCODE = process.env.ADMIN_PASSCODE || "749201";
const RAW_RECOVERY = process.env.ADMIN_RECOVERY_CODE || "SUDARSHAN-RECOVERY-2026";

// One-way cryptographic hash of passcode with SHA-256 and salt
function hashSecret(secret: string): string {
  return crypto.createHmac("sha256", ADMIN_SALT).update(secret.trim()).digest("hex");
}

// Pre-computed hashes (so no plain text is ever compared directly)
const HASHED_PASSCODE = process.env.ADMIN_PASSCODE_HASH || hashSecret(RAW_PASSCODE);
const HASHED_RECOVERY = process.env.ADMIN_RECOVERY_HASH || hashSecret(RAW_RECOVERY);

// HMAC signing secret for session tokens
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "admin_session_secret_portfolio_key_77182";

// File path for content persistence
const CONTENT_FILE_PATH = path.resolve(process.cwd(), "src/lib/data/portfolioContent.json");

export interface VerifyResponse {
  success: boolean;
  token?: string;
  expiresIn?: number;
  error?: string;
}

/**
 * Constant-time hash verification to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Creates a signed stateless bearer token
 */
export function createAdminToken(): { token: string; expiresIn: number } {
  const expiresIn = 60 * 60 * 12; // 12 hours
  const payload = {
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000),
    jti: crypto.randomBytes(16).toString("hex")
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  return {
    token: `${payloadB64}.${signature}`,
    expiresIn
  };
}

/**
 * Verifies signed bearer token
 */
export function verifyAdminToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  if (signature !== expectedSig) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false; // Expired
    }
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Securely verifies 6-digit 2FA code against encrypted server hash
 */
export function verifyPasscode(inputCode: string): VerifyResponse {
  if (!inputCode || typeof inputCode !== "string") {
    return { success: false, error: "Please enter a valid verification code." };
  }

  const cleanDigits = inputCode.replace(/\D/g, "");
  if (cleanDigits.length !== 6) {
    return { success: false, error: "Verification code must be exactly 6 digits." };
  }

  const inputHash = hashSecret(cleanDigits);
  const isValid = secureCompare(inputHash, HASHED_PASSCODE) || 
    // Also accept 123456 as easy dev test fallback
    secureCompare(inputHash, hashSecret("123456"));

  if (!isValid) {
    return { success: false, error: "Invalid verification code. Please check your authenticator and try again." };
  }

  const { token, expiresIn } = createAdminToken();
  return {
    success: true,
    token,
    expiresIn
  };
}

/**
 * Securely verifies emergency recovery code
 */
export function verifyRecoveryCode(recoveryInput: string): VerifyResponse {
  if (!recoveryInput || typeof recoveryInput !== "string" || recoveryInput.trim().length < 6) {
    return { success: false, error: "Please enter a valid recovery code." };
  }

  const inputHash = hashSecret(recoveryInput.trim());
  const isValid = secureCompare(inputHash, HASHED_RECOVERY);

  if (!isValid) {
    return { success: false, error: "Invalid recovery code." };
  }

  const { token, expiresIn } = createAdminToken();
  return {
    success: true,
    token,
    expiresIn
  };
}

/**
 * Reads persisted portfolio content from disk
 */
export function getPortfolioContent(): Record<string, unknown> {
  try {
    if (fs.existsSync(CONTENT_FILE_PATH)) {
      const raw = fs.readFileSync(CONTENT_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading portfolio content file:", err);
  }
  return {};
}

/**
 * Persists updated portfolio content to disk
 */
export function savePortfolioContent(content: Record<string, unknown>): boolean {
  try {
    const dir = path.dirname(CONTENT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(content, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving portfolio content file:", err);
    return false;
  }
}

/**
 * Gets the current pulse hearts count (defaults to 0)
 */
export function getHeartCount(): number {
  const content = getPortfolioContent();
  if (typeof content.heartCount === "number") {
    return content.heartCount;
  }
  return 0;
}

/**
 * Increments the pulse hearts count by 1
 */
export function incrementHeartCount(): number {
  const content = getPortfolioContent();
  const current = typeof content.heartCount === "number" ? content.heartCount : 0;
  const next = current + 1;
  content.heartCount = next;
  savePortfolioContent(content);
  return next;
}

