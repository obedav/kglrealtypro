import { WpContentPage } from "@/components/WpContentPage";

export const metadata = { title: "Real Estate Cashback" };
export const revalidate = 3600;

export default function CashbackPage() {
  return (
    <WpContentPage
      slug="real-estate-cashback-2"
      label="Investment"
      fallback={{
        title: "Real Estate Cashback",
        body: `<p>Full program terms coming soon. Speak to an agent for current conditions.</p>`,
      }}
    />
  );
}
