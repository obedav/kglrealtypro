"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// URL searchParams are the single source of truth — no client state duplication.
// Server-rendered results stay shareable via link and bookmarkable.

type Props = {
  cities: string[];
  amenities: string[];
  propertyTypes: string[];
  current: {
    q?: string;
    city?: string;
    type?: string;
    min?: string;
    max?: string;
    beds?: string;
    amenities?: string;
  };
};

export function SearchFilters({ cities, amenities, propertyTypes, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      // Reset to page 1 on any filter change
      next.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`);
      });
    },
    [router, pathname, searchParams],
  );

  const currentAmenities = new Set(
    current.amenities ? current.amenities.split(",").filter(Boolean) : [],
  );

  const toggleAmenity = (name: string) => {
    const next = new Set(currentAmenities);
    next.has(name) ? next.delete(name) : next.add(name);
    update({ amenities: next.size === 0 ? null : [...next].join(",") });
  };

  return (
    <aside className="sticky top-8 space-y-6 self-start rounded-lg border p-5" aria-busy={isPending}>
      {/* Keyword search */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Keyword
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
            update({ q: val || null });
          }}
          className="flex gap-2"
        >
          <Input
            name="q"
            type="search"
            defaultValue={current.q}
            placeholder="Address, title, city…"
          />
          <Button type="submit" size="icon" variant="outline" aria-label="Search">
            <Search size={16} />
          </Button>
        </form>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          City
        </label>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={current.city ?? ""}
          onChange={(e) => update({ city: e.target.value || null })}
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {propertyTypes.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Property type
          </label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={current.type ?? ""}
            onChange={(e) => update({ type: e.target.value || null })}
          >
            <option value="">All types</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Price (₦)
        </label>
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            defaultValue={current.min}
            onBlur={(e) => update({ min: e.target.value || null })}
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            defaultValue={current.max}
            onBlur={(e) => update({ max: e.target.value || null })}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Bedrooms
        </label>
        <div className="flex gap-2">
          {["", "1", "2", "3", "4", "5"].map((n) => (
            <button
              key={n || "any"}
              type="button"
              onClick={() => update({ beds: n || null })}
              className={
                "h-10 flex-1 rounded-md border text-sm transition " +
                ((current.beds ?? "") === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-muted")
              }
            >
              {n || "Any"}
              {n === "5" ? "+" : ""}
            </button>
          ))}
        </div>
      </div>

      {amenities.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Amenities
          </label>
          <div className="flex flex-wrap gap-2">
            {amenities.map((name) => {
              const active = currentAmenities.has(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAmenity(name)}
                  className={
                    "rounded-full border px-3 py-1 text-xs transition " +
                    (active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted")
                  }
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          update({ q: null, city: null, type: null, min: null, max: null, beds: null, amenities: null })
        }
        className="w-full"
      >
        Clear all filters
      </Button>
    </aside>
  );
}
