import { Metadata } from "next";
import { siteConfig } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the AlgoPatterns team. Contact us for support, feedback, bug reports, or business inquiries.",
  openGraph: {
    title: "Contact Us | AlgoPatterns",
    description:
      "Get in touch with the AlgoPatterns team for support, feedback, or inquiries.",
    type: "website",
    url: `${siteUrl}/contact`,
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const breadcrumbs = [
  { name: "Home", url: siteUrl },
  { name: "Contact", url: `${siteUrl}/contact` },
];

const contactMethods = [
  {
    title: "Support",
    description: "For technical issues, billing questions, or account help",
    email: "hello@algopatterns.in",
    responseTime: "Within 24-48 hours",
  },
  {
    title: "Feedback",
    description: "Have suggestions to improve AlgoPatterns?",
    email: "hello@algopatterns.in",
    subject: "Feedback",
  },
  {
    title: "Bug Reports",
    description: "Found a bug? Help us fix it",
    email: "hello@algopatterns.in",
    subject: "Bug Report",
    note: "Please include: steps to reproduce, browser/device info, screenshots if possible",
  },
];

const ContactCard = ({
  title,
  description,
  email,
  subject,
  responseTime,
  note,
}: {
  title: string;
  description: string;
  email: string;
  subject?: string;
  responseTime?: string;
  note?: string;
}) => {
  const mailtoLink = subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;

  return (
    <div
      className="p-5 rounded-lg border"
      style={{
        backgroundColor: "var(--bg-2)",
        borderColor: "var(--border-1)",
      }}
    >
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--text-1)" }}
      >
        {title}
      </h3>
      <p className="text-sm mb-3" style={{ color: "var(--text-3)" }}>
        {description}
      </p>
      <a
        href={mailtoLink}
        className="inline-block text-sm font-medium underline"
        style={{ color: "var(--accent)" }}
      >
        {email}
      </a>
      {responseTime && (
        <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>
          Response: {responseTime}
        </p>
      )}
      {note && (
        <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>
          {note}
        </p>
      )}
    </div>
  );
};

// skipcq: JS-0067
export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-1)" }}
        >
          Contact Us
        </h1>
        <p className="mb-8" style={{ color: "var(--text-2)" }}>
          We&apos;d love to hear from you! Whether you have a question,
          feedback, or need support, here&apos;s how to reach us.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {contactMethods.map((method) => (
            <ContactCard key={method.title} {...method} />
          ))}
        </div>

        <div className="space-y-8">
          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "var(--text-1)" }}
            >
              Response Times
            </h2>
            <p style={{ color: "var(--text-2)" }}>
              We typically respond within 24-48 hours during business days
              (Monday-Friday, IST). For urgent payment issues, we prioritize
              faster responses.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "var(--text-1)" }}
            >
              Before Contacting Support
            </h2>
            <p className="mb-3" style={{ color: "var(--text-2)" }}>
              For common questions, check these resources:
            </p>
            <ul
              className="list-disc list-inside space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>
                <a
                  href="/refund"
                  className="underline"
                  style={{ color: "var(--accent)" }}
                >
                  Refund Policy
                </a>{" "}
                - Cancellation and refund information
              </li>
              <li>
                <a
                  href="/terms"
                  className="underline"
                  style={{ color: "var(--accent)" }}
                >
                  Terms of Service
                </a>{" "}
                - Account and usage policies
              </li>
              <li>
                <a
                  href="/privacy"
                  className="underline"
                  style={{ color: "var(--accent)" }}
                >
                  Privacy Policy
                </a>{" "}
                - Data handling practices
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: "var(--text-1)" }}
            >
              Social Media
            </h2>
            <p style={{ color: "var(--text-2)" }}>
              Follow us for updates, tips, and new content:
            </p>
            <ul
              className="list-disc list-inside mt-2 space-y-1"
              style={{ color: "var(--text-2)" }}
            >
              <li>
                Twitter/X:{" "}
                <a
                  href="https://twitter.com/algopatterns"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "var(--accent)" }}
                >
                  @algopatterns
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
