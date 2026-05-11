import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Phone, MessageCircle, Mail, Globe } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { Reveal } from "@/components/Reveal";
import { getAgentBySlug, getAgents } from "@/lib/data";

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const agents = await getAgents();
    return agents.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) return {};
  return {
    title: agent.fullName,
    description: `${agent.role} at KGL Realty Pro. ${agent.specialties.join(", ")}.`,
  };
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  const waNumber = (agent.whatsapp ?? agent.phone).replace(/\D/g, "");
  const firstName = agent.fullName.replace(/^(Mr|Mrs|Miss|Ms|Dr)\.?\s+/i, "").split(" ")[0];
  const initials = agent.fullName
    .replace(/^(Mr|Mrs|Miss|Ms|Dr)\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hi ${firstName}, I found you on kglrealtypro.com.`,
  )}`;

  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-accent py-14 text-accent-foreground md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-1/4 top-0 aspect-square w-[500px] rounded-full bg-primary/10 blur-[120px]"
        />

        <div className="container relative">
          <Link
            href="/agents"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white/80"
          >
            <ArrowLeft size={12} aria-hidden="true" /> All agents
          </Link>

          <Reveal>
            <div className="mt-5 flex items-center gap-3">
              <span className="h-px w-8 bg-primary" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Our team
              </p>
            </div>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-white md:text-5xl">
              {agent.fullName}
            </h1>
            <p className="mt-2 text-base text-white/60">{agent.role}</p>
          </Reveal>
        </div>
      </section>

      <main className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          {/* Left: photo + contact */}
          <div className="space-y-4">
            {/* Portrait card */}
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              <div className="relative aspect-[3/3.5] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20">
                {agent.photo ? (
                  <Image
                    src={agent.photo}
                    alt={agent.fullName}
                    fill
                    priority
                    sizes="(min-width: 1024px) 320px, 100vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif text-7xl font-bold text-primary/30">
                      {initials}
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
              </div>
            </div>

            {/* Contact links */}
            <a
              href={`tel:${agent.phone}`}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition hover:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone size={16} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Phone</p>
                <p className="truncate text-sm font-medium">{agent.phone}</p>
              </div>
            </a>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition hover:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle size={16} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  WhatsApp
                </p>
                <p className="text-sm font-medium">Message on WhatsApp</p>
              </div>
            </a>

            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition hover:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail size={16} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Email</p>
                <p className="truncate text-sm font-medium">{agent.email}</p>
              </div>
            </a>
          </div>

          {/* Right: bio + specialties + languages + CTA */}
          <div>
            {agent.specialties.length > 0 && (
              <Reveal>
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-primary" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      Specialties
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {agent.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  About
                </p>
              </div>
              <div
                className="prose prose-neutral mt-6 max-w-none"
                dangerouslySetInnerHTML={{ __html: agent.bio }}
              />
            </Reveal>

            {agent.languages.length > 0 && (
              <Reveal>
                <div className="mt-8">
                  <div className="flex items-center gap-3">
                    <Globe size={14} className="text-primary" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      Languages
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.languages.map((lang) => (
                      <span
                        key={lang}
                        className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={100}>
              <div className="mt-10 rounded-2xl border border-primary/10 bg-primary/5 p-6">
                <p className="font-serif text-lg font-medium">
                  Ready to work with {firstName}?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get in touch directly — our agents respond within hours.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={`tel:${agent.phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    <Phone size={14} aria-hidden="true" /> Call now
                  </a>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
                  >
                    <MessageCircle size={14} aria-hidden="true" /> WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <Footer />
      <ConciergeChat />
    </>
  );
}
