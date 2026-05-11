import { WpContentPage } from "@/components/WpContentPage";

export const metadata = { title: "Partners" };
export const revalidate = 3600;

export default function PartnersPage() {
  return (
    <WpContentPage
      slug="partners"
      label="About"
      fallback={{
        title: "Partners",
        body: `
          <p>We work with licensed brokerages in the United Arab Emirates and the
          United Kingdom to represent Nigerian clients acquiring international
          property — and to introduce vetted international buyers to our domestic
          portfolio.</p>
          <p>Full partner list coming soon.</p>
        `,
      }}
    />
  );
}
