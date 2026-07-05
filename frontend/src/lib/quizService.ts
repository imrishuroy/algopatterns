import type {
  GetQuestionsResponse,
  StartAttemptRequest,
  StartAttemptResponse,
  SubmitResponseRequest,
  SubmitResponseResponse,
  CompleteAttemptRequest,
  CompleteAttemptResponse,
  AttemptHistoryResponse,
  QuizAttempt,
} from "@/types/quiz";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || "Request failed");
  }

  return json.data as T;
}

export const quizService = {
  getQuestions(
    patternId: string,
    sectionSlug?: string
  ): Promise<GetQuestionsResponse> {
    const params = new URLSearchParams();
    if (sectionSlug) {
      params.set("section", sectionSlug);
    }
    const query = params.toString();
    const endpoint = `/api/v1/quiz/questions/${patternId}${query ? `?${query}` : ""}`;
    return fetchApi<GetQuestionsResponse>(endpoint);
  },

  startAttempt(req: StartAttemptRequest): Promise<StartAttemptResponse> {
    return fetchApi<StartAttemptResponse>("/api/v1/quiz/attempts", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  submitResponse(
    attemptId: string,
    req: SubmitResponseRequest
  ): Promise<SubmitResponseResponse> {
    return fetchApi<SubmitResponseResponse>(
      `/api/v1/quiz/attempts/${attemptId}/responses`,
      {
        method: "POST",
        body: JSON.stringify(req),
      }
    );
  },

  completeAttempt(
    attemptId: string,
    req: CompleteAttemptRequest = {}
  ): Promise<CompleteAttemptResponse> {
    return fetchApi<CompleteAttemptResponse>(
      `/api/v1/quiz/attempts/${attemptId}/complete`,
      {
        method: "PATCH",
        body: JSON.stringify(req),
      }
    );
  },

  getAttempt(attemptId: string): Promise<QuizAttempt> {
    return fetchApi<QuizAttempt>(`/api/v1/quiz/attempts/${attemptId}`);
  },

  getAttemptHistory(
    patternId?: string,
    sectionSlug?: string,
    limit = 10,
    cursor?: string
  ): Promise<AttemptHistoryResponse> {
    const params = new URLSearchParams();
    if (patternId) params.set("pattern_id", patternId);
    if (sectionSlug) params.set("section_slug", sectionSlug);
    if (limit) params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);

    const query = params.toString();
    return fetchApi<AttemptHistoryResponse>(
      `/api/v1/quiz/attempts${query ? `?${query}` : ""}`
    );
  },
};
