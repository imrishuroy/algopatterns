import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  description:
    "AlgoPatterns refund and cancellation policy. Learn about our 7-day money-back guarantee, subscription cancellation process, and refund eligibility.",
  openGraph: {
    title: "Refund and Cancellation Policy | AlgoPatterns",
    description:
      "Learn about AlgoPatterns 7-day money-back guarantee and cancellation process.",
    type: "website",
    url: `${siteUrl}/refund`,
  },
  alternates: {
    canonical: `${siteUrl}/refund`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Refund Policy", url: `${siteUrl}/refund` },
];

// skipcq: JS-0067
export default function RefundPolicyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-1)" }}
        >
          Refund and Cancellation Policy
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-3)" }}>
          Last updated: July 31, 2026
        </p>

        <div className="prose-container space-y-8">
          <Section title="Subscription Cancellation">
            <Subsection title="How to Cancel">
              <ol
                className="list-decimal list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Log in to your AlgoPatterns account</li>
                <li>Go to Account Settings</li>
                <li>Click &quot;Manage Subscription&quot;</li>
                <li>Select &quot;Cancel Subscription&quot;</li>
              </ol>
            </Subsection>

            <Subsection title="What Happens When You Cancel">
              <ul
                className="list-disc list-inside space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>
                  Your subscription remains active until the end of your current
                  billing period
                </li>
                <li>You will not be charged for the next billing cycle</li>
                <li>
                  Your progress and highlights are preserved if you resubscribe
                  later
                </li>
              </ul>
            </Subsection>
          </Section>

          <Section title="Refund Policy">
            <Subsection title="7-Day Money-Back Guarantee">
              <p style={{ color: "var(--text-2)" }}>
                We offer a full refund within 7 days of your initial
                subscription purchase if:
              </p>
              <ul
                className="list-disc list-inside mt-2 space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>You are a first-time subscriber</li>
                <li>You have not previously received a refund from us</li>
              </ul>
            </Subsection>

            <Subsection title="How to Request a Refund">
              <p style={{ color: "var(--text-2)" }}>
                Email us at{" "}
                <a
                  href="mailto:hello@algopatterns.in"
                  className="underline"
                  style={{ color: "var(--accent)" }}
                >
                  hello@algopatterns.in
                </a>{" "}
                with:
              </p>
              <ul
                className="list-disc list-inside mt-2 space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Your registered email address</li>
                <li>Reason for the refund request (helps us improve)</li>
                <li>
                  Transaction ID (found in your payment confirmation email)
                </li>
              </ul>
              <p className="mt-3" style={{ color: "var(--text-2)" }}>
                We will process your refund within 5-7 business days.
              </p>
            </Subsection>

            <Subsection title="Refunds After 7 Days">
              <p style={{ color: "var(--text-2)" }}>After the 7-day period:</p>
              <ul
                className="list-disc list-inside mt-2 space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Monthly subscriptions: No refunds for partial months</li>
                <li>
                  Annual subscriptions: Pro-rated refunds may be considered on a
                  case-by-case basis
                </li>
              </ul>
            </Subsection>

            <Subsection title="Non-Refundable Cases">
              <p style={{ color: "var(--text-2)" }}>
                Refunds are not provided for:
              </p>
              <ul
                className="list-disc list-inside mt-2 space-y-1"
                style={{ color: "var(--text-2)" }}
              >
                <li>Subscriptions cancelled after the 7-day period</li>
                <li>Users who violate our Terms of Service</li>
                <li>
                  Technical issues caused by your device or internet connection
                </li>
                <li>Dissatisfaction with interview outcomes</li>
              </ul>
            </Subsection>
          </Section>

          <Section title="Payment Disputes">
            <p style={{ color: "var(--text-2)" }}>
              If you believe you were charged incorrectly:
            </p>
            <ol
              className="list-decimal list-inside mt-2 space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>
                Contact us first at{" "}
                <a
                  href="mailto:hello@algopatterns.in"
                  className="underline"
                  style={{ color: "var(--accent)" }}
                >
                  hello@algopatterns.in
                </a>
              </li>
              <li>Provide your transaction details</li>
              <li>We will investigate and resolve the issue within 48 hours</li>
            </ol>
            <p className="mt-3" style={{ color: "var(--text-2)" }}>
              Filing a chargeback without contacting us first may result in
              account suspension.
            </p>
          </Section>

          <Section title="Contact Us">
            <p style={{ color: "var(--text-2)" }}>
              For refund requests or billing questions:
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
              <li>Response time: Within 24-48 hours</li>
            </ul>
          </Section>

          <Section title="Changes to This Policy">
            <p style={{ color: "var(--text-2)" }}>
              We may update this policy from time to time. Changes will be
              posted on this page with an updated date.
            </p>
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
