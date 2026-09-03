// HTML email templates for agent notifications.
// Inline styles only — email clients strip <style> blocks.

const BASE_COLOR  = "#080F45";
const GOLD        = "#c9a84c";
const BODY_BG     = "#f8f7f4";
const CARD_BG     = "#ffffff";
const TEXT        = "#1a1a2e";
const MUTED       = "#64647a";
const BORDER      = "#e8e6e0";

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BODY_BG};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BODY_BG};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:${CARD_BG};border-radius:8px;overflow:hidden;border:1px solid ${BORDER};">
        <!-- Header -->
        <tr>
          <td style="background:${BASE_COLOR};padding:20px 32px;">
            <p style="margin:0;color:${GOLD};font-size:10px;letter-spacing:0.35em;text-transform:uppercase;font-family:Arial,sans-serif;">KGL Realty Pro</p>
            <p style="margin:6px 0 0;color:#ffffff;font-size:17px;font-weight:600;">${title}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid ${BORDER};padding:16px 32px;background:${BODY_BG};">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:${MUTED};">
              KGL Realty Pro &bull; hello@kglrealtypro.com &bull; This notification was generated automatically.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, value: string | undefined): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:${MUTED};width:120px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:${TEXT};font-weight:500;">${value}</td>
  </tr>`;
}

function waButton(href: string): string {
  if (!href) return "";
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:10px 22px;background:#25d366;color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:600;text-decoration:none;border-radius:4px;">
    Reply on WhatsApp
  </a>`;
}

function badge(urgency: "low" | "medium" | "high"): string {
  const colors: Record<string, string> = {
    high:   "background:#dc2626;color:#fff",
    medium: "background:#d97706;color:#fff",
    low:    "background:#16a34a;color:#fff",
  };
  return `<span style="display:inline-block;padding:2px 10px;border-radius:4px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;${colors[urgency] ?? colors.low}">${urgency}</span>`;
}

// ─── Lead captured ───────────────────────────────────────────────────────────

export type LeadEmailData = {
  rowId: number;
  full_name: string;
  phone?: string;
  email?: string;
  budget_ngn?: number;
  location_preference?: string;
  timeframe?: string;
  interest_summary: string;
};

export function leadCapturedHtml(d: LeadEmailData): string {
  const body = `
    <h2 style="margin:0 0 4px;font-size:15px;color:${TEXT};">New Qualified Lead <span style="color:${MUTED};font-size:13px;">#${d.rowId}</span></h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${row("Name", d.full_name)}
      ${row("Phone", d.phone)}
      ${row("Email", d.email)}
      ${row("Budget", d.budget_ngn ? `₦${d.budget_ngn.toLocaleString()}` : undefined)}
      ${row("Area", d.location_preference)}
      ${row("Timeframe", d.timeframe?.replace("_", " "))}
    </table>
    <div style="margin-top:20px;padding:16px;background:${BODY_BG};border-radius:6px;border-left:3px solid ${GOLD};">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;">Interest summary</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${TEXT};line-height:1.6;">${d.interest_summary}</p>
    </div>`;
  return shell(`New Lead — ${d.full_name}`, body);
}

// ─── Tour request ─────────────────────────────────────────────────────────────

export type TourEmailData = {
  rowId: number;
  listing_slug: string;
  preferred_date: string;
  preferred_time_window?: string;
  full_name: string;
  phone: string;
  email?: string;
  notes?: string;
  waLink?: string;
};

export function tourRequestHtml(d: TourEmailData): string {
  const body = `
    <h2 style="margin:0 0 4px;font-size:15px;color:${TEXT};">Tour Request <span style="color:${MUTED};font-size:13px;">#${d.rowId}</span></h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${row("Listing", d.listing_slug)}
      ${row("Date", d.preferred_date + (d.preferred_time_window ? ` (${d.preferred_time_window})` : ""))}
      ${row("Name", d.full_name)}
      ${row("Phone", d.phone)}
      ${row("Email", d.email)}
    </table>
    ${d.notes ? `<div style="margin-top:20px;padding:16px;background:${BODY_BG};border-radius:6px;border-left:3px solid ${GOLD};"><p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;">Notes</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${TEXT};line-height:1.6;">${d.notes}</p></div>` : ""}
    ${d.waLink ? waButton(d.waLink) : ""}`;
  return shell(`Tour Request — ${d.listing_slug}`, body);
}

// ─── Handoff ─────────────────────────────────────────────────────────────────

export type HandoffEmailData = {
  rowId: number;
  reason: string;
  urgency: "low" | "medium" | "high";
  summary: string;
  contact_phone?: string;
  contact_email?: string;
  waLink?: string;
};

export function handoffRequestHtml(d: HandoffEmailData): string {
  const body = `
    <h2 style="margin:0 0 8px;font-size:15px;color:${TEXT};">
      Human Handoff Requested <span style="color:${MUTED};font-size:13px;">#${d.rowId}</span>
    </h2>
    ${badge(d.urgency)}
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:16px;">
      ${row("Reason", d.reason.replace(/_/g, " "))}
      ${row("Phone", d.contact_phone)}
      ${row("Email", d.contact_email)}
    </table>
    <div style="margin-top:20px;padding:16px;background:${BODY_BG};border-radius:6px;border-left:3px solid ${GOLD};">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:0.1em;">Summary</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:${TEXT};line-height:1.6;">${d.summary}</p>
    </div>
    ${d.waLink ? waButton(d.waLink) : ""}`;
  return shell(`[${d.urgency.toUpperCase()}] Handoff — ${d.reason.replace(/_/g, " ")}`, body);
}
