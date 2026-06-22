export interface CodeTemplates {
  javascript: string;
  java?: string;
  python?: string;
  cpp?: string;
  go?: string;
}

// Language types for global language preference
export type SupportedLanguage = "java" | "python" | "cpp" | "javascript";

// DSA Fundamentals types
export type ConceptCategory =
  | "Data Structures"
  | "Collections & Maps"
  | "Arrays & Sorting"
  | "String & Character"
  | "Type Conversions & Math"
  | "Arithmetic Patterns"
  | "Java Fundamentals"
  | "Algorithm Idioms";

export interface ConceptCodeSnippets {
  java: string;
  python: string;
  cpp: string;
  javascript: string;
}

export interface Concept {
  id: string;
  name: string;
  slug: string;
  category: ConceptCategory;
  description: string;
  explanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  whenToUse: string[];
  codeSnippets: ConceptCodeSnippets;
  keyPoints?: string[];
  commonMistakes?: string[];
  relatedProblems?: string[];
  relatedPatterns?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VariationTemplate {
  javascript?: string;
  java?: string;
}

export interface PatternVariation {
  id: string;
  name: string;
  desc: string;
  when?: string;
  template?: VariationTemplate;
  problems?: string[];
  guide?: string;
}

export interface TutorialSection {
  title: string;
  content: string;
  code?: {
    java?: string;
    javascript?: string;
  };
}

export interface Pattern {
  id: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Easy-Medium" | "Medium-Hard";
  description: string;
  whenToUse: string[];
  codeTemplates: CodeTemplates;
  keyInsights: string[];
  commonMistakes?: string[];
  variations: PatternVariation[];
  commonProblems: string[];
  timeComplexity: string;
  spaceComplexity: string;
  tutorial?: TutorialSection[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  name: string;
  url: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern: string;
  companies: string[];
  frequency: string;
  category: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  meta?: {
    requestId: string;
    version: string;
  };
}

export interface PatternsListResponse {
  patterns: Pattern[];
  pagination: Pagination;
}

export interface CategoriesResponse {
  categories: string[];
}

// Auth types
export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ProgressResponse {
  questionIds: string[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Google OAuth types
export interface GoogleAuthURLResponse {
  url: string;
  state: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state: string;
}

// Problem types
export interface Problem {
  id: string;
  patternId?: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints?: string;
  examples?: string;
  hints?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  orderIndex: number;
  explanation?: string;
}

export interface Language {
  id: number;
  name: string;
  slug: string;
  version?: string;
  isActive: boolean;
}

export interface ProblemTemplate {
  id: string;
  problemId: string;
  languageId: number;
  templateCode: string;
  wrapperCode: string;
  languageName: string;
  languageSlug: string;
}

export interface ProblemDetailResponse {
  problem: Problem;
  sampleTestCases: TestCase[];
  templates: ProblemTemplate[];
  languages: Language[];
  userSolved: boolean;
  userSubmissions: number;
}

export interface ProblemListResponse {
  problems: Problem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Submission types
export type SubmissionStatus =
  | "pending"
  | "running"
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compilation_error"
  | "internal_error";

export interface SubmissionResult {
  id: string;
  submissionId: string;
  testCaseId: string;
  status: SubmissionStatus;
  actualOutput?: string;
  runtimeMs?: number;
  memoryKb?: number;
  errorMessage?: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  languageId: number;
  code: string;
  status: SubmissionStatus;
  runtimeMs?: number;
  memoryKb?: number;
  testCasesPassed: number;
  testCasesTotal: number;
  createdAt: string;
  results?: SubmissionResult[];
}

export interface SubmitCodeRequest {
  problemId: string;
  languageId: number;
  code: string;
}

export interface RunCodeRequest {
  problemId: string;
  languageId: number;
  code: string;
  customInput?: string;
}

export interface RunCodeResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: SubmissionStatus;
  runtimeMs?: number;
  memoryKb?: number;
  errorMessage?: string;
  stdout?: string;
  stderr?: string;
  isCustom?: boolean;
}

export interface RunCodeResponse {
  results: RunCodeResult[];
  totalPassed: number;
  totalTests: number;
}

// Highlight types
export type HighlightColor = "yellow" | "green" | "blue" | "pink" | "purple";

export interface Highlight {
  id: string;
  userId: string;
  contentType: string;
  contentId: string;
  startOffset: number;
  endOffset: number;
  startLine?: number;
  endLine?: number;
  selectedText: string;
  contentHash?: string;
  color: HighlightColor;
  note?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateHighlightRequest {
  contentType: string;
  contentId: string;
  startOffset: number;
  endOffset: number;
  startLine?: number;
  endLine?: number;
  selectedText: string;
  contentHash?: string;
  color: HighlightColor;
  note?: string;
}

export interface UpdateHighlightRequest {
  color?: HighlightColor;
  note?: string;
  version: number;
}

export interface HighlightListResponse {
  highlights: Highlight[];
  nextCursor?: string;
  totalCount: number;
}

export interface ContentHighlightsResponse {
  highlights: Highlight[];
  contentHash?: string;
}

// Batch sync types for offline support
export type SyncOperationType = "create" | "update" | "delete";

export interface SyncOperation {
  op: SyncOperationType;
  clientId?: string;
  id?: string;
  data?: CreateHighlightRequest;
  update?: UpdateHighlightRequest;
}

export interface BatchSyncRequest {
  operations: SyncOperation[];
  lastSyncAt?: string;
}

export interface SyncOperationResult {
  op: SyncOperationType;
  clientId?: string;
  id?: string;
  success: boolean;
  error?: string;
  highlight?: Highlight;
}

export interface BatchSyncResponse {
  results: SyncOperationResult[];
  serverChanges?: Highlight[];
}

// Payment types
export interface PlanFeatures {
  max_patterns: number;
  max_visualizers: number;
  quiz_questions_per_pattern: number;
  has_quiz_history: boolean;
  has_code_playground: boolean;
  has_progress_sync: boolean;
  has_highlighting: boolean;
  has_solutions_access: boolean;
  has_offline_export: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  currency: string;
  billing_period: "monthly" | "yearly" | "lifetime";
  savings_percentage?: number;
  features: PlanFeatures;
  is_recommended?: boolean;
}

export interface PlansListResponse {
  plans: Plan[];
}

export interface Subscription {
  id?: string;
  plan_id: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  features: PlanFeatures;
}

export interface PlanSummary {
  id: string;
  name: string;
  billing_period: string;
}

export interface PricingBreakdown {
  subtotal: number;
  discount_code?: string;
  discount_amount: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  currency: string;
}

export interface CreateOrderRequest {
  plan_id: string;
  discount_code?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
  plan: PlanSummary;
  pricing: PricingBreakdown;
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  payment_id: string;
  subscription: Subscription;
}

export interface ValidateDiscountRequest {
  code: string;
  plan_id: string;
}

export interface ValidateDiscountResponse {
  code: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  message: string;
}

export interface CancelSubscriptionRequest {
  reason?: string;
  feedback?: string;
}

export interface CancelSubscriptionResponse {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end?: string;
}
