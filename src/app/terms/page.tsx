import { WpContentPage } from "@/components/WpContentPage";

export const metadata = { title: "Terms & Conditions" };
export const revalidate = 86400;

export default function TermsPage() {
  return (
    <WpContentPage
      slug="terms-conditions"
      label="Legal"
      fallback={{
        title: "Terms & Conditions",
        body: `<p>Full terms under review with counsel.</p>`,
      }}
    />
  );
}
