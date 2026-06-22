"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
    if (stored && VALID_LANGUAGES.includes(stored)) {
      setLanguageState(stored);
    }
    setIsHydrated(true);
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (VALID_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  if (!isHydrated) {
    return (
      <LanguageContext.Provider
        value={{ language: DEFAULT_LANGUAGE, setLanguage }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
