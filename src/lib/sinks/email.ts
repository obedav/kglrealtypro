import { Resend } from "resend";

// Thin wrapper — single responsibility: deliver one email.
// Higher-level senders (lead-notify, tour-notify) compose this.

const FROM = process.env.LEAD_FROM_EMAIL ?? "hello@kglrealtypro.com";

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log("[email/dev]", opts);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    replyTo: opts.replyTo,
  });
}

function notifyTarget(): string {
  const target = process.env.LEAD_NOTIFY_EMAIL;
  if (!target) throw new Error("LEAD_NOTIFY_EMAIL is not set");
  return target;
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
