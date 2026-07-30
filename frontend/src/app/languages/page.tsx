import { Metadata } from "next";
import { getLanguageMetas } from "@/lib/languages";
import LanguageCard from "@/components/languages/LanguageCard";
import { ItemListJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Language-Specific Data Structures and Algorithms Guides | AlgoPatterns",
  description:
    "Master data structures and algorithms in your favorite programming language. Comprehensive guides for Go, Rust, Java, and Python with practical examples for coding interviews.",
  keywords: [
    "dsa guide",
    "data structures algorithms",
    "coding interview",
    "leetcode",
    "go dsa",
    "rust dsa",
    "java dsa",
    "python dsa",
  ],
  openGraph: {
    title:
      "Language-Specific Data Structures and Algorithms Guides | AlgoPatterns",
    description:
      "Learn Data Structures and Algorithms in your favorite language with comprehensive guides and practical examples.",
    type: "website",
    url: `${siteConfig.url}/languages`,
    siteName: siteConfig.name,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Language-Specific DSA Guides | AlgoPatterns",
    description:
      "Master DSA in Go, Rust, Java, and Python with comprehensive guides.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteConfig.url}/languages`,
  },
};

// skipcq: JS-0067 — Next.js page component
export default function LanguagesPage() {
  const languages = getLanguageMetas();

  const breadcrumbs = [
    { name: "Home", url: siteConfig.url },
    { name: "Languages", url: `${siteConfig.url}/languages` },
  ];

  const languageItems = languages.map((lang, index) => ({
    name: `${lang.name} DSA Guide`,
    url: `${siteConfig.url}/languages/${lang.id}`,
    description: lang.description,
    position: index + 1,
  }));

  // skipcq: JS-0415 — nesting depth from existing UI structure with SEO components
  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        name="Programming Language DSA Guides"
        description="Comprehensive Data Structures and Algorithms guides for popular programming languages including Go, Rust, Java, and Python."
        items={languageItems}
      />
      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Learn Data Structures and Algorithms in Your{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--accent-gradient)" }}
              >
                Favorite Language
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Master data structures and algorithms with language-specific
              guides. Learn idiomatic patterns, built-in libraries, and
              interview-ready techniques.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div
              className="p-6 rounded-xl"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-1)",
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Idiomatic Code
              </h3>
              <p className="text-gray-400 text-sm">
                Learn language-specific patterns and best practices that
                interviewers expect to see.
              </p>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-1)",
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Standard Library
              </h3>
              <p className="text-gray-400 text-sm">
                Master built-in data structures, sorting, and utilities for
                efficient solutions.
              </p>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-1)",
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Interview Ready
              </h3>
              <p className="text-gray-400 text-sm">
                Practice problems, cheatsheets, and common patterns used in
                FAANG interviews.
              </p>
            </div>
          </div>

          {/* Language Cards */}
          <h2 className="text-xl font-semibold text-white mb-6">
            Choose Your Language
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {languages.map((language) => (
              <LanguageCard key={language.id} language={language} />
            ))}
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
