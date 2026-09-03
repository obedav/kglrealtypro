import type { Listing } from "@/types";
import { CONTACT } from "@/lib/constants";

interface RuleContext {
  listing?: Listing;
}

interface ConciergeRule {
  id: string;
  patterns: RegExp[];
  answer: string | ((ctx: RuleContext) => string);
}

const WA    = CONTACT.phoneDisplay;
const EMAIL = CONTACT.emailGeneral;
const ADDR  = CONTACT.address.display;

// ─── RULES ────────────────────────────────────────────────────────────────────
// Order matters: first match wins. Put more-specific patterns above more-general
// ones where patterns could overlap (e.g. nigerian_title before legal).

const RULES: ConciergeRule[] = [

  // ── Greetings ────────────────────────────────────────────────────────────────
  {
    id: "greeting",
    patterns: [/^\s*(hi+|hello|hey|good\s*(morning|afternoon|evening)|howdy|how\s+are\s+you)\b/i],
    answer:
      "Hello! Welcome to KGL Realty Pro. I can help with questions about our properties, the buying process, viewings, and how to reach our agents. What would you like to know?",
  },

  // ── Thanks / affirmations ─────────────────────────────────────────────────────
  {
    id: "thanks",
    patterns: [
      /^\s*(thank(s|\s+you)?|bye|goodbye|cheers|ok(ay)?|great|perfect|noted|understood|alright|sounds\s+good)\b/i,
    ],
    answer: `You're welcome! If you have any other questions, feel free to ask. Our agents are also available directly on WhatsApp: ${WA}`,
  },

  // ── Complaints / frustration ──────────────────────────────────────────────────
  // Must come early — frustrated users may also say "speak to someone" (contact rule)
  {
    id: "complaints",
    patterns: [
      /\b(frustrated|disappointed|not\s+happy|unhappy|unsatisfied|bad\s+experience|misleading|incorrect|inaccurate|problem\s+with|issue\s+with|complaint|concern|something\s+wrong|let\s+down)\b/i,
    ],
    answer: `I'm sorry you've had a frustrating experience — that's not the standard we aim for. Rather than troubleshoot via chat, I'd like to connect you directly with our team so they can understand the issue and resolve it properly.\n\nPlease reach out immediately:\n\n• WhatsApp: ${WA}\n• Email: ${EMAIL}\n\nOur agents respond the same business day and will work to make this right. Thank you for giving us the chance to improve.`,
  },

  // ── Clarification / confusion ─────────────────────────────────────────────────
  {
    id: "clarification",
    patterns: [
      /\b(explain|clarify|what\s+do(es)?\s+(that|this)\s+mean|don.?t\s+(understand|get\s+it)|unclear|confused|what.?s\s+the\s+difference|what\s+is\s+(a|an|the)\s+\w+|how\s+does\s+\w+\s+work|can\s+you\s+break\s+down)\b/i,
    ],
    answer: `Of course — happy to clarify. Real estate jargon can be overwhelming, especially across different markets.\n\n• **Buyer's Guide** at /buyers-guide covers step-by-step processes, title types, and key terms\n• **Seller's Guide** at /sellers-guide explains valuation and marketing\n\nIf something specific confused you, share it and I'll do my best to break it down — or connect you with an agent who can walk through it in detail.\n\n• WhatsApp: ${WA}`,
  },

  // ── Nigerian title / legal terminology (before general "legal" rule) ───────────
  {
    id: "nigerian_title",
    patterns: [
      /\b(certificate\s+of\s+occupancy|c\s*of\s*o\b|c\.o\.o|deed\s+of\s+assignment|survey\s+plan|governor.?s\s+consent|excision|land\s+certificate|right\s+of\s+occupancy|proof\s+of\s+ownership|registered\s+title|conveyance|land\s+use\s+charge|ground\s+rent|absolute\s+(title|ownership)|offer\s+letter|letter\s+of\s+offer|irrevocable\s+power\s+of\s+attorney|ipoa|gazette|gazett)\b/i,
    ],
    answer: `**Quick Nigerian Title Guide:**\n\n**C of O (Certificate of Occupancy)** — Highest title grade in Lagos & most states. Issued by the State Governor; represents absolute right of occupancy. Most secure title to hold.\n\n**Governor's Consent** — Formal approval required to transfer a C of O from seller to buyer in Lagos. Processing takes 4–8 weeks and incurs state fees (~3% of property value).\n\n**Deed of Assignment** — The legal document that transfers ownership. Your solicitor prepares it; both parties sign before a notary.\n\n**Survey Plan** — Certified document showing exact plot boundaries, size, and coordinates. Required for title verification.\n\n**Excision** — Process where government releases originally crown/state land for private ownership. Common in new Lagos estates and parts of Abuja.\n\n**Land Use Charge / Ground Rent** — Annual government levy on property ownership. Varies by LGA and property size.\n\n**Offer Letter** — Preliminary document confirming agreed purchase terms before contracts are exchanged.\n\n**IPOA (Irrevocable Power of Attorney)** — Confers ownership control. Less secure than a full Deed; used in some transactions — always verify with a solicitor.\n\nEvery property we list has been title-verified. For legal advice specific to your transaction:\n\n• WhatsApp: ${WA}`,
  },

  // ── Viewing / scheduling (before price, so "how much is a viewing" hits price) ─
  {
    id: "viewing",
    patterns: [
      /\b(view|viewing|visit|tour|schedule|book\s+a\s+(tour|viewing|appointment)|see\s+the\s+propert|inspect|private\s+viewing|arrange\s+a\s+(visit|viewing|tour))\b/i,
    ],
    answer: ({ listing }) =>
      listing
        ? `To schedule a private viewing for ${listing.title}, use the "Request a Viewing" form on this page, or contact our agent directly:\n\n• WhatsApp: ${WA}\n\nWe confirm appointments within the same business day.`
        : `We schedule all viewings by private appointment. Use the "Request a Viewing" form on any listing page, or contact us directly:\n\n• WhatsApp: ${WA}\n\nWe confirm a time within the same business day.`,
  },

  // ── Budget shortlist / "what can you show me" ─────────────────────────────────
  {
    id: "shortlist",
    patterns: [
      /\b(shortlist|what\s+can\s+you\s+show\s+me|what\s+do\s+you\s+have|i.?m\s+looking\s+for|looking\s+for\s+a|find\s+me\s+a|match\s+me|i\s+have\s+a\s+budget\s+of|within\s+my\s+budget|show\s+me\s+options|curate|help\s+me\s+find)\b/i,
    ],
    answer: `To build your personalised shortlist, our agents need:\n\n1. **Budget** (in NGN, USD, GBP, or AED)\n2. **Location(s)** — Lagos, Abuja, Dubai, London, or a mix?\n3. **Property type** — Apartment, villa, townhouse, off-plan, land?\n4. **Must-haves** — Bedrooms, estate security, furnished, parking, BQ?\n5. **Timeline** — When are you looking to complete?\n6. **Intent** — Owner-occupancy or investment?\n\nShare these details on WhatsApp and we'll deliver 3–5 curated matches within 24 hours.\n\n• WhatsApp: ${WA}`,
  },

  // ── Price / asking price ──────────────────────────────────────────────────────
  {
    id: "price",
    patterns: [
      /\b(price|cost|how\s+much|afford|asking\s+price|what\s+is\s+the\s+(price|cost|value)|price\s+range|what\s+does\s+it\s+cost)\b/i,
    ],
    answer: ({ listing }) =>
      listing
        ? `The asking price for ${listing.title} is displayed at the top of this page. For payment plans, off-plan terms, or to discuss pricing:\n\n• WhatsApp: ${WA}`
        : `Each listing shows its asking price on the property detail page. For a shortlist within your budget, or a more detailed pricing discussion:\n\n• WhatsApp: ${WA}`,
  },

  // ── Visa / residency pathways (before diaspora rule — more specific) ───────────
  {
    id: "visa_residency",
    patterns: [
      /\b(visa|golden\s+visa|residency\s+(visa|permit|pathway|status)|uae\s+(residency|visa)|dubai\s+visa|immigration|settle\s+in|right\s+to\s+reside|property\s+(as|for)\s+visa|qualify\s+for\s+(a\s+)?visa)\b/i,
    ],
    answer: `Property ownership opens residency pathways in some markets:\n\n**UAE (Dubai / Abu Dhabi):**\n• **Golden Visa** — 5–10 year residency for property purchases of AED 2M or more (≈ ₦450M+)\n• Renewable and includes family sponsorship rights\n• Not automatic — a separate application is required\n• Our UAE partner team coordinates the full process\n\n**United Kingdom:**\n• Property ownership alone does not confer UK residency\n• Investor visa routes exist (£2M+ investment) but require a separate application\n\n**Nigeria:**\n• No direct visa benefit, but ownership can support future visa applications\n\nFor a residency-aware property acquisition strategy:\n\n• WhatsApp: ${WA}`,
  },

  // ── Diaspora / international buyers ──────────────────────────────────────────
  {
    id: "diaspora",
    patterns: [
      /\b(diaspora|foreigner|foreign\s+buyer|abroad|overseas|non.resident|based\s+in\s+(uk|us|usa|canada|europe|germany|france|italy)|nigerian\s+(living|residing)\s+(abroad|in)|i.?m\s+in\s+(uk|us|usa|canada|europe))\b/i,
    ],
    answer: `Yes — we specialise in representing diaspora and international buyers. We handle:\n\n• Due diligence and title verification remotely\n• Legal referrals and solicitor coordination\n• Full transaction management across time zones\n• AML/KYC documentation for international fund transfers\n• Virtual viewings and agent representation on your behalf\n\nFor a confidential consultation:\n\n• WhatsApp: ${WA}`,
  },

  // ── Currency / international payment ─────────────────────────────────────────
  {
    id: "currency_payment",
    patterns: [
      /\b(forex|foreign\s+exchange|pay\s+in\s+(usd|gbp|eur|aed|dollars|pounds|euros|dirhams|cad)|international\s+transfer|wire\s+transfer|bank\s+transfer|foreign\s+(currency|payment)|remittance|how\s+do\s+i\s+pay|payment\s+method(s)?|crypto|bitcoin)\b/i,
    ],
    answer: `For diaspora and international buyers, we coordinate all currency exchange and payment documentation.\n\n**Typical international payment flow:**\n1. Wire funds from your overseas bank (USD, GBP, EUR, AED, CAD accepted)\n2. Funds received into an escrow or client account in Nigeria\n3. Our legal team handles AML/KYC and CBN foreign remittance compliance\n4. Upon completion, funds released to the seller's account\n\n**Note:** We do not accept cryptocurrency for property transactions.\n\nExchange rate timing can significantly affect value — our agents advise on optimal conversion windows.\n\n• WhatsApp: ${WA}`,
  },

  // ── International property mechanics (freehold / leasehold / stamp duty) ───────
  // More specific than "financing" and "legal" — put before both.
  {
    id: "international_mechanics",
    patterns: [
      /\b(freehold|leasehold|tenure|stamp\s+duty|council\s+tax|service\s+charge\s+(uk|london)|ground\s+rent\s+(uk|lease)|leaseholder|freeholder|commonhold|buy.to.let\s+yield|mortgage\s+(uk|london)|surveyors?\s+report|homebuyer.?s\s+report|off.plan\s+completion|snagging|property\s+chain|exchange\s+of\s+contracts)\b/i,
    ],
    answer: `**UK & UAE Property Mechanics:**\n\n**United Kingdom:**\n• Most properties are **leasehold** (common for flats/apartments, 99–999 year leases); houses tend to be **freehold**\n• **Stamp Duty Land Tax (SDLT)** — 0–15% depending on purchase price and buyer status (first-time, overseas surcharge applies for non-UK residents)\n• **Independent survey** strongly recommended (HomeBuyer Report or Full Structural Survey)\n• Buy-to-let yields: 4–7% gross depending on city and property type\n• Mortgages available to non-UK residents (typically 60–75% LTV)\n\n**United Arab Emirates:**\n• Most properties are **freehold** with strata ownership\n• Off-plan: staged payment plans (10% deposit, milestone payments during construction)\n• **Golden Visa** residency for purchases ≥AED 2M\n• No stamp duty; ~2.5% registration fee payable to Dubai Land Department\n• Rental yields 5–8%; particularly strong in Dubai\n\nFull jurisdiction briefings provided by our partner agents. For your specific situation:\n\n• WhatsApp: ${WA}`,
  },

  // ── Off-plan / new development (before investment and financing) ───────────────
  {
    id: "off_plan",
    patterns: [
      /\b(off.plan\s+(propert|development|invest|opportunit)|new\s+development|under\s+construction|pre.construction|development\s+(phase|opportunit|project)|new\s+project|launch\s+(price|offer)|early\s+(bird|access)|construction\s+stage)\b/i,
    ],
    answer: `We maintain an active pipeline of off-plan and new-development opportunities across Nigeria, Dubai, and the UK — typically with structured payment plans spreading costs over the construction period.\n\n**Off-plan advantages:**\n• Lower entry price vs. completed properties\n• Flexible staged payments (often 10% deposit, then milestone instalments)\n• Potential capital appreciation before completion\n• Direct developer relationships in Lagos, Abuja, and UAE\n\n**What to verify before buying off-plan:**\n• Developer track record and previous completions\n• Escrow/trust account for funds protection\n• Penalty clauses for delayed completion\n• Title documentation pre- or post-completion\n\nOur investment page at /investment lists current opportunities. For a detailed brief on specific projects and payment structures:\n\n• WhatsApp: ${WA}`,
  },

  // ── Mortgage / payment plans / financing ──────────────────────────────────────
  {
    id: "financing",
    patterns: [
      /\b(mortgage|loan|financing|payment\s+plan|installment|instalment|deposit\s+(plan|scheme|structure)|staged\s+payment|how\s+to\s+finance|can\s+i\s+(get\s+a\s+)?mortgage)\b/i,
    ],
    answer: `We do not offer mortgages directly, but we work with trusted financial advisors and developers who provide flexible payment plans — especially for off-plan properties in Dubai and some Nigerian developers.\n\n**Common financing routes:**\n• **Developer payment plans** — off-plan properties often allow 10–30% down with staged payments\n• **Nigeria mortgage providers** — Federal Mortgage Bank, commercial banks (2–5% of clients use these)\n• **UK mortgages** — available to non-UK residents (60–75% LTV) via specialist brokers\n• **UAE mortgages** — available for completed properties (50–75% LTV for non-residents)\n\nFor financing options tailored to your situation and location:\n\n• WhatsApp: ${WA}`,
  },

  // ── Investment / rental yield / returns ───────────────────────────────────────
  {
    id: "investment",
    patterns: [
      /\b(invest|investment|rental\s+yield|return\s+on\s+investment|roi|buy.to.let|rental\s+income|capital\s+appreciation|portfolio|passive\s+income)\b/i,
    ],
    answer: `Our portfolio includes investment-grade properties across Lagos, Abuja, Dubai, and the UK.\n\n**Typical yield profiles:**\n• **Lagos (Lekki, Ikoyi)** — 5–7% gross rental yield; 8–12% annual capital appreciation\n• **Abuja (Prime)** — 4–6% gross rental yield; 6–10% annual appreciation\n• **Dubai** — 5–8% gross rental yield; strong capital growth in emerging areas\n• **UK** — 4–7% gross yield; stable, mature market with predictable appreciation\n\nWe also partner with vetted property managers for hands-off rental income management. For detailed investment analysis or a portfolio strategy conversation:\n\n• WhatsApp: ${WA}`,
  },

  // ── Market timing / "should I buy now?" ──────────────────────────────────────
  {
    id: "market_timing",
    patterns: [
      /\b(should\s+i\s+buy\s+now|best\s+time\s+to\s+buy|market\s+(timing|condition|outlook|forecast)|prices\s+(going\s+up|rising|falling|dropping)|wait\s+to\s+buy|rush\s+to\s+buy|is\s+(now|this)\s+a\s+good\s+time)\b/i,
    ],
    answer: `Timing the market perfectly is difficult; asset quality and selection typically matter more than entry timing.\n\n**Current market context:**\n• **Lagos** — Steady demand; prime areas (Ikoyi, VI, Lekki) hold value consistently. Current inventory includes compelling value across mid-to-luxury tiers\n• **Abuja** — Emerging areas (Phases 4–9) offer better value than prime districts; institutional demand growing\n• **Dubai** — Active buyer market; off-plan entry is particularly competitive right now given developer incentives\n• **UK** — Stable; mortgage rates have moderated; strong rental demand underpins buy-to-let returns\n\n**Our view:** The best time to buy is when you've identified the right asset at the right price with a clear exit or hold strategy. Don't rush; don't wait indefinitely.\n\nFor a bespoke market briefing and acquisition strategy:\n\n• WhatsApp: ${WA}`,
  },

  // ── Negotiation / making an offer ────────────────────────────────────────────
  {
    id: "negotiation",
    patterns: [
      /\b(negotiat|discount|lower\s+the\s+price|make\s+an\s+offer|below\s+asking|counter.offer|offer\s+below|can\s+i\s+offer|best\s+price|knock\s+down|reduce\s+the\s+price)\b/i,
    ],
    answer: `Price negotiations are handled directly by our agents, who can advise on the seller's position confidentially and structure your offer for the best outcome.\n\nTo discuss an offer or negotiate terms:\n\n• WhatsApp: ${WA}`,
  },

  // ── Buying process / timeline / how it works ──────────────────────────────────
  {
    id: "process",
    patterns: [
      /\b(how\s+long|timeline|how\s+soon|how\s+does\s+it\s+work|buying\s+process|what\s+(are\s+the\s+)?steps|what\s+happens\s+(next|after)|step.by.step|stages|process|procedure)\b/i,
    ],
    answer: `**Our buying process:**\n\n1. Property selection and shortlist\n2. Private viewing by appointment\n3. Offer and negotiation (handled by our agents)\n4. Legal due diligence and title verification\n5. Payment and completion\n6. Title transfer (Governor's Consent / registration)\n\n**Typical timelines:**\n• Nigerian transactions — 4–8 weeks after offer acceptance\n• Dubai (off-plan) — varies by payment milestone schedule\n• UK transactions — 8–16 weeks (depends on chain and survey)\n\nFor a timeline specific to your transaction:\n\n• WhatsApp: ${WA}`,
  },

  // ── Post-purchase / after completion ─────────────────────────────────────────
  {
    id: "post_purchase",
    patterns: [
      /\b(after\s+(completion|purchase|closing|i\s+buy)|post.purchase|post.completion|what\s+(happens|next)\s+after|transfer\s+(utilities|accounts|title|ownership)|estate\s+(management|charges)\s+(after|notification)|ongoing\s+(support|management)|do\s+you\s+help\s+after)\b/i,
    ],
    answer: `Our relationship doesn't end at the closing table. Post-completion, we support:\n\n**Immediate (Week 1–2):**\n• Notify estate management of ownership change\n• Transfer utility accounts (electricity, water) into your name\n• Register deed and title with the relevant land registry (via your solicitor)\n\n**Ongoing:**\n• Estate service charge and government levy management\n• For buy-to-let: tenant sourcing, rent collection, maintenance coordination\n• Annual property valuations for tax or refinancing purposes\n• Compliance reminders (land use charge, annual renewals)\n\n**For property management clients** — full day-to-day operations with quarterly performance reports.\n\nFor post-completion support:\n\n• WhatsApp: ${WA}`,
  },

  // ── Warranty / recourse / title dispute ───────────────────────────────────────
  {
    id: "warranty",
    patterns: [
      /\b(guarantee|warranty|what\s+if\s+(something|it)\s+goes\s+wrong|title\s+(dispute|problem|issue)|dispute\s+after|defect|structural\s+(issue|defect|problem)|recourse|liability|protection|hidden\s+(issue|defect)|insurance\s+(title|property))\b/i,
    ],
    answer: `An important question. Here's what protects you:\n\n**Title protection:**\n• Every property we list has passed independent legal-title verification before listing\n• If a title defect emerges post-completion, your appointed solicitor is your primary legal recourse\n• We remain available to coordinate with the original seller for remediation\n• Title insurance is available in some markets — ask your solicitor\n\n**Structural / condition:**\n• We strongly recommend an independent survey or condition inspection before purchase\n• Condition issues are the buyer's responsibility to identify pre-purchase via documented inspection\n• For off-plan: developer warranties and completion guarantees are negotiated at contract stage\n\n**Our commitment:**\n• Accurate listing descriptions and photography — no embellishment\n• Full transparency on known property history, pending development, and area changes\n• 7+ year archive of all transaction documents for certified copies on request\n\nFor specific risk/recourse guidance, your solicitor is the right advisor. We can introduce you to trusted solicitors:\n\n• WhatsApp: ${WA}`,
  },

  // ── Legal / tax / general title (after nigerian_title and international_mechanics)
  {
    id: "legal",
    patterns: [
      /\b(legal|lawyer|solicitor|attorney|tax|stamp\s+duty|cbn|title\s+(check|verification|search)|due\s+diligence|legal\s+(advice|cost|fee))\b/i,
    ],
    answer: `We do not provide legal or tax advice. We work with vetted property lawyers and tax advisors across Lagos, Abuja, Dubai, and the UK — and can make introductions as part of your transaction.\n\n**Typical legal costs (Nigeria):**\n• Solicitor fee: 1–2% of property value\n• Governor's Consent: ~3% in Lagos\n• Stamp duty: 1.5% (Federal)\n• Land registration: varies by state\n\nFor a solicitor introduction or legal cost breakdown specific to your transaction:\n\n• WhatsApp: ${WA}`,
  },

  // ── Off-market / discreet sales ───────────────────────────────────────────────
  {
    id: "off_market",
    patterns: [
      /\b(off.market|private\s+sale|private\s+listing|discreet|confidential\s+(sale|listing|transaction)|not\s+(publicly\s+)?listed|exclusive\s+listing|pocket\s+listing)\b/i,
    ],
    answer: `We regularly handle off-market transactions — private buyer introductions with limited exposure and full confidentiality. These are properties not publicly listed, matched to our vetted buyer pool.\n\nFor sellers: off-market protects your privacy and avoids prolonged public exposure.\nFor buyers: off-market access gives you first right of refusal on quality assets before they reach the open market.\n\nFor a confidential off-market conversation:\n\n• WhatsApp: ${WA}`,
  },

  // ── Property management services ─────────────────────────────────────────────
  {
    id: "property_management",
    patterns: [
      /\b(property\s+management|manage\s+my\s+propert|tenant\s+(sourcing|finding|screening|vetting|management)|rent\s+collection|landlord\s+service|letting\s+agent|lettings|property\s+maintenance|facility\s+management|collect\s+rent|manage\s+for\s+me|who\s+will\s+manage)\b/i,
    ],
    answer: `Yes — we provide full property management for buy-to-let and portfolio clients across Nigeria.\n\n**Services include:**\n• Vetted tenant sourcing and background screening\n• Monthly rent collection and owner disbursement\n• Routine maintenance coordination and contractor management\n• Dispute resolution and lease administration\n• Quarterly financial performance reports\n• Annual property inspection and valuation\n\nFor international clients, our management service means your Nigerian investment runs entirely without your physical presence.\n\nFor a management proposal tailored to your portfolio:\n\n• WhatsApp: ${WA}`,
  },

  // ── Short-stay / serviced apartments ─────────────────────────────────────────
  {
    id: "short_stay",
    patterns: [
      /\b(short.stay|serviced\s+apartment|corporate\s+(apartment|accommodation|housing)|furnished\s+(rental|accommodation|apartment|flat)|executive\s+(rental|apartment|accommodation)|short.term\s+(rental|let)|temporary\s+(stay|accommodation|housing)|vacation\s+rental|holiday\s+let|airbnb|weekly\s+rental|monthly\s+rental)\b/i,
    ],
    answer: `We offer vetted short-term rental properties for executive travel, family visits, and temporary relocations — fully furnished, utilities included, managed with concierge support.\n\n**Available in:**\n• Lagos — Lekki, Ikoyi, Victoria Island\n• Abuja — Maitama, Wuse II\n\n**Typical terms:**\n• Minimum stay: 1 week\n• Available monthly or weekly\n• All utilities, internet, and housekeeping included in premium units\n• Secure, gated locations with 24/7 security\n\nFor current availability and rates:\n\n• WhatsApp: ${WA}\n• Or visit /short-stay on our website`,
  },

  // ── Selling a property ────────────────────────────────────────────────────────
  {
    id: "sell",
    patterns: [
      /\b(sell|selling|list\s+my\s+propert|put\s+it\s+on\s+the\s+market|property\s+valuation|home\s+valuation|market\s+appraisal|i\s+have\s+a\s+(property|house|flat|land)\s+(for\s+sale|to\s+sell)|i\s+want\s+to\s+sell|how\s+do\s+i\s+sell|landlord\s+looking\s+to\s+sell)\b/i,
    ],
    answer: `We represent sellers on both open-market and off-market bases across all our service areas.\n\n**What we handle:**\n• Property valuation and pricing strategy\n• Professional photography and listing\n• Buyer vetting and qualification\n• Offer management and negotiation\n• Legal coordination through to completion\n• Marketing to our private buyer pool (including diaspora)\n\n**Off-market option:** If you prefer discretion, we can match your property to qualified buyers without public listing.\n\nTo discuss selling your property:\n\n• WhatsApp: ${WA}`,
  },

  // ── Joint ventures / land partnerships ───────────────────────────────────────
  {
    id: "joint_venture",
    patterns: [
      /\b(joint\s+venture|j\.?v\.?\b|partnership|co.own|co-own|land\s+(partnership|assembly|syndication|development\s+deal)|development\s+partnership|syndicate|fractional\s+ownership|co.invest|bulk\s+purchase|consortium|pool\s+resources)\b/i,
    ],
    answer: `For sophisticated investors seeking to share acquisition cost, development risk, or capital — we facilitate structured partnerships and joint ventures.\n\n**Common structures:**\n• Joint-venture land acquisition (2–4 investors co-own and co-develop)\n• Syndication of development projects (pre-sales fund construction)\n• Buy-to-let portfolio partnership (shared management, split returns)\n• Land-for-development trades (land owner + developer partner)\n\n**Our role:**\n• Source acquisition opportunities matching partnership criteria\n• Facilitate legal structuring via our solicitor partners\n• Coordinate joint-owner agreements and dispute prevention\n• Manage developer relationships and milestone tracking\n\nFor a confidential joint-venture discussion:\n\n• WhatsApp: ${WA}`,
  },

  // ── Referral program ──────────────────────────────────────────────────────────
  {
    id: "referral",
    patterns: [
      /\b(referral|refer\s+a\s+friend|referral\s+program|finder.?s\s+fee|i\s+can\s+bring|bring\s+you\s+a\s+(buyer|seller|client)|recommend\s+you|if\s+i\s+refer|referral\s+commission|reward\s+for\s+referral)\b/i,
    ],
    answer: `Yes — we reward client advocacy. If you refer a buyer or seller who completes a transaction with us:\n\n• **Referral commission** — Negotiated percentage of our earned agency fee\n• **Gifts & perks** — For introductions that don't yet complete (priority off-market access, market briefings)\n• **Loyalty benefits** — Existing clients transacting again receive preferential terms and early access\n\n**How to refer:**\n1. Send us the contact's name and number on WhatsApp with a brief intro\n2. We handle the rest — your contact gets the same professional service\n3. Referral fee paid within 30 days of deal completion\n\nFor referral terms and current incentives:\n\n• WhatsApp: ${WA}`,
  },

  // ── Fees / agency commission ──────────────────────────────────────────────────
  {
    id: "fees",
    patterns: [
      /\b(fee|commission|agency\s+fee|what\s+do\s+you\s+charge|how\s+much\s+do\s+you\s+charge|cost\s+to\s+(buy|sell\s+with\s+you)|brokerage|who\s+pays\s+(the\s+)?(agent|commission))\b/i,
    ],
    answer: `Standard agency commission is charged to the seller on completion. Buyer representation is typically fee-free.\n\n**Typical commission range:**\n• Nigeria: 5–10% of property value (split between selling and buying agents where applicable)\n• UAE: 2% (buyer's agent) standard under RERA rules\n• UK: 1–3% of sale price (selling agent), negotiated\n\nWe confirm the full cost structure in writing before you commit to any property or instruction.\n\n• WhatsApp: ${WA}`,
  },

  // ── Documents required ────────────────────────────────────────────────────────
  {
    id: "documents",
    patterns: [
      /\b(document|paperwork|requirement|what\s+do\s+i\s+need\s+to\s+(buy|start)|passport|national\s+id|id\s+card|proof\s+of\s+(funds|income|address)|kyc|know\s+your\s+customer|verification\s+documents|bank\s+statement)\b/i,
    ],
    answer: `Required documents vary by property type and jurisdiction, but typically include:\n\n**Nigeria (all buyers):**\n• Valid government-issued ID (international passport or NIN)\n• Recent bank statement or proof of funds\n• Utility bill (for KYC)\n• Tax Identification Number (TIN) for high-value transactions\n\n**International purchases (UAE / UK):**\n• All of the above, plus\n• Source-of-funds declaration\n• Certified copies of passport\n• Proof of overseas address\n\nOur agents will give you a precise checklist for your specific transaction:\n\n• WhatsApp: ${WA}`,
  },

  // ── Property-specific features ────────────────────────────────────────────────
  {
    id: "property_features",
    patterns: [
      /\b(generator|backup\s+power|solar\s+panel|air\s+condit|furnished|unfurnished|furnishing|parking|garage|carport|borehole|water\s+(tank|supply)|bq\s+(room|rooms)|boys.?\s*quarters|swimming\s+pool|garden|balcony|terrace|gym|security\s+system|cctv|fence|gate\s+house|fiber|broadband|internet|servant.?s?\s+quarter|elevator|lift|smart\s+home)\b/i,
    ],
    answer: ({ listing }) =>
      listing
        ? `Property specifications are detailed on each listing page. For ${listing.title} — any specific feature not listed there, our agent can confirm directly from the developer or landlord:\n\n• WhatsApp: ${WA}`
        : `Property features vary across our portfolio. In the luxury segment, common amenities include:\n\n**Essential (Lagos/Abuja):**\n• Backup generator or solar (critical given grid instability)\n• Borehole and water storage tanks\n• Secure parking or garage\n• Perimeter fencing and intercom\n• 24/7 gated estate or onsite security\n\n**Premium add-ons:**\n• Boys Quarters (BQ/domestic staff accommodation)\n• Swimming pool and garden\n• Gym or fitness suite\n• Fibre-optic internet ready\n• Smart home systems\n\nEach listing's detail page specifies its amenities. For features on a specific property:\n\n• WhatsApp: ${WA}`,
  },

  // ── Land / plots of land ─────────────────────────────────────────────────────
  // Put before neighbourhood so "land in Arepo" catches here, not there.
  {
    id: "land_plots",
    patterns: [
      /\b(plot(s)?\s+of\s+land|land\s+(for\s+sale|plot|purchase|acquisition|available)|serviced\s+plot|service\s+plot|residential\s+plot|commercial\s+plot|buy\s+(land|a\s+plot)|land\s+(in|at|near|around)|bare\s+land|raw\s+land|developed\s+plot|land\s+bank|hectares?|acres?\s+of\s+land|parcels?\s+of\s+land)\b/i,
    ],
    answer: `We handle land sales and acquisitions across our service areas — residential plots, commercial land, and serviced estates.\n\n**Available land types:**\n• **Serviced plots** — Infrastructure-ready (access roads, water, electricity) within gated estates; ready for immediate development\n• **Bare / raw land** — Suitable for later development; lower entry cost\n• **Commercial land** — Mixed-use and commercial plots in high-traffic corridors\n\n**Key locations:**\n• Lagos — Lekki, Ikoyi, Ajah, and emerging peri-urban corridors (including areas near the Ogun State border such as Arepo, Mowe, Ibafo)\n• Abuja — Gwarinpa, Karsana, Airport Road corridor, Lokogoma\n• International — Freehold plots in Dubai via our partner agencies\n\n**Critical due diligence for land (especially peri-urban areas):**\n• Verify title — C of O, Registered Deed of Assignment, or formal Gazette\n• Confirm excision status — essential for land in Ogun State fringe zones\n• Physically inspect access roads and infrastructure claims\n• Check for government acquisition or road reservation overlaps\n\nFor current land availability, specific estate names, or areas like Arepo:\n\n• WhatsApp: ${WA}`,
  },

  // ── Neighbourhood / area guide (covers micro + macro questions) ───────────────
  {
    id: "neighbourhood",
    patterns: [
      /\b(which\s+area|best\s+(area|neighbourhood|location|estate)|neighbourhood\s+(guide|profile|safety)|area\s+(guide|overview)|safe\s+area|family\s+(area|neighbourhood|friendly)|infrastructure|traffic|commute|schools\s+(nearby|in\s+the\s+area)|security\s+in|lekki\s+phase|banana\s+island|ikoyi\s+vs|maitama\s+district|what.?s\s+\w+\s+(like|area|neighbourhood))\b/i,
    ],
    answer: `Each of our markets has distinct character and buyer appeal:\n\n**Lagos:**\n• **Ikoyi** — Established ultra-luxury; waterfront access, older villas and modern high-rises, highest per-sqm, old-money feel\n• **Lekki Phase 1** — Mature, contemporary residential; strong infrastructure, estate-living, mid-to-upper luxury\n• **Lekki Phase 2** — Newer, more spacious plots; younger community, better value vs Phase 1\n• **Victoria Island** — Central and commercial; boutique residential with mixed-use, smaller plots\n• **Banana Island** — Gated ultra-premium island; limited inventory, highest security, top tier pricing\n• **Ajah** — Emerging corridor south of Lekki; lower pricing, growing amenities, strong capital appreciation potential\n\n**Abuja:**\n• **Maitama / Asokoro** — Prime diplomatic zone; villa-heavy, highest security, established\n• **Wuse II** — Contemporary apartments; younger professionals, shopping, nightlife\n• **Jabi / Gwarinpa** — Mixed residential; newer infrastructure, value tier\n\n**International:**\n• **Dubai** — Luxury high-rises, residency pathways, strong rental yields; emerging areas (JVC, Dubai Hills) offer best value\n• **London** — Diverse micro-markets (West London premium, Zones 2–3 for yield)\n\nFor a neighbourhood-to-lifestyle match and detailed briefing:\n\n• WhatsApp: ${WA}`,
  },

  // ── Locations / cities covered ────────────────────────────────────────────────
  {
    id: "locations",
    patterns: [
      /\b(area|location|where\s+do\s+you\s+(operate|cover)|cities|which\s+cities|what\s+locations|do\s+you\s+cover|lagos|abuja|dubai|london|uae|uk|united\s+kingdom|what\s+markets)\b/i,
    ],
    answer: `We cover residential and investment properties across:\n\n• **Lagos** — Lekki, Ikoyi, Victoria Island, Banana Island, Ajah and surrounding estates\n• **Abuja** — Maitama, Asokoro, Wuse, Jabi, Gwarinpa and environs\n• **Dubai (UAE)** — Via verified international partner agencies\n• **United Kingdom** — London, Manchester, Birmingham, Edinburgh via verified partners\n\nInternational listings (UAE and UK) are accessible through the partner portal linked on our homepage at /investment.`,
  },

  // ── Agent / team questions (before generic "contact" rule) ────────────────────
  {
    id: "agent_team",
    patterns: [
      /\b(who\s+(will\s+be\s+)?my\s+agent|who\s+handles|dedicated\s+agent|assigned\s+agent|meet\s+the\s+team|who\s+is\s+(in\s+charge|responsible)|background\s+of\s+the\s+team|who\s+are\s+your\s+agents|team\s+profile|agent\s+specialisat|which\s+agent\s+(is|should|will)|speak\s+to\s+a\s+specific\s+agent)\b/i,
    ],
    answer: `Every client is assigned a dedicated agent who manages your transaction end to end — viewings, negotiation, legal coordination, and completion.\n\n**Our principals:**\n• **Mr Adekunle Moruf** — CEO / Managing Director; 20+ years experience; specialist in luxury residential, diaspora clients, and off-market sales\n• **Mrs Popoola Nimotalai** — Lead Consultant; specialist in diaspora buyer representation and Lekki/Ikoyi portfolio\n\nFor agent profiles, credentials, and contact details, visit /agents.\n\nWhen you reach out, we match you with the agent best suited to your transaction type — international buyer, investment focus, off-market, or domestic purchase.\n\n• WhatsApp: ${WA}`,
  },

  // ── Company credentials / licensing ──────────────────────────────────────────
  {
    id: "credentials",
    patterns: [
      /\b(licen(s|c)ed|credentials|registration|registered|are\s+you\s+(licen(s|c)ed|registered|legitimate|legit|real)|how\s+long\s+have\s+you|rera|fca\s+regulated|accredited|professional\s+body|member\s+of|track\s+record|proof\s+of\s+registration|is\s+(kgl|this)\s+(real|legit))\b/i,
    ],
    answer: `KGL Realty Pro is a licensed real estate brokerage with over 10 years of operations:\n\n• **Nigeria** — Registered with the Real Estate Regulatory Authority (RERA) in Lagos; operates under the Estate Surveyors and Valuers Act\n• **Dubai / UAE** — All transactions handled through RERA-registered partner agencies\n• **United Kingdom** — Through vetted partner agents registered with the Property Ombudsman and subject to AML regulations\n\n**Track record:**\n• 200+ active listings across 4 countries\n• Diaspora client base across UK, US, Canada, Europe\n• 100% title-verified listings before publication\n• CAC-registered company in Nigeria\n\nWe provide regulatory documentation and references to serious buyers on request.\n\n• Email: ${EMAIL}\n• WhatsApp: ${WA}`,
  },

  // ── Relocation / moving to Nigeria ───────────────────────────────────────────
  {
    id: "relocation",
    patterns: [
      /\b(relocation|relocat|i.?m\s+moving\s+to|moving\s+to\s+(nigeria|lagos|abuja)|returning\s+(to\s+nigeria|home)|coming\s+back\s+to\s+nigeria|expat\s+housing|expatriate|new\s+to\s+the\s+area|just\s+arrived|settling\s+in|logistics|temporary\s+housing\s+while|where\s+to\s+stay\s+while)\b/i,
    ],
    answer: `We support relocation clients throughout the process:\n\n**What we provide:**\n• Short-stay furnished accommodation during your property search (Lagos and Abuja)\n• Neighbourhood orientation and safety briefings\n• School, healthcare, and expat community guides\n• Property shortlist matched to your lifestyle and budget\n• Introduction to legal and financial advisors\n\n**For international relocations to Nigeria:**\n• Virtual property tours before you arrive\n• Remote documentation and offer management\n• Residential property lease or purchase coordinated around your arrival date\n\nFor shipping, visa, or logistics services — we partner with specialist relocation firms and can refer you.\n\n• WhatsApp: ${WA}`,
  },

  // ── Rental / renting ──────────────────────────────────────────────────────────
  {
    id: "rental",
    patterns: [
      /\b(rent|renting|rental\s+propert|properties\s+to\s+rent|looking\s+to\s+rent|i\s+want\s+to\s+rent|for\s+rent|lease|annual\s+rent|monthly\s+rent|how\s+much\s+is\s+rent|rent\s+vs\s+buy|should\s+i\s+rent)\b/i,
    ],
    answer: `We handle both sales and long-term rentals across our service areas.\n\n**Long-term rentals (1-year+ leases):**\n• Lagos — Annual leases common; typically 1–2 years upfront\n• Abuja — Annual or bi-annual payment terms\n• Dubai / UK — Monthly or quarterly payments\n\n**Rent vs. buy guidance:**\nRenting offers flexibility with lower upfront cost — ideal for testing a neighbourhood or relocating temporarily. Buying builds equity and provides long-term stability but requires more capital. For luxury properties, many of our diaspora clients rent first, then buy after settling in.\n\nFor our rental listings and availability:\n\n• WhatsApp: ${WA}`,
  },

  // ── Blog / market reports / content ──────────────────────────────────────────
  {
    id: "content",
    patterns: [
      /\b(blog|article|market\s+report|market\s+analysis|market\s+update|insight(s)?|trend(s)?|research|publication|guide(s)?|white\s+paper|where\s+can\s+i\s+read|knowledge\s+base|resources)\b/i,
    ],
    answer: `We publish market intelligence and educational content regularly:\n\n• **/blog** — Market trends, neighbourhood profiles, buyer and seller guides, investment thesis\n• **/buyers-guide** — Step-by-step process for acquiring property in Nigeria and internationally\n• **/sellers-guide** — Valuation, presentation, marketing, and legal strategy for sellers\n• **/investment** — Current off-plan opportunities and investment philosophy\n\nFor bespoke market analysis — rental yields, price growth by area, or development pipeline reports — our agents can provide a tailored briefing:\n\n• WhatsApp: ${WA}`,
  },

  // ── Contact / speak to an agent (broad fallback for anything contact-related) ──
  {
    id: "contact",
    patterns: [
      /\b(contact|speak\s+(to|with)\s+(an\s+)?(agent|someone|you|us)|talk\s+to\s+(an\s+)?(agent|someone|person)|call|phone\s+number|whatsapp|email\s+(us|you|address)|reach\s+(us|out\s+to\s+you)|get\s+in\s+touch|human\s+agent|real\s+person|office)\b/i,
    ],
    answer: `You can reach our team directly:\n\n• **Phone / WhatsApp:** ${WA}\n• **Email:** ${EMAIL}\n• **Office:** ${ADDR}\n\nAvailable Monday – Friday, 9 am – 6 pm WAT.`,
  },

];

// ─── FALLBACK ─────────────────────────────────────────────────────────────────

export const CONCIERGE_FALLBACK =
  `That sounds like a specific inquiry. Our agents have access to the full portfolio — including off-market and unlisted opportunities not yet on this site.\n\nPlease contact us directly with your requirements:\n\n• WhatsApp: ${WA}\n• Email: ${EMAIL}\n\nShare the property type, location, and budget — we'll respond the same business day.`;

// ─── MATCHER ──────────────────────────────────────────────────────────────────

export function matchRule(userText: string, listing?: Listing): string {
  const ctx: RuleContext = { listing };
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(userText))) {
      return typeof rule.answer === "function" ? rule.answer(ctx) : rule.answer;
    }
  }
  return CONCIERGE_FALLBACK;
}
