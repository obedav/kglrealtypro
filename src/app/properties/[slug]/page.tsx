import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConciergeChat } from "@/components/ConciergeChat";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PriceDisplay } from "@/components/PriceDisplay";
import { Reveal } from "@/components/Reveal";
import { getListingBySlug, getListingSlugs } from "@/lib/data";
import { sanitizeListingHtml } from "@/lib/sanitize";
import { ScheduleMeetingForm } from "@/components/ScheduleMeetingForm";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const slugs = await getListingSlugs();
    return slugs.map((slug) => ({ slug }));
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
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  return {
    title: listing.title,
    description: listing.excerpt,
    openGraph: {
      title: listing.title,
      description: listing.excerpt,
      images: listing.gallery[0] ? [listing.gallery[0]] : [],
    },
  };
}

const STATUS_STYLES: Record<string, string> = {
  available: "bg-emerald-500/20 text-emerald-400",
  sold: "bg-red-500/20 text-red-400",
  off_market: "bg-amber-500/20 text-amber-400",
  pending: "bg-sky-500/20 text-sky-400",
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.excerpt,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/properties/${listing.slug}`,
    image: listing.gallery,
    datePosted: listing.datePosted,
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      addressCountry: listing.country,
    },
    offers: {
      "@type": "Offer",
      price: listing.priceNGN,
      priceCurrency: "NGN",
      availability: listing.status === "available" ? "InStock" : "SoldOut",
    },
    numberOfBedrooms: listing.bedrooms,
    numberOfBathroomsTotal: listing.bathrooms,
    floorSize: { "@type": "QuantitativeValue", value: listing.sqm, unitCode: "MTK" },
  };

  const waNumber = (process.env.WHATSAPP_DUTY_AGENT_NUMBER ?? "").replace(/\D/g, "");
  const statusStyle = STATUS_STYLES[listing.status] ?? "bg-white/10 text-white/60";

  return (
    <>
      <Header />

      {/* Page hero */}
      <section className="relative overflow-hidden bg-accent py-10 text-accent-foreground md:py-14">
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
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white/80"
          >
            <ArrowLeft size={12} aria-hidden="true" /> All properties
          </Link>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {listing.propertyType && (
                  <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                    {listing.propertyType}
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${statusStyle}`}
                >
                  {listing.status.replace("_", " ")}
                </span>
              </div>
              <h1 className="mt-3 font-serif text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
                {listing.title}
              </h1>
              <div className="mt-3 flex items-center gap-1.5 text-sm text-white/60">
                <MapPin size={13} aria-hidden="true" />
                {listing.city}, {listing.country}
              </div>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Bed size={14} className="text-primary" aria-hidden="true" />
                  <strong>{listing.bedrooms}</strong>&nbsp;bed{listing.bedrooms !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath size={14} className="text-primary" aria-hidden="true" />
                  <strong>{listing.bathrooms}</strong>&nbsp;bath{listing.bathrooms !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Maximize2 size={14} className="text-primary" aria-hidden="true" />
                  <strong>{listing.sqm}</strong>&nbsp;sqm
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[11px] uppercase tracking-widest text-white/40">Asking price</p>
              <p className="mt-1 font-serif text-3xl font-bold text-primary md:text-4xl">
                <PriceDisplay priceNGN={listing.priceNGN} />
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="container py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="grid gap-12 lg:grid-cols-[2fr_320px]">
          {/* Main content */}
          <div className="min-w-0">
            <PropertyGallery images={listing.gallery} title={listing.title} />

            {listing.excerpt && (
              <Reveal>
                <p className="mt-8 text-base leading-relaxed text-muted-foreground">
                  {listing.excerpt}
                </p>
              </Reveal>
            )}

            {listing.description && (
              <Reveal>
                <div className="mt-10">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-primary" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      About this property
                    </p>
                  </div>
                  <div
                    className="prose prose-neutral mt-6 max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeListingHtml(listing.description) }}
                  />
                </div>
              </Reveal>
            )}

            {listing.amenities.length > 0 && (
              <Reveal>
                <div className="mt-10">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-primary" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                      Features &amp; amenities
                    </p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-y-3 sm:grid-cols-3">
                    {listing.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2
                          size={14}
                          className="shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            {/* Schedule Meeting card */}
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              <div className="p-6">
                <ScheduleMeetingForm listingSlug={listing.slug} />

                {waNumber && (
                  <div className="mt-4 border-t pt-4">
                    <Button size="sm" variant="outline" className="w-full gap-2" asChild>
                      <a
                        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                          `Hi, I'm interested in ${listing.title} (${listing.slug}).`,
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={14} aria-hidden="true" /> WhatsApp agent instead
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="grid grid-cols-3 divide-x p-4 text-center">
                <div className="flex flex-col items-center gap-1 py-2 pr-4">
                  <Bed size={18} className="text-primary" aria-hidden="true" />
                  <p className="font-serif text-2xl font-bold">{listing.bedrooms}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Beds</p>
                </div>
                <div className="flex flex-col items-center gap-1 px-4 py-2">
                  <Bath size={18} className="text-primary" aria-hidden="true" />
                  <p className="font-serif text-2xl font-bold">{listing.bathrooms}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Baths</p>
                </div>
                <div className="flex flex-col items-center gap-1 py-2 pl-4">
                  <Maximize2 size={18} className="text-primary" aria-hidden="true" />
                  <p className="font-serif text-2xl font-bold">{listing.sqm}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">sqm</p>
                </div>
              </div>
            </div>

            {/* Virtual tour */}
            {listing.virtualTourUrl && (
              <a
                href={listing.virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border bg-card p-5 text-sm font-medium transition hover:bg-muted"
              >
                <span>Take a virtual tour</span>
                <ExternalLink size={15} className="text-muted-foreground" aria-hidden="true" />
              </a>
            )}
          </aside>
        </div>
      </main>

      <Footer />
      <ConciergeChat listing={listing} />
    </>
  );
}
