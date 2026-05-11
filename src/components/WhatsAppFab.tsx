import { MessageCircle } from "lucide-react";

/**
 * Floating WhatsApp CTA, anchored bottom-right. Reads the duty-agent number
 * from env; renders nothing if unset so there's no dead affordance.
 */
export function WhatsAppFab({ message }: { message?: string }) {
  const number = (process.env.WHATSAPP_DUTY_AGENT_NUMBER ?? "").replace(/\D/g, "");
  if (!number) return null;

  const text = message ?? "Hello, I'd like to speak to an agent about a property.";
  const href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with an agent on WhatsApp"
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-all hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
    >
      <MessageCircle size={26} strokeWidth={2} fill="currentColor" stroke="white" />
    </a>
  );
}
