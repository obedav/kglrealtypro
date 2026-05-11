/**
 * Public-site data access. Replaces the previous headless-WordPress boundary
 * at `lib/wp.ts`. The public API (function names + signatures) is unchanged
 * so every call site in `src/app/**` keeps working after a one-line import
 * swap.
 *
 * Mode selection:
 *   - If MYSQL_* env is set → live MySQL
 *   - If NODE_ENV=development and MySQL env is missing → demo stubs so the
 *     dev server renders end-to-end without a running DB
 *   - Otherwise → throw at module load (production must fail loud)
 */

import type { RowDataPacket } from "mysql2";
import { isDbConfigured, query, type ParamValue } from "@/lib/db";
import type { Agent, BlogPost, Listing, ListingStatus } from "@/types";

// ---------------------------------------------------------------------------
// Mode
// ---------------------------------------------------------------------------
function useStubs(): boolean {
  if (isDbConfigured()) return false;
  if (process.env.NODE_ENV === "development") {
    warnStubOnce();
    return true;
  }
  throw new Error("MySQL is not configured (set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE)");
}

let _warned = false;
function warnStubOnce() {
  if (_warned) return;
  _warned = true;
  console.warn(
    "\n[data] MySQL env not set — serving STUB data for local dev.\n" +
      "       Configure MYSQL_HOST / _USER / _PASSWORD / _DATABASE to hit a real DB.\n",
  );
}

// ---------------------------------------------------------------------------
// Stub data for dev
// ---------------------------------------------------------------------------
const STUB_LISTINGS: Listing[] = [
  {
    id: "stub-1",
    slug: "monastery-road-sangotedo",
    title: "5-Bedroom Detached Duplex, Monastery Road",
    excerpt: "Newly built 5-bed, 5-bath detached duplex on Monastery Road, Sangotedo — Ajah, Lagos.",
    description:
      "<p>A newly completed five-bedroom detached duplex on Monastery Road, Sangotedo. Finished to a modern specification with fitted kitchen, ensuite bedrooms, landscaped compound, and 24/7 estate security.</p>",
    priceNGN: 190_000_000,
    city: "Lagos",
    country: "Nigeria",
    bedrooms: 5,
    bathrooms: 5,
    sqm: 420,
    propertyType: "Detached Duplex",
    amenities: ["Fitted kitchen", "Ensuite", "Estate security", "Landscaped compound"],
    gallery: [],
    status: "available",
    datePosted: new Date().toISOString(),
    featured: true,
  },
  {
    id: "stub-2",
    slug: "lekki-oceanfront-villa",
    title: "Oceanfront Villa, Lekki Phase 1",
    excerpt:
      "Five-bedroom private residence with direct beach access, infinity pool, and dedicated staff quarters.",
    description:
      "<p>A rare oceanfront holding on Lekki Phase 1. The property spans 1,200 sqm on a private compound with 24/7 security, a dedicated pool terrace, and views across the lagoon.</p>",
    priceNGN: 1_450_000_000,
    city: "Lagos",
    country: "Nigeria",
    bedrooms: 5,
    bathrooms: 6,
    sqm: 820,
    propertyType: "Villa",
    amenities: ["Pool", "Ocean view", "Staff quarters", "Solar backup"],
    gallery: [],
    status: "available",
    datePosted: new Date().toISOString(),
    featured: true,
  },
  {
    id: "stub-3",
    slug: "maitama-diplomatic-residence",
    title: "Diplomatic Residence, Maitama",
    excerpt:
      "Four-bedroom ambassadorial home on a half-acre plot in Maitama's diplomatic quarter.",
    description:
      "<p>Discreet representation on a 2,000 sqm parcel in Maitama. Three reception rooms, a detached guest wing, and a landscaped garden with mature palms.</p>",
    priceNGN: 980_000_000,
    city: "Abuja",
    country: "Nigeria",
    bedrooms: 4,
    bathrooms: 5,
    sqm: 640,
    propertyType: "Mansion",
    amenities: ["Garden", "Guest wing", "Staff quarters"],
    gallery: [],
    status: "available",
    datePosted: new Date().toISOString(),
    featured: true,
  },
  {
    id: "stub-4",
    slug: "downtown-dubai-penthouse",
    title: "Penthouse, Downtown Dubai",
    excerpt:
      "Three-bedroom sky residence in Downtown Dubai with panoramic Burj Khalifa views.",
    description:
      "<p>An upper-floor penthouse with three terraces, full-height glazing, and a private lift lobby.</p>",
    priceNGN: 2_100_000_000,
    city: "Dubai",
    country: "United Arab Emirates",
    bedrooms: 3,
    bathrooms: 4,
    sqm: 420,
    propertyType: "Penthouse",
    amenities: ["Skyline view", "Private lift", "Concierge"],
    gallery: [],
    status: "available",
    datePosted: new Date().toISOString(),
    featured: true,
  },
];

const STUB_AGENTS: Agent[] = [
  {
    id: "stub-agent-1",
    slug: "adekunle-moruf",
    fullName: "Mr Adekunle Moruf",
    role: "CEO / Managing Director",
    bio: "<p>Adekunle leads the firm with two decades of luxury-residential experience across Lagos and Abuja.</p>",
    phone: "+2347038141774",
    whatsapp: "+2347038141774",
    email: "ceo@kglrealtypro.com",
    specialties: ["Luxury residential", "Diaspora clients", "Off-market sales"],
    languages: ["English", "Yoruba"],
  },
  {
    id: "stub-agent-2",
    slug: "popoola-nimotalai",
    fullName: "Mrs Popoola Nimotalai",
    role: "Lead Consultant",
    bio: "<p>Nimotalai runs buyer representation end-to-end, specialising in diaspora transactions.</p>",
    phone: "+2347038141774",
    email: "lead@kglrealtypro.com",
    specialties: ["Buyer representation", "Diaspora"],
    languages: ["English", "Yoruba"],
  },
];

const STUB_POSTS: BlogPost[] = [
  {
    id: "stub-post-1",
    slug: "lagos-luxury-market-q1-2026",
    title: "The Lagos Luxury Market — Q1 2026",
    excerpt: "A brief look at how the Lekki and Ikoyi high-end segments moved through Q1.",
    content: "<p>Demo content. Real posts load once MySQL is connected.</p>",
    datePosted: new Date().toISOString(),
    authorName: "KGL Research Desk",
    categories: ["Market analysis"],
  },
];

// ---------------------------------------------------------------------------
// Row → domain mappers
// ---------------------------------------------------------------------------
type ListingRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  price_ngn: string | number;
  city: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  amenities: string[] | string;
  property_type: string | null;
  status: ListingStatus;
  featured: 0 | 1;
  just_listed: 0 | 1;
  virtual_tour_url: string | null;
  date_posted: Date | string;
};

type ImageRow = RowDataPacket & { listing_id: number; url: string };

type AgentRow = RowDataPacket & {
  id: number;
  slug: string;
  full_name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  phone: string;
  whatsapp: string | null;
  email: string;
  specialties: string[] | string;
  languages: string[] | string;
};

type PostRow = RowDataPacket & {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  featured_image_url: string | null;
  categories: string[] | string;
  date_posted: Date | string;
};

function parseJsonArray(value: string[] | string): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toIso(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : String(d);
}

function mapListing(row: ListingRow, gallery: string[]): Listing {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    description: row.description,
    priceNGN: Number(row.price_ngn),
    city: row.city,
    country: row.country,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqm: row.sqm,
    amenities: parseJsonArray(row.amenities),
    gallery,
    propertyType: row.property_type ?? undefined,
    status: row.status,
    datePosted: toIso(row.date_posted),
    featured: Boolean(row.featured),
    virtualTourUrl: row.virtual_tour_url ?? undefined,
  };
}

function mapAgent(row: AgentRow): Agent {
  return {
    id: String(row.id),
    slug: row.slug,
    fullName: row.full_name,
    role: row.role,
    bio: row.bio,
    photo: row.photo_url ?? undefined,
    phone: row.phone,
    whatsapp: row.whatsapp ?? undefined,
    email: row.email,
    specialties: parseJsonArray(row.specialties),
    languages: parseJsonArray(row.languages),
  };
}

function mapPost(row: PostRow): BlogPost {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    datePosted: toIso(row.date_posted),
    featuredImage: row.featured_image_url ?? undefined,
    authorName: row.author_name,
    categories: parseJsonArray(row.categories),
  };
}

async function hydrateListings(rows: ListingRow[]): Promise<Listing[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  const images = await query<ImageRow>(
    `SELECT listing_id, url FROM listing_images
      WHERE listing_id IN (${placeholders})
      ORDER BY position ASC`,
    ids,
  );
  const galleryByListing = new Map<number, string[]>();
  for (const img of images) {
    const arr = galleryByListing.get(img.listing_id) ?? [];
    arr.push(img.url);
    galleryByListing.set(img.listing_id, arr);
  }
  return rows.map((r) => mapListing(r, galleryByListing.get(r.id) ?? []));
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------
export type ListingFilters = {
  q?: string;
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
  status?: Listing["status"];
  page?: number;
};

function matchesFilters(l: Listing, f: ListingFilters): boolean {
  if (f.q) {
    const needle = f.q.toLowerCase();
    const haystack = `${l.title} ${l.city} ${l.country} ${l.excerpt}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (f.city && l.city.toLowerCase() !== f.city.toLowerCase()) return false;
  if (f.type && l.propertyType?.toLowerCase() !== f.type.toLowerCase()) return false;
  if (f.minPrice && l.priceNGN < f.minPrice) return false;
  if (f.maxPrice && l.priceNGN > f.maxPrice) return false;
  if (f.bedrooms && l.bedrooms < f.bedrooms) return false;
  if (f.status && l.status !== f.status) return false;
  if (f.amenities && f.amenities.length > 0) {
    const have = new Set(l.amenities.map((a) => a.toLowerCase()));
    for (const want of f.amenities) {
      if (!have.has(want.toLowerCase())) return false;
    }
  }
  return true;
}

export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  if (useStubs()) {
    return STUB_LISTINGS.filter((l) => l.featured).slice(0, limit);
  }
  const rows = await query<ListingRow>(
    `SELECT * FROM listings
      WHERE featured = 1 AND status = 'available'
      ORDER BY date_posted DESC
      LIMIT ?`,
    [Math.max(1, Math.min(limit, 50))],
  );
  return hydrateListings(rows);
}

const PAGE_SIZE = 24;

export async function getListings(
  opts: ListingFilters & { first?: number } = {},
): Promise<Listing[]> {
  const page = Math.max(1, opts.page ?? 1);
  if (useStubs()) {
    const filtered = STUB_LISTINGS.filter((l) => matchesFilters(l, opts));
    const limit = opts.first ?? PAGE_SIZE;
    const offset = (page - 1) * limit;
    return filtered.slice(offset, offset + limit);
  }
  const where: string[] = [];
  const params: ParamValue[] = [];
  if (opts.q) {
    where.push("(title LIKE ? OR excerpt LIKE ? OR city LIKE ?)");
    const like = `%${opts.q}%`;
    params.push(like, like, like);
  }
  if (opts.city)      { where.push("city = ?");             params.push(opts.city); }
  if (opts.type)      { where.push("property_type = ?");    params.push(opts.type); }
  if (opts.minPrice)  { where.push("price_ngn >= ?");       params.push(opts.minPrice); }
  if (opts.maxPrice)  { where.push("price_ngn <= ?");       params.push(opts.maxPrice); }
  if (opts.bedrooms)  { where.push("bedrooms >= ?");        params.push(opts.bedrooms); }
  if (opts.status)    { where.push("status = ?");           params.push(opts.status); }
  if (opts.amenities?.length) {
    for (const a of opts.amenities) {
      where.push("JSON_CONTAINS(amenities, JSON_QUOTE(?))");
      params.push(a);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = Math.max(1, Math.min(opts.first ?? PAGE_SIZE, 500));
  const offset = (page - 1) * limit;
  const rows = await query<ListingRow>(
    `SELECT * FROM listings ${whereSql}
      ORDER BY featured DESC, date_posted DESC
      LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  return hydrateListings(rows);
}

export async function getListingCount(opts: ListingFilters = {}): Promise<number> {
  if (useStubs()) return STUB_LISTINGS.filter((l) => matchesFilters(l, opts)).length;
  const where: string[] = [];
  const params: ParamValue[] = [];
  if (opts.q) {
    where.push("(title LIKE ? OR excerpt LIKE ? OR city LIKE ?)");
    const like = `%${opts.q}%`;
    params.push(like, like, like);
  }
  if (opts.city)      { where.push("city = ?");          params.push(opts.city); }
  if (opts.type)      { where.push("property_type = ?"); params.push(opts.type); }
  if (opts.minPrice)  { where.push("price_ngn >= ?");    params.push(opts.minPrice); }
  if (opts.maxPrice)  { where.push("price_ngn <= ?");    params.push(opts.maxPrice); }
  if (opts.bedrooms)  { where.push("bedrooms >= ?");     params.push(opts.bedrooms); }
  if (opts.status)    { where.push("status = ?");        params.push(opts.status); }
  if (opts.amenities?.length) {
    for (const a of opts.amenities) {
      where.push("JSON_CONTAINS(amenities, JSON_QUOTE(?))");
      params.push(a);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await query<RowDataPacket & { n: number }>(
    `SELECT COUNT(*) AS n FROM listings ${whereSql}`,
    params,
  );
  return rows[0]?.n ?? 0;
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (useStubs()) return STUB_LISTINGS.find((l) => l.slug === slug) ?? null;
  const rows = await query<ListingRow>(
    "SELECT * FROM listings WHERE slug = ? LIMIT 1",
    [slug],
  );
  const hydrated = await hydrateListings(rows);
  return hydrated[0] ?? null;
}

export async function getListingSlugs(): Promise<string[]> {
  if (useStubs()) return STUB_LISTINGS.map((l) => l.slug);
  const rows = await query<RowDataPacket & { slug: string }>(
    "SELECT slug FROM listings ORDER BY date_posted DESC LIMIT 1000",
  );
  return rows.map((r) => r.slug);
}

export async function getListingFacets(): Promise<{
  cities: string[];
  amenities: string[];
  propertyTypes: string[];
}> {
  if (useStubs()) {
    const cities = new Set<string>();
    const amenities = new Set<string>();
    const propertyTypes = new Set<string>();
    for (const l of STUB_LISTINGS) {
      cities.add(l.city);
      for (const a of l.amenities) amenities.add(a);
      if (l.propertyType) propertyTypes.add(l.propertyType);
    }
    return {
      cities: [...cities].sort(),
      amenities: [...amenities].sort(),
      propertyTypes: [...propertyTypes].sort(),
    };
  }
  const [cityRows, amenityRows, typeRows] = await Promise.all([
    query<RowDataPacket & { city: string }>(
      "SELECT DISTINCT city FROM listings ORDER BY city ASC",
    ),
    query<RowDataPacket & { amenity: string }>(
      `SELECT DISTINCT jt.amenity AS amenity
         FROM listings,
              JSON_TABLE(amenities, '$[*]' COLUMNS (amenity VARCHAR(120) PATH '$')) AS jt
         ORDER BY jt.amenity ASC`,
    ),
    query<RowDataPacket & { property_type: string }>(
      "SELECT DISTINCT property_type FROM listings WHERE property_type IS NOT NULL ORDER BY property_type ASC",
    ),
  ]);
  return {
    cities: cityRows.map((r) => r.city).filter(Boolean),
    amenities: amenityRows.map((r) => r.amenity).filter(Boolean),
    propertyTypes: typeRows.map((r) => r.property_type).filter(Boolean),
  };
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------
export async function getAgents(): Promise<Agent[]> {
  if (useStubs()) return STUB_AGENTS;
  const rows = await query<AgentRow>(
    "SELECT * FROM agents ORDER BY id ASC LIMIT 100",
  );
  return rows.map(mapAgent);
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  if (useStubs()) return STUB_AGENTS.find((a) => a.slug === slug) ?? null;
  const rows = await query<AgentRow>(
    "SELECT * FROM agents WHERE slug = ? LIMIT 1",
    [slug],
  );
  return rows[0] ? mapAgent(rows[0]) : null;
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------
export async function getBlogPosts(limit = 12): Promise<BlogPost[]> {
  if (useStubs()) return STUB_POSTS.slice(0, limit);
  const rows = await query<PostRow>(
    "SELECT * FROM posts ORDER BY date_posted DESC LIMIT ?",
    [Math.max(1, Math.min(limit, 100))],
  );
  return rows.map(mapPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (useStubs()) return STUB_POSTS.find((p) => p.slug === slug) ?? null;
  const rows = await query<PostRow>(
    "SELECT * FROM posts WHERE slug = ? LIMIT 1",
    [slug],
  );
  return rows[0] ? mapPost(rows[0]) : null;
}

// ---------------------------------------------------------------------------
// Pages
// In the WP architecture this came from wp_posts of post_type=page. After the
// rebuild, static pages (/about, /contact, /terms, /privacy, /buyers-guide,
// etc.) are authored directly in `src/app/**` as React. Returning null here
// lets `<WpContentPage>` fall back to its built-in copy.
// ---------------------------------------------------------------------------
export async function getPageBySlug(_slug: string): Promise<{ title: string; content: string } | null> {
  return null;
}
