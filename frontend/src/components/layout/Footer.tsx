import Link from "next/link";
import Image from "next/image";

const APP_VERSION = "2.3.0";

const footerLinks = {
  product: [
    { label: "Patterns", href: "/" },
    { label: "Fundamentals", href: "/dsa-fundamentals" },
    { label: "Pricing", href: "/pricing" },
  ],
  resources: [
    { label: "Interview Cheatsheet", href: "/interview-cheatsheet" },
    { label: "Pattern Recognition", href: "/pattern-recognition" },
    { label: "Articles", href: "/articles" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

// skipcq: JS-0067
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800/50 bg-gray-950/50">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="AlgoPatterns"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="font-semibold text-lg text-white">
                AlgoPatterns
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Master Data Structures & Algorithms with AI Enabled pattern-first
              learning. Interactive visualizations and 300+ curated problems.
            </p>
            <a
              href="mailto:hello@algopatterns.in"
              className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              hello@algopatterns.in
            </a>
          </div>

          {/* Links Sections */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Product */}
              <div>
                <h3 className="font-medium text-sm text-gray-300 uppercase tracking-wider mb-4">
                  Product
                </h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-medium text-sm text-gray-300 uppercase tracking-wider mb-4">
                  Resources
                </h3>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="font-medium text-sm text-gray-300 uppercase tracking-wider mb-4">
                  Legal
                </h3>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/contact"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} AlgoPatterns. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">v{APP_VERSION}</p>
        </div>
      </div>
    </footer>
  );
}
