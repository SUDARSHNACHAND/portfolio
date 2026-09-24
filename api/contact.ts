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
