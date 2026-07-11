import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, MapPin, Percent, Layers,
  Calendar, ShieldCheck, CreditCard, TrendingUp,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { Reveal } from "@/components/Reveal";
import { getInvestmentBySlug, getInvestmentSlugs } from "@/lib/data";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getInvestmentSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const inv = await getInvestmentBySlug(slug);
  if (!inv) return {};
  return {
    title: inv.seoTitle ?? inv.title,
    description: inv.metaDescription ?? inv.excerpt,
  };
}

function statusBadge(status: "available" | "sold_out" | "coming_soon") {
  const map = {
    available:   { label: "Available",   cls: "bg-emerald-500/15 text-emerald-600" },
    coming_soon: { label: "Coming Soon", cls: "bg-amber-500/15 text-amber-600" },
    sold_out:    { label: "Sold Out",    cls: "bg-rose-500/15 text-rose-600" },
  } as const;
  const { label, cls } = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export default async function InvestmentDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const inv = await getInvestmentBySlug(slug);
  if (!inv) notFound();

  const cover = inv.gallery[0] ?? inv.coverImage;

  return (
    <>
      <Header />

      <main className="pb-20">
        {/* Back nav */}
        <div className="container pt-6">
          <Link
            href="/investment"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft size={14} /> Back to investments
          </Link>
        </div>

        {/* Hero image */}
        {cover && (
          <div className="container mt-4">
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={cover}
                alt={inv.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          </div>
        )}

        <div className="container mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">

          {/* ── Left: main content ─────────────────────────────────── */}
          <div>
            {/* Category + status */}
            <div className="flex flex-wrap items-center gap-2">
              {inv.category && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {inv.category}
                </span>
              )}
              {statusBadge(inv.status)}
            </div>

            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight md:text-4xl">
              {inv.title}
            </h1>

            {(inv.locationDetail || inv.city) && (
              <p className="mt-3 flex items-center gap-1.5 text-muted-foreground">
                <MapPin size={14} className="shrink-0" />
                {inv.locationDetail
                  ? `${inv.locationDetail} · ${inv.city}, ${inv.country}`
                  : `${inv.city}, ${inv.country}`}
              </p>
            )}

            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{inv.excerpt}</p>

            {/* Key figures strip */}
            <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border bg-muted/30 p-5 sm:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">From</p>
                <p className="mt-1 font-serif text-xl font-bold text-primary">
                  ₦{inv.priceNGN.toLocaleString()}
                </p>
              </div>
              {inv.expectedRoiPct != null && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">ROI</p>
                  <p className="mt-1 flex items-center gap-1 font-serif text-xl font-bold text-emerald-600">
                    <Percent size={15} />{inv.expectedRoiPct}%
                  </p>
                </div>
              )}
              {inv.landSize && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Size</p>
                  <p className="mt-1 flex items-center gap-1 font-serif text-xl font-bold">
                    <Layers size={15} className="text-muted-foreground" />{inv.landSize}
                  </p>
                </div>
              )}
              {inv.unitsAvailable != null && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Units left</p>
                  <p className="mt-1 font-serif text-xl font-bold">{inv.unitsAvailable}</p>
                </div>
              )}
            </div>

            {/* Full description */}
            {inv.description && (
              <Reveal>
                <div
                  className="prose prose-sm md:prose-base mt-8 max-w-none"
                  dangerouslySetInnerHTML={{ __html: inv.description }}
                />
              </Reveal>
            )}

            {/* Gallery (remaining images) */}
            {inv.gallery.length > 1 && (
              <Reveal>
                <div className="mt-10">
                  <h2 className="mb-4 font-serif text-xl font-semibold">Gallery</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {inv.gallery.slice(1).map((url, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={url}
                          alt={`${inv.title} — photo ${i + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* ── Right: enquiry sidebar ─────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-24">

            {/* Quick details */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h3 className="mb-4 font-serif text-lg font-semibold">Opportunity details</h3>
              <dl className="space-y-3 text-sm">
                {inv.titleType && (
                  <div className="flex items-start gap-2">
                    <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Documentation</dt>
                      <dd className="font-medium">{inv.titleType}</dd>
                    </div>
                  </div>
                )}
                {inv.timeline && (
                  <div className="flex items-start gap-2">
                    <Calendar size={15} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Timeline</dt>
                      <dd className="font-medium">{inv.timeline}</dd>
                    </div>
                  </div>
                )}
                {inv.expectedRoiPct != null && (
                  <div className="flex items-start gap-2">
                    <TrendingUp size={15} className="mt-0.5 shrink-0 text-primary" />
                    <div>
                      <dt className="text-xs text-muted-foreground">Expected return</dt>
                      <dd className="font-medium">{inv.expectedRoiPct}%</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Payment plan */}
            {inv.paymentPlan && (
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" />
                  <h3 className="font-serif text-base font-semibold">Payment plan</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{inv.paymentPlan}</p>
              </div>
            )}

            {/* CTA */}
            <div className="rounded-2xl border bg-primary p-5 text-primary-foreground shadow-sm">
              <h3 className="font-serif text-lg font-semibold">Interested?</h3>
              <p className="mt-2 text-sm text-primary-foreground/70">
                Speak to an investment advisor — no obligation, title checks included.
              </p>
              <Link
                href={`/contact?ref=${inv.slug}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                Enquire now <ArrowRight size={14} />
              </Link>
            </div>

            <Link
              href="/investment"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft size={14} /> All opportunities
            </Link>
          </aside>

        </div>
      </main>

      <Footer />
      <ConciergeChat />
    </>
  );
}
