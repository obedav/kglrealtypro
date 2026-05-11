// No paid WhatsApp Business API — we generate a pre-filled wa.me deep-link
// and surface it to the duty agent via the email notification. When the agent
// taps it from their phone, WhatsApp opens with the message ready to send.

function normalizeNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function dutyAgentWhatsappLink(messageText: string): string | null {
  const number = process.env.WHATSAPP_DUTY_AGENT_NUMBER;
  if (!number) return null;
  return `https://wa.me/${normalizeNumber(number)}?text=${encodeURIComponent(messageText)}`;
}
