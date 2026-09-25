import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { validateContactForm, sendContactEmail } from "../src/server/contactHandler.js";

// Lazy Supabase client — only created when actually needed (avoids crash on local dev)
let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
    if (url && key) {
      _supabase = createClient(url, key, { auth: { persistSession: false } });
    }
  }
  return _supabase;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  try {
    const body = req.body || {};
    const validation = validateContactForm(body);
    if (!validation.valid || !validation.sanitized) {
      return res.status(400).json({ success: false, error: validation.error || "Validation failed." });
    }

    const result = await sendContactEmail(validation.sanitized);

    // Persist message to Supabase (non-blocking)
    try {
      const sb = getSupabase();
      if (sb) {
        const ip = (req.headers["x-forwarded-for"] as string || "").split(",")[0] || "unknown";
        await sb.from("contact_messages").insert({
          id: randomUUID(),
          name: validation.sanitized.name,
          email: validation.sanitized.email,
          message: validation.sanitized.message,
          status: "UNREAD",
          ip_address: ip,
          created_at: new Date().toISOString()
        });
      }
    } catch (dbErr) {
      console.error("Failed to persist contact message:", dbErr);
    }

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error || "Unable to send message." });
    }

    return res.status(200).json({ success: true, message: "Message sent successfully ✓" });
  } catch (err) {
    console.error("Contact handler error:", err);
    return res.status(500).json({ success: false, error: "Unable to send message. Please try again." });
  }
}

// Also export for local dev use in vite.config.ts middleware
export async function handleContactRequest(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) {
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ success: false, error: "Method not allowed." }));
    return;
  }
  let rawBody = "";
  for await (const chunk of req) {
    rawBody += chunk;
    if (rawBody.length > 50000) { res.statusCode = 413; res.end(JSON.stringify({ success: false, error: "Payload too large." })); return; }
  }
  try {
    const body = JSON.parse(rawBody);
    const validation = validateContactForm(body);
    if (!validation.valid || !validation.sanitized) { res.statusCode = 400; res.end(JSON.stringify({ success: false, error: validation.error })); return; }
    const result = await sendContactEmail(validation.sanitized);
    res.statusCode = result.success ? 200 : 500;
    res.end(JSON.stringify(result.success ? { success: true } : { success: false, error: result.error }));
  } catch { res.statusCode = 500; res.end(JSON.stringify({ success: false, error: "Server error." })); }
}
