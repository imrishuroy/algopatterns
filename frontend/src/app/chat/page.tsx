import { Metadata } from "next";
import { ChatClient } from "./ChatClient";

export const metadata: Metadata = {
  title: "AI DSA Tutor - Chat with Thor AI",
  description:
    "Get instant help with Data Structures and Algorithms. Ask questions, understand concepts, and solve coding problems with our AI-powered DSA tutor.",
  keywords: [
    "AI tutor",
    "DSA help",
    "algorithm explanation",
    "coding assistant",
    "data structures help",
    "leetcode help",
    "interview preparation AI",
  ],
  openGraph: {
    title: "AI DSA Tutor - Chat with Thor AI",
    description:
      "Get instant help with Data Structures and Algorithms. Ask questions, understand concepts, and solve coding problems with our AI-powered DSA tutor.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI DSA Tutor - Chat with Thor AI",
    description:
      "Get instant help with Data Structures and Algorithms with our AI-powered DSA tutor.",
  },
};

// skipcq: JS-0067
export default function ChatPage() {
  return <ChatClient />;
}
