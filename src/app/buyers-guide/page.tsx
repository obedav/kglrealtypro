import { WpContentPage } from "@/components/WpContentPage";

export const metadata = { title: "Buyer's Guide" };
export const revalidate = 3600;

export default function BuyersGuidePage() {
  return (
    <WpContentPage
      slug="buyers-guide"
      label="Guides"
      fallback={{
        title: "Buyer's Guide",
        body: `
          <p>Buying luxury property is a process of due diligence as much as selection.
          Our Buyer's Guide walks you through every step — from defining the brief to
          closing escrow — with the scrutiny a significant acquisition deserves.</p>
          <p>Full guide coming soon. In the meantime, speak to one of our agents for a
          tailored walkthrough.</p>
        `,
      }}
    />
  );
}
