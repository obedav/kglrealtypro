"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
import { useFavourite } from "@/lib/use-favourite";
import { ArrowUpRight, Bath, BedDouble, Building2, Heart, MapPin, Maximize2, Video } from "lucide-react";
import { PriceDisplay } from "@/components/PriceDisplay";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types";

interface PropertyCardProps {
  listing: Listing;
  className?: string;
  priority?: boolean;
  /** First card in the featured grid — 16:9 image + larger typography */
  featured?: boolean;
}

const STATUS_PILL: Record<string, string> = {
  sold:       "bg-rose-500 text-white",
  pending:    "bg-amber-500 text-white",
  off_market: "bg-slate-700 text-white",
};

function isRecent(iso: string, days = 7): boolean {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < days * 24 * 60 * 60 * 1000;
}

function relativeTime(iso: string): string | null {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return null;
  const diff = Date.now() - d;
  const hrs  = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (hrs  < 1) return "Just now";
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return null;
}

export const PropertyCard = memo(function PropertyCard({
  listing,
  className,
  priority = false,
  featured = false,
}: PropertyCardProps) {
  const { isFav, toggle: toggleFav } = useFavourite(listing.id);
  const unavailable  = listing.status !== "available";
  const hasGallery   = listing.gallery.length > 0;
  const hasHoverSwap = !unavailable && listing.gallery.length > 1;
  const [imgLoaded, setImgLoaded] = useState(!hasGallery);
  const [hovered,   setHovered]   = useState(false);

  const showJustListed = !unavailable && isRecent(listing.datePosted);
  const timeAgo        = relativeTime(listing.datePosted);
  const pricePerSqm    = listing.sqm > 0 ? Math.round(listing.priceNGN / listing.sqm) : null;

  return (
    <Link
      href={`/properties/${listing.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl outline-none",
        "border border-border/60 bg-card",
        "shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
      style={{ viewTransitionName: `property-card-${listing.slug}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── IMAGE BLOCK ── */}
      <div className={cn(
        "relative overflow-hidden",
        featured ? "aspect-video" : "aspect-[4/3]",
      )}>

        {/* Skeleton */}
        {!imgLoaded && (
          <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-muted via-muted-foreground/5 to-muted" />
        )}

        {/* No-image placeholder */}
        {!hasGallery && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Building2 size={40} className="text-white/10" aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/20">No photo yet</p>
            </div>
          </div>
        )}

        {/* Images */}
        {hasGallery && (
          <>
            <Image
              src={listing.gallery[0]}
              alt={listing.title}
              fill
              priority={priority}
              quality={85}
              sizes={
                featured
                  ? "(min-width: 1024px) 66vw, 100vw"
                  : "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              }
              className={cn(
                "object-cover transition-all duration-700 ease-out will-change-transform",
                "group-hover:scale-105 motion-reduce:group-hover:scale-100",
                hovered && hasHoverSwap ? "opacity-0" : "opacity-100",
                !imgLoaded ? "opacity-0" : "",
                "motion-reduce:transition-none",
              )}
              onLoad={() => setImgLoaded(true)}
            />
            {hasHoverSwap && (
              <Image
                src={listing.gallery[1]}
                alt=""
                fill
                quality={80}
                sizes="(min-width: 1024px) 33vw, 100vw"
                className={cn(
                  "object-cover transition-opacity duration-700 ease-out",
                  hovered ? "opacity-100" : "opacity-0",
                  "motion-reduce:transition-none",
                )}
                aria-hidden="true"
              />
            )}
          </>
        )}

        {/* Status / type badges — top-left */}
        <div className="absolute left-3 top-3 z-20 flex flex-col items-start gap-1.5">
          {unavailable ? (
            <span className={cn(
              "rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md",
              STATUS_PILL[listing.status] ?? "bg-black/50 text-white",
            )}>
              {listing.status.replace("_", " ")}
            </span>
          ) : showJustListed ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-900/30">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
              Just Listed
            </span>
          ) : null}

          {listing.propertyType && (
            <span className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              {listing.propertyType}
            </span>
          )}
        </div>

        {/* Virtual tour badge — bottom-left of image */}
        {listing.virtualTourUrl && (
          <div className="absolute bottom-3 left-3 z-20">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
              <Video size={11} aria-hidden="true" />
              3D Tour
            </span>
          </div>
        )}

        {/* Favourite button — top-right */}
        <button
          type="button"
          onClick={toggleFav}
          aria-label={isFav ? "Remove from favourites" : "Save to favourites"}
          aria-pressed={isFav}
          className={cn(
            "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full",
            "border border-white/20 bg-white/10 backdrop-blur-md",
            "transition-all duration-300 hover:scale-110 hover:bg-white/20 active:scale-90",
            isFav && "border-rose-400/50 bg-rose-500/70",
            "motion-reduce:transition-none",
          )}
        >
          <Heart
            size={16}
            className={cn("text-white transition-transform duration-300", isFav && "fill-current")}
          />
        </button>
      </div>

      {/* ── CONTENT BLOCK ── */}
      <div className="flex flex-1 flex-col gap-1 p-4">

        {/* Price row */}
        <div className="flex items-baseline justify-between gap-2">
          <p className={cn(
            "font-bold tabular-nums tracking-tight text-foreground",
            featured ? "text-xl" : "text-lg",
          )}>
            <PriceDisplay priceNGN={listing.priceNGN} />
          </p>
          {pricePerSqm && (
            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
              <PriceDisplay priceNGN={pricePerSqm} />/sqm
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "line-clamp-1 font-serif font-semibold text-foreground",
          featured ? "text-base" : "text-sm",
        )}>
          {listing.title}
        </h3>

        {/* Location + time ago */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={11} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{listing.city}, {listing.country}</span>
          </div>
          {timeAgo && (
            <span className="shrink-0 text-[11px] text-muted-foreground/70">{timeAgo}</span>
          )}
        </div>

        {/* Stats */}
        <div className="mt-auto flex items-center gap-3 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={12} aria-hidden="true" />
            <strong className="font-semibold text-foreground">{listing.bedrooms}</strong>
            <span>{listing.bedrooms === 1 ? "bed" : "beds"}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={12} aria-hidden="true" />
            <strong className="font-semibold text-foreground">{listing.bathrooms}</strong>
            <span>{listing.bathrooms === 1 ? "bath" : "baths"}</span>
          </span>
          {listing.sqm > 0 && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 size={12} aria-hidden="true" />
              <strong className="font-semibold text-foreground">{listing.sqm.toLocaleString()}</strong>
              <span>sqm</span>
            </span>
          )}
          <span className="ml-auto">
            <ArrowUpRight
              size={18}
              className="rounded-full bg-primary p-0.5 text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 motion-reduce:transition-none"
            />
          </span>
        </div>
      </div>
    </Link>
  );
});
