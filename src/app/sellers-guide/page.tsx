import { WpContentPage } from "@/components/WpContentPage";

export const metadata = { title: "Seller's Guide" };
export const revalidate = 3600;

export default function SellersGuidePage() {
  return (
    <WpContentPage
      slug="sellers-guide"
      label="Guides"
      fallback={{
        title: "Seller's Guide",
        body: `
          <p>Selling well requires positioning, pricing, and discretion in equal
          measure. Our Seller's Guide explains how we represent high-value property —
          vetted buyer pools, managed viewings, and negotiation on your terms.</p>
          <p>Full guide coming soon. Speak to an agent for a private consultation.</p>
        `,
      }}
    />
  );
}
