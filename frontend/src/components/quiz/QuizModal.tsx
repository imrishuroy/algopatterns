"use client";

import { useState, useEffect, useCallback, useRef, startTransition } from "react";
import type { QuizQuestion, Answer } from "@/types/quiz";
import { quizService } from "@/lib/quizService";
import MultipleChoice from "./questions/MultipleChoice";
import TrueFalse from "./questions/TrueFalse";
import ExplanationPanel from "./questions/ExplanationPanel";
import QuizResults from "./QuizResults";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  patternId: string;
  sectionSlug?: string;
}

export default function QuizModal({
  isOpen,
  onClose,
  patternId,
  sectionSlug,
}: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    totalQuestions: number;
    correctCount: number;
    scorePercentage: number;
  } | null>(null);

  const questionStartTime = useRef<number>(0);
  const quizStartTime = useRef<number>(0);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const hasAnswered = currentQuestion
    ? answers.has(currentQuestion.id)
    : false;

  const initQuiz = useCallback(async () => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers(new Map());
    setAttemptId(null);
    setShowExplanation(false);
    setShowResults(false);
    setResults(null);

    try {
      const questionsRes = await quizService.getQuestions(
        patternId,
        sectionSlug
      );

      if (questionsRes.questions.length === 0) {
        setError("No questions available for this quiz.");
        setIsLoading(false);
        return;
      }

      const attemptRes = await quizService.startAttempt({
        patternId,
        sectionSlug,
        totalQuestions: questionsRes.questions.length,
      });

      setQuestions(questionsRes.questions);
      setAttemptId(attemptRes.attemptId);
      quizStartTime.current = Date.now();
      questionStartTime.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, patternId, sectionSlug]);

  useEffect(() => {
    startTransition(() => {
      initQuiz();
    });
  }, [initQuiz]);

  const handleAnswer = async (answer: unknown) => {
    if (!attemptId || !currentQuestion || hasAnswered) return;

    const timeTakenMs = Date.now() - questionStartTime.current;

    try {
      const response = await quizService.submitResponse(attemptId, {
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        timeTakenMs,
      });

      setAnswers(
        (prev) =>
          new Map(prev).set(currentQuestion.id, {
            selected: answer,
            isCorrect: response.isCorrect,
            correctAnswer: response.correctAnswer,
            explanation: response.explanation,
          })
      );

      setShowExplanation(true);
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    startTransition(() => {
      questionStartTime.current = Date.now();
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setShowExplanation(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const completeQuiz = async () => {
    if (!attemptId) return;

    const timeTakenSeconds = Math.floor(
      (Date.now() - quizStartTime.current) / 1000
    );

    try {
      const result = await quizService.completeAttempt(attemptId, {
        timeTakenSeconds,
      });

      setResults({
        totalQuestions: result.totalQuestions,
        correctCount: result.correctCount,
        scorePercentage: result.scorePercentage,
      });
      setShowResults(true);
    } catch (err) {
      console.error("Failed to complete quiz:", err);
    }
  };

  const handleRetake = () => {
    initQuiz();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-gray-900 border border-gray-800 rounded-md w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <span className="text-teal-400 font-medium">
              {showResults
                ? "Quiz Complete"
                : `Question ${currentIndex + 1} of ${questions.length}`}
            </span>
            {!showResults && questions.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-36 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg
                className="w-12 h-12 text-red-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400">{error}</p>
              <button
                onClick={handleClose}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {!isLoading && !error && showResults && results && (
            <QuizResults
              totalQuestions={results.totalQuestions}
              correctCount={results.correctCount}
              scorePercentage={results.scorePercentage}
              questions={questions}
              answers={answers}
              onRetake={handleRetake}
              onClose={handleClose}
            />
          )}

          {!isLoading && !error && !showResults && currentQuestion && (
            <>
              <QuestionRenderer
                question={currentQuestion}
                answer={answers.get(currentQuestion.id)}
                onAnswer={handleAnswer}
                disabled={hasAnswered}
              />

              {showExplanation && answers.get(currentQuestion.id) && (
                <ExplanationPanel answer={answers.get(currentQuestion.id)!} />
              )}
            </>
          )}
        </div>

        {/* Footer navigation */}
        {!isLoading && !error && !showResults && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            {hasAnswered && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-medium transition-colors"
              >
                {currentIndex < questions.length - 1
                  ? "Next Question"
                  : "See Results"}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionRenderer({
  question,
  answer,
  onAnswer,
  disabled,
}: {
  question: QuizQuestion;
  answer?: Answer;
  onAnswer: (answer: unknown) => void;
  disabled: boolean;
}) {
  switch (question.type) {
    case "multiple-choice":
    case "code-output":
    case "identify-bug":
    case "code-trace":
      return (
        <MultipleChoice
          question={question}
          answer={answer}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    case "true-false":
      return (
        <TrueFalse
          question={question}
          answer={answer}
          onAnswer={onAnswer}
          disabled={disabled}
        />
      );
    default:
      return (
        <div className="text-gray-400">
          Unsupported question type: {question.type}
        </div>
      );
  }
}
