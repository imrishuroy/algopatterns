import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - AlgoPatterns",
  robots: { index: false, follow: false },
};

// skipcq: JS-0067
export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
