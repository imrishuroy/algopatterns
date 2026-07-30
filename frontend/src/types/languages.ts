// Language-Specific DSA Guide Types

export type SupportedGuideLanguage = "go" | "rust" | "java" | "python";

export interface LanguageGuide {
  id: SupportedGuideLanguage;
  name: string; // "Go"
  displayName: string; // "DSA in Go"
  description: string;
  difficulty: string; // "Beginner to Advanced"
  icon: string; // Icon identifier
  version: string; // "1.22"

  // Flat list of sections (like pattern.tutorial)
  sections: LanguageSection[];

  // Problems tab content
  commonProblems: ProblemReference[];

  // Cheatsheet tab content
  cheatsheet: CheatsheetContent;
}

export interface LanguageSection {
  id: string; // "arrays-slices" (used for hash navigation)
  title: string; // "Arrays and Slices"
  category: string; // "Data Structures" (for sidebar grouping)
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string; // "15 min"

  // Content (rendered as markdown or structured)
  content: SectionContent[];
}

export type SectionContentType =
  | "text"
  | "code"
  | "tip"
  | "warning"
  | "comparison"
  | "complexity"
  | "heading"
  | "table";

export interface SectionContent {
  type: SectionContentType;

  // For type: "text" or "heading"
  text?: string;
  level?: 2 | 3 | 4; // For heading type

  // For type: "code"
  code?: string;
  language?: string; // Always "go" for Go guide
  filename?: string; // Optional: "two_sum.go"

  // For type: "tip" | "warning"
  title?: string;
  message?: string;

  // For type: "comparison"
  items?: ComparisonItem[];

  // For type: "complexity"
  time?: string;
  space?: string;
  explanation?: string;

  // For type: "table"
  headers?: string[];
  rows?: string[][];
}

export interface ComparisonItem {
  label: string;
  description: string;
}

export interface CheatsheetContent {
  quickReference: QuickRefItem[];
  commonPatterns: QuickRefItem[];
  gotchas: string[];
}

export interface QuickRefItem {
  title: string;
  code: string;
  notes?: string;
}

export interface ProblemReference {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  leetcodeUrl?: string;
  topics: string[];
}

// Language metadata for hub page
export interface LanguageMeta {
  id: SupportedGuideLanguage;
  name: string;
  displayName: string;
  description: string;
  sectionCount: number;
  difficulty: string;
  icon: string;
  available: boolean;
  version?: string;
}

// Difficulty badge colors
export const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Easy: "bg-green-500/20 text-green-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Hard: "bg-red-500/20 text-red-400",
};

// Language accent colors for theming
export const languageAccents: Record<SupportedGuideLanguage, string> = {
  go: "#00ADD8",
  rust: "#DEA584",
  java: "#ED8B00",
  python: "#3776AB",
};
