import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cms.kglrealtypro.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "imagedelivery.net" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Preserve SEO equity from the old site's per-city URLs. Each redirect maps a
  // top-level city path to the filtered listings view. Nigerian cities: 301
  // (permanent); Dubai stays because it's international and may move again.
  async redirects() {
    return [
      { source: "/lagos",      destination: "/properties?city=Lagos",      permanent: true },
      { source: "/abuja",      destination: "/properties?city=Abuja",      permanent: true },
      { source: "/ibadan",     destination: "/properties?city=Ibadan",     permanent: true },
      { source: "/ogun",       destination: "/properties?city=Ogun",       permanent: true },
      { source: "/asaba",      destination: "/properties?city=Asaba",      permanent: true },
      { source: "/dubai",      destination: "/properties?city=Dubai",      permanent: true },
      { source: "/about-us",   destination: "/about",                      permanent: true },
      { source: "/contact-us", destination: "/contact",                    permanent: true },
      { source: "/patners",    destination: "/partners",                   permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
