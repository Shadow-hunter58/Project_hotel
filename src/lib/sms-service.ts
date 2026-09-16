import { formatSmsText, type ReceiptDetails } from "./booking";

export type SmsDispatchResult = {
  sent: boolean;
  provider: string;
  message: string;
};

/**
 * Dispatches an automated SMS confirmation with stay voucher details
 * to the guest mobile phone number.
 *
 * Checks the server /api/send-sms endpoint first (which supports Fast2SMS,
 * Twilio, or custom SMS gateway without exposing keys to client).
 * Falls back to direct client-side credentials if present.
 */
export async function sendAutomatedBookingSms(
  details: ReceiptDetails,
): Promise<SmsDispatchResult> {
  const phone = details.guestPhone?.trim();
  if (!phone) {
    return {
      sent: false,
      provider: "none",
      message: "No mobile number provided for SMS dispatch.",
    };
  }

  const smsText = formatSmsText(details);

  // 1. Try server-side SMS dispatch endpoint
  try {
    const res = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        message: smsText,
        reference: details.reference,
        guestName: details.guestName,
      }),
    });

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        provider?: string;
        message?: string;
      };
      if (data.success) {
        return {
          sent: true,
          provider: data.provider ?? "SMS Gateway",
          message: data.message ?? `SMS sent directly to ${phone}`,
        };
      }
      if (data.message && data.provider && data.provider !== "none") {
        return {
          sent: false,
          provider: data.provider,
          message: data.message,
        };
      }
    }
  } catch {
    // Server endpoint not reachable or running in static context
  }

  // 2. Check client-side Fast2SMS key if configured in VITE env
  const viteFast2sms =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env["VITE_FAST2SMS_API_KEY"] as string | undefined)
      : undefined;

  if (viteFast2sms) {
    try {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: viteFast2sms,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: smsText,
          language: "english",
          flash: 0,
          numbers: cleanPhone,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { return?: boolean; message?: string[] };
      if (res.ok && data.return === true) {
        return {
          sent: true,
          provider: "Fast2SMS",
          message: `SMS dispatched via Fast2SMS to +91 ${cleanPhone}`,
        };
      }
    } catch (err) {
      return {
        sent: false,
        provider: "Fast2SMS",
        message: err instanceof Error ? err.message : "Fast2SMS request error",
      };
    }
  }

  // 3. Fallback when credentials are not configured yet in .env
  return {
    sent: false,
    provider: "none",
    message: "SMS Gateway API key not configured in .env (FAST2SMS_API_KEY / TWILIO). Use 1-tap SMS launcher below.",
  };
}
