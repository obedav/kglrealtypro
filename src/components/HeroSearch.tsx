"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface HeroSearchProps {
  cities: string[];
}

const TRUST_CHIPS = [
  { Icon: Building2,   label: "200+ Verified Listings" },
  { Icon: MapPin,      label: "Lagos · Dubai · London"  },
  { Icon: ShieldCheck, label: "Licensed Brokerage"      },
] as const;

const QUICK_CITIES = ["Lagos", "Abuja", "Dubai", "London"] as const;

const HERO_VIDEO = "/video/160033-820167238.mp4";

export function HeroSearch({ cities }: HeroSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  const [query, setQuery]       = useState("");
  const [city, setCity]         = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [beds, setBeds]         = useState("");

  const queryId = useId();
  const cityId  = useId();
  const bedsId  = useId();
  const minId   = useId();
  const maxId   = useId();

  const hasActiveFilters = Boolean(city || minPrice || maxPrice || beds);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city)         params.set("city", city);
    if (minPrice)     params.set("min", minPrice);
    if (maxPrice)     params.set("max", maxPrice);
    if (beds)         params.set("beds", beds);
    const qs = params.toString();
    startTransition(() => router.push(qs ? `/properties?${qs}` : "/properties"));
  }

  function goToCity(c: string) {
    startTransition(() => router.push(`/properties?city=${c}`));
  }

  return (
    <section className="relative isolate overflow-hidden bg-accent text-white">

      {/* ── Layer 1: single video — fills entire section, never remounts ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        src={HERO_VIDEO}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        aria-hidden="true"
      />

      {/* ── Layer 2a: desktop — solid left-panel bg with diagonal right edge ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] hidden bg-accent lg:block"
        style={{ clipPath: "polygon(0 0, 65% 0, 56% 100%, 0 100%)" }}
      />

      {/* ── Layer 2b: mobile — dark gradient overlay over full video ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/50 to-black/20 lg:hidden"
      />

      {/* ── Layer 3: right-panel depth gradients (desktop) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* ── Layout ── */}
      <div className="relative z-[3] flex min-h-[40vh] flex-col lg:min-h-[45vh] lg:flex-row">

        {/* ══════════════════════════════
            LEFT PANEL — content
        ══════════════════════════════ */}
        <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 text-center lg:w-[56%] lg:shrink-0 lg:items-start lg:px-20 lg:text-left">

          {/* Desktop ambient glow */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
            <div className="absolute -left-1/4 -top-1/3 aspect-square w-[700px] rounded-full bg-primary/10 blur-[130px]" />
            <div className="absolute bottom-0 right-0 aspect-square w-[300px] rounded-full bg-primary/5 blur-[80px]" />
          </div>

          <div className="relative w-full max-w-xl">

            {/* Headline */}
            <h1 className="text-balance">
              <span className="animate-in fade-in slide-in-from-bottom-4 block font-serif text-4xl font-normal tracking-tight duration-700 md:text-5xl xl:text-6xl">
                Exceptional Properties,
              </span>
              <span className="animate-in fade-in slide-in-from-bottom-4 block font-serif text-4xl font-semibold tracking-tight duration-700 delay-150 md:text-5xl xl:text-6xl">
                Across Three Continents.
              </span>
            </h1>

            {/* Trust chips */}
            <div className="animate-in fade-in slide-in-from-bottom-5 mt-7 flex flex-wrap items-center justify-center gap-2 duration-700 delay-200 lg:justify-start">
              {TRUST_CHIPS.map(({ Icon, label }) => (
                <div
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55 backdrop-blur-sm"
                >
                  <Icon size={11} className="shrink-0" />
                  {label}
                </div>
              ))}
            </div>

            {/* City quick-select chips */}
            <div className="animate-in fade-in slide-in-from-bottom-6 mt-8 flex flex-wrap items-center justify-center gap-2 duration-700 delay-300 lg:justify-start">
              <span className="shrink-0 text-xs text-white/35">Browse by city:</span>
              {QUICK_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={isPending}
                  onClick={() => goToCity(c)}
                  className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-medium text-white/70 backdrop-blur-sm transition-all hover:border-white/35 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <form
              onSubmit={onSubmit}
              className="animate-in fade-in slide-in-from-bottom-6 mt-5 duration-700 delay-300"
            >
              <div className="group relative flex items-center rounded-2xl border border-white/10 bg-white/5 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl transition-all focus-within:border-white/20 focus-within:bg-white/10 focus-within:ring-primary/20">
                <Search size={18} className="ml-4 shrink-0 text-white/40" aria-hidden="true" />
                <label htmlFor={queryId} className="sr-only">Search properties</label>
                <input
                  id={queryId}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Address, city, or keyword…"
                  className="h-14 w-full flex-1 bg-transparent px-3 py-3 text-base text-white placeholder:text-white/40 focus:outline-none md:h-16 md:text-lg"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mr-2 grid h-8 w-8 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="m-1.5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70 md:h-12 md:px-8"
                >
                  {isPending ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Search size={18} aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Filter toggle */}
              <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
                <button
                  type="button"
                  onClick={() => setShowFilters((s) => !s)}
                  aria-expanded={showFilters}
                  aria-controls="hero-filters"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
                >
                  <SlidersHorizontal size={14} aria-hidden="true" />
                  Filters
                  {hasActiveFilters && (
                    <span className="flex h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                  )}
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={`transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* Animated filter panel */}
              <div
                id="hero-filters"
                aria-hidden={!showFilters}
                className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${showFilters ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 shadow-2xl backdrop-blur-2xl sm:grid-cols-2">
                    <FilterField id={cityId} label="City">
                      <select
                        id={cityId}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.07] focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="" className="bg-popover text-popover-foreground">Any city</option>
                        {cities.map((c) => (
                          <option key={c} value={c} className="bg-popover text-popover-foreground">{c}</option>
                        ))}
                      </select>
                    </FilterField>
                    <FilterField id={bedsId} label="Bedrooms">
                      <select
                        id={bedsId}
                        value={beds}
                        onChange={(e) => setBeds(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/[0.07] focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="" className="bg-popover text-popover-foreground">Any</option>
                        {[1, 2, 3, 4, 5, 6].map((nb) => (
                          <option key={nb} value={nb} className="bg-popover text-popover-foreground">{nb}+</option>
                        ))}
                      </select>
                    </FilterField>
                    <FilterField id={minId} label="Min price (₦)">
                      <input
                        id={minId}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="e.g. 100,000,000"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors hover:bg-white/[0.07] focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </FilterField>
                    <FilterField id={maxId} label="Max price (₦)">
                      <input
                        id={maxId}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="e.g. 2,000,000,000"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 transition-colors hover:bg-white/[0.07] focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </FilterField>
                  </div>
                  {hasActiveFilters && (
                    <div className="mt-3 text-center lg:text-left">
                      <button
                        type="button"
                        onClick={() => { setCity(""); setMinPrice(""); setMaxPrice(""); setBeds(""); }}
                        className="text-xs font-medium text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
                      >
                        Reset all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>

            {/* Secondary CTAs */}
            <div className="animate-in fade-in slide-in-from-bottom-7 mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm duration-700 delay-500 lg:justify-start">
              <Link href="/properties" className="text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline">
                Browse all listings →
              </Link>
              <span aria-hidden="true" className="hidden text-white/20 sm:inline">|</span>
              <Link href="/contact" className="text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline">
                Speak to an agent →
              </Link>
            </div>

          </div>{/* /content */}

          {/* Scroll cue */}
          <div
            aria-hidden="true"
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 lg:left-20 lg:translate-x-0"
          >
            <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-white/30">Scroll</span>
            <span className="relative h-8 w-px overflow-hidden rounded-full bg-white/15">
              <span className="absolute inset-x-0 top-0 h-full animate-scroll-line bg-gradient-to-b from-transparent via-white/70 to-transparent" />
            </span>
          </div>

        </div>{/* /left panel */}

        {/* Right spacer — video shows through from layer 1 */}
        <div className="hidden lg:block lg:flex-1" />

      </div>
    </section>
  );
}

function FilterField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-widest text-white/50">
        {label}
      </label>
      {children}
    </div>
  );
}
