import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: ContactFormData;
}

export function validateContactForm(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request payload." };
  }

  const { name, email, message } = body as Record<string, unknown>;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { valid: false, error: "Please enter a valid name (at least 2 characters)." };
  }
  if (name.trim().length > 100) {
    return { valid: false, error: "Name is too long (maximum 100 characters)." };
  }

  if (!email || typeof email !== "string") {
    return { valid: false, error: "Please enter your email address." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim()) || email.trim().length > 150) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  if (!message || typeof message !== "string" || message.trim().length < 5) {
    return { valid: false, error: "Please enter a message (at least 5 characters)." };
  }
  if (message.trim().length > 3000) {
    return { valid: false, error: "Message is too long (maximum 3000 characters)." };
  }

  return {
    valid: true,
    sanitized: {
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    }
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendContactEmail(data: ContactFormData): Promise<{ success: boolean; error?: string }> {
  // Reload latest env settings
  dotenv.config();

  const recipient = process.env.CONTACT_EMAIL_TO || "sudarshnachandms@gmail.com";
  const now = new Date();
  const timestamp = now.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long"
  });

  const subject = `New Portfolio Contact from ${data.name}`;

  const textBody = `New Portfolio Contact\n\nName: ${data.name}\nEmail: ${data.email}\nMessage:\n${data.message}\n\nReceived: ${timestamp}`;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #14110e; color: #f3f4f6; margin: 0; padding: 24px; }
    .card { background-color: #1c1713; border: 1px solid rgba(255, 140, 0, 0.25); border-radius: 12px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #241c16 0%, #17120e 100%); padding: 24px; border-bottom: 1px solid rgba(255, 140, 0, 0.2); }
    .tag { font-family: monospace; font-size: 11px; letter-spacing: 0.2em; color: #ff8c00; text-transform: uppercase; font-weight: bold; margin-bottom: 6px; }
    .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0; }
    .content { padding: 24px; }
    .field { margin-bottom: 18px; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 4px; }
    .value { font-size: 15px; color: #f9fafb; word-break: break-word; }
    .message-box { background-color: #120e0b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 16px; margin-top: 6px; font-size: 14px; line-height: 1.6; color: #e5e7eb; white-space: pre-wrap; }
    .footer { padding: 18px 24px; background-color: #120e0b; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="tag">PORTFOLIO NOTIFICATION</div>
      <h2 class="title">New Portfolio Contact</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name</div>
        <div class="value"><strong>${escapeHtml(data.name)}</strong></div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${escapeHtml(data.email)}" style="color: #ff8c00; text-decoration: none;">${escapeHtml(data.email)}</a></div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="message-box">${escapeHtml(data.message)}</div>
      </div>
      <div class="field" style="margin-bottom: 0;">
        <div class="label">Received</div>
        <div class="value" style="font-size: 13px; color: #9ca3af;">${escapeHtml(timestamp)}</div>
      </div>
    </div>
    <div class="footer">
      You can reply directly to this email to respond to ${escapeHtml(data.name)}.
    </div>
  </div>
</body>
</html>
  `;

  // 1. Resend API support (if configured)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.CONTACT_EMAIL_FROM || "onboarding@resend.dev";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [recipient],
          reply_to: data.email,
          subject,
          text: textBody,
          html: htmlBody
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Resend API error:", errorText);
        return { success: false, error: "Unable to send message via email provider." };
      }

      return { success: true };
    } catch (err) {
      console.error("Resend network error:", err);
      return { success: false, error: "Unable to send message. Please try again." };
    }
  }

  // 2. Web3Forms REST API support (if configured)
  const web3FormsKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (web3FormsKey) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: web3FormsKey,
          name: data.name,
          email: data.email,
          message: data.message,
          subject,
          from_name: "Portfolio Contact",
          replyto: data.email
        })
      });

      const resData = await res.json() as { success?: boolean; message?: string };
      if (res.ok && resData.success) {
        return { success: true };
      }

      console.error("Web3Forms error:", resData);
      return { success: false, error: resData.message || "Unable to send message via Web3Forms." };
    } catch (err) {
      console.error("Web3Forms network error:", err);
      return { success: false, error: "Unable to send message. Please try again." };
    }
  }

  // 3. Nodemailer SMTP support
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass) {
    console.warn("⚠️ Email service not configured in .env (Provide RESEND_API_KEY, WEB3FORMS_ACCESS_KEY, or SMTP credentials).");
    console.log("📨 Message received from visitor:", {
      name: data.name,
      email: data.email,
      message: data.message,
      timestamp
    });
    return {
      success: false,
      error: "Email service is not yet configured. Please configure RESEND_API_KEY, WEB3FORMS_ACCESS_KEY, or SMTP in your .env file."
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });

    const fromAddress = process.env.CONTACT_EMAIL_FROM || `"Portfolio Contact" <${user}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      replyTo: data.email,
      subject,
      text: textBody,
      html: htmlBody
    });

    return { success: true };
  } catch (err) {
    console.error("Nodemailer delivery error:", err);
    return {
      success: false,
      error: "Unable to send message. Please check SMTP settings."
    };
  }
}
