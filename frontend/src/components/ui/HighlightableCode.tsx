"use client";

import { useRef, useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTextSelection } from "@/hooks/useTextSelection";
import { useHighlights } from "@/contexts/HighlightContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Highlight, HighlightColor } from "@/types";

interface HighlightableCodeProps {
  code: string;
  language?: string;
  contentType: string;
  contentId: string;
  showLineNumbers?: boolean;
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

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: "rgba(255, 175, 56, 0.3)",
  green: "rgba(77, 171, 154, 0.35)",
  blue: "rgba(94, 135, 201, 0.4)",
  pink: "rgba(205, 116, 152, 0.4)",
  purple: "rgba(144, 101, 176, 0.4)",
};

const COLOR_BUTTONS: { color: HighlightColor; border: string }[] = [
  { color: "yellow", border: "#FFAF38" },
  { color: "green", border: "#4DAB9A" },
  { color: "blue", border: "#5E87C9" },
  { color: "pink", border: "#CD7498" },
  { color: "purple", border: "#9065B0" },
];

const customStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "transparent",
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

export function HighlightableCode({
  code,
  language = "java",
  contentType,
  contentId,
  showLineNumbers = true,
}: HighlightableCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const {
    createHighlight,
    deleteHighlight,
    getHighlightsForContent,
    fetchHighlightsForContent,
  } = useHighlights();

  const { selection, clearSelection } = useTextSelection(containerRef, {
    enabled: true, // Always enable to show login prompt
  });

  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(
    null
  );

  const normalizedLang = languageMap[language.toLowerCase()] || "java";
  const highlights = getHighlightsForContent(contentType, contentId);
  const trimmedCode = code.trim();

  // Fetch highlights on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchHighlightsForContent(contentType, contentId);
    }
  }, [isAuthenticated, contentType, contentId, fetchHighlightsForContent]);

  // Update toolbar position when selection changes
  useEffect(() => {
    if (selection && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = {
        top: Math.max(0, selection.rect.top - containerRect.top - 50),
        left: Math.max(
          10,
          Math.min(
            containerRect.width - 180,
            selection.rect.left -
              containerRect.left +
              selection.rect.width / 2 -
              80
          )
        ),
      };
      console.log(
        "[Highlight] Selection detected:",
        selection.text.substring(0, 50)
      );
      console.log("[Highlight] Toolbar position:", newPosition);
      setToolbarPosition(newPosition);
      setActiveHighlight(null);
    } else if (!activeHighlight) {
      setToolbarPosition(null);
    }
  }, [selection, activeHighlight]);

  // Debug: Log auth state
  useEffect(() => {
    console.log("[Highlight] isAuthenticated:", isAuthenticated);
  }, [isAuthenticated]);

  const handleCreateHighlight = async (color: HighlightColor) => {
    if (!selection) return;

    await createHighlight({
      contentType,
      contentId,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      startLine: selection.startLine,
      endLine: selection.endLine,
      selectedText: selection.text,
      color,
    });

    clearSelection();
    setToolbarPosition(null);
  };

  const handleDeleteHighlight = async () => {
    if (activeHighlight) {
      await deleteHighlight(activeHighlight.id);
      setActiveHighlight(null);
      setToolbarPosition(null);
    }
  };

  // Build line highlights map
  const lineHighlights = new Map<number, HighlightColor>();
  highlights.forEach((h) => {
    if (h.startLine && h.endLine) {
      for (let line = h.startLine; line <= h.endLine; line++) {
        if (!lineHighlights.has(line)) {
          lineHighlights.set(line, h.color as HighlightColor);
        }
      }
    }
  });

  const lineProps = (lineNumber: number) => {
    const color = lineHighlights.get(lineNumber);
    const highlight = highlights.find(
      (h) =>
        h.startLine &&
        h.endLine &&
        lineNumber >= h.startLine &&
        lineNumber <= h.endLine
    );

    const style: React.CSSProperties = {
      display: "block",
      width: "100%",
    };

    if (color) {
      style.backgroundColor = HIGHLIGHT_COLORS[color];
      style.cursor = "pointer";
    }

    return {
      style,
      onClick: highlight
        ? (e: React.MouseEvent) => {
            e.stopPropagation();
            if (containerRef.current) {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const containerRect =
                containerRef.current.getBoundingClientRect();
              setToolbarPosition({
                top: rect.top - containerRect.top - 45,
                left: rect.left - containerRect.left + rect.width / 2 - 60,
              });
              setActiveHighlight(highlight);
              clearSelection();
            }
          }
        : undefined,
    };
  };

  return (
    <div ref={containerRef} className="relative">
      <SyntaxHighlighter
        language={normalizedLang}
        style={customStyle}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        lineProps={lineProps}
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
        {trimmedCode}
      </SyntaxHighlighter>

      {/* Selection/Highlight Toolbar */}
      {toolbarPosition && (
        <div
          data-highlight-toolbar
          className="absolute z-[100] flex items-center gap-1 p-2 bg-gray-800 rounded-md shadow-2xl border border-gray-600"
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
            minWidth: "160px",
          }}
        >
          {!isAuthenticated ? (
            <span className="text-xs text-gray-400 px-2">
              Login to highlight
            </span>
          ) : selection && !activeHighlight ? (
            <>
              {COLOR_BUTTONS.map(({ color, border }) => (
                <button
                  key={color}
                  onClick={() => handleCreateHighlight(color)}
                  className="w-7 h-7 rounded-full border-2 border-gray-500 hover:border-white hover:scale-110 transition-all"
                  style={{ backgroundColor: border }}
                  title={`Highlight ${color}`}
                />
              ))}
            </>
          ) : activeHighlight ? (
            <>
              <button
                onClick={handleDeleteHighlight}
                className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-md transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setActiveHighlight(null);
                  setToolbarPosition(null);
                }}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
