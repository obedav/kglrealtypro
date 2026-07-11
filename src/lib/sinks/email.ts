import nodemailer from "nodemailer";

// Thin wrapper — single responsibility: deliver one email.
// Higher-level senders (lead-notify, tour-notify) compose this.

function makeTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  const transport = makeTransport();
  if (!transport) {
    console.log("[email/dev]", opts);
    return;
  }
  const from = process.env.GMAIL_USER!;
  await transport.sendMail({
    from,
    to: Array.isArray(opts.to) ? opts.to.join(", ") : opts.to,
    subject: opts.subject,
    text: opts.text,
    replyTo: opts.replyTo,
  });
}

function notifyTarget(): string[] {
  const target = process.env.LEAD_NOTIFY_EMAIL;
  if (!target) throw new Error("LEAD_NOTIFY_EMAIL is not set");
  return target.split(",").map((e) => e.trim()).filter(Boolean);
}

export async function notifyDutyAgent(opts: {
  subject: string;
  text: string;
  urgency?: "low" | "medium" | "high";
  replyTo?: string;
}): Promise<void> {
  const prefix = opts.urgency === "high" ? "[URGENT] " : "";
  await sendEmail({
    to: notifyTarget(),
    subject: prefix + opts.subject,
    text: opts.text,
    replyTo: opts.replyTo,
  });
}
