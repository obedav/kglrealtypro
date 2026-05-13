import { WpContentPage } from "@/components/WpContentPage";

export const metadata = {
  title: "Buyer's Guide",
  description:
    "A step-by-step guide to buying luxury property in Lagos, Abuja, and internationally with KGL Realty Pro.",
};
export const revalidate = 3600;

export default function BuyersGuidePage() {
  return (
    <WpContentPage
      slug="buyers-guide"
      label="Guides"
      fallback={{
        title: "Buyer's Guide",
        body: `
          <p>Buying luxury property is a process of due diligence as much as selection. Our Buyer's Guide walks you through every step — from defining the brief to completing the transaction — with the scrutiny a significant acquisition deserves.</p>

          <h2>Step 1 — Define Your Brief</h2>
          <p>Before viewing a single property, establish three things in writing: your maximum budget (including taxes, legal fees, and agency commission); the specific locations that meet your commute and lifestyle requirements; and your non-negotiable property criteria — bedroom count, plot size, estate security, generator capacity. Clarity at this stage saves weeks of misdirected searching.</p>

          <h2>Step 2 — Engage a Licensed Agent</h2>
          <p>Work with a licensed real-estate professional registered with your state's Real Estate Regulatory Agency. A good agent provides access to off-market listings, honest pricing context, and — critically — guides the due-diligence process on your behalf. KGL Realty Pro agents manage every step below in full, at no extra charge to buyers.</p>

          <h2>Step 3 — Property Search & Shortlisting</h2>
          <p>Your agent presents properties that match the brief, including verified listings not advertised publicly. Shortlist no more than five at a time — decision fatigue is real, and serious sellers grow wary of uncommitted viewers. For off-plan or new-development purchases, inspect comparable completed projects by the same developer before committing.</p>

          <h2>Step 4 — Due Diligence</h2>
          <p>No offer should be made before verifying the following:</p>
          <ul>
            <li><strong>Title document</strong> — Certificate of Occupancy (C of O) or Governor's Consent are the two most secure titles in Nigeria. Confirm the title is unencumbered and the chain of assignment is intact from the original allocatee.</li>
            <li><strong>Physical inspection</strong> — Structural condition, drainage, roof, electrics, and plumbing assessed by a qualified surveyor.</li>
            <li><strong>Land use confirmation</strong> — Verify the property is not under any court order, mortgage default, family dispute, or compulsory acquisition notice.</li>
            <li><strong>Utility and estate compliance</strong> — Confirm no outstanding service charges, estate levies, or government rates.</li>
          </ul>
          <p>Our agents coordinate all searches directly with the appropriate land registry and can recommend independent surveyors and solicitors where needed.</p>

          <h2>Step 5 — Making an Offer</h2>
          <p>Offers are made in writing, subject to satisfactory due diligence. The letter of offer or Memorandum of Understanding (MOU) should state the agreed price, the payment structure (outright, installment, or mortgage), and a realistic completion window. A deposit — typically 10% — is paid only after the MOU is signed and the title documents have been sighted.</p>

          <h2>Step 6 — Legal Process</h2>
          <p>Engage your own independent solicitor — not one recommended by the seller's agent. Your solicitor reviews the title documents, drafts or reviews the deed of assignment, and submits for Governor's Consent where required. Lagos State consent processing typically takes four to eight weeks. Abuja transactions use a Land Use Act lease assignment process through the AGIS registry, which follows a separate timeline.</p>
          <p>Stamp duty and consent fees are the buyer's responsibility and should be budgeted at approximately 3–5% of the purchase price, depending on state.</p>

          <h2>Step 7 — Payment & Completion</h2>
          <p>All property payments should be made via direct bank transfer to the registered company or individual account — never cash, never through an informal intermediary. Obtain official receipts at every stage. Final payment releases the original title documents and keys. Your solicitor lodges the assignment for registration immediately on completion to protect your ownership.</p>

          <h2>Step 8 — Post-Purchase</h2>
          <p>Notify the estate management of the ownership change, transfer utility accounts into your name, and retain copies of all transaction documents permanently. For buy-to-let acquisitions, KGL Realty Pro can assist with professional tenant sourcing and ongoing property management from day one.</p>

          <h2>International Purchases — UK & UAE</h2>
          <p>For clients acquiring property in the United Kingdom or the United Arab Emirates, the due-diligence process, legal framework, and payment structure differ materially from the Nigerian market. KGL Realty Pro works with vetted partner agents in both markets who handle all local legal compliance. We coordinate the full process from Lagos — including foreign exchange documentation, anti-money-laundering (AML) compliance, and post-completion management arrangements. Contact us for a private international-buyer briefing before committing to any overseas acquisition.</p>
        `,
      }}
    />
  );
}
