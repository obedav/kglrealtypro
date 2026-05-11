import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { PropertyCard } from "@/components/PropertyCard";
import { ConciergeChat } from "@/components/ConciergeChat";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilters } from "@/components/search/SearchFilters";
import { getListingFacets, getListings, getListingCount } from "@/lib/data";

export const metadata = { title: "Properties" };
export const revalidate = 300;

const PAGE_SIZE = 24;

type SearchParams = {
  q?: string;
  city?: string;
  type?: string;
  min?: string;
  max?: string;
  beds?: string;
  amenities?: string;
  page?: string;
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const amenityList = params.amenities?.split(",").filter(Boolean);

  const filters = {
    q: params.q,
    city: params.city,
    type: params.type,
    minPrice: params.min ? Number(params.min) : undefined,
    maxPrice: params.max ? Number(params.max) : undefined,
    bedrooms: params.beds ? Number(params.beds) : undefined,
    amenities: amenityList,
    page,
    first: PAGE_SIZE,
  };

  const [listings, total, facets] = await Promise.all([
    getListings(filters),
    getListingCount(filters),
    getListingFacets(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.city) sp.set("city", params.city);
    if (params.type) sp.set("type", params.type);
    if (params.min) sp.set("min", params.min);
    if (params.max) sp.set("max", params.max);
    if (params.beds) sp.set("beds", params.beds);
    if (params.amenities) sp.set("amenities", params.amenities);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/properties?${qs}` : "/properties";
  }

  return (
    <>
      <Header />
      <PageHero
        label="Listings"
        title="Properties"
        description={`${total} ${total === 1 ? "listing" : "listings"} across Nigeria, Dubai, and the UK.`}
        breadcrumbs={[{ label: "Properties", href: "/properties" }]}
      />

      <main className="container py-10">
        {params.q && (
          <p className="mb-6 text-sm text-muted-foreground">
            Results for &ldquo;<span className="font-medium text-foreground">{params.q}</span>&rdquo;
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <SearchFilters
            cities={facets.cities}
            amenities={facets.amenities}
            propertyTypes={facets.propertyTypes}
            current={params}
          />

          <div>
            {listings.length === 0 ? (
              <div className="rounded-2xl border bg-muted/30 p-10 text-center">
                <p className="font-serif text-xl text-muted-foreground">No listings match those filters.</p>
                <p className="mt-2 text-sm text-muted-foreground">Try widening the price range or removing a filter.</p>
                <Link href="/properties" className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
                  Clear all filters →
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {listings.map((listing, i) => (
                    <PropertyCard key={listing.id} listing={listing} priority={i < 4} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
                    {page > 1 && (
                      <Link href={pageUrl(page - 1)} className="rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-muted">
                        ← Prev
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        item === "…" ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
                        ) : (
                          <Link
                            key={item}
                            href={pageUrl(item)}
                            aria-current={item === page ? "page" : undefined}
                            className={`h-9 w-9 inline-flex items-center justify-center rounded-full border text-sm font-medium transition ${
                              item === page
                                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "hover:bg-muted"
                            }`}
                          >
                            {item}
                          </Link>
                        )
                      )}
                    {page < totalPages && (
                      <Link href={pageUrl(page + 1)} className="rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-muted">
                        Next →
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ConciergeChat />
    </>
  );
}
