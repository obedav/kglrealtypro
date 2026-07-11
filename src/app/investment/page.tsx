import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Globe, ShieldCheck, BarChart3, Briefcase, MapPin, Percent, Layers } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { getInvestments } from "@/lib/data";
import type { InvestmentOpportunity } from "@/types";

export const revalidate = 300;

export const metadata = {
  title: "Real Estate Investment",
  description:
    "Build a high-performing real estate portfolio in Lagos, Abuja, Dubai, and the UK with KGL Realty Pro. Expert advisory for residential and commercial investments.",
};

const PILLARS = [
  {
    Icon: TrendingUp,
    title: "Capital Appreciation",
    body: "Strategic acquisition in high-growth corridors — Lekki, Ikoyi, Maitama, and select UAE off-plan — where land value and rental yields consistently outpace inflation.",
  },
  {
    Icon: Globe,
    title: "International Diversification",
    body: "Spread portfolio risk across three currencies and economic zones. Our UK and UAE partner network gives clients access to markets unavailable through Nigerian-only channels.",
  },
  {
    Icon: ShieldCheck,
    title: "Title-Verified Assets",
    body: "Every investment property we recommend has passed a legal-title check. C of O, Governor's Consent, or equivalent documentation — confirmed before any conversation about price.",
  },
  {
    Icon: Briefcase,
    title: "Buy-to-Let Management",
    body: "For clients acquiring property to let, our team handles tenant sourcing, rent collection, and property management — turning a passive asset into a managed income stream.",
  },
];

const STATS = [
  { value: "₦2B+",  label: "Investment facilitated" },
  { value: "3",     label: "Countries covered"      },
  { value: "100%",  label: "Title-verified assets"  },
];

function statusBadge(status: InvestmentOpportunity["status"]) {
  const map = {
    available:   { label: "Available",    cls: "bg-emerald-500/15 text-emerald-600" },
    coming_soon: { label: "Coming Soon",  cls: "bg-amber-500/15 text-amber-600" },
    sold_out:    { label: "Sold Out",     cls: "bg-rose-500/15 text-rose-600" },
  } as const;
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function InvestmentCard({ inv }: { inv: InvestmentOpportunity }) {
  return (
    <Reveal>
      <Link
        href={`/investment/${inv.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
      >
        {/* Cover image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {inv.coverImage ? (
            <Image
              src={inv.coverImage}
              alt={inv.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BarChart3 size={40} className="text-muted-foreground/30" />
            </div>
          )}
          {inv.category && (
            <div className="absolute left-3 top-3">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {inv.category}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
              {inv.title}
            </h3>
            {statusBadge(inv.status)}
          </div>

          {(inv.locationDetail || inv.city) && (
            <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin size={12} className="shrink-0" />
              {inv.locationDetail ?? `${inv.city}, ${inv.country}`}
            </p>
          )}

          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {inv.excerpt}
          </p>

          {/* Key figures */}
          <div className="mt-auto grid grid-cols-2 gap-3 border-t pt-4">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="font-serif text-base font-bold text-primary">
                ₦{inv.priceNGN.toLocaleString()}
              </p>
            </div>
            {inv.expectedRoiPct != null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Expected ROI</p>
                <p className="flex items-center justify-end gap-1 font-serif text-base font-bold text-emerald-600">
                  <Percent size={13} />
                  {inv.expectedRoiPct}%
                </p>
              </div>
            )}
            {inv.landSize && (
              <div className={inv.expectedRoiPct != null ? "col-span-2" : "col-span-1"}>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Layers size={11} /> {inv.landSize}
                </p>
              </div>
            )}
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            View details <ArrowRight size={14} />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export default async function InvestmentPage() {
  const opportunities = await getInvestments("available");

  return (
    <>
      <Header />
      <PageHero
        label="Investment"
        title="Real estate investment"
        description="Structured advisory for clients building a portfolio — not just buying a single home."
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

        {/* ── Live investment opportunities ───────────────────────── */}
        {opportunities.length > 0 && (
          <section className="py-20">
            <div className="container">
              <Reveal>
                <div className="mx-auto max-w-2xl text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-primary" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      Current opportunities
                    </p>
                    <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
                    Available investments
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    Title-verified, due-diligence-cleared opportunities — land, off-plan, and
                    buy-to-let across Nigeria, the UAE, and the UK.
                  </p>
                </div>
              </Reveal>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {opportunities.map((inv) => (
                  <InvestmentCard key={inv.id} inv={inv} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Advisory pillars */}
        <section className={opportunities.length > 0 ? "border-t py-20 bg-muted/20" : "py-20"}>
          <div className="container">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    Our approach
                  </p>
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
                  Investing with KGL Realty Pro
                </h2>
                <p className="mt-4 text-muted-foreground">
                  We advise on residential and commercial acquisitions across Nigeria, the UAE,
                  and the United Kingdom — with full due-diligence support on every transaction.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {PILLARS.map(({ Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                    <div className="flex flex-1 flex-col p-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                        <Icon size={22} className="text-primary" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 font-serif text-xl font-semibold">{title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* UK & UAE callout */}
        <section className="border-y bg-muted/30 py-16">
          <div className="container grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  International
                </p>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-semibold">
                UK & UAE investment properties
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Through our vetted partner network, qualified buyers access off-plan and
                ready-to-move residential investments in London, Manchester, Dubai, and Abu
                Dhabi — with currency-hedge and residency-pathway benefits built in.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://kglrealty.propviewr.com/en/uk/properties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Browse UK listings <ArrowRight size={14} />
                </a>
                <a
                  href="https://kglrealty.propviewr.com/en/ae/properties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition hover:border-primary hover:text-primary"
                >
                  Browse UAE listings <ArrowRight size={14} />
                </a>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="space-y-3">
                {[
                  { market: "United Kingdom", detail: "London, Manchester, Birmingham, Edinburgh", currency: "GBP" },
                  { market: "United Arab Emirates", detail: "Dubai, Abu Dhabi, Sharjah", currency: "AED" },
                ].map(({ market, detail, currency }) => (
                  <div
                    key={market}
                    className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-medium">{market}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {currency}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA band */}
        <section className="border-t bg-accent py-16 text-accent-foreground">
          <Reveal>
            <div className="container max-w-2xl text-center">
              <BarChart3 size={32} className="mx-auto text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-serif text-3xl font-semibold text-white">
                Ready to build your portfolio?
              </h2>
              <p className="mt-4 text-white/60">
                Our investment advisors will map your goals, risk appetite, and timeline to
                the right opportunity — domestic or international, no obligation.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
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
