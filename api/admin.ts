import type { IncomingMessage, ServerResponse } from "node:http";
import { 
  verifyPasscode, 
  verifyRecoveryCode, 
  verifyAdminToken,
  getPortfolioContent,
  savePortfolioContent,
  getHeartCount,
  incrementHeartCount
} from "../src/server/adminHandler.js";

export async function handleAdminRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader("Content-Type", "application/json");

  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  // PulseHeart endpoint: GET current heart count or POST to increment (1 vote per user)
  if (pathname.includes("/heart")) {
    if (req.method === "GET") {
      res.statusCode = 200;
      res.end(JSON.stringify({ count: getHeartCount() }));
      return;
    }
    if (req.method === "POST") {
      const updated = incrementHeartCount();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, count: updated }));
      return;
    }
  }

  // Content endpoint GET (Public or Admin read)
  if (req.method === "GET" && pathname.includes("/content")) {
    const data = getPortfolioContent();
    res.statusCode = 200;
    res.end(JSON.stringify(data));
    return;
  }

  // Session check
  if (req.method === "GET") {
    const isValid = verifyAdminToken(token);
    if (isValid) {
      res.statusCode = 200;
      res.end(JSON.stringify({ 
        authenticated: true, 
        user: { name: "Sudarshan Chand", role: "Administrator" } 
      }));
    } else {
      res.statusCode = 401;
      res.end(JSON.stringify({ authenticated: false, error: "Unauthorized" }));
    }
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ success: false, error: "Method not allowed." }));
    return;
  }

  let rawBody = "";
  try {
    for await (const chunk of req) {
      rawBody += chunk;
      if (rawBody.length > 500000) { // 500KB limit for full content
        res.statusCode = 413;
        res.end(JSON.stringify({ success: false, error: "Payload too large." }));
        return;
      }
    }

    let body: any = {};
    if (rawBody.trim()) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, error: "Invalid JSON format." }));
        return;
      }
    }

    // Save portfolio content (Only authenticated admin can modify)
    if (pathname.includes("/content")) {
      const isAuth = verifyAdminToken(token);
      // Allow saving in local dev or if valid token
      const isLocalDev = process.env.NODE_ENV !== "production";
      if (!isAuth && !isLocalDev) {
        res.statusCode = 403;
        res.end(JSON.stringify({ success: false, error: "Forbidden. Admin authorization required." }));
        return;
      }

      const saved = savePortfolioContent(body);
      if (saved) {
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: "Portfolio content updated successfully." }));
      } else {
        res.statusCode = 500;
        res.end(JSON.stringify({ success: false, error: "Failed to persist content." }));
      }
      return;
    }

    // Check verification action
    if (pathname.includes("/verify") || body.code || body.recoveryCode) {
      let result;
      if (body.recoveryCode) {
        result = verifyRecoveryCode(body.recoveryCode);
      } else {
        result = verifyPasscode(body.code);
      }

      if (result.success) {
        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } else {
        res.statusCode = 401;
        res.end(JSON.stringify(result));
      }
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ success: false, error: "Endpoint not found." }));
  } catch (err) {
    console.error("Admin handler error:", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: "Internal server error." }));
  }
}

export default handleAdminRequest;
