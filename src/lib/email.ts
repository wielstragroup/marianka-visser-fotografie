import "server-only";
import { Resend } from "resend";
import type { ContactInput } from "@/lib/validations/contact";
import { formatDateTime } from "@/lib/utils";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value?: string | null) {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px 6px 0;color:#8a6749;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(
    label
  )}</td><td style="padding:6px 0;color:#33291f;font-size:14px;">${escapeHtml(value)}</td></tr>`;
}

// Sends the admin notification for a new booking inquiry. Fails soft: if no
// API key is configured (e.g. local dev) or the send errors out, this logs a
// warning instead of throwing — the submission is already safely stored in
// the database regardless of whether the email goes out.
export async function sendContactNotification(input: ContactInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!apiKey || !to) {
    console.warn("[email] RESEND_API_KEY of CONTACT_NOTIFICATION_EMAIL ontbreekt — e-mail niet verstuurd.");
    return { sent: false };
  }

  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#faf5ee;">
      <h1 style="font-size:20px;font-weight:500;color:#33291f;margin:0 0 4px;">Nieuwe aanvraag</h1>
      <p style="font-size:13px;color:#8a6749;margin:0 0 24px;">Ontvangen op ${escapeHtml(
        formatDateTime(new Date().toISOString())
      )}</p>
      <table style="width:100%;border-collapse:collapse;background:#fffdfa;border-radius:4px;padding:8px;">
        ${row("Naam", input.name)}
        ${row("E-mail", input.email)}
        ${row("Telefoon", input.phone)}
        ${row("Shoot", input.shootName)}
        ${row("Gewenste datum", input.desiredDate)}
        ${row("Beschikbaarheid", input.availabilityPreference)}
        ${row("Hoe gevonden", input.howFound)}
      </table>
      ${
        input.message
          ? `<div style="margin-top:20px;"><p style="font-size:13px;color:#8a6749;margin:0 0 6px;">Bericht</p><p style="font-size:14px;color:#33291f;white-space:pre-line;margin:0;">${escapeHtml(
              input.message
            )}</p></div>`
          : ""
      }
    </div>
  `;

  // Sending "from" a real address on the client's own domain requires that
  // domain to be verified in Resend. Until that's set up, RESEND_FROM_EMAIL
  // falls back to Resend's shared sandbox sender.
  const from = process.env.RESEND_FROM_EMAIL || "Marianka Visser Fotografie <onboarding@resend.dev>";

  try {
    await resend.emails.send({
      from,
      to,
      replyTo: input.email,
      subject: `Nieuwe aanvraag van ${input.name}`,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error("[email] Versturen van notificatie is mislukt:", error);
    return { sent: false };
  }
}
