import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "AlgoPatterns Privacy Policy. Learn how we collect, use, and protect your personal information when you use our DSA learning platform.",
  openGraph: {
    title: "Privacy Policy | AlgoPatterns",
    description:
      "Learn how AlgoPatterns collects, uses, and protects your personal information.",
    type: "website",
    url: `${siteUrl}/privacy`,
  },
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Privacy Policy", url: `${siteUrl}/privacy` },
];

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

// skipcq: JS-0067, JS-0415 - Next.js page, content page needs nesting
export default function PrivacyPolicyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-1)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          Last updated: July 31, 2026
        </p>

        <div className="prose-container space-y-8">
          <p style={{ color: "var(--text-2)" }}>
            AlgoPatterns (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
            operates the website https://algopatterns.in (the
            &quot;Service&quot;). This page informs you of our policies
            regarding the collection, use, and disclosure of personal data when
            you use our Service.
          </p>

          <Section title="Information We Collect">
            <Subsection title="Account Information">
              <p style={{ color: "var(--text-2)" }}>
                When you create an account, we collect:
              </p>
              <ul
                className="list-disc list-inside mt-2 space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Email address</li>
                <li>Name (if provided)</li>
                <li>
                  Profile information from Google (if you sign in with Google)
                </li>
              </ul>
            </Subsection>

            <Subsection title="Usage Data">
              <p style={{ color: "var(--text-2)" }}>
                We automatically collect:
              </p>
              <ul
                className="list-disc list-inside mt-2 space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Pages visited and features used</li>
                <li>Time spent on the platform</li>
                <li>Browser type and device information</li>
                <li>IP address (anonymized for analytics)</li>
              </ul>
            </Subsection>

            <Subsection title="Payment Information">
              <p style={{ color: "var(--text-2)" }}>
                When you subscribe to AlgoPatterns Pro:
              </p>
              <ul
                className="list-disc list-inside mt-2 space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Payment processing is handled by Razorpay</li>
                <li>We do not store your card details</li>
                <li>
                  We receive transaction confirmations and subscription status
                </li>
              </ul>
            </Subsection>
          </Section>

          <Section title="How We Use Your Information">
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>To provide and maintain the Service</li>
              <li>To track your learning progress</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send important service updates</li>
              <li>To improve our content and features</li>
              <li>To respond to support requests</li>
            </ul>
          </Section>

          <Section title="Data Storage and Security">
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>
                Your data is stored on secure servers (Google Cloud Platform)
              </li>
              <li>
                We use industry-standard encryption for data transmission
                (HTTPS/TLS)
              </li>
              <li>Passwords are hashed and never stored in plain text</li>
              <li>We retain your data as long as your account is active</li>
            </ul>
          </Section>

          <Section title="Third-Party Services">
            <p className="mb-3" style={{ color: "var(--text-2)" }}>
              We use the following third-party services:
            </p>
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>
                <strong>Google Analytics</strong>: For understanding usage
                patterns (anonymized)
              </li>
              <li>
                <strong>Razorpay</strong>: For payment processing
              </li>
              <li>
                <strong>Sentry</strong>: For error monitoring (no personal data
                collected)
              </li>
              <li>
                <strong>Google OAuth</strong>: For authentication (if you choose
                to sign in with Google)
              </li>
            </ul>
          </Section>

          <Section title="Your Rights">
            <p className="mb-3" style={{ color: "var(--text-2)" }}>
              You have the right to:
            </p>
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Delete your account and associated data</li>
              <li>Export your progress data</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="mt-3" style={{ color: "var(--text-2)" }}>
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:hello@algopatterns.in"
                className="underline"
                style={{ color: "var(--accent)" }}
              >
                hello@algopatterns.in
              </a>
            </p>
          </Section>

          <Section title="Cookies">
            <p className="mb-3" style={{ color: "var(--text-2)" }}>
              We use essential cookies to:
            </p>
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>Keep you logged in</li>
              <li>Remember your preferences (theme, language)</li>
              <li>Track your learning progress</li>
            </ul>
            <p className="mt-3" style={{ color: "var(--text-2)" }}>
              We use analytics cookies (Google Analytics) to understand how
              users interact with our Service. You can disable cookies in your
              browser settings.
            </p>
          </Section>

          <Section title="Children's Privacy">
            <p style={{ color: "var(--text-2)" }}>
              AlgoPatterns is not intended for children under 13. We do not
              knowingly collect personal information from children under 13.
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p style={{ color: "var(--text-2)" }}>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </Section>

          <Section title="Contact Us">
            <p style={{ color: "var(--text-2)" }}>
              If you have questions about this Privacy Policy, contact us at:
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
