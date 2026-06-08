"use client";

import { useState } from "react";
import { PatternFundamentals } from "@/types";
import CodeBlock from "@/components/ui/CodeBlock";
import LanguageToggle from "@/components/ui/LanguageToggle";

interface FundamentalsSectionProps {
  fundamentals: PatternFundamentals;
  patternId: string;
}

const DiagramBlock = ({ diagram }: { diagram: string }) => (
  <div className="my-6 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
    <div className="p-4 overflow-x-auto">
      <pre className="text-sm font-mono text-gray-300 whitespace-pre">
        {diagram}
      </pre>
    </div>
  </div>
);

const ContentBlock = ({ content }: { content: string }) => (
  <div className="text-gray-300 leading-relaxed whitespace-pre-line">
    {content.split("\n").map((line, i) => {
      if (line.startsWith("•")) {
        return (
          <div key={i} className="flex items-start gap-2 ml-2">
            <span className="text-indigo-400">•</span>
            <span>{line.substring(1).trim()}</span>
          </div>
        );
      }
      if (line.match(/^\d+\./)) {
        return (
          <div key={i} className="flex items-start gap-2 ml-2">
            <span className="text-indigo-400 font-medium">
              {line.match(/^\d+\./)?.[0]}
            </span>
            <span>{line.replace(/^\d+\./, "").trim()}</span>
          </div>
        );
      }
      return (
        <p key={i} className={line.trim() === "" ? "h-4" : ""}>
          {line}
        </p>
      );
    })}
  </div>
);

export default function FundamentalsSection({
  fundamentals,
  patternId,
}: FundamentalsSectionProps) {
  const [currentLang, setCurrentLang] = useState<string>("java");

  return (
    <div className="space-y-12 mb-16">
      {/* Section Header */}
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📚</span>
          Graph Fundamentals
        </h2>
        <p className="text-gray-400 mt-2">
          Essential theory and concepts before diving into algorithms
        </p>
      </div>

      {/* Introduction */}
      {fundamentals.introduction && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">1.</span>
            {fundamentals.introduction.title}
          </h3>
          <ContentBlock content={fundamentals.introduction.content} />
          {fundamentals.introduction.diagram && (
            <DiagramBlock diagram={fundamentals.introduction.diagram} />
          )}
        </div>
      )}

      {/* Terminology */}
      {fundamentals.terminology && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-indigo-400">2.</span>
            Key Terminology
          </h3>
          <div className="space-y-8">
            {Object.entries(fundamentals.terminology).map(
              ([key, topic], idx) => (
                <div
                  key={key}
                  className="border-l-2 border-indigo-500/30 pl-4"
                >
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {topic.title}
                  </h4>
                  <ContentBlock content={topic.content} />
                  {topic.diagram && <DiagramBlock diagram={topic.diagram} />}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Types */}
      {fundamentals.types && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-indigo-400">3.</span>
            Types of Graphs
          </h3>
          <div className="space-y-8">
            {Object.entries(fundamentals.types).map(([key, topic]) => (
              <div key={key} className="border-l-2 border-purple-500/30 pl-4">
                <h4 className="text-lg font-semibold text-white mb-2">
                  {topic.title}
                </h4>
                <ContentBlock content={topic.content} />
                {topic.diagram && <DiagramBlock diagram={topic.diagram} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Representation */}
      {fundamentals.representation && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-indigo-400">4.</span>
            {fundamentals.representation.title || "Graph Representation in Code"}
          </h3>

          {fundamentals.representation.intro && (
            <ContentBlock content={fundamentals.representation.intro} />
          )}

          {fundamentals.representation.inputExample && (
            <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-semibold text-indigo-400 mb-2">
                Input Format Example
              </h4>
              <pre className="text-sm font-mono text-gray-300 whitespace-pre overflow-x-auto">
                {fundamentals.representation.inputExample}
              </pre>
            </div>
          )}

          {/* Adjacency Matrix */}
          {fundamentals.representation.adjacencyMatrix && (
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-orange-400">▸</span>
                {fundamentals.representation.adjacencyMatrix.title}
              </h4>
              <ContentBlock
                content={fundamentals.representation.adjacencyMatrix.content}
              />
              {fundamentals.representation.adjacencyMatrix.diagram && (
                <DiagramBlock
                  diagram={fundamentals.representation.adjacencyMatrix.diagram}
                />
              )}
              {(fundamentals.representation.adjacencyMatrix.codeJava ||
                fundamentals.representation.adjacencyMatrix.codeJavaScript) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">
                      Code
                    </span>
                    <LanguageToggle
                      currentLang={currentLang}
                      onChange={setCurrentLang}
                      languages={["java", "javascript"]}
                      size="sm"
                    />
                  </div>
                  <CodeBlock
                    code={
                      currentLang === "java"
                        ? fundamentals.representation.adjacencyMatrix.codeJava ||
                          ""
                        : fundamentals.representation.adjacencyMatrix
                            .codeJavaScript || ""
                    }
                    language={currentLang}
                    collapsible={true}
                    highlightable
                    contentType="fundamentals_code"
                    contentId={`${patternId}:adjacencyMatrix:${currentLang}`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Adjacency List */}
          {fundamentals.representation.adjacencyList && (
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-green-400">▸</span>
                {fundamentals.representation.adjacencyList.title}
              </h4>
              <ContentBlock
                content={fundamentals.representation.adjacencyList.content}
              />
              {fundamentals.representation.adjacencyList.diagram && (
                <DiagramBlock
                  diagram={fundamentals.representation.adjacencyList.diagram}
                />
              )}
              {(fundamentals.representation.adjacencyList.codeJava ||
                fundamentals.representation.adjacencyList.codeJavaScript) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">
                      Code
                    </span>
                    <LanguageToggle
                      currentLang={currentLang}
                      onChange={setCurrentLang}
                      languages={["java", "javascript"]}
                      size="sm"
                    />
                  </div>
                  <CodeBlock
                    code={
                      currentLang === "java"
                        ? fundamentals.representation.adjacencyList.codeJava ||
                          ""
                        : fundamentals.representation.adjacencyList
                            .codeJavaScript || ""
                    }
                    language={currentLang}
                    collapsible={true}
                    highlightable
                    contentType="fundamentals_code"
                    contentId={`${patternId}:adjacencyList:${currentLang}`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Weighted List */}
          {fundamentals.representation.weightedList && (
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-blue-400">▸</span>
                {fundamentals.representation.weightedList.title}
              </h4>
              <ContentBlock
                content={fundamentals.representation.weightedList.content}
              />
              {fundamentals.representation.weightedList.diagram && (
                <DiagramBlock
                  diagram={fundamentals.representation.weightedList.diagram}
                />
              )}
              {(fundamentals.representation.weightedList.codeJava ||
                fundamentals.representation.weightedList.codeJavaScript) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">
                      Code
                    </span>
                    <LanguageToggle
                      currentLang={currentLang}
                      onChange={setCurrentLang}
                      languages={["java", "javascript"]}
                      size="sm"
                    />
                  </div>
                  <CodeBlock
                    code={
                      currentLang === "java"
                        ? fundamentals.representation.weightedList.codeJava ||
                          ""
                        : fundamentals.representation.weightedList
                            .codeJavaScript || ""
                    }
                    language={currentLang}
                    collapsible={true}
                    highlightable
                    contentType="fundamentals_code"
                    contentId={`${patternId}:weightedList:${currentLang}`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Comparison */}
          {fundamentals.representation.comparison && (
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-yellow-400">💡</span>
                {fundamentals.representation.comparison.title}
              </h4>
              <ContentBlock
                content={fundamentals.representation.comparison.content}
              />
              {fundamentals.representation.comparison.diagram && (
                <DiagramBlock
                  diagram={fundamentals.representation.comparison.diagram}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
