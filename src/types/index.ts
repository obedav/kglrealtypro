export type ListingStatus = "available" | "sold" | "off_market" | "pending";

export type Listing = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  priceNGN: number;
  city: string;
  country: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  amenities: string[];
  gallery: string[];
  status: ListingStatus;
  datePosted: string;
  agentId?: string;
  propertyType?: string;
  virtualTourUrl?: string;
  featured?: boolean;
};

export type Agent = {
  id: string;
  slug: string;
  fullName: string;
  role: string;
  bio: string;
  photo?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  specialties: string[];
  languages: string[];
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  datePosted: string;
  featuredImage?: string;
  authorName: string;
  categories: string[];
};

export type InvestmentStatus = "available" | "sold_out" | "coming_soon";

export type InvestmentOpportunity = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  category?: string;
  locationDetail?: string;
  city: string;
  country: string;
  priceNGN: number;
  expectedRoiPct?: number;
  landSize?: string;
  unitsAvailable?: number;
  paymentPlan?: string;
  timeline?: string;
  titleType?: string;
  status: InvestmentStatus;
  featured: boolean;
  coverImage?: string;
  gallery: string[];
  datePosted: string;
  seoTitle?: string;
  metaDescription?: string;
};

export type LeadSource = "concierge" | "form" | "whatsapp" | "phone" | "referral";
export type LeadStatus = "new" | "qualified" | "contacted" | "tour_booked" | "won" | "lost";

export type Lead = {
  id: string;
  source: LeadSource;
  status: LeadStatus;
  fullName: string;
  phone?: string;
  email?: string;
  listingSlug?: string;
  interestSummary: string;
  budgetNGN?: number;
  locationPreference?: string;
  timeframe?: "immediate" | "3_months" | "6_months" | "12_months" | "exploratory";
  createdAt: string;
  notes?: string;
};

export type TourRequest = {
  id: string;
  listingSlug: string;
  preferredDate: string;
  preferredTimeWindow?: string;
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
};

export type HandoffRequest = {
  id: string;
  reason:
    | "legal_question"
    | "negotiation"
    | "off_market"
    | "complex_financing"
    | "user_requested"
    | "frustrated_tone"
    | "other";
  summary: string;
  urgency: "low" | "medium" | "high";
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
};
