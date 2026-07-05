import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - AlgoPatterns",
  robots: { index: false, follow: false },
};

// skipcq: JS-0067
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
