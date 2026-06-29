"use client";

import { useState, useEffect, startTransition } from "react";
import { quotes } from "@/lib/quotes";

export default function QuoteSection() {
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    startTransition(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
    });
  }, []);

  return (
    <div className="mt-4 mb-4 text-center">
      <blockquote className="max-w-3xl mx-auto">
        <p
          className="text-xl italic leading-relaxed"
          style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
        >
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-2" style={{ color: "var(--text-3)" }}>
          — {quote.author}
        </footer>
      </blockquote>
    </div>
  );
}
