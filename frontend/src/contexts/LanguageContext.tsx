"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  startTransition,
  ReactNode,
  useCallback,
} from "react";
import { SupportedLanguage } from "@/types";

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "preferredLanguage";
const VALID_LANGUAGES: SupportedLanguage[] = [
  "java",
  "python",
  "cpp",
  "javascript",
];
const DEFAULT_LANGUAGE: SupportedLanguage = "java";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
    if (stored && VALID_LANGUAGES.includes(stored)) {
      startTransition(() => {
        setLanguageState(stored);
      });
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (VALID_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
