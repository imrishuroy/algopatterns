import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    [key: string]: unknown;
  }) => React.createElement("a", { href, className, ...props }, children),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
    ...props
  }: {
    alt?: string;
    className?: string;
    [key: string]: unknown;
  }) => React.createElement("img", { alt, className, ...props }),
}));

// Mock JsonLd components
vi.mock("@/components/seo/JsonLd", () => ({
  BreadcrumbJsonLd: () => null,
}));

// Privacy Policy Page
describe("Privacy Policy Page", () => {
  it("renders the page title", async () => {
    const PrivacyPage = (await import("@/app/privacy/page")).default;
    render(React.createElement(PrivacyPage));
    expect(
      screen.getByRole("heading", { name: /privacy policy/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("renders the last updated date", async () => {
    const PrivacyPage = (await import("@/app/privacy/page")).default;
    render(React.createElement(PrivacyPage));
    expect(screen.getByText(/July 31, 2026/i)).toBeInTheDocument();
  });

  it("renders key sections", async () => {
    const PrivacyPage = (await import("@/app/privacy/page")).default;
    render(React.createElement(PrivacyPage));
    expect(
      screen.getByRole("heading", { name: /information we collect/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /how we use your information/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /data storage and security/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /third-party services/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /your rights/i })
    ).toBeInTheDocument();
  });

  it("renders contact email link", async () => {
    const PrivacyPage = (await import("@/app/privacy/page")).default;
    render(React.createElement(PrivacyPage));
    const emailLinks = screen.getAllByText("hello@algopatterns.in");
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  it("has correct metadata", async () => {
    const { metadata } = await import("@/app/privacy/page");
    expect(metadata.title).toBe("Privacy Policy");
    expect(metadata.description).toContain("Privacy Policy");
  });
});

// Terms of Service Page
describe("Terms of Service Page", () => {
  it("renders the page title", async () => {
    const TermsPage = (await import("@/app/terms/page")).default;
    render(React.createElement(TermsPage));
    expect(
      screen.getByRole("heading", { name: /terms of service/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("renders key sections", async () => {
    const TermsPage = (await import("@/app/terms/page")).default;
    render(React.createElement(TermsPage));
    expect(
      screen.getByRole("heading", { name: /acceptance of terms/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /accounts/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /subscriptions and payments/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /acceptable use/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /intellectual property/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /termination/i })
    ).toBeInTheDocument();
  });

  it("renders governing law section with location", async () => {
    const TermsPage = (await import("@/app/terms/page")).default;
    render(React.createElement(TermsPage));
    expect(screen.getByText(/governing law/i)).toBeInTheDocument();
    expect(screen.getByText(/india/i)).toBeInTheDocument();
  });

  it("has correct metadata", async () => {
    const { metadata } = await import("@/app/terms/page");
    expect(metadata.title).toBe("Terms of Service");
  });
});

// Refund Policy Page
describe("Refund Policy Page", () => {
  it("renders the page title", async () => {
    const RefundPage = (await import("@/app/refund/page")).default;
    render(React.createElement(RefundPage));
    expect(
      screen.getByRole("heading", {
        name: /refund and cancellation policy/i,
        level: 1,
      })
    ).toBeInTheDocument();
  });

  it("renders cancellation instructions", async () => {
    const RefundPage = (await import("@/app/refund/page")).default;
    render(React.createElement(RefundPage));
    expect(screen.getByText(/subscription cancellation/i)).toBeInTheDocument();
    expect(screen.getByText(/how to cancel/i)).toBeInTheDocument();
  });

  it("renders 7-day money-back guarantee", async () => {
    const RefundPage = (await import("@/app/refund/page")).default;
    render(React.createElement(RefundPage));
    expect(screen.getByText(/7-day money-back guarantee/i)).toBeInTheDocument();
  });

  it("renders refund request instructions", async () => {
    const RefundPage = (await import("@/app/refund/page")).default;
    render(React.createElement(RefundPage));
    expect(screen.getByText(/how to request a refund/i)).toBeInTheDocument();
  });

  it("has correct metadata", async () => {
    const { metadata } = await import("@/app/refund/page");
    expect(metadata.title).toBe("Refund and Cancellation Policy");
  });
});

// Contact Page
describe("Contact Page", () => {
  it("renders the page title", async () => {
    const ContactPage = (await import("@/app/contact/page")).default;
    render(React.createElement(ContactPage));
    expect(
      screen.getByRole("heading", { name: /contact us/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("renders contact methods", async () => {
    const ContactPage = (await import("@/app/contact/page")).default;
    render(React.createElement(ContactPage));
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
    expect(screen.getByText("Bug Reports")).toBeInTheDocument();
  });

  it("renders email links", async () => {
    const ContactPage = (await import("@/app/contact/page")).default;
    render(React.createElement(ContactPage));
    const emailLinks = screen.getAllByText("hello@algopatterns.in");
    expect(emailLinks.length).toBeGreaterThan(0);
  });

  it("renders response times section", async () => {
    const ContactPage = (await import("@/app/contact/page")).default;
    render(React.createElement(ContactPage));
    expect(
      screen.getByRole("heading", { name: /response times/i })
    ).toBeInTheDocument();
    // Multiple elements mention 24-48 hours, just verify at least one exists
    expect(screen.getAllByText(/24-48 hours/i).length).toBeGreaterThan(0);
  });

  it("renders links to other legal pages", async () => {
    const ContactPage = (await import("@/app/contact/page")).default;
    render(React.createElement(ContactPage));
    expect(screen.getByRole("link", { name: /refund policy/i })).toHaveAttribute(
      "href",
      "/refund"
    );
    expect(
      screen.getByRole("link", { name: /terms of service/i })
    ).toHaveAttribute("href", "/terms");
    expect(
      screen.getByRole("link", { name: /privacy policy/i })
    ).toHaveAttribute("href", "/privacy");
  });

  it("renders social media section", async () => {
    const ContactPage = (await import("@/app/contact/page")).default;
    render(React.createElement(ContactPage));
    expect(screen.getByText(/social media/i)).toBeInTheDocument();
    expect(screen.getByText("@algopatterns")).toBeInTheDocument();
  });

  it("has correct metadata", async () => {
    const { metadata } = await import("@/app/contact/page");
    expect(metadata.title).toBe("Contact Us");
    expect(metadata.description).toContain("Contact");
  });
});

// Sitemap includes legal pages
describe("Sitemap", () => {
  it("includes legal pages in sitemap", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const sitemapEntries = sitemap();

    const urls = sitemapEntries.map((entry) => entry.url);

    expect(urls.some((url) => url.includes("/privacy"))).toBe(true);
    expect(urls.some((url) => url.includes("/terms"))).toBe(true);
    expect(urls.some((url) => url.includes("/refund"))).toBe(true);
    expect(urls.some((url) => url.includes("/contact"))).toBe(true);
  });
});
