import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Globe, ShieldCheck, Users, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";

export const metadata = { title: "About Us" };

const VALUES = [
  { Icon: ShieldCheck, title: "Integrity first",    body: "Every listing passes a legal-title check and condition inspection before it reaches this site. We only show what we can stand behind." },
  { Icon: Users,       title: "Client-centric",     body: "Buyer representation is typically fee-free. Our agents earn when you complete — our incentive is always aligned with yours." },
  { Icon: Globe,       title: "Global reach",       body: "Offices and partnerships in Lagos, Abuja, Dubai, and the United Kingdom give our clients access to three of the world's most dynamic property markets." },
  { Icon: TrendingUp,  title: "Market intelligence", body: "We publish regular market analysis so clients can make informed decisions — not just find a property, but understand its value." },
];

const TEAM = [
  { name: "Mr Adekunle Moruf",         role: "CEO / Managing Director",  photo: "/images/Mr Adekunle Moruf.jpeg"     },
  { name: "Mrs Popoola Nimotalai",     role: "Lead Consultant",          photo: "/images/Mrs Popoola Nimotalai.jpeg" },
  { name: "Miss Oyinkansola Adekunle", role: "Sales Executive",          photo: undefined                           },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <PageHero
        label="About us"
        title="Who we are"
        description="A boutique licensed brokerage operating across Nigeria, Dubai, and the United Kingdom."
        breadcrumbs={[{ label: "About", href: "/about" }]}
      />

      <main>

        {/* Story */}
        <section className="py-20">
          <div className="container grid gap-14 md:grid-cols-2 md:items-center">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Our story</p>
              </div>
              <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">
                Built on trust, driven by results.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                KGL Realty Pro was founded with a single mandate: bring the standards of
                international luxury brokerage to Nigerian clients, and connect Nigerian
                buyers with the most compelling overseas opportunities.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Today we represent a curated portfolio across Lagos, Abuja, Dubai, and
                London — each listing individually verified, each transaction handled by
                a licensed professional.
              </p>
              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t pt-8">
                {[
                  { value: "200+", label: "Verified listings"  },
                  { value: "3",    label: "Countries"          },
                  { value: "10+",  label: "Years experience"   },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-serif text-3xl font-bold text-primary">{value}</p>
                    <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/images/story.PNG"
                  alt="KGL Realty Pro — our story"
                  fill
                  sizes="(min-width:768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Values */}
        <section className="relative overflow-hidden border-y bg-accent py-20 text-accent-foreground">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-1/4 top-0 aspect-square w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          <div className="container relative">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">What we stand for</p>
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">Our values</h2>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map(({ Icon, title, body }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <h3 className="mt-5 font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Team preview */}
        <section className="py-20">
          <div className="container">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">The team</p>
                  <span className="h-px w-8 bg-primary" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-serif text-3xl font-semibold md:text-4xl">The people behind KGL</h2>
                <p className="mt-4 text-muted-foreground">Licensed professionals with hands-on knowledge of every market we serve.</p>
              </div>
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
              {TEAM.map((person, i) => {
                const initials = person.name
                  .replace(/^(Mr|Mrs|Miss|Ms|Dr)\.?\s+/i, "")
                  .split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <Reveal key={person.name} delay={i * 100}>
                    <div className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                      <div className="relative aspect-[3/3.5] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/20">
                        {person.photo ? (
                          <Image src={person.photo} alt={person.name} fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-serif text-6xl font-bold text-primary/30">{initials}</span>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-lg font-semibold">{person.name}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{person.role}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={400}>
              <div className="mt-10 text-center">
                <Button asChild variant="outline" className="rounded-full px-8">
                  <Link href="/agents">Meet the full team</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/30 py-16">
          <div className="container max-w-2xl text-center">
            <Reveal>
              <h2 className="font-serif text-3xl font-semibold">Ready to work with us?</h2>
              <p className="mt-4 text-muted-foreground">Whether buying, selling, or investing — our team is ready to help you find the right property.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/properties" className="inline-flex items-center gap-2">
                    Browse listings <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Contact an agent</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

      </main>

      <Footer />
      <ConciergeChat />
    </>
  );
}
