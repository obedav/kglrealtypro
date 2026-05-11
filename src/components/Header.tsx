"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About Us",  href: "/about"    },
      { label: "Partners",  href: "/partners" },
    ],
  },
  {
    label: "Guides",
    href: "/buyers-and-sellers-guide",
    children: [
      { label: "Buyer's Guide",  href: "/buyers-guide"  },
      { label: "Seller's Guide", href: "/sellers-guide" },
    ],
  },
  {
    label: "Listings",
    href: "/properties",
    children: [
      { label: "Lagos",            href: "/properties?city=Lagos"  },
      { label: "Abuja",            href: "/properties?city=Abuja"  },
      { label: "Ibadan",           href: "/properties?city=Ibadan" },
      { label: "Ogun",             href: "/properties?city=Ogun"   },
      { label: "Asaba",            href: "/properties?city=Asaba"  },
      { label: "Dubai",            href: "/properties?city=Dubai"  },
      { label: "New Developments", href: "/new-developments"       },
      { label: "Short Stay",       href: "/short-stay"             },
    ],
  },
  {
    label: "Investment",
    href: "/investment",
    children: [
      { label: "Cashback",   href: "/investment/cashback"   },
      { label: "Land Vest",  href: "/investment/land-vest"  },
    ],
  },
  { label: "Blog",    href: "/blog"    },
  { label: "Agents",  href: "/agents"  },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname       = usePathname();
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [openDropdown,  setOpenDropdown]  = useState<string | null>(null);
  const [scrolled,      setScrolled]      = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 80); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isTransparent = pathname === "/" && !scrolled;

  function isActive(item: NavItem): boolean {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href.split("?")[0]);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        isTransparent
          /* Dark gradient gives nav links a legible backdrop over any hero content */
          ? "border-transparent bg-gradient-to-b from-black/55 via-black/20 to-transparent"
          : "border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="KGL Realty Pro home">
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={43}
            priority
            className="h-9 w-auto"
          />
          <span
            className={cn(
              "hidden font-serif text-lg font-semibold tracking-tight transition-colors duration-300 sm:inline",
              isTransparent ? "text-white" : "text-primary",
            )}
          >
            KGL Realty Pro
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Main navigation">
          {NAV.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive(item)
                    ? isTransparent
                      ? "bg-white/15 text-white"
                      : "bg-primary/[8%] text-primary"
                    : isTransparent
                    ? "text-white/90 hover:bg-white/10 hover:text-white"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
                {item.children && (
                  <ChevronDown
                    size={13}
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 opacity-60 transition-transform duration-200",
                      openDropdown === item.label && "rotate-180 opacity-100",
                    )}
                  />
                )}
              </Link>

              {/* Dropdown */}
              {item.children && (
                <div
                  className={cn(
                    /* Invisible top spacer bridges the hover gap between link and panel */
                    "absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2",
                    "pointer-events-none transition-all duration-200 ease-out",
                    openDropdown === item.label
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0",
                  )}
                >
                  <div className={cn(
                    "min-w-[200px] overflow-hidden rounded-xl border border-border/60",
                    "bg-background/95 shadow-xl shadow-black/10 backdrop-blur-xl",
                  )}>
                    {/* Primary accent top bar */}
                    <div className="h-0.5 bg-primary" />
                    <div className="py-1.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-muted",
                            pathname.startsWith(child.href.split("?")[0])
                              ? "font-semibold text-primary"
                              : "text-foreground/80",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Currency + theme — desktop */}
        <div className="hidden items-center gap-2 lg:flex">
          <CurrencyToggle />
          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors lg:hidden",
            isTransparent ? "text-white hover:bg-white/10" : "hover:bg-muted",
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div id="mobile-nav" className="border-t bg-background lg:hidden">
          <nav className="container space-y-0.5 py-4" aria-label="Mobile navigation">
            {NAV.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                    isActive(item) ? "text-primary" : "text-foreground/80",
                  )}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="mb-1 ml-3 space-y-0.5 border-l-2 border-border/50 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                          pathname.startsWith(child.href.split("?")[0])
                            ? "font-medium text-primary"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="container flex items-center justify-between border-t py-3">
            <CurrencyToggle />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
