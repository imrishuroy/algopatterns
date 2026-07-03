"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { HighlightableCode } from "./HighlightableCode";

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
  showCopy?: boolean;
  collapsible?: boolean;
  highlightable?: boolean;
  contentType?: string;
  contentId?: string;
}

const languageMap: Record<string, string> = {
  javascript: "javascript",
  js: "javascript",
  jsx: "jsx",
  java: "java",
  python: "python",
  py: "python",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  go: "go",
  golang: "go",
  typescript: "typescript",
  ts: "typescript",
  tsx: "tsx",
};

const customStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "#011627",
    margin: 0,
    padding: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.6",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontSize: "0.875rem",
  },
};

export default function CodeBlock({
  code,
  language = "java",
  label,
  showCopy = true,
  collapsible = false,
  highlightable = false,
  contentType,
  contentId,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!collapsible);

  const normalizedLang = languageMap[language.toLowerCase()] || "java";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayLabel = label ?? (
    normalizedLang === "cpp"
      ? "C++"
      : normalizedLang.charAt(0).toUpperCase() + normalizedLang.slice(1)
  );

  return (
    <div className="relative group rounded-md overflow-hidden border border-gray-800 bg-[#011627] theme-dark">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1b2a] border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className="text-xs text-gray-400 ml-2 font-medium">
            {displayLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1 text-xs rounded-md transition flex items-center gap-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300"
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              {expanded ? "Hide" : "Show"}
            </button>
          )}
          {showCopy && (
            <button
              onClick={handleCopy}
              className={`px-3 py-1 text-xs rounded-md transition flex items-center gap-1 ${
                copied
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-700/50 hover:bg-gray-600/50 text-gray-300"
              }`}
            >
              {copied ? (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Code content - Collapsible */}
      {expanded && (
        <div className="overflow-auto scrollbar-thin">
          {highlightable && contentType && contentId ? (
            <HighlightableCode
              code={code}
              language={normalizedLang}
              contentType={contentType}
              contentId={contentId}
            />
          ) : (
            <SyntaxHighlighter
              language={normalizedLang}
              style={customStyle}
              showLineNumbers
              lineNumberStyle={{
                minWidth: "2.5em",
                paddingRight: "1em",
                textAlign: "right",
                userSelect: "none",
                color: "#4a5568",
                fontSize: "0.75rem",
              }}
              customStyle={{
                margin: 0,
                background: "#011627",
                borderRadius: 0,
              }}
              codeTagProps={{
                style: {
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                },
              }}
            >
              {code.trim()}
            </SyntaxHighlighter>
          )}
        </div>
      )}
    </div>
  );
}
