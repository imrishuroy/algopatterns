export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "code-output"
  | "fill-blank"
  | "identify-bug"
  | "code-trace"
  | "ordering";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type AttemptStatus = "in_progress" | "completed" | "abandoned";

export interface QuizQuestion {
  id: string;
  patternId: string;
  sectionSlug?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  questionText: string;
  codeSnippet?: string;
  options?: string[];
  displayOrder: number;
}

export interface QuizAttempt {
  id: string;
  userId?: string;
  patternId: string;
  sectionSlug?: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage?: number;
  startedAt: string;
  completedAt?: string;
  timeTakenSeconds?: number;
  status: AttemptStatus;
}

export interface QuizResponse {
  id: string;
  attemptId: string;
  questionId: string;
  selectedAnswer: unknown;
  isCorrect: boolean;
  timeTakenMs?: number;
  answeredAt: string;
}

// API Request/Response types
export interface GetQuestionsResponse {
  patternId: string;
  sectionSlug?: string;
  /** Full number of questions available for this pattern (before free-tier slice). */
  totalQuestions: number;
  questions: QuizQuestion[];
  isLimited?: boolean;
  limitReason?: string;
}

export interface StartAttemptRequest {
  patternId: string;
  sectionSlug?: string;
  totalQuestions: number;
}

export interface StartAttemptResponse {
  attemptId: string;
  startedAt: string;
}

export interface SubmitResponseRequest {
  questionId: string;
  selectedAnswer: unknown;
  timeTakenMs?: number;
}

export interface SubmitResponseResponse {
  isCorrect: boolean;
  correctAnswer: unknown;
  acceptableAnswers?: unknown;
  explanation: string;
}

export interface CompleteAttemptRequest {
  timeTakenSeconds?: number;
}

export interface CompleteAttemptResponse {
  attemptId: string;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeTakenSeconds?: number;
  completedAt: string;
}

export interface AttemptHistoryResponse {
  attempts: QuizAttempt[];
  bestScore?: number;
  totalAttempts: number;
  nextCursor?: string;
}

// Local state types
export interface Answer {
  selected: unknown;
  isCorrect: boolean;
  correctAnswer: unknown;
  explanation: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Map<string, Answer>;
  attemptId: string | null;
  startTime: number | null;
  status: "loading" | "ready" | "in_progress" | "completed" | "error";
}
