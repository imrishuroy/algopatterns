import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HighlightProvider } from "@/contexts/HighlightContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Algo Patterns - Master DSA Patterns",
  description:
    "Master Data Structures & Algorithms with pattern-based learning. Interactive visualizers, step-by-step animations, and curated problem sets for FAANG interviews.",
  keywords: ["DSA", "algorithms", "data structures", "coding patterns", "leetcode", "FAANG interview"],
  authors: [{ name: "Algo Patterns" }],
  openGraph: {
    title: "Algo Patterns - Master DSA Patterns",
    description: "Master Data Structures & Algorithms with pattern-based learning",
    type: "website",
  },
};

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
      <body
        className="min-h-full flex flex-col text-gray-100"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <HighlightProvider>
              <ProgressProvider>
                <FilterProvider>
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </FilterProvider>
              </ProgressProvider>
            </HighlightProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
