import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "3 September 2026";
const EMAIL = "hello@kglrealtypro.com";

export default function TermsPage() {
  return (
    <>
      <Header />
      <PageHero
        label="Legal"
        title="Terms & Conditions"
        description={`Last updated ${LAST_UPDATED}`}
        breadcrumbs={[{ label: "Terms & Conditions", href: "/terms" }]}
      />

      <main className="container py-16">
        <article className="prose prose-neutral mx-auto max-w-3xl dark:prose-invert">

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong>kglrealtypro.com</strong> (the &ldquo;Site&rdquo;), you agree to
            be bound by these Terms &amp; Conditions. If you do not agree, please do not use the
            Site. These terms apply to all visitors, enquirers, registered users, and clients.
          </p>

          <h2>2. About KGL Realty Pro</h2>
          <p>
            KGL Realty Pro is a licensed real-estate agency operating in Nigeria, the United Arab
            Emirates, and the United Kingdom. We facilitate the introduction of buyers and sellers
            and provide property advisory services. We are not a mortgage lender, legal adviser,
            or financial services firm.
          </p>

          <h2>3. Information on This Site</h2>
          <p>
            All property listings, prices, availability, and descriptions are provided in good
            faith and are believed to be accurate at the time of publication. However:
          </p>
          <ul>
            <li>Prices are subject to change without notice and should be confirmed directly with an agent before any commitment is made.</li>
            <li>Floor plans, dimensions, and images are indicative. They should not be relied upon as precise measurements for construction, legal, or structural purposes.</li>
            <li>Currency conversions displayed on the Site are for indicative purposes only, based on approximate exchange rates. Final transaction values will be confirmed in the agreed contract currency.</li>
            <li>KGL Realty Pro makes no warranty, express or implied, as to the completeness, accuracy, or fitness for purpose of any information on the Site.</li>
          </ul>

          <h2>4. No Legal or Financial Advice</h2>
          <p>
            Nothing on this Site — including responses from our AI concierge — constitutes legal,
            tax, financial, or mortgage advice. You should seek independent professional advice
            before entering into any property transaction. KGL Realty Pro agents can introduce you
            to suitably qualified professionals but do not provide regulated financial advice.
          </p>

          <h2>5. AI Concierge</h2>
          <p>
            Our concierge chat is powered by artificial intelligence and is intended to answer
            general questions and assist with initial enquiries. It:
          </p>
          <ul>
            <li>May make errors and should not be the sole basis for any decision.</li>
            <li>Is not a substitute for advice from a licensed agent, solicitor, or surveyor.</li>
            <li>Conversations may be reviewed by KGL Realty Pro staff to improve the service and for quality assurance.</li>
          </ul>

          <h2>6. Enquiries and Lead Capture</h2>
          <p>
            When you submit an enquiry, schedule a viewing, or provide your contact details
            through the Site, you consent to KGL Realty Pro contacting you about the specific
            property or service you enquired about and about other relevant listings. You may
            opt out at any time by emailing <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or
            replying &ldquo;STOP&rdquo; to any communication.
          </p>

          <h2>7. Intellectual Property</h2>
          <p>
            All content on this Site — including text, images, logos, branding, and code — is
            the property of KGL Realty Pro or its licensors and is protected by Nigerian and
            international copyright law. You may not reproduce, distribute, or republish any
            content without prior written consent, except for personal, non-commercial use.
          </p>
          <p>
            Property photographs may be subject to separate copyright held by the photographer
            or developer. Where images are supplied by third parties, KGL Realty Pro has obtained
            permission to display them but does not hold the underlying copyright.
          </p>

          <h2>8. Third-Party Links</h2>
          <p>
            The Site may contain links to third-party websites (for example, WhatsApp, partner
            brokerages, or payment processors). KGL Realty Pro is not responsible for the content,
            privacy practices, or accuracy of any third-party site. Links do not constitute an
            endorsement.
          </p>

          <h2>9. Agency Commission</h2>
          <p>
            KGL Realty Pro typically earns commission from the seller on completion of a sale.
            Buyer representation is generally fee-free unless otherwise agreed in writing.
            Commission rates for seller-mandated transactions range from 5–10% of the agreed
            sale price and will be confirmed in a written mandate agreement before marketing begins.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, KGL Realty Pro shall not be
            liable for any indirect, incidental, consequential, or punitive damages arising from
            your use of the Site or reliance on information contained herein, including lost
            profits, data loss, or business interruption.
          </p>
          <p>
            Our total liability for any claim arising from use of the Site shall not exceed the
            amount of any commission or fee paid to KGL Realty Pro in connection with the
            transaction giving rise to the claim.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria. Any dispute
            arising from these terms or your use of the Site shall be subject to the exclusive
            jurisdiction of the courts of Lagos State, Nigeria, unless otherwise required by
            applicable law (for example, for UK residents, the courts of England and Wales).
          </p>

          <h2>12. Amendments</h2>
          <p>
            We reserve the right to update these terms at any time. The &ldquo;Last updated&rdquo;
            date at the top of this page will reflect any changes. Continued use of the Site
            after changes are posted constitutes acceptance of the revised terms.
          </p>

          <h2>13. Contact</h2>
          <p>
            For questions about these terms, email{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>

        </article>
      </main>
      <Footer />
    </>
  );
}
