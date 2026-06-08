"use client";

import { useRef, useEffect, useState, useCallback, type ReactNode } from "react";
import { useHighlights } from "@/contexts/HighlightContext";
import { useAuth } from "@/contexts/AuthContext";
import { generateContentHash, isHighlightStale, getContentText } from "@/lib/contentHash";
import type { Highlight, HighlightColor } from "@/types";

interface HighlightableProps {
  children: ReactNode;
  contentType: string;
  contentId: string;
  className?: string;
}

const COLOR_OPTIONS: { color: HighlightColor; bg: string }[] = [
  { color: "yellow", bg: "#F97316" },
  { color: "green", bg: "#14B8A6" },
  { color: "blue", bg: "#6366F1" },
  { color: "pink", bg: "#F43F5E" },
  { color: "purple", bg: "#06B6D4" },
];

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: "rgba(249, 115, 22, 0.4)",
  green: "rgba(20, 184, 166, 0.4)",
  blue: "rgba(99, 102, 241, 0.45)",
  pink: "rgba(244, 63, 94, 0.4)",
  purple: "rgba(6, 182, 212, 0.4)",
};

interface HighlightOverlay {
  id: string;
  rects: { top: number; left: number; width: number; height: number }[];
  color: string;
  highlight: Highlight;
  isStale: boolean;
}

type ToolbarMode = "colors" | "highlight-menu" | "edit-note";

export function Highlightable({
  children,
  contentType,
  contentId,
  className = "",
}: HighlightableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);
  const { isAuthenticated } = useAuth();
  const {
    createHighlight,
    updateHighlight,
    deleteHighlight,
    getHighlightsForContent,
    fetchHighlightsForContent,
  } = useHighlights();

  const [selection, setSelection] = useState<{
    text: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);

  const [toolbar, setToolbar] = useState<{ top: number; left: number } | null>(null);
  const [toolbarMode, setToolbarMode] = useState<ToolbarMode>("colors");
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
  const [overlays, setOverlays] = useState<HighlightOverlay[]>([]);
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [contentHash, setContentHash] = useState<string>("");

  const highlights = getHighlightsForContent(contentType, contentId);

  // Calculate content hash when content changes
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const calculateHash = async () => {
      const text = getContentText(content);
      const hash = await generateContentHash(text);
      setContentHash(hash);
    };

    // Use requestAnimationFrame to ensure content is rendered
    const frame = requestAnimationFrame(() => {
      calculateHash();
    });
    return () => cancelAnimationFrame(frame);
  }, [children]);

  // Fetch highlights on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchHighlightsForContent(contentType, contentId);
    }
  }, [isAuthenticated, contentType, contentId, fetchHighlightsForContent]);

  // Focus note input when mode changes to edit-note
  useEffect(() => {
    if (toolbarMode === "edit-note" && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [toolbarMode]);

  // Calculate overlay positions for highlights
  const calculateOverlays = useCallback(() => {
    const content = contentRef.current;
    if (!content || highlights.length === 0) {
      setOverlays([]);
      return;
    }

    const containerRect = content.getBoundingClientRect();
    const newOverlays: HighlightOverlay[] = [];

    const getTextNodesWithOffsets = (node: Node): { node: Text; start: number; end: number }[] => {
      const result: { node: Text; start: number; end: number }[] = [];
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let offset = 0;
      let current: Node | null;
      while ((current = walker.nextNode())) {
        const textNode = current as Text;
        const length = textNode.length;
        result.push({ node: textNode, start: offset, end: offset + length });
        offset += length;
      }
      return result;
    };

    const textNodesInfo = getTextNodesWithOffsets(content);
    if (textNodesInfo.length === 0) return;

    highlights.forEach((highlight) => {
      try {
        const overlappingNodes = textNodesInfo.filter(
          (info) => info.end > highlight.startOffset && info.start < highlight.endOffset
        );

        if (overlappingNodes.length === 0) return;

        const allRawRects: { top: number; left: number; width: number; height: number }[] = [];

        overlappingNodes.forEach((nodeInfo) => {
          const { node: textNode, start: nodeStart } = nodeInfo;

          const highlightStartInNode = Math.max(0, highlight.startOffset - nodeStart);
          const highlightEndInNode = Math.min(textNode.length, highlight.endOffset - nodeStart);

          if (highlightStartInNode >= highlightEndInNode) return;

          const range = document.createRange();
          range.setStart(textNode, highlightStartInNode);
          range.setEnd(textNode, highlightEndInNode);

          const clientRects = range.getClientRects();
          for (let i = 0; i < clientRects.length; i++) {
            const rect = clientRects[i];
            allRawRects.push({
              top: rect.top - containerRect.top,
              left: rect.left - containerRect.left,
              width: rect.width,
              height: rect.height,
            });
          }
        });

        const rects: { top: number; left: number; width: number; height: number }[] = [];
        allRawRects.forEach((rect) => {
          const existing = rects.find(
            (r) => Math.abs(r.top - rect.top) < 3 && Math.abs(r.height - rect.height) < 3
          );
          if (existing) {
            const newLeft = Math.min(existing.left, rect.left);
            const newRight = Math.max(existing.left + existing.width, rect.left + rect.width);
            existing.left = newLeft;
            existing.width = newRight - newLeft;
          } else {
            rects.push({ ...rect });
          }
        });

        if (rects.length > 0) {
          newOverlays.push({
            id: highlight.id,
            rects,
            color: HIGHLIGHT_COLORS[highlight.color as HighlightColor] || HIGHLIGHT_COLORS.yellow,
            highlight,
            isStale: isHighlightStale(highlight.contentHash, contentHash),
          });
        }
      } catch (error) {
        console.warn("Could not calculate overlay for highlight:", highlight.id, error);
      }
    });

    setOverlays(newOverlays);
  }, [highlights, contentHash]);

  useEffect(() => {
    // Use requestAnimationFrame for immediate but safe DOM calculation
    const frame = requestAnimationFrame(() => {
      calculateOverlays();
    });
    return () => cancelAnimationFrame(frame);
  }, [calculateOverlays]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    let resizeTimeout: NodeJS.Timeout;
    const debouncedCalculate = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateOverlays, 50);
    };

    const resizeObserver = new ResizeObserver(debouncedCalculate);
    resizeObserver.observe(content);

    window.addEventListener("resize", debouncedCalculate);
    window.addEventListener("scroll", debouncedCalculate, true);

    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      window.removeEventListener("resize", debouncedCalculate);
      window.removeEventListener("scroll", debouncedCalculate, true);
    };
  }, [calculateOverlays]);

  // Handle text selection
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleMouseUp = () => {
      if (document.querySelector("[data-highlight-toolbar]:hover")) return;

      requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        if (!container.contains(range.commonAncestorContainer)) return;

        const text = sel.toString().trim();
        if (text.length < 3 || text.length > 5000) return;

        const preRange = document.createRange();
        preRange.selectNodeContents(container);
        preRange.setEnd(range.startContainer, range.startOffset);
        const startOffset = preRange.toString().length;
        const endOffset = startOffset + sel.toString().length;

        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setSelection({ text, startOffset, endOffset });
        setToolbar({
          top: rect.top - containerRect.top - 50,
          left: Math.max(10, rect.left - containerRect.left + rect.width / 2 - 100),
        });
        setToolbarMode("colors");
        setActiveHighlight(null);
        setNoteText("");
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("[data-highlight-toolbar]")) return;
      if (target.closest("[data-highlight-overlay]")) return;
      closeToolbar();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeToolbar();
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const closeToolbar = () => {
    setSelection(null);
    setToolbar(null);
    setToolbarMode("colors");
    setActiveHighlight(null);
    setNoteText("");
  };

  const handleOverlayClick = (overlay: HighlightOverlay, e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setActiveHighlight(overlay.highlight);
    setSelection(null);
    setToolbarMode("highlight-menu");
    setNoteText(overlay.highlight.note || "");
    setToolbar({
      top: rect.bottom - containerRect.top + 8,
      left: Math.max(10, rect.left - containerRect.left),
    });
  };

  const handleColorSelect = async (color: HighlightColor) => {
    if (!selection || !isAuthenticated) return;

    // Clear browser selection first so user sees the highlight overlay replace it
    window.getSelection()?.removeAllRanges();

    setIsSaving(true);
    await createHighlight({
      contentType,
      contentId,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      selectedText: selection.text,
      color,
      contentHash: contentHash || undefined,
    });

    setIsSaving(false);
    closeToolbar();
  };

  const handleEditNote = () => {
    setToolbarMode("edit-note");
  };

  const handleSaveNote = async () => {
    if (!activeHighlight) return;

    setIsSaving(true);
    await updateHighlight(activeHighlight.id, {
      note: noteText.trim() || undefined,
      version: activeHighlight.version,
    });

    setIsSaving(false);
    closeToolbar();
  };

  const handleDelete = async () => {
    if (!activeHighlight) return;
    await deleteHighlight(activeHighlight.id);
    closeToolbar();
  };

  const handleChangeColor = async (color: HighlightColor) => {
    if (!activeHighlight) return;

    await updateHighlight(activeHighlight.id, {
      color,
      version: activeHighlight.version,
    });

    closeToolbar();
  };

  const handleRelocate = async () => {
    if (!activeHighlight || !contentRef.current) return;

    const currentText = getContentText(contentRef.current);
    const searchText = activeHighlight.selectedText;
    const index = currentText.indexOf(searchText);

    if (index !== -1) {
      setIsSaving(true);
      const newHash = await generateContentHash(currentText);
      await updateHighlight(activeHighlight.id, {
        version: activeHighlight.version,
      });
      // Note: We can't update offsets via the current API, so we delete and recreate
      await deleteHighlight(activeHighlight.id);
      await createHighlight({
        contentType,
        contentId,
        startOffset: index,
        endOffset: index + searchText.length,
        selectedText: searchText,
        color: activeHighlight.color as HighlightColor,
        note: activeHighlight.note || undefined,
        contentHash: newHash,
      });
      setIsSaving(false);
      closeToolbar();
    }
  };

  const canRelocate = (highlight: Highlight): boolean => {
    if (!contentRef.current) return false;
    const currentText = getContentText(contentRef.current);
    return currentText.includes(highlight.selectedText);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Content */}
      <div ref={contentRef} className="relative">
        {children}
      </div>

      {/* Highlight Overlays */}
      {overlays.map((overlay) => {
        // Use stable key based on position to avoid re-animation when temp ID → server ID
        const stableKey = `${overlay.highlight.startOffset}-${overlay.highlight.endOffset}`;
        return (
        <div key={stableKey} data-highlight-overlay={overlay.id}>
          {overlay.rects.map((rect, idx) => (
            <div
              key={`${stableKey}-${idx}`}
              onClick={(e) => handleOverlayClick(overlay, e)}
              className={`absolute pointer-events-auto cursor-pointer transition-all hover:brightness-110 ${
                overlay.isStale ? "border-2 border-dashed border-yellow-500/70" : ""
              }`}
              style={{
                top: rect.top - 2,
                left: rect.left - 3,
                width: rect.width + 6,
                height: rect.height + 4,
                backgroundColor: overlay.isStale ? `${overlay.color.replace("0.4", "0.25")}` : overlay.color,
                borderRadius: "6px",
                animation: "highlightFadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              title={overlay.isStale
                ? "⚠️ Content may have changed - click to review"
                : (overlay.highlight.note || "Click to manage")}
            />
          ))}
        </div>
        );
      })}

      {/* Toolbar */}
      {toolbar && (
        <div
          data-highlight-toolbar
          className="absolute z-[9999]"
          style={{
            top: Math.max(0, toolbar.top),
            left: Math.max(0, toolbar.left),
          }}
        >
          {/* Arrow pointer */}
          {toolbarMode === "colors" && (
            <div className="absolute -bottom-[6px] left-8 w-3 h-3 bg-gray-800 border-r border-b border-gray-700 transform rotate-45" />
          )}
          {(toolbarMode === "highlight-menu" || toolbarMode === "edit-note") && (
            <div className="absolute -top-[6px] left-8 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45" />
          )}

          <div className="bg-gray-800 rounded-md shadow-xl border border-gray-700 overflow-hidden">
            {!isAuthenticated ? (
              <div className="px-3 py-2">
                <span className="text-sm text-gray-400">Sign in to highlight</span>
              </div>
            ) : toolbarMode === "colors" && selection ? (
              /* Color Selection - click to highlight instantly */
              <div className="px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Highlight</p>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map(({ color, bg }) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      disabled={isSaving}
                      className="w-7 h-7 rounded-full hover:scale-110 transition-all opacity-80 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{ backgroundColor: bg }}
                      title={`Highlight ${color}`}
                    />
                  ))}
                </div>
              </div>
            ) : toolbarMode === "highlight-menu" && activeHighlight ? (
              /* Existing Highlight Menu */
              <div className="w-72">
                {/* Stale warning with original text and relocate */}
                {isHighlightStale(activeHighlight.contentHash, contentHash) && (
                  <div className="px-4 py-3 bg-yellow-900/30 border-b border-yellow-700/50">
                    <p className="text-xs text-yellow-400 flex items-center gap-1.5 mb-2">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Content may have changed
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Original text</p>
                    <p className="text-xs text-gray-400 italic line-clamp-3 mb-2">
                      &ldquo;{activeHighlight.selectedText.slice(0, 150)}{activeHighlight.selectedText.length > 150 ? "..." : ""}&rdquo;
                    </p>
                    {canRelocate(activeHighlight) && (
                      <button
                        onClick={handleRelocate}
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded transition-colors disabled:opacity-50"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isSaving ? "Relocating..." : "Relocate highlight"}
                      </button>
                    )}
                  </div>
                )}

                {/* Note section */}
                {activeHighlight.note && (
                  <div className="px-4 py-3 border-b border-gray-700/50">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Note</p>
                    <p className="text-sm text-gray-200 leading-relaxed">{activeHighlight.note}</p>
                  </div>
                )}

                {/* Color picker section */}
                <div className="px-4 py-3 border-b border-gray-700/50">
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2.5">Color</p>
                  <div className="flex items-center gap-2">
                    {COLOR_OPTIONS.map(({ color, bg }) => (
                      <button
                        key={color}
                        onClick={() => handleChangeColor(color)}
                        className={`w-7 h-7 rounded-full transition-all ${
                          activeHighlight.color === color
                            ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110"
                            : "hover:scale-110 opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: bg }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Actions section */}
                <div className="p-2">
                  <button
                    onClick={handleEditNote}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {activeHighlight.note ? "Edit Note" : "Add Note"}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ) : toolbarMode === "edit-note" && activeHighlight ? (
              /* Edit Note for Existing Highlight */
              <div className="w-72 p-4">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">
                  {activeHighlight.note ? "Edit Note" : "Add Note"}
                </p>
                <textarea
                  ref={noteInputRef}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your note..."
                  className="w-full h-24 px-3 py-2 text-sm bg-gray-900 border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  maxLength={1000}
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setToolbarMode("highlight-menu")}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={isSaving}
                    className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50 font-medium"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default Highlightable;
