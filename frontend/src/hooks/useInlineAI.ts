"use client";

import { useState, useCallback, useEffect } from "react";
import type { OnMount } from "@monaco-editor/react";

type EditorInstance = Parameters<OnMount>[0];

interface InlineAIState {
  isOpen: boolean;
  position: { top: number; left: number };
  selectedCode: string;
  selectionRange: { startLine: number; endLine: number } | null;
}

export function useInlineAI(editorInstance: EditorInstance | null) {
  const [state, setState] = useState<InlineAIState>({
    isOpen: false,
    position: { top: 0, left: 0 },
    selectedCode: "",
    selectionRange: null,
  });

  const open = useCallback(() => {
    if (!editorInstance) return;

    const selection = editorInstance.getSelection();
    const model = editorInstance.getModel();

    if (!selection || !model) return;

    const selectedText = model.getValueInRange(selection);

    // Get cursor position for positioning the popup
    const cursorPosition = editorInstance.getPosition();
    if (!cursorPosition) return;

    const editorDom = editorInstance.getDomNode();
    if (!editorDom) return;

    const editorRect = editorDom.getBoundingClientRect();
    const scrollTop = editorInstance.getScrollTop();
    const lineHeight = editorInstance.getOption(66); // LineHeight option

    // Calculate position relative to viewport
    const lineTop = (cursorPosition.lineNumber - 1) * lineHeight - scrollTop;
    const top = editorRect.top + lineTop + lineHeight + 10;
    const left = editorRect.left + 50;

    setState({
      isOpen: true,
      position: { top, left },
      selectedCode: selectedText,
      selectionRange: selection.isEmpty()
        ? null
        : {
            startLine: selection.startLineNumber,
            endLine: selection.endLineNumber,
          },
    });
  }, [editorInstance]);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const applyCode = useCallback(
    (newCode: string) => {
      if (!editorInstance || !state.selectionRange) return;

      const model = editorInstance.getModel();
      if (!model) return;

      const selection = editorInstance.getSelection();
      if (!selection) return;

      editorInstance.executeEdits("inline-ai", [
        {
          range: selection,
          text: newCode,
          forceMoveMarkers: true,
        },
      ]);

      close();
    },
    [editorInstance, state.selectionRange, close]
  );

  // Set up keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    if (!editorInstance) return;

    editorInstance.addCommand(
      // monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK
      2048 | 41, // CtrlCmd + K
      () => {
        open();
      }
    );
  }, [editorInstance, open]);

  return {
    isOpen: state.isOpen,
    position: state.position,
    selectedCode: state.selectedCode,
    open,
    close,
    applyCode,
  };
}
