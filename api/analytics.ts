import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

const supabase = createClient(url, key, { auth: { persistSession: false } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    await supabase.from("analytics_events").insert({
      id: randomUUID(),
      event_type: String(body.type || "pageview"),
      page_path: String(body.path || "/"),
      referrer: String(body.referrer || ""),
      device_type: String(body.device || "Desktop"),
      browser: req.headers["user-agent"] || "",
      session_id: String(body.session || ""),
      timestamp: new Date().toISOString()
    });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to track event" });
  }
}
