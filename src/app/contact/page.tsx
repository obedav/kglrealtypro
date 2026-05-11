import { Mail, MessageCircle, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConciergeChat } from "@/components/ConciergeChat";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";

export const metadata = { title: "Contact" };

const CONTACT_ITEMS = [
  {
    Icon: Phone,
    label: "Phone",
    value: "+234 703 814 1774",
    href: "tel:+2347038141774",
    detail: "Mon – Fri, 9 am – 6 pm WAT",
  },
  {
    Icon: MessageCircle,
    label: "WhatsApp",
    value: "+234 703 814 1774",
    href: "https://wa.me/2347038141774",
    detail: "Fastest response — same day",
    external: true,
  },
  {
    Icon: Mail,
    label: "Email",
    value: "leads@kglrealtypro.com",
    href: "mailto:leads@kglrealtypro.com",
    detail: "We reply within 4 business hours",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const { listing } = await searchParams;

  return (
    <>
      <Header />
      <PageHero
        label="Get in touch"
        title="Let's talk"
        description="Tell us what you're looking for and one of our agents will follow up the same business day."
        breadcrumbs={[{ label: "Contact", href: "/contact" }]}
      />

      <main className="container py-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">

          {/* Contact details */}
          <div className="space-y-8">
            <div className="space-y-4">
              {CONTACT_ITEMS.map(({ Icon, label, value, href, detail, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-start gap-4 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 font-medium text-foreground">{value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="rounded-xl border bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Office
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                KGL Realty Pro<br />
                Suite 53, Road 5<br />
                Ikota Shopping Complex VGC<br />
                Lekki, Lagos State, Nigeria
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Private viewings by appointment only.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
            <h2 className="font-serif text-xl font-semibold">Send a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us your budget, preferred location, and timeline — we'll send a
              curated shortlist.
            </p>
            <div className="mt-6">
              <ContactForm prefilledListing={listing} />
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <ConciergeChat />
    </>
  );
}
