import type { ReceiptDetails } from "./booking";

/**
 * Generates an executive, responsive HTML email for booking receipts.
 */
export function generateBookingEmailHtml(details: ReceiptDetails): string {
  const advanceNote = details.advancePaid && details.advancePaid > 0
    ? `<tr>
        <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Advance Paid:</td>
        <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #059669; text-align: right; border-bottom: 1px solid #e2e8f0;">INR ${details.advancePaid.toLocaleString("en-IN")}</td>
       </tr>
       <tr>
        <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Balance Due at Reception:</td>
        <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">INR ${Math.max(0, details.totalTariff - details.advancePaid).toLocaleString("en-IN")}</td>
       </tr>`
    : `<tr>
        <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Payment Status:</td>
        <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #d97706; text-align: right; border-bottom: 1px solid #e2e8f0;">${details.paymentStatus ?? "Confirmed (Pay at Reception)"}</td>
       </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation - Hotel Ratna Forever</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #020617; padding: 36px 32px; text-align: center; border-bottom: 3px solid #f59e0b;">
              <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 14px; border-radius: 9999px;">
                Official Reservation Voucher
              </span>
              <h1 style="margin: 16px 0 6px 0; font-family: Georgia, serif; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 0.02em;">
                Hotel Ratna Forever
              </h1>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; letter-spacing: 0.05em;">
                Nitte Parapady, Karkala Taluk, Udupi Dist, Karnataka 574110
              </p>
            </td>
          </tr>

          <!-- Confirmation Callout -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px 24px; text-align: center;">
                <span style="font-size: 11px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.12em; display: block;">
                  Booking Reference
                </span>
                <span style="font-family: monospace; font-size: 26px; font-weight: 700; color: #065f46; letter-spacing: 0.1em; display: block; margin-top: 4px;">
                  ${details.reference}
                </span>
              </div>
              <p style="margin: 20px 0 0 0; font-size: 15px; color: #334155; line-height: 1.6;">
                Dear <strong>${details.guestName}</strong>,<br>
                Thank you for reserving your stay directly with Hotel Ratna Forever. Your reservation has been recorded at our front desk.
              </p>
            </td>
          </tr>

          <!-- Stay Details Section -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #0f172a; padding: 12px 16px; color: #fbbf24; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                    Stay Schedule & Accommodation
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; width: 40%;">Room Category:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${details.roomName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Check-in:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${details.checkIn} <span style="font-size: 11px; color: #d97706;">(From 12:00 PM)</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Check-out:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${details.checkOut} <span style="font-size: 11px; color: #64748b;">(Until 11:00 AM)</span></td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Duration:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${details.nights} ${details.nights === 1 ? "Night" : "Nights"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Guests:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${details.adults} Adult(s)${details.children > 0 ? `, ${details.children} Child` : ""}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #475569;">Inclusions:</td>
                  <td style="padding: 10px 16px; font-size: 12px; color: #059669; font-weight: 600;">✓ Free Breakfast · Free Wi-Fi · 24-hr Hot Water · AC · Parking</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Billing Folio -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                <tr>
                  <td colspan="2" style="background-color: #f1f5f9; padding: 12px 16px; color: #1e293b; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">
                    Billing Folio Breakdown
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Estimated Stay Tariff:</td>
                  <td style="padding: 10px 16px; font-size: 15px; font-weight: 700; color: #b45309; text-align: right; border-bottom: 1px solid #e2e8f0;">INR ${details.totalTariff.toLocaleString("en-IN")}</td>
                </tr>
                ${advanceNote}
              </table>
            </td>
          </tr>

          <!-- Guidelines Box -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 16px 20px; font-size: 12px; color: #713f12; line-height: 1.6;">
                <strong>Guest Check-in Guidelines:</strong><br>
                • Please present booking reference <strong>${details.reference}</strong> and a valid Government Photo ID (Aadhaar / Passport / Driving License) upon arrival.<br>
                • Breakfast is served daily from 7:30 AM to 10:30 AM in the hotel dining hall.<br>
                • Free on-site vehicle parking is available on Nitte Main Road.
              </div>

              <!-- Action buttons -->
              <div style="text-align: center; margin-top: 24px;">
                <a href="tel:+917338088744" style="display: inline-block; background-color: #f59e0b; color: #020617; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 4px; letter-spacing: 0.05em; text-transform: uppercase;">
                  Call Front Desk: +91 73380 88744
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #020617; padding: 24px 32px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Hotel Ratna Forever · Nitte, Karkala Taluk, Karnataka 574110
              </p>
              <p style="margin: 6px 0 0 0; color: #64748b; font-size: 11px;">
                24-Hour Reception & Guest Enquiries: +91 73380 88744
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Dispatches an automated confirmation email to the guest via Resend API
 * if RESEND_API_KEY is configured in the environment.
 */
export async function sendAutomatedBookingEmail(details: ReceiptDetails): Promise<{
  sent: boolean;
  message: string;
}> {
  if (!details.guestEmail || !details.guestEmail.includes("@")) {
    return { sent: false, message: "No guest email provided" };
  }

  // Check for Resend API key
  const apiKey = typeof process !== "undefined" && process.env ? process.env["RESEND_API_KEY"] : undefined;

  if (!apiKey) {
    // Graceful fallback - API key not set yet
    return {
      sent: false,
      message: "Resend API key not configured yet. 1-tap client email link is active.",
    };
  }

  try {
    const html = generateBookingEmailHtml(details);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hotel Ratna Forever <reservations@hotelratnaforever.com>",
        to: [details.guestEmail],
        subject: `Your Booking Confirmation & Stay Receipt [${details.reference}] - Hotel Ratna Forever`,
        html,
      }),
    });

    if (res.ok) {
      return { sent: true, message: `Automated confirmation email sent to ${details.guestEmail}` };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { sent: false, message: `Email gateway response: ${JSON.stringify(errData)}` };
    }
  } catch (err) {
    return {
      sent: false,
      message: err instanceof Error ? err.message : "Failed to dispatch automated email",
    };
  }
}
