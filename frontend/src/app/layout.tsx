import Script from "next/script";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HighlightProvider } from "@/contexts/HighlightContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PatternProgressProvider } from "@/contexts/PatternProgressContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { defaultMetadata } from "@/lib/seo";
import { WebsiteJsonLd, OrganizationJsonLd } from "@/components/seo/JsonLd";
import { GlobalSearchHandler } from "@/components/search/GlobalSearchHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata = defaultMetadata;

// skipcq: JS-0067, JS-0415
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} h-full antialiased dark`}
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-64T0261KB3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){dataLayer.push(arguments);};
            window.gtag('js', new Date());
            window.gtag('config', 'G-64T0261KB3');
          `}
        </Script>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body
        className="min-h-full flex flex-col text-gray-100"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <HighlightProvider>
                  <ProgressProvider>
                    <PatternProgressProvider>
                      <FilterProvider>
                        <SearchProvider>
                          <GlobalSearchHandler />
                          <Header />
                          <main className="flex-1">{children}</main>
                          {/* <Footer /> */}
                        </SearchProvider>
                      </FilterProvider>
                    </PatternProgressProvider>
                  </ProgressProvider>
                </HighlightProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
