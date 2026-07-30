import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "AlgoPatterns Terms of Service. Read our terms and conditions for using the DSA learning platform, subscriptions, and code execution services.",
  openGraph: {
    title: "Terms of Service | AlgoPatterns",
    description:
      "Terms and conditions for using AlgoPatterns DSA learning platform.",
    type: "website",
    url: `${siteUrl}/terms`,
  },
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Terms of Service", url: `${siteUrl}/terms` },
];

// skipcq: JS-0067
export default function TermsOfServicePage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-1)" }}
        >
          Terms of Service
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          Last updated: July 31, 2026
        </p>

        <div className="prose-container space-y-8">
          <p style={{ color: "var(--text-2)" }}>
            Please read these Terms of Service (&quot;Terms&quot;) carefully
            before using https://algopatterns.in (the &quot;Service&quot;)
            operated by AlgoPatterns (&quot;us&quot;, &quot;we&quot;, or
            &quot;our&quot;).
          </p>

          <Section title="Acceptance of Terms">
            <p style={{ color: "var(--text-2)" }}>
              By accessing or using the Service, you agree to be bound by these
              Terms. If you disagree with any part of the Terms, you may not
              access the Service.
            </p>
          </Section>

          <Section title="Accounts">
            <Subsection title="Registration">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>
                  You must provide accurate and complete information when
                  creating an account
                </li>
                <li>
                  You are responsible for maintaining the security of your
                  account credentials
                </li>
                <li>
                  You must notify us immediately of any unauthorized access to
                  your account
                </li>
              </ul>
            </Subsection>

            <Subsection title="Eligibility">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>You must be at least 13 years old to use this Service</li>
                <li>If you are under 18, you must have parental consent</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="Subscriptions and Payments">
            <Subsection title="Free Tier">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Access to select patterns and problems</li>
                <li>Limited features as described on the pricing page</li>
              </ul>
            </Subsection>

            <Subsection title="Pro Subscription">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Billed monthly or annually as selected</li>
                <li>
                  Provides access to all patterns, problems, and premium
                  features
                </li>
                <li>Payments processed securely via Razorpay</li>
              </ul>
            </Subsection>

            <Subsection title="Automatic Renewal">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>You can cancel anytime from your account settings</li>
                <li>
                  Cancellation takes effect at the end of the current billing
                  period
                </li>
              </ul>
            </Subsection>

            <Subsection title="Price Changes">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>We may change subscription prices with 30 days notice</li>
                <li>Price changes do not affect current billing periods</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="Acceptable Use">
            <p className="mb-3" style={{ color: "var(--text-2)" }}>
              You agree not to:
            </p>
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>Share your account credentials with others</li>
              <li>Use automated tools to scrape or download content</li>
              <li>
                Reproduce, distribute, or sell our content without permission
              </li>
              <li>Attempt to bypass payment or access controls</li>
              <li>Use the Service for any illegal purpose</li>
              <li>Interfere with or disrupt the Service</li>
            </ul>
          </Section>

          <Section title="Intellectual Property">
            <Subsection title="Our Content">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>
                  All patterns, explanations, visualizations, and code examples
                  are our intellectual property
                </li>
                <li>
                  You may not reproduce, distribute, or create derivative works
                  without permission
                </li>
              </ul>
            </Subsection>

            <Subsection title="Your Content">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>
                  You retain ownership of code you write in the playground
                </li>
                <li>
                  By using the Service, you grant us the right to process your
                  code for execution
                </li>
              </ul>
            </Subsection>
          </Section>

          <Section title="Code Execution">
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>
                Code submitted to our playground is executed in isolated
                sandboxes
              </li>
              <li>We are not responsible for the behavior of code you write</li>
              <li>
                Do not submit malicious code or attempt to exploit the execution
                environment
              </li>
            </ul>
          </Section>

          <Section title="Disclaimer of Warranties">
            <p style={{ color: "var(--text-2)" }}>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF
              ANY KIND. WE DO NOT GUARANTEE:
            </p>
            <ul
              className="list-disc list-inside mt-2 space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>Uninterrupted or error-free service</li>
              <li>That the Service will meet your specific requirements</li>
              <li>The accuracy or completeness of any content</li>
              <li>That your use will help you pass any interview</li>
            </ul>
          </Section>

          <Section title="Limitation of Liability">
            <p style={{ color: "var(--text-2)" }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE
              FOR:
            </p>
            <ul
              className="list-disc list-inside mt-2 space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>
                Damages exceeding the amount you paid us in the past 12 months
              </li>
            </ul>
          </Section>

          <Section title="Indemnification">
            <p style={{ color: "var(--text-2)" }}>
              You agree to indemnify and hold us harmless from any claims,
              damages, or expenses arising from:
            </p>
            <ul
              className="list-disc list-inside mt-2 space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
            </ul>
          </Section>

          <Section title="Termination">
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>
                We may terminate or suspend your account at any time for Terms
                violations
              </li>
              <li>You may delete your account at any time</li>
              <li>
                Upon termination, your right to use the Service ceases
                immediately
              </li>
            </ul>
          </Section>

          <Section title="Governing Law">
            <p style={{ color: "var(--text-2)" }}>
              These Terms are governed by the laws of India. Any disputes shall
              be resolved in the courts of Bengaluru, India.
            </p>
          </Section>

          <Section title="Changes to Terms">
            <p style={{ color: "var(--text-2)" }}>
              We may modify these Terms at any time. We will notify you of
              material changes via email or prominent notice on the Service.
              Continued use after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="Contact Us">
            <p style={{ color: "var(--text-2)" }}>
              For questions about these Terms, contact us at:
            </p>
            <ul
              className="list-disc list-inside mt-2 space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>
                Email:{" "}
                <a
                  href="mailto:hello@algopatterns.in"
                  className="underline"
                  style={{ color: "var(--accent)" }}
                >
                  hello@algopatterns.in
                </a>
              </li>
              <li>
                Website:{" "}
                <a
                  href="/contact"
                  className="underline"
                  style={{ color: "var(--accent)" }}
                >
                  https://algopatterns.in/contact
                </a>
              </li>
            </ul>
          </Section>
        </div>
      </main>
    </>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section>
    <h2
      className="text-xl font-semibold mb-3"
      style={{ color: "var(--text-1)" }}
    >
      {title}
    </h2>
    {children}
  </section>
);

const Subsection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <h3 className="text-lg font-medium mb-2" style={{ color: "var(--text-1)" }}>
      {title}
    </h3>
    {children}
  </div>
);
