import type {
  ApiResponse,
  AuthResponse,
  RefreshResponse,
  ProgressResponse,
  RegisterRequest,
  LoginRequest,
  User,
  ProblemListResponse,
  ProblemDetailResponse,
  Language,
  Submission,
  SubmitCodeRequest,
  RunCodeRequest,
  RunCodeResponse,
  Highlight,
  CreateHighlightRequest,
  UpdateHighlightRequest,
  HighlightListResponse,
  ContentHighlightsResponse,
  BatchSyncRequest,
  BatchSyncResponse,
  PlansListResponse,
  Subscription,
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  ValidateDiscountRequest,
  ValidateDiscountResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  GoogleAuthURLResponse,
  GoogleCallbackRequest,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle 204 No Content (empty response body)
    if (response.status === 204) {
      return { success: true } as ApiResponse<T>;
    }

    // Handle 409 Conflict (version conflict)
    if (response.status === 409) {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          code: "VERSION_CONFLICT",
          message: errorData.error?.message || "Resource was modified by another client",
          details: errorData.data ? { serverVersion: JSON.stringify(errorData.data) } : undefined,
        },
        data: errorData.data as T,
      };
    }

    const data: ApiResponse<T> = await response.json();

    if (!response.ok && response.status === 401 && this.accessToken) {
      const newToken = await this.refreshToken();
      if (newToken) {
        (headers as Record<string, string>)["Authorization"] =
          `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });
        if (retryResponse.status === 204) {
          return { success: true } as ApiResponse<T>;
        }
        return retryResponse.json();
      }
    }

    return data;
  }

  async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          this.accessToken = null;
          return null;
        }

        const data: ApiResponse<RefreshResponse> = await response.json();
        if (data.success && data.data.accessToken) {
          this.accessToken = data.data.accessToken;
          return data.data.accessToken;
        }
        return null;
      } catch {
        this.accessToken = null;
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Auth endpoints
  async register(req: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(req),
    });
    if (response.success && response.data.accessToken) {
      this.accessToken = response.data.accessToken;
    }
    return response;
  }

  async login(req: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(req),
    });
    if (response.success && response.data.accessToken) {
      this.accessToken = response.data.accessToken;
    }
    return response;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await this.request<{ message: string }>(
      "/api/v1/auth/logout",
      {
        method: "POST",
      }
    );
    this.accessToken = null;
    return response;
  }

  // Google OAuth
  getGoogleAuthURL(): Promise<ApiResponse<GoogleAuthURLResponse>> {
    return this.request<GoogleAuthURLResponse>("/api/v1/auth/google/url");
  }

  async googleCallback(req: GoogleCallbackRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/api/v1/auth/google/callback", {
      method: "POST",
      body: JSON.stringify(req),
    });
    if (response.success && response.data.accessToken) {
      this.accessToken = response.data.accessToken;
    }
    return response;
  }

  getMe(): Promise<ApiResponse<User>> {
    return this.request<User>("/api/v1/user/me");
  }

  // Progress endpoints
  getProgress(): Promise<ApiResponse<ProgressResponse>> {
    return this.request<ProgressResponse>("/api/v1/progress");
  }

  toggleProgress(
    questionId: string,
    completed: boolean
  ): Promise<ApiResponse<ProgressResponse>> {
    return this.request<ProgressResponse>("/api/v1/progress/toggle", {
      method: "POST",
      body: JSON.stringify({ questionId, completed }),
    });
  }

  syncProgress(
    questionIds: string[]
  ): Promise<ApiResponse<ProgressResponse>> {
    return this.request<ProgressResponse>("/api/v1/progress/sync", {
      method: "POST",
      body: JSON.stringify({ questionIds }),
    });
  }

  // Problem endpoints
  getProblems(params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    patternId?: string;
    search?: string;
  }): Promise<ApiResponse<ProblemListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.difficulty) searchParams.set("difficulty", params.difficulty);
    if (params?.patternId) searchParams.set("patternId", params.patternId);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return this.request<ProblemListResponse>(
      `/api/v1/problems${query ? `?${query}` : ""}`
    );
  }

  getProblemBySlug(
    slug: string
  ): Promise<ApiResponse<ProblemDetailResponse>> {
    return this.request<ProblemDetailResponse>(`/api/v1/problems/${slug}`);
  }

  getLanguages(): Promise<ApiResponse<Language[]>> {
    return this.request<Language[]>("/api/v1/languages");
  }

  // Submission endpoints
  submitCode(req: SubmitCodeRequest): Promise<ApiResponse<Submission>> {
    return this.request<Submission>("/api/v1/submissions", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  runCode(req: RunCodeRequest): Promise<ApiResponse<RunCodeResponse>> {
    return this.request<RunCodeResponse>("/api/v1/submissions/run", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  getSubmission(id: string): Promise<ApiResponse<Submission>> {
    return this.request<Submission>(`/api/v1/submissions/${id}`);
  }

  getSubmissions(problemId?: string): Promise<ApiResponse<Submission[]>> {
    const query = problemId ? `?problemId=${problemId}` : "";
    return this.request<Submission[]>(`/api/v1/submissions${query}`);
  }

  // Highlight endpoints
  createHighlight(
    req: CreateHighlightRequest
  ): Promise<ApiResponse<Highlight>> {
    return this.request<Highlight>("/api/v1/highlights", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  getHighlight(id: string): Promise<ApiResponse<Highlight>> {
    return this.request<Highlight>(`/api/v1/highlights/${id}`);
  }

  getHighlightsForContent(
    contentType: string,
    contentId: string
  ): Promise<ApiResponse<ContentHighlightsResponse>> {
    return this.request<ContentHighlightsResponse>(
      `/api/v1/highlights/content/${encodeURIComponent(contentType)}/${encodeURIComponent(contentId)}`
    );
  }

  getHighlights(params?: {
    limit?: number;
    cursor?: string;
    contentType?: string;
  }): Promise<ApiResponse<HighlightListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.contentType)
      searchParams.set("content_type", params.contentType);
    const query = searchParams.toString();
    return this.request<HighlightListResponse>(
      `/api/v1/highlights${query ? `?${query}` : ""}`
    );
  }

  updateHighlight(
    id: string,
    req: UpdateHighlightRequest
  ): Promise<ApiResponse<Highlight>> {
    return this.request<Highlight>(`/api/v1/highlights/${id}`, {
      method: "PATCH",
      body: JSON.stringify(req),
    });
  }

  deleteHighlight(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/highlights/${id}`, {
      method: "DELETE",
    });
  }

  batchSyncHighlights(
    req: BatchSyncRequest
  ): Promise<ApiResponse<BatchSyncResponse>> {
    return this.request<BatchSyncResponse>("/api/v1/highlights/sync", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  // Payment endpoints
  async getPlans(currency?: string): Promise<ApiResponse<PlansListResponse>> {
    const query = currency ? `?currency=${currency}` : "";
    return this.request<PlansListResponse>(`/api/v1/payments/plans${query}`);
  }

  async getSubscription(): Promise<ApiResponse<Subscription>> {
    return this.request<Subscription>("/api/v1/payments/subscription");
  }

  async createOrder(
    req: CreateOrderRequest,
    idempotencyKey?: string
  ): Promise<ApiResponse<CreateOrderResponse>> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return this.request<CreateOrderResponse>("/api/v1/payments/orders", {
      method: "POST",
      body: JSON.stringify(req),
      headers,
    });
  }

  async verifyPayment(
    req: VerifyPaymentRequest
  ): Promise<ApiResponse<VerifyPaymentResponse>> {
    return this.request<VerifyPaymentResponse>("/api/v1/payments/verify", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  async validateDiscount(
    req: ValidateDiscountRequest
  ): Promise<ApiResponse<ValidateDiscountResponse>> {
    return this.request<ValidateDiscountResponse>(
      "/api/v1/payments/validate-discount",
      {
        method: "POST",
        body: JSON.stringify(req),
      }
    );
  }

  async cancelSubscription(
    req: CancelSubscriptionRequest
  ): Promise<ApiResponse<CancelSubscriptionResponse>> {
    return this.request<CancelSubscriptionResponse>("/api/v1/payments/cancel", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  // Pattern Progress
  async syncPatternProgress(
    progress: { [key: string]: number[] }
  ): Promise<ApiResponse<{ progress: { [key: string]: number[] } }>> {
    return this.request<{ progress: { [key: string]: number[] } }>(
      "/api/v1/pattern-progress/sync",
      {
        method: "POST",
        body: JSON.stringify({ progress }),
      }
    );
  }

  async markSectionComplete(
    patternId: string,
    sectionIndex: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/api/v1/pattern-progress/${patternId}/${sectionIndex}`,
      { method: "POST" }
    );
  }

  async markSectionIncomplete(
    patternId: string,
    sectionIndex: number
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/api/v1/pattern-progress/${patternId}/${sectionIndex}`,
      { method: "DELETE" }
    );
  }
}

export const apiClient = new ApiClient();
