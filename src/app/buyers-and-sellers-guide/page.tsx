import Link from "next/link";
import { ArrowRight, Search, Tag, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";

export const metadata = { title: "Buyer's and Seller's Guide" };

const GUIDES = [
  {
    href: "/buyers-guide",
    Icon: Search,
    badge: "Buying",
    title: "Buyer's Guide",
    body: "How to scope, evaluate, and close on a property with confidence. From brief-setting to legal completion — drafted by our senior brokers.",
    steps: [
      "Define your brief & budget",
      "Shortlist and schedule viewings",
      "Due diligence & title search",
      "Offer, negotiation & completion",
    ],
    cta: "Read the buyer's guide",
  },
  {
    href: "/sellers-guide",
    Icon: Tag,
    badge: "Selling",
    title: "Seller's Guide",
    body: "How to price, position, and sell a luxury property discreetly. Vetted buyer pools, managed viewings, and negotiation on your terms.",
    steps: [
      "Property valuation & positioning",
      "Marketing to qualified buyers",
      "Managed viewings & offers",
      "Completion & handover",
    ],
    cta: "Read the seller's guide",
  },
];

export default function GuidesIndex() {
  return (
    <>
      <Header />
      <PageHero
        label="Guides"
        title="Buyer's &amp; Seller's Guide"
        description="Whether you're acquiring or preparing to sell — our guides walk you through every step."
        breadcrumbs={[{ label: "Guides", href: "/buyers-and-sellers-guide" }]}
      />

      <main className="py-20">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2">
            {GUIDES.map(({ href, Icon, badge, title, body, steps, cta }, i) => (
              <Reveal key={href} delay={i * 100}>
                <Link
                  href={href}
                  className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-black/[0.07]">
                    <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
                    <div className="flex flex-1 flex-col p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                          <Icon size={22} className="text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-primary">
                            {badge}
                          </span>
                          <h2 className="mt-2 font-serif text-2xl font-semibold">{title}</h2>
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{body}</p>

                      <ul className="mt-6 space-y-2.5">
                        {steps.map((step, idx) => (
                          <li
                            key={step}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                              {idx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-8 flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5">
                        {cta} <ArrowRight size={13} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Bottom note */}
          <Reveal delay={200}>
            <div className="mt-12 flex items-start gap-3 rounded-2xl border bg-muted/30 p-6">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                All KGL transactions are handled by licensed professionals. Every guide reflects
                current Nigerian, UAE, and UK regulations — updated quarterly.
              </p>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
      <ConciergeChat />
    </>
  );
}
