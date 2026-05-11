import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, User, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { Reveal } from "@/components/Reveal";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/data";
import { sanitizeListingHtml } from "@/lib/sanitize";

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts(100);
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.datePosted,
    author: { "@type": "Person", name: post.authorName },
    image: post.featuredImage ? [post.featuredImage] : undefined,
  };

  const dateFormatted = new Date(post.datePosted).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header />

      {/* Article hero */}
      <section className="relative overflow-hidden bg-accent text-accent-foreground">
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

        <div className="container relative py-12 md:py-18">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 transition hover:text-white/80"
          >
            <ArrowLeft size={12} aria-hidden="true" /> All insights
          </Link>

          <Reveal>
            <div className="mt-5 max-w-3xl">
              {post.categories.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                    {post.categories[0]}
                  </p>
                </div>
              )}
              <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-4 text-base leading-relaxed text-white/60">{post.excerpt}</p>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={13} aria-hidden="true" />
                  {dateFormatted}
                </span>
                {post.authorName && (
                  <span className="inline-flex items-center gap-1.5">
                    <User size={13} aria-hidden="true" />
                    {post.authorName}
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="relative mx-auto aspect-[21/9] max-w-6xl overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}
      </section>

      <main className="container max-w-3xl py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <article>
          <div
            className="prose prose-lg prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeListingHtml(post.content) }}
          />
        </article>

        {/* Author block */}
        {post.authorName && (
          <Reveal>
            <div className="mt-14 flex items-start gap-4 rounded-2xl border bg-muted/30 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 font-serif text-lg font-bold text-primary">
                {post.authorName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Written by
                </p>
                <p className="mt-0.5 font-semibold">{post.authorName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  KGL Realty Pro Research Desk
                </p>
              </div>
            </div>
          </Reveal>
        )}

        {/* Back link */}
        <Reveal delay={100}>
          <div className="mt-10 border-t pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <ArrowLeft size={14} aria-hidden="true" /> Back to all insights
            </Link>
          </div>
        </Reveal>
      </main>

      {/* CTA band */}
      <section className="border-t bg-muted/30 py-14">
        <Reveal>
          <div className="container max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-semibold">Ready to act on this insight?</h2>
            <p className="mt-3 text-muted-foreground">
              Our advisors can translate market analysis into a concrete strategy for your portfolio.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Browse listings <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Speak to an agent
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
