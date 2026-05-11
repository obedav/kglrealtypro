import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { Reveal } from "@/components/Reveal";
import { getPageBySlug } from "@/lib/data";
import { sanitizeListingHtml } from "@/lib/sanitize";

type Props = {
  slug: string;
  fallback: {
    title: string;
    body: string;
  };
  /** Small gold label shown above the title in the page hero. */
  label?: string;
};

export async function WpContentPage({ slug, fallback, label }: Props) {
  const page = await getPageBySlug(slug);
  const title = page?.title ?? fallback.title;
  const html = page?.content ?? fallback.body;

  return (
    <>
      <Header />

      {/* Page hero */}
      <section className="relative overflow-hidden bg-accent py-14 text-accent-foreground md:py-20">
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
          className="pointer-events-none absolute -left-1/4 top-0 aspect-square w-[500px] rounded-full bg-primary/10 blur-[120px]"
        />
        <div className="container relative">
          <Reveal>
            {label && (
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-8 bg-primary" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  {label}
                </p>
              </div>
            )}
            <h1 className="font-serif text-4xl font-semibold text-white md:text-5xl">{title}</h1>
          </Reveal>
        </div>
      </section>

      {/* Content */}
      <main className="container max-w-3xl py-16">
        <div
          className="prose prose-lg prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeListingHtml(html) }}
        />
      </main>

      {/* CTA band */}
      <section className="border-t bg-muted/30 py-14">
        <Reveal>
          <div className="container max-w-xl text-center">
            <h2 className="font-serif text-2xl font-semibold">Have a question?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Our team is available to walk you through any aspect of the process.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Contact an agent <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Browse listings
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
      <ConciergeChat />
    </>
  );
}
