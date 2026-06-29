"use client";

import { useState, useEffect, useCallback, startTransition, type RefObject } from "react";

export interface SelectionInfo {
  text: string;
  startOffset: number;
  endOffset: number;
  startLine?: number;
  endLine?: number;
  rect: DOMRect;
}

interface UseTextSelectionOptions {
  minLength?: number;
  maxLength?: number;
  enabled?: boolean;
}

export function useTextSelection(
  containerRef: RefObject<HTMLElement | null>,
  options: UseTextSelectionOptions = {}
) {
  const { minLength = 3, maxLength = 5000, enabled = true } = options;
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  useEffect(() => {
    if (!enabled) {
      startTransition(() => {
        setSelection(null);
      });
      return;
    }

    const handleMouseUp = () => {
      const container = containerRef.current;
      if (!container) return;

      // Small delay to ensure selection is complete
      requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) {
          return;
        }

        const range = sel.getRangeAt(0);

        // Check if selection is within or overlaps with container
        const selectionInContainer = container.contains(range.commonAncestorContainer) ||
          container.contains(range.startContainer) ||
          container.contains(range.endContainer);

        if (!selectionInContainer) {
          return;
        }

        const text = sel.toString();
        const trimmedText = text.trim();

        if (trimmedText.length < minLength || trimmedText.length > maxLength) {
          return;
        }

        // Get bounding rect for toolbar positioning
        const rect = range.getBoundingClientRect();

        // Calculate offsets based on text content
        const fullText = container.textContent || "";
        const preRange = document.createRange();
        preRange.selectNodeContents(container);
        preRange.setEnd(range.startContainer, range.startOffset);
        const startOffset = preRange.toString().length;
        const endOffset = startOffset + text.length;

        // Calculate line numbers
        const textBeforeStart = fullText.substring(0, startOffset);
        const startLine = (textBeforeStart.match(/\n/g) || []).length + 1;
        const textBeforeEnd = fullText.substring(0, endOffset);
        const endLine = (textBeforeEnd.match(/\n/g) || []).length + 1;

        setSelection({
          text: trimmedText,
          startOffset,
          endOffset,
          startLine,
          endLine,
          rect,
        });
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Don't clear if clicking on the highlight toolbar
      const target = e.target as Element;
      if (target.closest?.("[data-highlight-toolbar]")) {
        return;
      }
      setSelection(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelection(null);
        window.getSelection()?.removeAllRanges();
      }
    };

    // Listen on document for better capture
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, enabled, minLength, maxLength]);

  return { selection, clearSelection };
}
