// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Lato, Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/lib/currency-context";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

/* ------------------------------------------------------------------ */
//  Typography
//  We use next/font/google which downloads, subsets, and self-hosts
//  these files at build time (zero external requests at runtime).
/* ------------------------------------------------------------------ */

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-sans",   // body copy
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif", // maps to tailwind's font-serif slot (display / headings)
  display: "swap",
});

/* ------------------------------------------------------------------ */
//  Viewport (Next.js 14+ separate export)
/* ------------------------------------------------------------------ */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080F45",
};

/* ------------------------------------------------------------------ */
//  Metadata
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://kglrealtypro.com"
  ),
  title: {
    default: "KGL Realty Pro — Luxury Real Estate",
    template: "%s | KGL Realty Pro",
  },
  description:
    "Luxury properties for sale in Lagos, Abuja, UK, and UAE. KGL Realty Pro — licensed real estate agency with curated listings, private viewings, and expert advisory.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "KGL Realty Pro",
    locale: "en_NG",
    images: [
      {
        url: "/og-image.jpg", // 1200×630 recommended
        width: 1200,
        height: 630,
        alt: "KGL Realty Pro — Luxury Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    // creator: "@kglrealtypro", // uncomment if you have a handle
  },
  robots: { index: true, follow: true },
};

/* ------------------------------------------------------------------ */
//  Layout
/* ------------------------------------------------------------------ */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning // keep only if you wrap with ThemeProvider
      className={`${lato.variable} ${montserrat.variable} scroll-smooth`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}