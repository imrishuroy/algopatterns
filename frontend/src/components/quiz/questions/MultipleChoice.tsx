"use client";

import type { QuizQuestion, Answer } from "@/types/quiz";

interface MultipleChoiceProps {
  question: QuizQuestion;
  answer?: Answer;
  onAnswer: (answer: number) => void;
  disabled: boolean;
}

function parseQuestionText(text: string): { question: string; code: string | null } {
  const codePatterns = [
    /^(.+?)\n\n((?:const|let|var|function|class|if|for|while|return|import|export|def |public |private |int |void |String )[\s\S]+)$/,
    /^(.+?)\n\n(```[\s\S]*?```)$/,
  ];

  for (const pattern of codePatterns) {
    const match = text.match(pattern);
    if (match) {
      return { question: match[1], code: match[2].replace(/```\w*\n?/g, '').replace(/```$/g, '') };
    }
  }

  if (text.includes('\\n')) {
    const parts = text.split(/\\n\\n|\\n/);
    const questionPart = parts[0];
    const codePart = parts.slice(1).join('\n').trim();
    if (codePart && (codePart.includes('const ') || codePart.includes('function') || codePart.includes('for (') || codePart.includes('while ('))) {
      return { question: questionPart, code: codePart };
    }
  }

  return { question: text, code: null };
}

export default function MultipleChoice({
  question,
  answer,
  onAnswer,
  disabled,
}: MultipleChoiceProps) {
  const options = question.options || [];
  const showResult = answer !== undefined;
  const { question: questionText, code: parsedCode } = parseQuestionText(question.questionText);
  const codeToShow = question.codeSnippet || parsedCode;

  return (
    <div className="space-y-6">
      <p className="text-xl text-white leading-relaxed font-medium">
        {questionText}
      </p>

      {codeToShow && (
        <pre className="bg-gray-950 border border-gray-800 rounded-xl p-5 overflow-x-auto">
          <code className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {codeToShow}
          </code>
        </pre>
      )}

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = answer?.selected === index;
          const isCorrect = answer?.correctAnswer === index;

          let borderClass = "border-gray-800 hover:border-gray-600 hover:bg-gray-800/50";
          let bgClass = "";

          if (showResult) {
            if (isCorrect) {
              borderClass = "border-green-500";
              bgClass = "bg-green-500/10";
            } else if (isSelected && !isCorrect) {
              borderClass = "border-red-500";
              bgClass = "bg-red-500/10";
            } else {
              borderClass = "border-gray-800";
              bgClass = "opacity-50";
            }
          }

          return (
            <button
              key={`option-${index}`}
              onClick={() => !disabled && onAnswer(index)}
              disabled={disabled}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all ${borderClass} ${bgClass} ${
                disabled ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                  showResult && isCorrect
                    ? "bg-green-500 text-white"
                    : showResult && isSelected && !isCorrect
                      ? "bg-red-500 text-white"
                      : "bg-gray-800 text-gray-300"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 text-white text-base">{option}</span>
              {showResult && isCorrect && (
                <svg
                  className="w-6 h-6 text-green-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {showResult && isSelected && !isCorrect && (
                <svg
                  className="w-6 h-6 text-red-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
