import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { ConciergeChat } from "@/components/ConciergeChat";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { HeroSearch } from "@/components/HeroSearch";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { getFeaturedListings, getListingFacets } from "@/lib/data";
import { Globe, TrendingUp, Briefcase, Home as HomeIcon, ArrowRight, ChevronDown, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const revalidate = 300;

// Team captured from the live site on 2026-04-22. Editors update via the PHP
// admin once the agents table is seeded; then swap this constant for a
// getAgents() call.
const TEAM = [
  { name: "Mr Adekunle Moruf",         role: "CEO / Managing Director",  photo: "/images/Mr Adekunle Moruf.jpeg"      },
  { name: "Mrs Popoola Nimotalai",     role: "Lead Consultant",          photo: "/images/Mrs Popoola Nimotalai.jpeg" },
  { name: "Miss Oyinkansola Adekunle", role: "Sales Executive",          photo: undefined                            },
];

const WHY_INVEST = [
  { Icon: TrendingUp, title: "Increased returns", body: "Strong capital appreciation and rental yield in mature overseas markets." },
  { Icon: Globe,      title: "Diversification",    body: "Spread risk across currencies and economies — hedge against local volatility." },
  { Icon: Briefcase,  title: "New markets",        body: "Access buyer pools and residency pathways unavailable from domestic portfolios." },
  { Icon: HomeIcon,   title: "Personal use",       body: "A home-away-from-home in Dubai, London, or Edinburgh for travel and family." },
];

const FAQS = [
  {
    q: "How do I arrange a private viewing?",
    a: "We schedule viewings by appointment only. Share the listing through our concierge, contact form, or WhatsApp — one of our agents will confirm a time the same business day.",
  },
  {
    q: "Do you handle international transactions?",
    a: "Yes. We represent Nigerian buyers acquiring property in the UAE and the United Kingdom, and work with vetted overseas partners on both sides of every deal.",
  },
  {
    q: "What does your commission structure look like?",
    a: "Standard agency commission is billed to the seller on completion. Buyer representation is typically fee-free; we confirm the full structure in writing before you commit to a property.",
  },
  {
    q: "How do you verify listings?",
    a: "Every listing passes a legal-title check and a condition inspection before it reaches this site. If a property does not meet our standards, it does not appear.",
  },
  {
    q: "Can I sell a property discreetly, without public listing?",
    a: "Yes. We regularly represent sellers on an off-market basis, introducing properties to a vetted private buyer pool. Request a confidential consultation via our contact page.",
  },
];

export default async function HomePage() {
  const [featured, facets] = await Promise.all([
    getFeaturedListings(8),
    getListingFacets(),
  ]);

  return (
    <>
      <Header />

      <main>
        <HeroSearch cities={facets.cities} />

        {/* Featured listings */}
        <section className="py-16 md:py-24">
          <div className="container">
            <Reveal>
              <div className="mb-10 flex items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-primary" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      Selected properties
                    </p>
                  </div>
                  <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                    Featured listings
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Hand-picked from our current portfolio across Lagos, Abuja, Dubai &amp; London.
                  </p>
                </div>
                <Link
                  href="/properties"
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all hover:border-primary hover:text-primary"
                >
                  View all
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>

            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((listing, i) => (
                <div key={listing.id} className="w-[72%] flex-shrink-0 snap-start sm:w-auto">
                  <Reveal delay={i * 60}>
                    <PropertyCard listing={listing} priority={i < 4} />
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* International Portfolio */}
        <section className="relative overflow-hidden border-y bg-accent text-accent-foreground">

          {/* Background depth — radial glows */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-1/4 top-0 aspect-square w-[600px] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute -right-1/4 bottom-0 aspect-square w-[500px] rounded-full bg-primary/5 blur-[100px]" />
          </div>

          {/* Subtle dot-grid texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="container relative grid gap-16 py-24 md:grid-cols-2 md:items-center">

            {/* Left — copy */}
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  International portfolio
                </p>
              </div>

              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
                Purchase or invest in foreign properties.
              </h2>

              <p className="mt-5 text-base leading-relaxed text-white/70">
                Through our Dubai and United Kingdom partnerships, qualified buyers
                access a curated international portfolio with currency-hedge and
                residency-pathway benefits.
              </p>

              {/* Stats row */}
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-8">
                {[
                  { value: "3",    label: "Countries"       },
                  { value: "200+", label: "Active listings" },
                  { value: "10+",  label: "Years experience"},
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-serif text-3xl font-bold text-white">{value}</p>
                    <p className="mt-0.5 text-xs text-white/50 uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <Link href="/properties?city=Dubai">View international listings →</Link>
                </Button>
              </div>
            </Reveal>

            {/* Right — feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {WHY_INVEST.map(({ Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className={cn(
                    "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5",
                    "transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-xl hover:shadow-black/20"
                  )}>
                    {/* Card number */}
                    <span className="absolute right-4 top-3 font-serif text-4xl font-bold text-white/5 select-none">
                      0{i + 1}
                    </span>
                    {/* Icon circle */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30 transition-colors group-hover:bg-primary/30">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold text-white">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

          </div>
        </section>

        {/* Team */}
        <section className="relative overflow-hidden py-24">
          {/* Background */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-muted/20" />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="container relative">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">The team</p>
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
                  Mission-driven representation.
                </h2>
                <p className="mt-4 text-muted-foreground">
                  A small licensed team with deep knowledge of the Nigerian, UAE, and
                  UK luxury markets.
                </p>
              </div>
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
              {TEAM.map((person, i) => {
                const initials = person.name
                  .replace(/^(Mr|Mrs|Miss|Ms|Dr)\.?\s+/i, "")
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <Reveal key={person.name} delay={i * 100}>
                    <div className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/[0.07]">

                      {/* Accent top bar */}
                      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

                      {/* Photo */}
                      <div className="relative aspect-[3/3.5] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20">
                        {person.photo ? (
                          <Image
                            src={person.photo}
                            alt={person.name}
                            fill
                            sizes="(min-width: 640px) 33vw, 100vw"
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-serif text-6xl font-bold text-primary/30">{initials}</span>
                          </div>
                        )}
                        {/* Bottom fade into card */}
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-serif text-lg font-semibold">{person.name}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{person.role}</p>

                        {/* Hover CTA */}
                        <div className="mt-4 grid grid-rows-[0fr] opacity-0 transition-all duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                          <div className="overflow-hidden">
                            <Link
                              href="/contact"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
                            >
                              Get in touch
                              <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={400}>
              <div className="mt-12 text-center">
                <Button asChild variant="outline" className="rounded-full px-8">
                  <Link href="/agents">Meet the full team</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative overflow-hidden py-24">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/40 via-muted/10 to-background" />
          <div className="container relative max-w-3xl">
            <Reveal>
              <div className="text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Frequently asked</p>
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
                  What buyers ask us most.
                </h2>
              </div>
            </Reveal>

            <div className="mt-12 space-y-2.5">
              {FAQS.map((item, i) => (
                <Reveal key={item.q} delay={i * 50}>
                  <details className="group rounded-xl border bg-card shadow-sm transition-shadow duration-200 open:shadow-md">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4">
                      <span className="font-medium">{item.q}</span>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
                      />
                    </summary>
                    <div className="border-t px-6 pb-5 pt-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t bg-primary py-24 text-primary-foreground">
          {/* Depth — radial glows + dot texture */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-1/4 -top-1/4 aspect-square w-[600px] rounded-full bg-white/5 blur-[120px]" />
            <div className="absolute -bottom-1/4 -left-1/4 aspect-square w-[500px] rounded-full bg-white/5 blur-[100px]" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />

          <div className="container relative grid gap-14 md:grid-cols-2 md:items-center">

            {/* Left — headline + primary CTA */}
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-white/40" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Get in touch</p>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
                Looking for something specific? Let&apos;s talk.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/70">
                Share what you&apos;re after — budget, location, timeline — and one of
                our agents will reach out the same day with a curated shortlist.
              </p>
              <div className="mt-8">
                <Button asChild size="lg" className="bg-white text-primary shadow-lg shadow-black/10 hover:bg-white/90">
                  <Link href="/contact">Send a message →</Link>
                </Button>
              </div>
            </Reveal>

            {/* Right — direct contact cards */}
            <Reveal delay={150}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                Or reach us directly
              </p>
              <div className="space-y-3">
                {[
                  {
                    href: "tel:+2347038141774",
                    Icon: Phone,
                    label: "Phone",
                    value: "+234 703 814 1774",
                    note: "Mon – Fri, 9 am – 6 pm WAT",
                    external: false,
                  },
                  {
                    href: "https://wa.me/2347038141774",
                    Icon: MessageCircle,
                    label: "WhatsApp",
                    value: "+234 703 814 1774",
                    note: "Fastest response — same day",
                    external: true,
                  },
                ].map(({ href, Icon, label, value, note, external }) => (
                  <a
                    key={label}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group flex items-center gap-4 rounded-xl border border-white/15 bg-white/5 p-4 transition-all hover:border-white/30 hover:bg-white/10"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
                      <p className="font-semibold text-white">{value}</p>
                      <p className="text-xs text-white/50">{note}</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto shrink-0 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
                  </a>
                ))}
              </div>
            </Reveal>

          </div>
        </section>
      </main>

      <Footer />
      <ConciergeChat />
      <WhatsAppFab />
    </>
  );
}
