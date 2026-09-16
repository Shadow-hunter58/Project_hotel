import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

async function handleSmsApi(request: Request, env: unknown): Promise<Response> {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      phone?: string;
      message?: string;
      reference?: string;
      guestName?: string;
    };
    const phone = body.phone?.trim();
    const message = body.message?.trim();
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing phone or message" }),
        { status: 400, headers: { "content-type": "application/json" } },
      );
    }

    const envMap = (env as Record<string, string> | undefined) ?? {};
    const fast2smsKey =
      envMap["FAST2SMS_API_KEY"] ||
      (typeof process !== "undefined" && process.env ? process.env["FAST2SMS_API_KEY"] : undefined);
    const twilioSid =
      envMap["TWILIO_ACCOUNT_SID"] ||
      (typeof process !== "undefined" && process.env ? process.env["TWILIO_ACCOUNT_SID"] : undefined);
    const twilioToken =
      envMap["TWILIO_AUTH_TOKEN"] ||
      (typeof process !== "undefined" && process.env ? process.env["TWILIO_AUTH_TOKEN"] : undefined);
    const twilioFrom =
      envMap["TWILIO_PHONE_NUMBER"] ||
      (typeof process !== "undefined" && process.env ? process.env["TWILIO_PHONE_NUMBER"] : undefined);
    const gatewayUrl =
      envMap["SMS_GATEWAY_URL"] ||
      (typeof process !== "undefined" && process.env ? process.env["SMS_GATEWAY_URL"] : undefined);

    // 1. Fast2SMS (Quick SMS route for India)
    if (fast2smsKey) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message,
          language: "english",
          flash: 0,
          numbers: cleanPhone,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { return?: boolean; message?: string[] };
      if (res.ok && data.return === true) {
        return new Response(
          JSON.stringify({
            success: true,
            provider: "Fast2SMS",
            message: `SMS successfully sent to +91 ${cleanPhone}`,
          }),
          { headers: { "content-type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          success: false,
          provider: "Fast2SMS",
          message: Array.isArray(data.message) ? data.message.join(", ") : "Fast2SMS gateway rejected request",
        }),
        { headers: { "content-type": "application/json" } },
      );
    }

    // 2. Twilio SMS
    if (twilioSid && twilioToken && twilioFrom) {
      let targetPhone = phone.replace(/\D/g, "");
      if (targetPhone.length === 10) targetPhone = `+91${targetPhone}`;
      else if (!targetPhone.startsWith("+")) targetPhone = `+${targetPhone}`;

      const auth = btoa(`${twilioSid}:${twilioToken}`);
      const params = new URLSearchParams();
      params.append("To", targetPhone);
      params.append("From", twilioFrom);
      params.append("Body", message);

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        },
      );
      if (res.ok) {
        return new Response(
          JSON.stringify({
            success: true,
            provider: "Twilio",
            message: `SMS successfully sent via Twilio to ${targetPhone}`,
          }),
          { headers: { "content-type": "application/json" } },
        );
      }
      const err = await res.text();
      return new Response(
        JSON.stringify({ success: false, provider: "Twilio", message: `Twilio error: ${err}` }),
        { headers: { "content-type": "application/json" } },
      );
    }

    // 3. Custom SMS Gateway Webhook
    if (gatewayUrl) {
      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message, reference: body.reference, guestName: body.guestName }),
      });
      if (res.ok) {
        return new Response(
          JSON.stringify({ success: true, provider: "Custom Gateway", message: "SMS dispatched via gateway" }),
          { headers: { "content-type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        provider: "none",
        message: "No SMS gateway API key configured (FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID).",
      }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        provider: "server",
        message: err instanceof Error ? err.message : "Internal error sending SMS",
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/send-sms" && request.method === "POST") {
        return await handleSmsApi(request, env);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

