export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface AISession {
  id: string;
  problemSlug?: string;
  patternId?: string;
  messages: AIMessage[];
  createdAt: Date;
}

export type ContextType = "problem" | "pattern" | "general";

export interface HintRequest {
  problemSlug: string;
  problemTitle: string;
  problemDescription?: string;
  code: string;
  language: string;
  hintLevel?: number;
}

export interface HintResponse {
  hint: string;
  level: number;
  pattern?: string;
  tokensUsed: number;
}

export interface ReviewRequest {
  problemSlug: string;
  problemTitle: string;
  problemDescription?: string;
  code: string;
  language: string;
  focusAreas?: string[];
}

export interface ReviewResponse {
  review: string;
  tokensUsed: number;
}

export interface ExplainRequest {
  code: string;
  language: string;
  errorType: string;
  errorMessage: string;
  lineNumber?: number;
}

export interface ExplainResponse {
  explanation: string;
  relatedConcept?: string;
  tokensUsed: number;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  problemSlug?: string;
  problemTitle?: string;
  problemDescription?: string;
  patternId?: string;
  patternName?: string;
  patternDifficulty?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  sectionContent?: string;
  activeSection?: string;
  contextType?: ContextType;
  code?: string;
  language?: string;
  history?: ConversationMessage[];
  errorMessage?: string;
}

export interface ChatResponse {
  content: string;
  sessionId: string;
  tokensUsed: number;
  model: string;
}

export type AIFeatureType = "chat" | "hint" | "review" | "explain";

export type PatternQuickAction =
  | "explain"
  | "compare"
  | "whenToUse"
  | "walkThrough"
  | "practiceNext";
