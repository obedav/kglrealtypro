import { WpContentPage } from "@/components/WpContentPage";

export const metadata = { title: "Land Vest" };
export const revalidate = 3600;

export default function LandVestPage() {
  return (
    <WpContentPage
      slug="land-vest"
      label="Investment"
      fallback={{
        title: "Land Vest",
        body: `<p>Full program terms coming soon. Speak to an agent for current conditions.</p>`,
      }}
    />
  );
}
