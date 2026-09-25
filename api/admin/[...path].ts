import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";

// ── Supabase admin client (lazy — avoids crash on local dev without env vars) ─
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
    // Clean up the URL if Vercel integration or user added /rest/v1/ to the end
    url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    
    if (!url || !key) throw new Error(`Supabase env vars missing. URL=${url ? "SET" : "EMPTY"} Key=${key ? "SET" : "EMPTY"}`);
    if (!url.startsWith("http")) throw new Error(`Supabase URL is invalid, must start with http. Value: '${url}'`);
    _supabase = createClient(url, key, { auth: { persistSession: false } });
  }
  return _supabase;
}
// Alias for cleaner usage
const supabase = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function json(res: VercelResponse, status: number, data: unknown) {
  res.status(status)
    .setHeader("X-Content-Type-Options", "nosniff")
    .setHeader("X-Frame-Options", "DENY")
    .json(data);
}

async function readBody(req: VercelRequest): Promise<Record<string, unknown>> {
  if (req.body) return req.body as Record<string, unknown>;
  return {};
}

function getSessionToken(req: VercelRequest): string | null {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/admin_session=([^;]+)/);
  return match ? match[1] : null;
}

async function validateSession(token: string | null): Promise<{ valid: boolean; user?: { id: string; username: string; role: string } }> {
  if (!token) return { valid: false };
  const { data } = await supabase
    .from("admin_sessions")
    .select("user_id, expires_at, admin_users(id, username, role, status)")
    .eq("session_token", token)
    .single();

  if (!data) return { valid: false };
  if (new Date(data.expires_at) < new Date()) return { valid: false };
  const user = Array.isArray(data.admin_users) ? data.admin_users[0] : data.admin_users as { id: string; username: string; role: string; status: string } | null;
  if (!user || user.status !== "active") return { valid: false };
  return { valid: true, user: { id: user.id, username: user.username, role: user.role } };
}

// Simple Argon2id-like hash using SHA-512 + salt (Vercel-safe, no native modules)
function hashPassword(password: string): string {
  const salt = randomUUID().replace(/-/g, "");
  const hash = createHash("sha512").update(salt + password + (process.env.ADMIN_PEPPER || "")).digest("hex");
  return `$sha512$v1$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (!stored.startsWith("$sha512$v1$")) {
    // Legacy argon2id stored hashes — reject and force re-setup
    return false;
  }
  const parts = stored.split("$");
  const salt = parts[3];
  const expected = createHash("sha512").update(salt + password + (process.env.ADMIN_PEPPER || "")).digest("hex");
  return parts[4] === expected;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") { return res.status(200).end(); }

  const url = req.url || "";
  // Vercel catch-all: req.query.path is an array like ["setup"] or ["login"]
  // Fallback to URL parsing for local dev
  const pathSegments = req.query?.path;
  let route = "";
  if (Array.isArray(pathSegments)) {
    route = pathSegments.join("/");
  } else if (typeof pathSegments === "string") {
    route = pathSegments;
  } else {
    route = url.replace(/^\/api\/admin\/?/, "").split("?")[0];
  }

  // ── /api/admin/status ────────────────────────────────────────────────────
  if (route === "status" || route === "") {
    const token = getSessionToken(req);
    const session = await validateSession(token);
    return json(res, 200, { authenticated: session.valid, user: session.user || null });
  }

  // ── /api/admin/setup ─────────────────────────────────────────────────────
  if (route === "setup" && req.method === "POST") {
    try {
      const { data: existing, error: checkErr } = await supabase.from("admin_users").select("id").limit(1);
      if (checkErr) {
        // Log the exact URL being used (without the key) so we can see what's wrong with it
        const urlValue = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_FOUND";
        return json(res, 500, { error: `DB check failed: ${checkErr.message}. (URL used: ${urlValue})` });
      }
      if (existing && existing.length > 0) {
        return json(res, 409, { error: "Admin already configured." });
      }
      const body = await readBody(req);
      const { username, passcode } = body as { username?: string; passcode?: string };
      if (!username || !passcode || String(passcode).length < 8) {
        return json(res, 400, { error: "Username and passcode (min 8 chars) required." });
      }
      const hash = hashPassword(String(passcode));
      const now = new Date().toISOString();
      const { error } = await supabase.from("admin_users").insert({
        id: randomUUID(), username: String(username), password_hash: hash,
        role: "SUPER_ADMIN", status: "active", created_at: now, updated_at: now
      });
      if (error) return json(res, 500, { error: `Failed to create admin: ${error.message} (code: ${error.code})` });
      return json(res, 201, { success: true });
    } catch (setupErr: unknown) {
      const msg = setupErr instanceof Error ? setupErr.message : String(setupErr);
      return json(res, 500, { error: `Setup exception: ${msg}` });
    }
  }

  // ── /api/admin/login ─────────────────────────────────────────────────────
  if (route === "login" && req.method === "POST") {
    const body = await readBody(req);
    const { username, passcode } = body as { username?: string; passcode?: string };
    if (!username || !passcode) return json(res, 400, { error: "Username and passcode required." });

    const { data: user } = await supabase
      .from("admin_users")
      .select("id, username, role, password_hash, status")
      .eq("username", String(username))
      .single();

    if (!user || !verifyPassword(String(passcode), user.password_hash)) {
      return json(res, 401, { error: "Invalid credentials." });
    }
    if (user.status !== "active") return json(res, 403, { error: "Account disabled." });

    const token = randomUUID() + "-" + randomUUID();
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    await supabase.from("admin_sessions").insert({
      id: randomUUID(), user_id: user.id, session_token: token,
      ip_address: req.headers["x-forwarded-for"] as string || "unknown",
      user_agent: req.headers["user-agent"] || "unknown", expires_at: expires,
      created_at: new Date().toISOString()
    });
    await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);

    res.setHeader("Set-Cookie", `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);
    return json(res, 200, { success: true, user: { id: user.id, username: user.username, role: user.role } });
  }

  // ── /api/admin/logout ────────────────────────────────────────────────────
  if (route === "logout" && req.method === "POST") {
    const token = getSessionToken(req);
    if (token) await supabase.from("admin_sessions").delete().eq("session_token", token);
    res.setHeader("Set-Cookie", "admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
    return json(res, 200, { success: true });
  }

  // ── All routes below require auth ─────────────────────────────────────────
  const token = getSessionToken(req);
  const session = await validateSession(token);
  if (!session.valid) return json(res, 401, { error: "Unauthorized." });

  // ── /api/admin/dashboard-stats ────────────────────────────────────────────
  if (route === "dashboard-stats") {
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 86400000).toISOString();
    const [views, msgs, proj, exp] = await Promise.all([
      supabase.from("analytics_events").select("id", { count: "exact", head: true }).gte("timestamp", d7),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "UNREAD"),
      supabase.from("portfolio_projects").select("id", { count: "exact", head: true }).eq("status", "published").eq("is_deleted", false),
      supabase.from("portfolio_experience").select("id", { count: "exact", head: true }).eq("status", "published"),
    ]);
    return json(res, 200, {
      visitors7d: views.count || 0,
      unreadMessages: msgs.count || 0,
      publishedProjects: proj.count || 0,
      publishedExperience: exp.count || 0,
    });
  }

  // ── /api/admin/analytics ──────────────────────────────────────────────────
  if (route === "analytics") {
    const days = parseInt(String(req.query?.days || "7"));
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data: events } = await supabase
      .from("analytics_events")
      .select("event_type, page_path, device_type, timestamp")
      .gte("timestamp", since)
      .order("timestamp", { ascending: true });

    const byDay: Record<string, number> = {};
    const byPage: Record<string, number> = {};
    const byDevice: Record<string, number> = {};
    for (const e of events || []) {
      const day = e.timestamp.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
      byPage[e.page_path] = (byPage[e.page_path] || 0) + 1;
      byDevice[e.device_type || "Unknown"] = (byDevice[e.device_type || "Unknown"] || 0) + 1;
    }
    return json(res, 200, { totalViews: events?.length || 0, byDay, byPage, byDevice });
  }

  // ── /api/admin/analytics/track (POST - public) ────────────────────────────
  if (route === "analytics/track" && req.method === "POST") {
    const body = await readBody(req);
    await supabase.from("analytics_events").insert({
      id: randomUUID(),
      event_type: String(body.type || "pageview"),
      page_path: String(body.path || "/"),
      referrer: String(body.referrer || ""),
      device_type: String(body.device || "Desktop"),
      timestamp: new Date().toISOString()
    });
    return json(res, 200, { success: true });
  }

  // ── /api/admin/content (GET/POST/PUT/DELETE) ──────────────────────────────
  if (route.startsWith("content")) {
    const table = String(req.query?.table || "");
    const tableMap: Record<string, string> = {
      home: "portfolio_home", about: "portfolio_about", education: "portfolio_education",
      experience: "portfolio_experience", skills: "portfolio_skills",
      projects: "portfolio_projects", socials: "portfolio_socials",
      resume: "resume_metadata", contact: "contact_messages"
    };
    const dbTable = tableMap[table];
    if (!dbTable) return json(res, 400, { error: "Unknown table." });

    if (req.method === "GET") {
      const { data, error } = await supabase.from(dbTable).select("*").order("display_order", { ascending: true, nullsFirst: false });
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { data });
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      const { data, error } = await supabase.from(dbTable).insert({ id: randomUUID(), ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select().single();
      if (error) return json(res, 500, { error: error.message });
      return json(res, 201, { data });
    }
    if (req.method === "PUT") {
      const id = String(req.query?.id || "");
      const body = await readBody(req);
      const { data, error } = await supabase.from(dbTable).update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).select().single();
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { data });
    }
    if (req.method === "DELETE") {
      const id = String(req.query?.id || "");
      const { error } = await supabase.from(dbTable).delete().eq("id", id);
      if (error) return json(res, 500, { error: error.message });
      return json(res, 200, { success: true });
    }
  }

  // ── /api/admin/messages ───────────────────────────────────────────────────
  if (route === "messages") {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    return json(res, 200, { messages: data || [] });
  }

  // ── /api/admin/activity-logs ──────────────────────────────────────────────
  if (route === "activity-logs") {
    const { data } = await supabase.from("activity_logs").select("*").order("timestamp", { ascending: false }).limit(100);
    return json(res, 200, { logs: data || [] });
  }

  return json(res, 404, { error: "Not found." });
}
