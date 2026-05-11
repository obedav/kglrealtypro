import Link from "next/link";
import { ArrowRight, TrendingUp, Layers, ShieldCheck, BarChart3 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

export const metadata = { title: "Real Estate Investment" };

const PROGRAMS = [
  {
    href: "/investment/cashback",
    Icon: TrendingUp,
    badge: "Commission rebate",
    title: "Real Estate Cashback",
    body: "A program for returning buyers that redirects a portion of agent commission back to the client — reducing the effective acquisition cost on every transaction.",
    features: [
      "Eligible on qualifying purchases above ₦100m",
      "Rebate paid at completion",
      "Stackable with negotiated price reductions",
    ],
    cta: "Learn about cashback →",
  },
  {
    href: "/investment/land-vest",
    Icon: Layers,
    badge: "Fractional land",
    title: "Land Vest",
    body: "Fractional investment in pre-development land parcels curated by our acquisition team — with projected appreciation over 24–36 months and transparent exit mechanisms.",
    features: [
      "Minimum entry from ₦5m",
      "Title-verified parcels only",
      "Quarterly valuation updates",
    ],
    cta: "Explore Land Vest →",
  },
];

const STATS = [
  { value: "₦2B+", label: "Investment facilitated" },
  { value: "24–36", label: "Month average horizon" },
  { value: "100%", label: "Title-verified assets" },
];

export default function InvestmentPage() {
  return (
    <>
      <Header />
      <PageHero
        label="Investment"
        title="Real estate investment"
        description="Structured programs for clients building a portfolio — not just buying a single home."
        breadcrumbs={[{ label: "Investment", href: "/investment" }]}
      />

      <main>
        {/* Stats row */}
        <section className="border-b bg-muted/30 py-10">
          <div className="container">
            <div className="grid grid-cols-3 divide-x text-center">
              {STATS.map(({ value, label }) => (
                <div key={label} className="px-4 py-2">
                  <p className="font-serif text-3xl font-bold text-primary">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs */}
        <section className="py-20">
          <div className="container">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    Our programs
                  </p>
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
                  Two ways to grow your portfolio
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Both programs are administered by licensed KGL agents with full paper trails
                  — no opaque structures.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {PROGRAMS.map(({ href, Icon, badge, title, body, features, cta }, i) => (
                <Reveal key={href} delay={i * 100}>
                  <Link href={href} className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
                    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-black/[0.07]">
                      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                      <div className="flex flex-1 flex-col p-8">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                            <Icon size={22} className="text-primary" aria-hidden="true" />
                          </div>
                          <div>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                              {badge}
                            </span>
                            <h2 className="mt-2 font-serif text-2xl font-semibold">{title}</h2>
                          </div>
                        </div>

                        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{body}</p>

                        <ul className="mt-6 space-y-2.5">
                          {features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-8 flex items-center gap-1 text-sm font-medium text-primary transition-all group-hover:gap-2">
                          {cta}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="border-t bg-accent py-16 text-accent-foreground">
          <Reveal>
            <div className="container max-w-2xl text-center">
              <BarChart3 size={32} className="mx-auto text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-serif text-3xl font-semibold text-white">
                Not sure which program fits?
              </h2>
              <p className="mt-4 text-white/60">
                Our investment advisors will map your goals, risk appetite, and timeline to
                the right structure — no obligation.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Book a free consultation <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
      <ConciergeChat />
    </>
  );
}
