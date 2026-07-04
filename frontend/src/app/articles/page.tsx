import { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/content/articles";
import { siteConfig } from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/JsonLd";

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  title: "Articles - DSA Deep Dives & Algorithm Guides | AlgoPatterns",
  description:
    "In-depth articles on recursion, dynamic programming, graph algorithms, and interview preparation. Comprehensive guides with code examples in Java, Python, C++, and JavaScript.",
  keywords: [
    "dsa articles",
    "algorithm guides",
    "recursion tutorial",
    "dynamic programming guide",
    "graph algorithms article",
    "coding interview guide",
    "data structures deep dive",
  ],
  openGraph: {
    title: "Articles - DSA Deep Dives & Algorithm Guides | AlgoPatterns",
    description:
      "In-depth articles on recursion, dynamic programming, graph algorithms, and more with code examples.",
    type: "website",
    url: `${siteUrl}/articles`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AlgoPatterns Articles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles - DSA Deep Dives & Algorithm Guides | AlgoPatterns",
    description:
      "In-depth articles on algorithms and data structures for coding interview prep.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: `${siteUrl}/articles`,
  },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AlgoPatterns Articles",
  description:
    "In-depth articles on data structures, algorithms, and coding interview preparation.",
  url: `${siteUrl}/articles`,
  numberOfItems: articles.length,
  itemListElement: articles.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${siteUrl}/articles/${article.slug}`,
    name: article.title,
  })),
};

// skipcq: JS-0067
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500/20 text-green-400";
    case "intermediate":
      return "bg-yellow-500/20 text-yellow-400";
    case "advanced":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

// skipcq: JS-0067
export default function ArticlesPage() {
  return (
    <>
      <JsonLdScript data={itemListJsonLd} />
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
        <header className="mb-8 md:mb-12">
          <Link
            href="/"
            className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-block"
          >
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Articles
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Deep dives into programming concepts, data structures, algorithms,
            and interview preparation strategies.
          </p>
        </header>

        <div className="grid gap-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block"
            >
              <article className="bg-gray-900 rounded-md overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}
                        >
                          {article.difficulty}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {article.estimatedTime}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition mb-2">
                        {article.title}
                      </h2>
                      <p className="text-gray-400">{article.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                        {article.authorAvatar}
                      </div>
                      <div>
                        <div className="text-sm text-white">
                          {article.author}
                        </div>
                        <div className="text-xs text-gray-500">
                          {article.publishedAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="hidden sm:inline">{article.sections.length} sections</span>
                      <div className="flex gap-2 flex-wrap">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-800 rounded-md text-gray-400 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sections preview */}
                  <div className="mt-6 pt-4 border-t border-gray-800">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Sections
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {article.sections.slice(0, 6).map((section, idx) => (
                        <div
                          key={section.slug}
                          className="flex items-center gap-2 text-sm text-gray-400"
                        >
                          <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
                            {idx + 1}
                          </span>
                          <span className="truncate">{section.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-md border border-indigo-500/20 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            More Articles Coming Soon
          </h3>
          <p className="text-gray-400 mb-6">
            We are working on comprehensive guides for Dynamic Programming,
            Graph Algorithms, System Design, and more.
          </p>
          <button className="px-6 py-3 bg-indigo-500 text-white rounded-md font-medium hover:bg-indigo-400 transition">
            Get Notified
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
