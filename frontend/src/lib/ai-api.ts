import type {
  ChatRequest,
  ChatResponse,
  HintRequest,
  HintResponse,
  ReviewRequest,
  ReviewResponse,
  ExplainRequest,
  ExplainResponse,
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

  async chat(req: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/chat`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
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
    return response.json();
  }

  chatStream(
    req: ChatRequest,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void,
    onDone: (sessionId?: string) => void
  ): () => void {
    const controller = new AbortController();

    const buildBody = () =>
      JSON.stringify({
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
                  onDone
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

        await this.processStream(response, onChunk, onError, onDone);
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
    onDone: (sessionId?: string) => void
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
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/hint`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        problem_slug: req.problemSlug,
        problem_title: req.problemTitle,
        problem_description: req.problemDescription,
        code: req.code,
        language: req.language,
        hint_level: req.hintLevel,
      }),
    });
    return response.json();
  }

  async reviewCode(req: ReviewRequest): Promise<ApiResponse<ReviewResponse>> {
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/review`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        problem_slug: req.problemSlug,
        problem_title: req.problemTitle,
        problem_description: req.problemDescription,
        code: req.code,
        language: req.language,
        focus_areas: req.focusAreas,
      }),
    });
    return response.json();
  }

  async explainError(
    req: ExplainRequest
  ): Promise<ApiResponse<ExplainResponse>> {
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/explain`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({
        code: req.code,
        language: req.language,
        error_type: req.errorType,
        error_message: req.errorMessage,
        line_number: req.lineNumber,
      }),
    });
    return response.json();
  }

  async getSessions(): Promise<ApiResponse<{ sessions: AISessionData[] }>> {
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/sessions`, {
      method: "GET",
      headers,
      credentials: "include",
    });
    return response.json();
  }

  async getSessionMessages(
    sessionId: string
  ): Promise<ApiResponse<{ messages: AIMessageData[] }>> {
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai/sessions/${sessionId}/messages`,
      {
        method: "GET",
        headers,
        credentials: "include",
      }
    );
    return response.json();
  }

  async clearSession(
    sessionId: string
  ): Promise<ApiResponse<{ cleared: boolean }>> {
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai/sessions/${sessionId}`,
      {
        method: "DELETE",
        headers,
        credentials: "include",
      }
    );
    return response.json();
  }

  async archiveSession(
    sessionId: string,
    title?: string
  ): Promise<ApiResponse<{ archived: boolean }>> {
    const headers = await this.refreshAndGetHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai/sessions/${sessionId}/archive`,
      {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ title }),
      }
    );
    return response.json();
  }

  async getArchivedSessions(
    problemSlug?: string,
    patternId?: string
  ): Promise<ApiResponse<{ sessions: AISessionData[] }>> {
    const headers = await this.refreshAndGetHeaders();
    const params = new URLSearchParams();
    if (problemSlug) params.set("problem_slug", problemSlug);
    if (patternId) params.set("pattern_id", patternId);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai/sessions/archived?${params.toString()}`,
      {
        method: "GET",
        headers,
        credentials: "include",
      }
    );
    return response.json();
  }
}

// Types for session/message data from API
export interface AISessionData {
  id: string;
  user_id: string;
  problem_id?: string;
  problem_slug?: string;
  pattern_id?: string;
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
