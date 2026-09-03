"use client";

import { useState } from "react";
import { PropertyCard } from "@/components/PropertyCard";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types";

interface Props {
  listings: Listing[];
}

export function FeaturedListingsGrid({ listings }: Props) {
  const cities = Array.from(new Set(listings.map((l) => l.city))).sort();
  const [active, setActive] = useState<string | null>(null);

  const filtered = active ? listings.filter((l) => l.city === active) : listings;
  const isFeatured = (i: number) => i === 0 && active === null;

  return (
    <div>
      {/* City filter tabs */}
      {cities.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive(null)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
              active === null
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "border text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            All
          </button>
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setActive(active === city ? null : city)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                active === city
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Card grid — horizontal snap on mobile, CSS grid on sm+ */}
      <div
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4",
          "sm:mx-0 sm:snap-none sm:overflow-visible sm:px-0",
          "sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {filtered.map((listing, i) => (
          <div
            key={listing.id}
            className={cn(
              "w-[72%] flex-shrink-0 snap-start sm:w-auto",
              isFeatured(i) && "sm:col-span-2",
            )}
          >
            <Reveal delay={Math.min(i, 5) * 60} className="h-full">
              <PropertyCard
                listing={listing}
                priority={i < 4}
                featured={isFeatured(i)}
              />
            </Reveal>
          </div>
        ))}
      </div>

      {/* Mobile scroll hint — hidden once grid kicks in */}
      {filtered.length > 1 && (
        <p className="mt-3 text-center text-[11px] text-muted-foreground/70 sm:hidden">
          Swipe to browse more ↔
        </p>
      )}
    </div>
  );
}
