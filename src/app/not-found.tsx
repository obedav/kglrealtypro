import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          404 — Not found
        </p>
        <h1 className="mt-4 max-w-xl font-serif text-4xl font-medium leading-tight md:text-5xl">
          We couldn&apos;t find the page you were looking for.
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          The listing may have been sold, the page moved, or the link mistyped. Start
          fresh from any of these.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild><Link href="/properties">Browse properties</Link></Button>
          <Button asChild variant="outline"><Link href="/">Home</Link></Button>
          <Button asChild variant="outline"><Link href="/contact">Speak to an agent</Link></Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
