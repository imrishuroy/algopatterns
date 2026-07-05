"use client";

import type { QuizQuestion, Answer } from "@/types/quiz";

interface QuizResultsProps {
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  questions: QuizQuestion[];
  answers: Map<string, Answer>;
  onRetake: () => void;
  onClose: () => void;
}

export default function QuizResults({ // skipcq: JS-0067
  totalQuestions,
  correctCount,
  scorePercentage,
  questions,
  answers,
  onRetake,
  onClose,
}: QuizResultsProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset =
    circumference - (scorePercentage / 100) * circumference;

  const getMessage = () => {
    if (scorePercentage >= 90) return "Outstanding!";
    if (scorePercentage >= 80) return "Excellent!";
    if (scorePercentage >= 70) return "Good job!";
    if (scorePercentage >= 60) return "Nice effort!";
    return "Keep practicing!";
  };

  const getScoreColor = () => {
    if (scorePercentage >= 70) return "text-green-500";
    if (scorePercentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="text-center py-4">
      {/* Score circle */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-800"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getScoreColor()} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">
            {Math.round(scorePercentage)}%
          </span>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">{getMessage()}</h3>
      <p className="text-gray-400 mb-6">
        You got {correctCount} out of {totalQuestions} questions correct
      </p>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={onRetake}
          className="px-6 py-2.5 border border-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          Retake Quiz
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-500 transition-colors"
        >
          Continue Learning
        </button>
      </div>

      {/* Question review list */}
      <div className="text-left border-t border-gray-800 pt-6">
        <h4 className="text-sm font-medium text-gray-400 mb-4">
          Review your answers
        </h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {questions.map((q, i) => {
            const answer = answers.get(q.id);
            const questionText = q.questionText.split("\\n")[0];
            return (
              <div
                key={q.id}
                className="flex items-center gap-3 px-4 py-3 rounded-md bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    answer?.isCorrect
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {answer?.isCorrect ? (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-gray-300 truncate">
                  <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                  {questionText.length > 50
                    ? questionText.substring(0, 50) + "..."
                    : questionText}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
