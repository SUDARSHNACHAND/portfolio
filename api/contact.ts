import type { IncomingMessage, ServerResponse } from "node:http";
import { validateContactForm, sendContactEmail } from "../src/server/contactHandler.js";

export async function handleContactRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ success: false, error: "Method not allowed. Only POST is supported." }));
    return;
  }

  let rawBody = "";
  try {
    for await (const chunk of req) {
      rawBody += chunk;
      // Max 50KB limit
      if (rawBody.length > 50000) {
        res.statusCode = 413;
        res.end(JSON.stringify({ success: false, error: "Payload too large." }));
        return;
      }
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ success: false, error: "Invalid JSON format." }));
      return;
    }

    const validation = validateContactForm(parsed);
    if (!validation.valid || !validation.sanitized) {
      res.statusCode = 400;
      res.end(JSON.stringify({ success: false, error: validation.error || "Validation failed." }));
      return;
    }

    const result = await sendContactEmail(validation.sanitized);

    // Persist to contact_messages database table
    try {
      const { db } = await import("../src/server/db.js");
      const { logActivity } = await import("../src/server/auth.js");
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const ip = (typeof req.headers["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"].split(",")[0] : req.socket.remoteAddress) || "127.0.0.1";

      db.prepare(`
        INSERT INTO contact_messages (id, name, email, message, status, ip_address, created_at)
        VALUES (?, ?, ?, ?, 'UNREAD', ?, ?)
      `).run(id, validation.sanitized.name, validation.sanitized.email, validation.sanitized.message, ip, now);

      logActivity("New Contact Message Received", "contact_messages", null, id, true, {
        name: validation.sanitized.name,
        email: validation.sanitized.email
      });
    } catch (dbErr) {
      console.error("Failed to persist message to database:", dbErr);
    }

    if (!result.success) {
      res.statusCode = 500;
      res.end(JSON.stringify({ success: false, error: result.error || "Unable to send message. Please try again." }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, message: "Message sent successfully ✓" }));
  } catch (err) {
    console.error("Contact handler error:", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: "Unable to send message. Please try again." }));
  }
}

export default handleContactRequest;
