import { WpContentPage } from "@/components/WpContentPage";

export const metadata = { title: "Privacy Policy" };
export const revalidate = 86400;

export default function PrivacyPage() {
  return (
    <WpContentPage
      slug="privacy-policy"
      label="Legal"
      fallback={{
        title: "Privacy Policy",
        body: `<p>Full privacy policy under review with counsel. Contact <a href="mailto:hello@kglrealtypro.com">hello@kglrealtypro.com</a> with any privacy-related questions.</p>`,
      }}
    />
  );
}
