"use client";

import { CheatsheetContent } from "@/types/languages";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AlertTriangle, Code, Zap } from "lucide-react";

interface CheatsheetTabProps {
  cheatsheet: CheatsheetContent;
  language: string;
}

// skipcq: JS-0067
export default function CheatsheetTab({
  cheatsheet,
  language,
}: CheatsheetTabProps) {
  return (
    <div className="space-y-10">
      {/* Quick Reference */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/20">
            <Code className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Quick Reference</h2>
        </div>
        <div className="grid gap-4">
          {cheatsheet.quickReference.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-800"
            >
              <h3 className="font-medium text-white mb-3">{item.title}</h3>
              <SyntaxHighlighter
                language={language.toLowerCase()}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                {item.code}
              </SyntaxHighlighter>
              {item.notes && (
                <p className="mt-3 text-sm text-gray-400">{item.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Common Patterns */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Common Patterns</h2>
        </div>
        <div className="grid gap-4">
          {cheatsheet.commonPatterns.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-800"
            >
              <h3 className="font-medium text-white mb-3">{item.title}</h3>
              <SyntaxHighlighter
                language={language.toLowerCase()}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                {item.code}
              </SyntaxHighlighter>
              {item.notes && (
                <p className="mt-3 text-sm text-gray-400">{item.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Gotchas */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">
            Common Gotchas & Mistakes
          </h2>
        </div>
        <div className="space-y-3">
          {cheatsheet.gotchas.map((gotcha, index) => (
            <div
              key={index}
              className="flex gap-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20"
            >
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-amber-400">
                  {index + 1}
                </span>
              </div>
              <p className="text-gray-300">{gotcha}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Print/Download Note */}
      <div className="text-center py-6 text-sm text-gray-500">
        <p>
          Tip: Use your browser&apos;s print function (Cmd/Ctrl + P) to save
          this cheatsheet as PDF.
        </p>
      </div>
    </div>
  );
}
