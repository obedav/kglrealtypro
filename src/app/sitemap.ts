import type { MetadataRoute } from "next";
import { getListingSlugs, getBlogPosts, getAgents } from "@/lib/data";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kglrealtypro.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,           lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/properties`, lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/agents`,     lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/blog`,       lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE}/about`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Pull dynamic routes in parallel. Any individual failure degrades to empty
  // rather than blocking sitemap generation — a partial sitemap is better than
  // a 500.
  const [listingSlugs, blogPosts, agents] = await Promise.all([
    getListingSlugs().catch(() => []),
    getBlogPosts(1000).catch(() => []),
    getAgents().catch(() => []),
  ]);

  const listingRoutes: MetadataRoute.Sitemap = listingSlugs.map((slug) => ({
    url: `${BASE}/properties/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.datePosted),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const agentRoutes: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${BASE}/agents/${agent.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...listingRoutes, ...blogRoutes, ...agentRoutes];
}
