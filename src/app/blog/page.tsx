import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { PageHero } from "@/components/PageHero";
import { getBlogPosts } from "@/lib/data";

export const metadata = { title: "Insights", alternates: { canonical: "/blog" } };
export const revalidate = 600;

export default async function BlogPage() {
  const posts = await getBlogPosts(24);

  return (
    <>
      <Header />
      <PageHero
        label="Insights"
        title="Market intelligence"
        description="Analysis, buying guides, and area profiles from the KGL research desk."
        breadcrumbs={[{ label: "Insights", href: "/blog" }]}
      />

      <main className="container py-14">
        {posts.length === 0 ? (
          <div className="rounded-2xl border bg-muted/30 p-12 text-center">
            <p className="font-serif text-xl text-muted-foreground">Articles coming soon.</p>
            <p className="mt-2 text-sm text-muted-foreground">Our research desk publishes market intelligence regularly — check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border bg-card shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.07] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      priority={i < 3}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-serif text-4xl font-bold text-primary/20">KGL</span>
                    </div>
                  )}

                  {/* Category badge */}
                  {post.categories.length > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-foreground shadow-lg">
                      {post.categories[0]}
                    </span>
                  )}

                  {/* Bottom fade */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-serif text-lg font-semibold leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>

                  {/* Meta row */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={12} aria-hidden="true" />
                        {new Date(post.datePosted).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {post.authorName && (
                        <span className="inline-flex items-center gap-1">
                          <User size={12} aria-hidden="true" />
                          {post.authorName}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 font-medium text-primary transition-gap group-hover:gap-1.5">
                      Read <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <ConciergeChat />
    </>
  );
}
