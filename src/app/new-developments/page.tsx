import { PropertyCard } from "@/components/PropertyCard";
import { ConciergeChat } from "@/components/ConciergeChat";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { getListings } from "@/lib/data";

export const metadata = { title: "New Developments" };
export const revalidate = 300;

export default async function NewDevelopmentsPage() {
  const listings = await getListings({ first: 60, status: "available" });

  return (
    <>
      <Header />
      <PageHero
        label="New Developments"
        title="Off-plan & pre-completion"
        description="Hand-picked off-plan and pre-completion residences across Lagos, Abuja, Dubai, and London."
        breadcrumbs={[{ label: "New Developments", href: "/new-developments" }]}
      />

      <main className="container py-14">
        {listings.length === 0 ? (
          <div className="rounded-2xl border bg-muted/30 p-12 text-center">
            <p className="font-serif text-xl text-muted-foreground">No developments listed yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back shortly — new projects are added regularly.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing, i) => (
              <PropertyCard key={listing.id} listing={listing} priority={i < 4} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <ConciergeChat />
    </>
  );
}
