"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
import { useFavourite } from "@/lib/use-favourite";
import { ArrowUpRight, Bath, BedDouble, Heart, MapPin, Maximize2 } from "lucide-react";
import { PriceDisplay } from "@/components/PriceDisplay";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types";

interface PropertyCardProps {
  listing: Listing;
  className?: string;
  priority?: boolean;
  /** First card in the featured grid — landscape ratio + larger typography */
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
  const [imgLoaded, setImgLoaded]    = useState(false);
  const [hovered,   setHovered]      = useState(false);

  const unavailable    = listing.status !== "available";
  const showJustListed = !unavailable && isRecent(listing.datePosted);
  const timeAgo        = relativeTime(listing.datePosted);
  const hasGallery     = listing.gallery.length > 0;
  const hasHoverSwap   = !unavailable && listing.gallery.length > 1;

  return (
    <Link
      href={`/properties/${listing.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        featured ? "aspect-[4/3]" : "aspect-[4/3]",
        className
      )}
      style={{ viewTransitionName: `property-card-${listing.slug}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── SKELETON ── */}
      {!imgLoaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-br from-muted via-muted-foreground/5 to-muted" />
      )}

      {/* ── IMAGES (full bleed) ── */}
      {hasGallery && (
        <>
          <Image
            src={listing.gallery[0]}
            alt={listing.title}
            fill
            priority={priority}
            sizes={
              featured
                ? "(min-width: 1024px) 66vw, 100vw"
                : "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className={cn(
              "object-cover transition-all duration-700 ease-out will-change-transform",
              "group-hover:scale-105 motion-reduce:group-hover:scale-100",
              hovered && hasHoverSwap ? "opacity-0" : "opacity-100",
              "motion-reduce:transition-none"
            )}
            onLoad={() => setImgLoaded(true)}
          />
          {hasHoverSwap && (
            <Image
              src={listing.gallery[1]}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className={cn(
                "object-cover transition-opacity duration-700 ease-out",
                hovered ? "opacity-100" : "opacity-0",
                "motion-reduce:transition-none"
              )}
              aria-hidden="true"
            />
          )}
        </>
      )}

      {/* ── GRADIENT OVERLAY ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/0" />

      {/* ── TOP-LEFT BADGES ── */}
      <div className="absolute left-3 top-3 z-20 flex flex-col items-start gap-1.5">
        {unavailable ? (
          <span className={cn(
            "rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur-md",
            STATUS_PILL[listing.status] ?? "bg-black/50 text-white"
          )}>
            {listing.status.replace("_", " ")}
          </span>
        ) : showJustListed ? (
          <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg shadow-emerald-900/30">
            Just Listed
          </span>
        ) : null}

        {listing.propertyType && (
          <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {listing.propertyType}
          </span>
        )}
      </div>

      {/* ── FAVOURITE BUTTON ── */}
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
          "motion-reduce:transition-none"
        )}
      >
        <Heart
          size={16}
          className={cn("text-white transition-transform duration-300", isFav && "fill-current")}
        />
      </button>

      {/* ── CONTENT OVERLAY ── */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-4">

        {/* Price */}
        <p className="text-lg font-bold tabular-nums tracking-tight text-white">
          <PriceDisplay priceNGN={listing.priceNGN} />
        </p>

        {/* Title */}
        <h3 className="mt-0.5 line-clamp-1 font-serif text-sm font-semibold text-white/90">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="mt-1 flex items-center gap-1 text-xs text-white/55">
          <MapPin size={11} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{listing.city}, {listing.country}</span>
        </div>

        {/* Stats */}
        <div className="mt-2 flex items-center gap-3 border-t border-white/10 pt-2 text-[11px] text-white/60">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={12} aria-hidden="true" />
            <strong className="font-semibold text-white/90">{listing.bedrooms}</strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={12} aria-hidden="true" />
            <strong className="font-semibold text-white/90">{listing.bathrooms}</strong>
          </span>
          {listing.sqm > 0 && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 size={12} aria-hidden="true" />
              <strong className="font-semibold text-white/90">{listing.sqm.toLocaleString()}</strong>
              <span>sqm</span>
            </span>
          )}
          <span className="ml-auto">
            <ArrowUpRight
              size={18}
              className="rounded-full bg-primary p-0.5 text-white opacity-0 transition-all duration-300 group-hover:opacity-100"
            />
          </span>
        </div>

      </div>
    </Link>
  );
});
