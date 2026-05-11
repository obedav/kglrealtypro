import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Global route-level loading UI. Shown during RSC streaming when a page's
// data-fetch (e.g., WPGraphQL) hasn't resolved yet. Keeps layout stable so
// CLS stays low on mid-tier Nigerian mobile networks.
export default function Loading() {
  return (
    <>
      <Header />
      <main className="container py-20">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-5 w-96 animate-pulse rounded bg-muted/70" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border">
              <div className="aspect-[4/3] animate-pulse bg-muted" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
