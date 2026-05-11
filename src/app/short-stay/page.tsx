import { WpContentPage } from "@/components/WpContentPage";

export const metadata = { title: "Short Stay" };
export const revalidate = 3600;

export default function ShortStayPage() {
  return (
    <WpContentPage
      slug="short-stay"
      label="Properties"
      fallback={{
        title: "Short Stay",
        body: `
          <p>Vetted short-term rental properties for executive travel and family
          visits — managed by our team with concierge support on request.</p>
          <p>Active inventory coming soon.</p>
        `,
      }}
    />
  );
}
