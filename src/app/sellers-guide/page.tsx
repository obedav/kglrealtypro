import { WpContentPage } from "@/components/WpContentPage";

export const metadata = {
  title: "Seller's Guide",
  description:
    "How to sell luxury property in Lagos, Abuja, and internationally with KGL Realty Pro — from valuation to completion.",
};
export const revalidate = 3600;

export default function SellersGuidePage() {
  return (
    <WpContentPage
      slug="sellers-guide"
      label="Guides"
      fallback={{
        title: "Seller's Guide",
        body: `
          <p>Selling well requires positioning, pricing, and discretion in equal measure. Our Seller's Guide explains how KGL Realty Pro represents high-value property — from accurate market valuation through to a clean, documented completion.</p>

          <h2>Step 1 — Know Your Property's Market Value</h2>
          <p>An accurate asking price is the single most important factor in a successful sale. Overpricing leads to no viewings; underpricing erodes wealth that took years to build. KGL Realty Pro provides a complimentary, evidence-based market valuation using recent comparable sales in your exact sub-market — not guesswork or wishful estimates. We also advise on optimal timing relative to seasonal demand patterns and current buyer activity in your area.</p>

          <h2>Step 2 — Prepare the Legal Pack</h2>
          <p>Before marketing begins, assemble the following documents:</p>
          <ul>
            <li>Certificate of Occupancy (C of O) or Governor's Consent</li>
            <li>Survey plan (certified copy)</li>
            <li>Deed of assignment — full chain from original allocatee to present owner</li>
            <li>Receipts for all government charges paid (land use charge, ground rent)</li>
            <li>Evidence of current utility accounts and any estate service-charge clearance</li>
          </ul>
          <p>Serious buyers request all of this before making an offer. Having it ready removes weeks from the sale timeline and signals a professional, trustworthy transaction.</p>

          <h2>Step 3 — Presentation & Photography</h2>
          <p>First impressions are formed online before a viewer ever sets foot on the property. Clean, declutter, and address minor maintenance issues before photography — a leaking tap or peeling paint in a listing image communicates neglect and reduces perceived value. KGL Realty Pro arranges professional wide-angle photography and, for premium listings, videography and 3D virtual tours at no additional cost to the seller. Properties presented to our standard consistently achieve faster sales and firmer final prices.</p>

          <h2>Step 4 — Pricing Strategy & Marketing</h2>
          <p>KGL Realty Pro markets across our website, social media channels, and a vetted private buyer pool that includes diaspora buyers in the UK, US, and Canada actively acquiring in Lagos and Abuja. We do not simply list and wait.</p>
          <p>Pricing strategy is reviewed weekly against market response. If viewings are not converting to offers within the first three to four weeks, we act on that signal early — adjusting positioning, marketing copy, or price — rather than allowing the listing to stagnate and attract price-chasers.</p>
          <p>For sensitive or off-market disposals, we present the property confidentially to a shortlist of pre-qualified buyers only, with full discretion throughout.</p>

          <h2>Step 5 — Viewings & Offers</h2>
          <p>All viewings are agent-accompanied. We pre-qualify interested buyers before scheduling to avoid wasting your time with unserious enquiries. Every offer received is presented to you in writing in full, with our honest assessment of the buyer's seriousness, financial position, and likelihood of completing. You remain in complete control of acceptance, rejection, or counter-offer at every stage — we advise, never decide for you.</p>

          <h2>Step 6 — Legal Process & Completion</h2>
          <p>On acceptance of an offer, the buyer's solicitor drafts the deed of assignment. Your independent solicitor — not one referred by the buyer's agent — reviews, negotiates, and approves. Standard agency commission in Nigeria ranges from 5–10% of the agreed sale price and is payable by the seller on completion. All fees and deductions are clearly itemised in writing before we accept a mandate — no surprises at closing.</p>
          <p>KGL Realty Pro coordinates the exchange of documents, monitors the consent process, and ensures the final payment is received and confirmed before keys and original title documents change hands.</p>

          <h2>Step 7 — Post-Sale</h2>
          <p>Notify estate management of the ownership change and formally close or transfer utility accounts. Retain copies of all transaction documents permanently — the deed of assignment, receipts, and consent paperwork are irreplaceable. KGL Realty Pro provides every client with a full, organised transaction summary on completion for their personal records.</p>

          <h2>Discreet & Off-Market Sales</h2>
          <p>If you prefer not to list publicly — for privacy reasons, to avoid market speculation, or because your timeline is flexible — KGL Realty Pro regularly represents sellers on a fully off-market basis. We introduce the property to a curated, pre-vetted pool of serious buyers under complete confidentiality. Contact us for a private consultation — no obligation, no public exposure.</p>
        `,
      }}
    />
  );
}
