"use client";

import { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";

interface MermaidBlockProps {
  chart: string;
  isStreaming?: boolean;
}

// Check if mermaid chart looks syntactically complete enough to attempt render
const looksComplete = (chart: string): boolean => {
  const trimmed = chart.trimEnd();
  if (!trimmed) return false;

  const lines = trimmed.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return false; // Need at least diagram type + one node

  const lastLine = lines[lines.length - 1].trim();

  // Incomplete if ends with arrow operators or common incomplete patterns
  if (
    lastLine.endsWith("-->") ||
    lastLine.endsWith("--") ||
    lastLine.endsWith("->") ||
    lastLine.endsWith("---") ||
    lastLine.endsWith("|") ||
    lastLine.endsWith("[") ||
    lastLine.endsWith("(") ||
    lastLine.endsWith("{") ||
    lastLine.endsWith(":") ||
    lastLine.endsWith(",")
  ) {
    return false;
  }

  // Check for unclosed brackets/quotes in the entire chart
  const openBrackets = (trimmed.match(/\[/g) || []).length;
  const closeBrackets = (trimmed.match(/\]/g) || []).length;
  const openParens = (trimmed.match(/\(/g) || []).length;
  const closeParens = (trimmed.match(/\)/g) || []).length;
  const openBraces = (trimmed.match(/\{/g) || []).length;
  const closeBraces = (trimmed.match(/\}/g) || []).length;

  // Return true only if all brackets are balanced
  return (
    openBrackets === closeBrackets &&
    openParens === closeParens &&
    openBraces === closeBraces
  );
};

export const MermaidBlock = ({
  chart,
  isStreaming = false,
}: MermaidBlockProps) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const renderIdRef = useRef(0);

  useEffect(() => {
    // During streaming, only attempt render if diagram looks complete
    if (isStreaming && !looksComplete(chart)) {
      return; // wait for more chunks
    }

    // Don't try to render empty or trivial content
    const trimmed = chart.trim();
    if (!trimmed || trimmed.split("\n").filter((l) => l.trim()).length < 2) {
      return;
    }

    let cancelled = false;
    const currentRenderId = ++renderIdRef.current;

    import("mermaid").then(({ default: mermaid }) => {
      if (cancelled || renderIdRef.current !== currentRenderId) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "strict",
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          nodeSpacing: 50,
          rankSpacing: 50,
        },
        themeVariables: {
          fontSize: "14px",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          dark: true,
          primaryColor: "#6366f1",
          primaryTextColor: "#e5e7eb",
          lineColor: "#6b7280",
          secondaryColor: "#374151",
          tertiaryColor: "#1f2937",
        },
        // Suppress default error rendering
        suppressErrorRendering: true,
      });

      const id = `mermaid-${currentRenderId}`;

      mermaid
        .render(id, chart)
        .then(({ svg: renderedSvg }: { svg: string }) => {
          if (!cancelled && renderIdRef.current === currentRenderId) {
            // Check if Mermaid returned an error SVG
            if (
              renderedSvg.includes("Syntax error") ||
              renderedSvg.includes("Parse error")
            ) {
              setError("Invalid diagram syntax");
              setSvg("");
            } else {
              setSvg(renderedSvg);
              setError("");
            }
          }
        })
        .catch((err: Error) => {
          if (!cancelled && renderIdRef.current === currentRenderId) {
            setError(err.message || "Failed to render diagram");
            setSvg("");
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [chart, isStreaming]);

  // Show loading state during streaming when diagram is incomplete
  if (isStreaming && !svg && !error) {
    return (
      <div className="my-3 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Building diagram...
        </div>
        <pre className="mt-2 text-xs text-gray-500 font-mono overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  // Show error state with option to view raw code
  if (error) {
    return (
      <div className="my-3 rounded-lg border border-red-900/50 bg-gray-900 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-red-400">Diagram error: {error}</span>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            {showRaw ? "Hide" : "Show"} code
          </button>
        </div>
        {showRaw && (
          <pre className="overflow-x-auto text-xs text-gray-400 font-mono bg-gray-950 p-2 rounded">
            {chart}
          </pre>
        )}
      </div>
    );
  }

  // Still loading (not streaming, no svg yet)
  if (!svg) {
    return (
      <div className="my-3 flex items-center justify-center rounded-lg bg-gray-900/50 p-4 text-xs text-gray-500">
        Loading diagram...
      </div>
    );
  }

  // Success: render the SVG (sanitized to prevent XSS)
  const sanitizedSvg = DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ["use"],
  });

  return (
    // skipcq: JS-0440 - SVG is sanitized with DOMPurify before injection
    <div
      className="my-3 rounded-lg bg-gray-900/50 p-4 [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
    />
  );
};
