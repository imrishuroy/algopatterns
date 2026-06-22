import Script from "next/script";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HighlightProvider } from "@/contexts/HighlightContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { defaultMetadata } from "@/lib/seo";
import { WebsiteJsonLd } from "@/components/seo/JsonLd";

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
        <meta name="google-site-verification" content="GN9sKyZeBRDfjzlfvY8mPl0NB0zbnt2gHnPbmWpK3ng" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-64T0261KB3"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-64T0261KB3');
          `}
        </Script>
        <WebsiteJsonLd />
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
                    <FilterProvider>
                      <Header />
                      <main className="flex-1">{children}</main>
                      <Footer />
                    </FilterProvider>
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
