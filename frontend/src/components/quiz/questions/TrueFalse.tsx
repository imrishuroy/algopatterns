"use client";

import type { QuizQuestion, Answer } from "@/types/quiz";

interface TrueFalseProps {
  question: QuizQuestion;
  answer?: Answer;
  onAnswer: (answer: boolean) => void;
  disabled: boolean;
}

export default function TrueFalse({
  // skipcq: JS-0067
  question,
  answer,
  onAnswer,
  disabled,
}: TrueFalseProps) {
  const showResult = answer !== undefined;

  const options = [
    { value: true, label: "True", icon: "✓" },
    { value: false, label: "False", icon: "✗" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-xl text-white leading-relaxed font-medium">
        {question.questionText}
      </p>

      {question.codeSnippet && (
        <pre className="bg-gray-950 border border-gray-800 rounded-md p-5 overflow-x-auto">
          <code className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {question.codeSnippet}
          </code>
        </pre>
      )}

      <div className="grid grid-cols-2 gap-4">
        {options.map(({ value, label }) => {
          const isSelected = answer?.selected === value;
          const isCorrect = answer?.correctAnswer === value;

          let borderClass =
            "border-gray-800 hover:border-gray-600 hover:bg-gray-800/50";
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
              key={label}
              onClick={() => !disabled && onAnswer(value)}
              disabled={disabled}
              className={`flex items-center justify-center gap-4 px-5 py-4 rounded-md border transition-all ${borderClass} ${bgClass} ${
                disabled ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold ${
                  showResult && isCorrect
                    ? "bg-green-500 text-white"
                    : showResult && isSelected && !isCorrect
                      ? "bg-red-500 text-white"
                      : "bg-gray-800 text-gray-300"
                }`}
              >
                {value ? "T" : "F"}
              </span>
              <span className="text-white text-base font-medium">{label}</span>
              {showResult && isCorrect && (
                <svg
                  className="w-6 h-6 text-green-400 ml-auto"
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
                  className="w-6 h-6 text-red-400 ml-auto"
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
