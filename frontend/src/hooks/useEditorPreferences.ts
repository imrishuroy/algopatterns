"use client";

import { useState, useEffect, useCallback } from "react";

// Storage keys

const KEYS = {
  fontSize: "editor_fontSize",
  wordWrap: "editor_wordWrap",
  tabSize: "editor_tabSize",
  leftPanelWidth: "editor_leftPanelWidth",
  rightPanelWidth: "editor_rightPanelWidth",
  editorHeight: "editor_editorHeight",
  // Global language preference — numeric API language ID.
  // Written by ProblemPageClient on every language switch.
  language: "editor_language",
} as const;

// Defaults

const DEFAULTS = {
  fontSize: 14,
  wordWrap: false,
  tabSize: 4,
  leftPanelWidth: 35,
  rightPanelWidth: 20,
  editorHeight: 60,
} as const;

// Helpers

const readNum = (key: string, def: number): number => {
  if (typeof window === "undefined") return def;
  const raw = localStorage.getItem(key);
  if (!raw) return def;
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? def : parsed;
};

const readBool = (key: string, def: boolean): boolean => {
  if (typeof window === "undefined") return def;
  const raw = localStorage.getItem(key);
  if (raw === null) return def;
  return raw === "true";
};

/**
 * Persists editor preferences to localStorage so they survive page reloads.
 *
 * Discrete settings (fontSize, wordWrap, tabSize) are written immediately on
 * change. Panel widths (leftPanelWidth, rightPanelWidth, editorHeight) are
 * updated continuously during drag so their writes are debounced by 500 ms.
 */
// skipcq: JS-0067
export function useEditorPreferences() {
  // State — lazy-initialised from localStorage

  const [fontSize, setFontSizeState] = useState(() =>
    readNum(KEYS.fontSize, DEFAULTS.fontSize),
  );
  const [wordWrap, setWordWrapState] = useState(() =>
    readBool(KEYS.wordWrap, DEFAULTS.wordWrap),
  );
  const [tabSize, setTabSizeState] = useState(() =>
    readNum(KEYS.tabSize, DEFAULTS.tabSize),
  );
  const [leftPanelWidth, setLeftPanelWidth] = useState(() =>
    readNum(KEYS.leftPanelWidth, DEFAULTS.leftPanelWidth),
  );
  const [rightPanelWidth, setRightPanelWidth] = useState(() =>
    readNum(KEYS.rightPanelWidth, DEFAULTS.rightPanelWidth),
  );
  const [editorHeight, setEditorHeight] = useState(() =>
    readNum(KEYS.editorHeight, DEFAULTS.editorHeight),
  );

  // Immediate writes for discrete settings

  const setFontSize = useCallback((value: number) => {
    setFontSizeState(value);
    localStorage.setItem(KEYS.fontSize, value.toString());
  }, []);

  const setWordWrap = useCallback((value: boolean) => {
    setWordWrapState(value);
    localStorage.setItem(KEYS.wordWrap, value.toString());
  }, []);

  const setTabSize = useCallback((value: number) => {
    setTabSizeState(value);
    localStorage.setItem(KEYS.tabSize, value.toString());
  }, []);

  // Debounced writes for panel widths (dragged continuously)

  useEffect(() => {
    const timer = setTimeout(
      () => localStorage.setItem(KEYS.leftPanelWidth, leftPanelWidth.toString()),
      500,
    );
    return () => clearTimeout(timer);
  }, [leftPanelWidth]);

  useEffect(() => {
    const timer = setTimeout(
      () => localStorage.setItem(KEYS.rightPanelWidth, rightPanelWidth.toString()),
      500,
    );
    return () => clearTimeout(timer);
  }, [rightPanelWidth]);

  useEffect(() => {
    const timer = setTimeout(
      () => localStorage.setItem(KEYS.editorHeight, editorHeight.toString()),
      500,
    );
    return () => clearTimeout(timer);
  }, [editorHeight]);

  return {
    fontSize,
    setFontSize,
    wordWrap,
    setWordWrap,
    tabSize,
    setTabSize,
    leftPanelWidth,
    setLeftPanelWidth,
    rightPanelWidth,
    setRightPanelWidth,
    editorHeight,
    setEditorHeight,
  };
}
