"use client";

import dynamic from "next/dynamic";
import { Pattern, SupportedLanguage } from "@/types";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const CodeBlock = dynamic(() => import("@/components/ui/CodeBlock"), {
  loading: () => (
    <div
      className="h-64 rounded-md animate-pulse"
      style={{ background: "var(--bg-elevated)" }}
    />
  ),
  ssr: false,
});

interface CheatsheetTabProps {
  pattern: Pattern;
}

export default function CheatsheetTab({ pattern }: CheatsheetTabProps) {
  const { language: currentLang, setLanguage: setCurrentLang } = useLanguage();

  const languageOrder = ["java", "javascript", "python", "cpp", "go"];
  const availableLanguages = languageOrder.filter((lang) =>
    pattern.codeTemplates[lang as keyof typeof pattern.codeTemplates]?.trim()
  );

  const currentCode =
    pattern.codeTemplates[currentLang as keyof typeof pattern.codeTemplates] ||
    pattern.codeTemplates[
      availableLanguages[0] as keyof typeof pattern.codeTemplates
    ] ||
    "";

  return (
    <div className="space-y-6">
      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* When to Use */}
        <div className="bg-gray-900/50 rounded-md border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">
            When to Use
          </h3>
          <ul className="space-y-2">
            {pattern.whenToUse.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-300 text-sm"
              >
                <span className="text-green-400 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Insights */}
        <div className="bg-gray-900/50 rounded-md border border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-3">
            Key Insights
          </h3>
          <ul className="space-y-2">
            {pattern.keyInsights.map((insight, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-300 text-sm"
              >
                <span className="text-yellow-400 font-medium">{i + 1}.</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Common Mistakes */}
      {pattern.commonMistakes && pattern.commonMistakes.length > 0 && (
        <div className="bg-red-500/5 rounded-md border border-red-500/20 p-5">
          <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3">
            Common Mistakes
          </h3>
          <ul className="space-y-2">
            {pattern.commonMistakes.map((mistake, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-gray-300 text-sm"
              >
                <span className="text-red-400">✗</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code Template */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">
            Quick Template
          </h3>
          <LanguageToggle
            currentLang={currentLang}
            onChange={(lang) => setCurrentLang(lang as SupportedLanguage)}
            languages={availableLanguages}
            size="sm"
          />
        </div>
        <CodeBlock
          code={currentCode}
          language={currentLang}
          highlightable
          contentType="pattern_code"
          contentId={`${pattern.id}:${currentLang}`}
        />
      </div>

      {/* Complexity */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Time:</span>
          <span className="font-mono text-indigo-400">
            {pattern.timeComplexity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Space:</span>
          <span className="font-mono text-purple-400">
            {pattern.spaceComplexity}
          </span>
        </div>
      </div>
    </div>
  );
}
