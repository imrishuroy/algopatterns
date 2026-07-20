import type {
  ChatRequest,
  ChatResponse,
  HintRequest,
  HintResponse,
  ReviewRequest,
  ReviewResponse,
  ExplainRequest,
  ExplainResponse,
  Intent,
} from "@/types/ai";
import type { ApiResponse } from "@/types";
import { apiClient } from "./api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class AIApiClient {
  private getHeaders(): HeadersInit {
    const token = apiClient.getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async refreshAndGetHeaders(): Promise<HeadersInit> {
    let token = apiClient.getAccessToken();

    // If no token, try to refresh
    if (!token) {
      token = await apiClient.refreshToken();
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // Helper to make requests with automatic 401 retry
  private async requestWithRetry<T>(
    url: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle 401 by refreshing token and retrying
    if (response.status === 401) {
      const newToken = await apiClient.refreshToken();
      if (newToken) {
        const retryHeaders = this.getHeaders();
        const retryResponse = await fetch(url, {
          ...options,
          headers: retryHeaders,
          credentials: "include",
        });
        return retryResponse.json();
      }
    }

    return response.json();
  }

  async chat(req: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.requestWithRetry(`${API_BASE_URL}/api/v1/ai/chat`, {
      method: "POST",
      body: JSON.stringify({
        session_id: req.sessionId,
        message: req.message,
        problem_slug: req.problemSlug,
        problem_title: req.problemTitle,
        problem_description: req.problemDescription,
        pattern_id: req.patternId,
        pattern_name: req.patternName,
        pattern_difficulty: req.patternDifficulty,
        time_complexity: req.timeComplexity,
        space_complexity: req.spaceComplexity,
        section_content: req.sectionContent,
        active_section: req.activeSection,
        context_type: req.contextType,
        code: req.code,
        language: req.language,
        history: req.history,
        error_message: req.errorMessage,
      }),
    });
  }

  chatStream(
    req: ChatRequest,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void,
    onDone: (sessionId?: string) => void,
    onIntent?: (intent: Intent) => void
  ): () => void {
    const controller = new AbortController();

    const buildBody = () =>
      JSON.stringify({
        session_id: req.sessionId,
        message: req.message,
        problem_slug: req.problemSlug,
        problem_title: req.problemTitle,
        problem_description: req.problemDescription,
        pattern_id: req.patternId,
        pattern_name: req.patternName,
        pattern_difficulty: req.patternDifficulty,
        time_complexity: req.timeComplexity,
        space_complexity: req.spaceComplexity,
        section_content: req.sectionContent,
        active_section: req.activeSection,
        context_type: req.contextType,
        code: req.code,
        language: req.language,
        history: req.history,
        error_message: req.errorMessage,
      });

    (async () => {
      try {
        // Ensure we have a valid token before streaming
        const headers = await this.refreshAndGetHeaders();

        const response = await fetch(`${API_BASE_URL}/api/v1/ai/chat/stream`, {
          method: "POST",
          headers,
          credentials: "include",
          body: buildBody(),
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Try to refresh token and retry once
            const newToken = await apiClient.refreshToken();
            if (newToken) {
              const retryHeaders = this.getHeaders();
              const retryResponse = await fetch(
                `${API_BASE_URL}/api/v1/ai/chat/stream`,
                {
                  method: "POST",
                  headers: retryHeaders,
                  credentials: "include",
                  body: buildBody(),
                  signal: controller.signal,
                }
              );

              if (retryResponse.ok) {
                await this.processStream(
                  retryResponse,
                  onChunk,
                  onError,
                  onDone,
                  onIntent
                );
                return;
              }
            }
            onError("Session expired. Please refresh the page.");
            return;
          }

          const errorData = await response.json();
          onError(errorData.error?.message || "Failed to connect to AI");
          return;
        }

        await this.processStream(response, onChunk, onError, onDone, onIntent);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          onError((err as Error).message || "Stream connection failed");
        }
      }
    })();

    return () => controller.abort();
  }

  private async processStream(
    response: Response,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void,
    onDone: (sessionId?: string) => void,
    onIntent?: (intent: Intent) => void
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      onError("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        // Handle event: intent (for Omni-Tutor intent classification)
        if (line.startsWith("event: intent")) {
          continue; // Next line will have the data
        }
        // Handle both "data: {...}" and "data:{...}" formats
        if (line.startsWith("data:")) {
          const data = line.startsWith("data: ")
            ? line.slice(6)
            : line.slice(5);
          if (data === "[DONE]") {
            onDone();
            return;
          }
          if (data.includes('"done":true')) {
            let sessionId: string | undefined;
            try {
              const parsed = JSON.parse(data);
              sessionId = parsed.session_id;
            } catch {
              // ignore parse errors
            }
            onDone(sessionId);
            return;
          }
          try {
            const parsed = JSON.parse(data);
            // Handle intent event data
            if (parsed.intent && onIntent) {
              onIntent(parsed.intent as Intent);
            }
            if (parsed.content) {
              onChunk(parsed.content);
            }
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
          } catch {
            // ignore parse errors for incomplete chunks
          }
        }
      }
    }
    onDone();
  }

  async getHint(req: HintRequest): Promise<ApiResponse<HintResponse>> {
    return this.requestWithRetry(`${API_BASE_URL}/api/v1/ai/hint`, {
      method: "POST",
      body: JSON.stringify({
        problem_slug: req.problemSlug,
        problem_title: req.problemTitle,
        problem_description: req.problemDescription,
        code: req.code,
        language: req.language,
        hint_level: req.hintLevel,
      }),
    });
  }

  async reviewCode(req: ReviewRequest): Promise<ApiResponse<ReviewResponse>> {
    return this.requestWithRetry(`${API_BASE_URL}/api/v1/ai/review`, {
      method: "POST",
      body: JSON.stringify({
        problem_slug: req.problemSlug,
        problem_title: req.problemTitle,
        problem_description: req.problemDescription,
        code: req.code,
        language: req.language,
        focus_areas: req.focusAreas,
      }),
    });
  }

  async explainError(
    req: ExplainRequest
  ): Promise<ApiResponse<ExplainResponse>> {
    return this.requestWithRetry(`${API_BASE_URL}/api/v1/ai/explain`, {
      method: "POST",
      body: JSON.stringify({
        code: req.code,
        language: req.language,
        error_type: req.errorType,
        error_message: req.errorMessage,
        line_number: req.lineNumber,
      }),
    });
  }

  async getSessions(): Promise<ApiResponse<{ sessions: AISessionData[] }>> {
    return this.requestWithRetry(`${API_BASE_URL}/api/v1/ai/sessions`, {
      method: "GET",
    });
  }

  async getSessionMessages(
    sessionId: string
  ): Promise<ApiResponse<{ messages: AIMessageData[] }>> {
    return this.requestWithRetry(
      `${API_BASE_URL}/api/v1/ai/sessions/${sessionId}/messages`,
      { method: "GET" }
    );
  }

  async clearSession(
    sessionId: string
  ): Promise<ApiResponse<{ cleared: boolean }>> {
    return this.requestWithRetry(
      `${API_BASE_URL}/api/v1/ai/sessions/${sessionId}/messages`,
      { method: "DELETE" }
    );
  }

  async deleteSession(
    sessionId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.requestWithRetry(
      `${API_BASE_URL}/api/v1/ai/sessions/${sessionId}`,
      { method: "DELETE" }
    );
  }

  async archiveSession(
    sessionId: string,
    title?: string
  ): Promise<ApiResponse<{ archived: boolean }>> {
    return this.requestWithRetry(
      `${API_BASE_URL}/api/v1/ai/sessions/${sessionId}/archive`,
      {
        method: "POST",
        body: JSON.stringify({ title }),
      }
    );
  }

  async updateSessionTitle(
    sessionId: string,
    title: string
  ): Promise<ApiResponse<{ updated: boolean }>> {
    return this.requestWithRetry(
      `${API_BASE_URL}/api/v1/ai/sessions/${sessionId}/title`,
      {
        method: "PATCH",
        body: JSON.stringify({ title }),
      }
    );
  }

  async getArchivedSessions(
    problemSlug?: string,
    patternId?: string,
    contextType?: string,
    includeActive?: boolean
  ): Promise<ApiResponse<{ sessions: AISessionData[] }>> {
    const params = new URLSearchParams();
    if (problemSlug) params.set("problem_slug", problemSlug);
    if (patternId) params.set("pattern_id", patternId);
    if (contextType) params.set("context_type", contextType);
    if (includeActive) params.set("include_active", "true");
    return this.requestWithRetry(
      `${API_BASE_URL}/api/v1/ai/sessions/archived?${params.toString()}`,
      { method: "GET" }
    );
  }

  async generateTitle(
    messages: Array<{ role: string; content: string }>
  ): Promise<ApiResponse<{ title: string }>> {
    return this.requestWithRetry(
      `${API_BASE_URL}/api/v1/ai/sessions/generate-title`,
      {
        method: "POST",
        body: JSON.stringify({ messages }),
      }
    );
  }
}

// Types for session/message data from API
export interface AISessionData {
  id: string;
  user_id: string;
  problem_id?: string;
  problem_slug?: string;
  pattern_id?: string;
  context_type: string;
  title?: string;
  is_archived: boolean;
  started_at: string;
  last_message_at: string;
  message_count: number;
  total_tokens: number;
}

export interface AIMessageData {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  message_type?: string;
  tokens_used?: number;
  model_used?: string;
  created_at: string;
}

export const aiApiClient = new AIApiClient();
