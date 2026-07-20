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
import { apiClient } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

const buildHeaders = (extra?: HeadersInit): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (extra) {
    const asRecord =
      extra instanceof Headers
        ? Object.fromEntries(extra.entries())
        : Array.isArray(extra)
          ? Object.fromEntries(extra)
          : { ...(extra as Record<string, string>) };
    Object.assign(headers, asRecord);
  }

  const token = apiClient.getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// skipcq: JS-R1005
const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers = buildHeaders(options.headers);

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Retry once after refresh if the access token was rejected.
  if (!response.ok && response.status === 401 && headers["Authorization"]) {
    const newToken = await apiClient.refreshToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || "Request failed");
  }

  return json.data as T;
};

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
