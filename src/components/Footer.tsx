"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin, ArrowRight, ArrowUp } from "lucide-react";

const SOCIALS = [
  { href: "https://facebook.com/kglrealtypro",      label: "Facebook",  Icon: Facebook  },
  { href: "https://www.instagram.com/kglrealtypro", label: "Instagram", Icon: Instagram },
  { href: "https://x.com/kglrealtypro",             label: "X",         Icon: Twitter   },
  { href: "https://youtube.com/kglrealtypro",       label: "YouTube",   Icon: Youtube   },
] as const;

const EXPLORE = [
  { label: "Properties",       href: "/properties"       },
  { label: "New Developments", href: "/new-developments" },
  { label: "Short Stay",       href: "/short-stay"       },
  { label: "Investment",       href: "/investment"       },
  { label: "Agents",           href: "/agents"           },
  { label: "Insights",         href: "/blog"             },
];

const COMPANY = [
  { label: "About Us",       href: "/about"         },
  { label: "Partners",       href: "/partners"      },
  { label: "Buyer's Guide",  href: "/buyers-guide"  },
  { label: "Seller's Guide", href: "/sellers-guide" },
  { label: "Contact",        href: "/contact"       },
];

const TRUST = [
  { title: "Licensed Brokerage",  body: "All transactions are handled by licensed real estate professionals."  },
  { title: "Title Verified",      body: "Legal-title checks and condition inspections on every listing."       },
  { title: "Same-Day Response",   body: "Every enquiry is acknowledged the same business day."                 },
];

export function Footer() {
  return (
    <footer className="bg-accent text-accent-foreground">

      {/* ── Top CTA band ── */}
      <div className="border-b border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <div>
            <p className="font-serif text-xl font-semibold text-white">
              Ready to find your next property?
            </p>
            <p className="mt-0.5 text-sm text-white/50">Our agents respond the same business day.</p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            Get in touch
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="relative overflow-hidden">

        {/* Decorative watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-4 -right-6 select-none font-serif text-[180px] font-black leading-none text-white/[0.03]"
        >
          KGL
        </div>

        {/* Subtle dot texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        <div className="container relative grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand + contact */}
          <div>
            <p className="font-serif text-2xl font-bold text-white">KGL Realty Pro</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
              Boutique luxury real estate across Nigeria, Dubai, and the United Kingdom.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <a
                  href="tel:+2347038141774"
                  className="inline-flex items-center gap-2.5 text-white/55 transition-colors hover:text-white"
                >
                  <Phone size={13} className="shrink-0 text-primary" />
                  +234 703 814 1774
                </a>
              </li>
              <li>
                <a
                  href="mailto:leads@kglrealtypro.com"
                  className="inline-flex items-center gap-2.5 text-white/55 transition-colors hover:text-white"
                >
                  <Mail size={13} className="shrink-0 text-primary" />
                  leads@kglrealtypro.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/55">
                <MapPin size={13} className="mt-0.5 shrink-0 text-primary" />
                <span>Suite 53, Road 5, Ikota Shopping Complex VGC, Lekki, Lagos</span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="mt-6 flex flex-wrap gap-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:border-primary/60 hover:bg-primary/20 hover:text-white"
                >
                  <Icon size={15} />
                </a>
              ))}
              <a
                href="https://www.tiktok.com/@kgl.realty.pro"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/50 transition-all hover:border-primary/60 hover:bg-primary/20 hover:text-white"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/25">Explore</p>
            <ul className="mt-5 space-y-3">
              {EXPLORE.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
                  >
                    <span className="h-px w-0 bg-primary transition-all duration-200 group-hover:w-3" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/25">Company</p>
            <ul className="mt-5 space-y-3">
              {COMPANY.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
                  >
                    <span className="h-px w-0 bg-primary transition-all duration-200 group-hover:w-3" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust pillars */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/25">Our Promise</p>
            <div className="mt-5 space-y-3">
              {TRUST.map(({ title, body }) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    <p className="text-xs font-semibold text-white">{title}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/45">{body}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KGL Realty Pro. All rights reserved.</p>
          <nav className="flex items-center gap-5" aria-label="Legal">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms"   className="transition-colors hover:text-white">Terms</Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/40 transition-all hover:border-white/20 hover:text-white"
            >
              Back to top
              <ArrowUp size={11} />
            </button>
          </nav>
        </div>
      </div>

    </footer>
  );
}
