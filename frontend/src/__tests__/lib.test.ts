vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:8080";
  process.env.NEXT_PUBLIC_SITE_URL = "https://algopatterns.in";
});

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { apiClient } from "@/lib/api";
import { aiApiClient } from "@/lib/ai-api";
import { siteConfig, defaultMetadata, patternSEO, getPatternMetadata } from "@/lib/seo";
import { solutions } from "@/lib/solutions";
import {
  questions,
  categoryToPatternId,
  getCategories,
  getCompanies,
  getQuestionsByCategory,
} from "@/lib/questions";
import { quizService } from "@/lib/quizService";
import { quotes } from "@/lib/quotes";

// ---------------------------------------------------------------------------
// Shared mockFetch used by api, ai-api, and quizService sections
// ---------------------------------------------------------------------------

let mockFetch: ReturnType<typeof vi.fn>;

beforeAll(() => {
  mockFetch = vi.fn();
  vi.stubGlobal("fetch", mockFetch);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  mockFetch.mockReset();
});

// ===========================================================================
// 1. api.ts — API Client
// ===========================================================================

describe("apiClient", () => {
  beforeEach(() => {
    apiClient.setAccessToken(null);
  });

  // -- token management --

  describe("setAccessToken / getAccessToken", () => {
    it("defaults to null", () => {
      expect(apiClient.getAccessToken()).toBeNull();
    });

    it("sets and gets a token", () => {
      apiClient.setAccessToken("abc");
      expect(apiClient.getAccessToken()).toBe("abc");
    });

    it("clears token when set to null", () => {
      apiClient.setAccessToken("abc");
      apiClient.setAccessToken(null);
      expect(apiClient.getAccessToken()).toBeNull();
    });
  });

  // -- request internals (tested through public methods) --

  describe("request (via getMe)", () => {
    it("sends GET with Content-Type and credentials", async () => {
      const body = { success: true, data: { id: "u1", email: "a@b.com", emailVerified: true } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(body) });

      const res = await apiClient.getMe();

      expect(res).toEqual(body);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/user/me"),
        expect.objectContaining({
          credentials: "include",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
        }),
      );
    });

    it("omits Authorization when no token is set", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.getMe();

      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers).not.toHaveProperty("Authorization");
    });

    it("includes Authorization Bearer when token is set", async () => {
      apiClient.setAccessToken("my-token");
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.getMe();

      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer my-token");
    });
  });

  describe("204 No Content handling", () => {
    it("returns success for 204 responses", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: () => { throw new Error("should not call json"); } });

      const res = await apiClient.deleteHighlight("h-1");

      expect(res).toEqual({ success: true });
    });
  });

  describe("409 Conflict handling", () => {
    it("returns error with VERSION_CONFLICT code", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          error: { message: "conflict" },
          data: { version: 42 },
        }),
      });

      const res = await apiClient.getMe();

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("VERSION_CONFLICT");
      expect(res.error?.message).toBe("conflict");
      expect(res.error?.details?.serverVersion).toBe('{"version":42}');
      expect(res.data).toEqual({ version: 42 });
    });

    it("falls back to default message when error.message is missing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({}),
      });

      const res = await apiClient.getMe();

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("VERSION_CONFLICT");
      expect(res.error?.message).toBe("Resource was modified by another client");
    });
  });

  describe("401 auto-refresh", () => {
    it("refreshes token and retries the original request", async () => {
      apiClient.setAccessToken("expired");
      const retryData = { success: true, data: { id: "u1", email: "a@b.com", emailVerified: true } };

      // 1. original → 401
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ success: false }) });
      // 2. refresh → ok
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: { accessToken: "refreshed", expiresIn: 3600 } }),
      });
      // 3. retry → success
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(retryData) });

      const res = await apiClient.getMe();

      expect(apiClient.getAccessToken()).toBe("refreshed");
      expect(res).toEqual(retryData);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("does not retry when refresh fails and clears token", async () => {
      apiClient.setAccessToken("expired");

      mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ success: false }) });
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({ success: false }) });

      const res = await apiClient.getMe();

      expect(apiClient.getAccessToken()).toBeNull();
      expect(res.success).toBe(false);
    });
  });

  // -- refreshToken --

  describe("refreshToken", () => {
    it("sends POST to refresh endpoint and stores new token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: { accessToken: "new-token", expiresIn: 3600 } }),
      });

      const result = await apiClient.refreshToken();

      expect(result).toBe("new-token");
      expect(apiClient.getAccessToken()).toBe("new-token");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/refresh"),
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );
    });

    it("returns null when refresh endpoint fails", async () => {
      apiClient.setAccessToken("old");
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) });

      const result = await apiClient.refreshToken();

      expect(result).toBeNull();
      expect(apiClient.getAccessToken()).toBeNull();
    });

    it("returns null on network error and clears token", async () => {
      apiClient.setAccessToken("old");
      mockFetch.mockRejectedValueOnce(new Error("network"));

      const result = await apiClient.refreshToken();

      expect(result).toBeNull();
      expect(apiClient.getAccessToken()).toBeNull();
    });

    it("deduplicates concurrent calls", async () => {
      let callCount = 0;
      mockFetch.mockImplementation(async () => {
        callCount++;
        await new Promise<void>((r) => setTimeout(r, 30));
        return {
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: { accessToken: "deduped", expiresIn: 3600 } }),
        };
      });

      const [t1, t2, t3] = await Promise.all([
        apiClient.refreshToken(),
        apiClient.refreshToken(),
        apiClient.refreshToken(),
      ]);

      expect(callCount).toBe(1);
      expect(t1).toBe("deduped");
      expect(t2).toBe("deduped");
      expect(t3).toBe("deduped");
    });
  });

  // -- auth endpoints --

  describe("auth endpoints", () => {
    it("register sends POST and stores token", async () => {
      const authResp = { success: true, data: { user: { id: "u1", email: "a@b.com", emailVerified: false }, accessToken: "tok", expiresIn: 3600 } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(authResp) });

      const res = await apiClient.register({ email: "a@b.com", password: "p" });

      expect(res).toEqual(authResp);
      expect(apiClient.getAccessToken()).toBe("tok");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/auth/register");
      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ email: "a@b.com", password: "p" });
    });

    it("login sends POST and stores token", async () => {
      const authResp = { success: true, data: { user: { id: "u1", email: "a@b.com", emailVerified: false }, accessToken: "tok", expiresIn: 3600 } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(authResp) });

      const res = await apiClient.login({ email: "a@b.com", password: "p" });

      expect(res).toEqual(authResp);
      expect(apiClient.getAccessToken()).toBe("tok");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/auth/login");
    });

    it("login does not store token when response is unsuccessful", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: false, data: {} }) });

      await apiClient.login({ email: "a@b.com", password: "p" });

      expect(apiClient.getAccessToken()).toBeNull();
    });

    it("logout sends POST and clears token", async () => {
      apiClient.setAccessToken("tok");
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { message: "bye" } }) });

      const res = await apiClient.logout();

      expect(res.success).toBe(true);
      expect(apiClient.getAccessToken()).toBeNull();
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/auth/logout");
    });

    it("getGoogleAuthURL calls the google url endpoint", async () => {
      const resp = { success: true, data: { url: "https://accounts.google.com/o/oauth2/auth", state: "xyz" } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(resp) });

      const result = await apiClient.getGoogleAuthURL();

      expect(result).toEqual(resp);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/auth/google/url");
    });

    it("googleCallback sends POST and stores token", async () => {
      const authResp = { success: true, data: { user: { id: "u1", email: "a@b.com", emailVerified: false }, accessToken: "gtok", expiresIn: 3600 } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(authResp) });

      const res = await apiClient.googleCallback({ code: "c", state: "s" });

      expect(res).toEqual(authResp);
      expect(apiClient.getAccessToken()).toBe("gtok");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/auth/google/callback");
    });
  });

  // -- problem endpoints --

  describe("problem endpoints", () => {
    it("getProblems builds query params", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { problems: [], total: 0, page: 1, limit: 10, totalPages: 0 } }) });

      await apiClient.getProblems({ page: 2, limit: 5, difficulty: "Easy", patternId: "sliding-window", search: "max" });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("page=2");
      expect(url).toContain("limit=5");
      expect(url).toContain("difficulty=Easy");
      expect(url).toContain("patternId=sliding-window");
      expect(url).toContain("search=max");
    });

    it("getProblems sends request without query when no params", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { problems: [], total: 0, page: 1, limit: 10, totalPages: 0 } }) });

      await apiClient.getProblems();

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).not.toContain("?");
    });

    it("getProblemBySlug calls correct endpoint", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.getProblemBySlug("two-sum");

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/problems/two-sum");
    });

    it("getLanguages calls languages endpoint", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) });

      await apiClient.getLanguages();

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/languages");
    });
  });

  // -- submission endpoints --

  describe("submission endpoints", () => {
    it("submitCode sends POST with body", async () => {
      const resp = { success: true, data: { id: "s1", status: "pending" } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(resp) });

      const res = await apiClient.submitCode({ problemId: "p1", languageId: 1, code: "print(1)" });

      expect(res).toEqual(resp);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/submissions");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    });

    it("runCode sends POST with custom input", async () => {
      const resp = { success: true, data: { results: [], totalPassed: 0, totalTests: 0 } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(resp) });

      const res = await apiClient.runCode({ problemId: "p1", languageId: 1, code: "print(1)", customInput: "5" });

      expect(res).toEqual(resp);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/submissions/run");
      expect(JSON.parse(mockFetch.mock.calls[0][1].body).customInput).toBe("5");
    });

    it("getSubmission fetches by id", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.getSubmission("s-42");

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/submissions/s-42");
    });

    it("getSubmissions appends query when problemId provided", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) });

      await apiClient.getSubmissions("p-1");

      expect(mockFetch.mock.calls[0][0]).toContain("?problemId=p-1");
    });

    it("getSubmissions omits query when no problemId", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: [] }) });

      await apiClient.getSubmissions();

      expect(mockFetch.mock.calls[0][0]).not.toContain("?");
    });
  });

  // -- highlight endpoints --

  describe("highlight endpoints", () => {
    it("createHighlight sends POST with body", async () => {
      const resp = { success: true, data: { id: "h1" } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(resp) });

      const req = { contentType: "article", contentId: "c1", startOffset: 0, endOffset: 5, selectedText: "hello", color: "yellow" as const };
      const res = await apiClient.createHighlight(req);

      expect(res).toEqual(resp);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/highlights");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    });

    it("getHighlight fetches by id", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.getHighlight("h-1");

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/highlights/h-1");
    });

    it("getHighlightsForContent builds path with encoded params", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { highlights: [] } }) });

      await apiClient.getHighlightsForContent("article", "p 1");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("/api/v1/highlights/content/article/p%201");
    });

    it("getHighlights builds query params", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { highlights: [], totalCount: 0 } }) });

      await apiClient.getHighlights({ limit: 10, cursor: "next", contentType: "article" });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("limit=10");
      expect(url).toContain("cursor=next");
      expect(url).toContain("content_type=article");
    });

    it("getHighlights omits query when no params", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { highlights: [], totalCount: 0 } }) });

      await apiClient.getHighlights();

      expect(mockFetch.mock.calls[0][0]).not.toContain("?");
    });

    it("updateHighlight sends PATCH with body", async () => {
      const resp = { success: true, data: { id: "h1" } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(resp) });

      const res = await apiClient.updateHighlight("h-1", { color: "blue", version: 2 });

      expect(res).toEqual(resp);
      expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/highlights/h-1");
    });

    it("deleteHighlight sends DELETE", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: undefined }) });

      await apiClient.deleteHighlight("h-1");

      expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/highlights/h-1");
    });

    it("batchSyncHighlights sends POST", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { results: [] } }) });

      const res = await apiClient.batchSyncHighlights({ operations: [] });

      expect(res.success).toBe(true);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/highlights/sync");
    });
  });

  // -- payment endpoints --

  describe("payment endpoints", () => {
    it("getPlans appends currency query when provided", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { plans: [] } }) });

      await apiClient.getPlans("INR");

      expect(mockFetch.mock.calls[0][0]).toContain("?currency=INR");
    });

    it("getPlans omits query when no currency", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { plans: [] } }) });

      await apiClient.getPlans();

      expect(mockFetch.mock.calls[0][0]).not.toContain("?");
    });

    it("getSubscription fetches subscription", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.getSubscription();

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/payments/subscription");
    });

    it("createOrder sends POST with optional idempotency key", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.createOrder({ plan_id: "p1" }, "idem-1");

      expect(mockFetch.mock.calls[0][1].headers).toHaveProperty("Idempotency-Key", "idem-1");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/payments/orders");
    });

    it("createOrder omits idempotency key when not provided", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.createOrder({ plan_id: "p1" });

      expect(mockFetch.mock.calls[0][1].headers).toEqual(expect.any(Object));
      // no Idempotency-Key header
      expect((mockFetch.mock.calls[0][1].headers as Record<string, string>)["Idempotency-Key"]).toBeUndefined();
    });

    it("verifyPayment sends POST", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.verifyPayment({ razorpay_payment_id: "p", razorpay_order_id: "o", razorpay_signature: "s" });

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/payments/verify");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    });

    it("validateDiscount sends POST", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.validateDiscount({ code: "SAVE10", plan_id: "p1" });

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/payments/validate-discount");
    });

    it("cancelSubscription sends POST", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await apiClient.cancelSubscription({ reason: "too expensive" });

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/payments/cancel");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    });
  });

  describe("progress endpoints", () => {
    it("getProgress calls progress endpoint", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { questionIds: [] } }) });

      const res = await apiClient.getProgress();

      expect(res.success).toBe(true);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/progress");
    });

    it("toggleProgress sends POST", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { questionIds: [] } }) });

      await apiClient.toggleProgress("q-1", true);

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/progress/toggle");
      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ questionId: "q-1", completed: true });
    });

    it("syncProgress sends POST with question IDs", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { questionIds: [] } }) });

      await apiClient.syncProgress(["q1", "q2"]);

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/progress/sync");
      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ questionIds: ["q1", "q2"] });
    });
  });
});

// ===========================================================================
// 2. ai-api.ts — AI API Client
// ===========================================================================

describe("aiApiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    apiClient.setAccessToken(null);
  });

  describe("chat", () => {
    it("sends POST to /api/v1/ai/chat", async () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      const resp = { success: true, data: { content: "answer", sessionId: "s1", tokensUsed: 10, model: "gpt-4" } };
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(resp) });

      const result = await aiApiClient.chat({ message: "hello" });

      expect(result).toEqual(resp);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain("/api/v1/ai/chat");
      expect(call[1].method).toBe("POST");
      expect(JSON.parse(call[1].body)).toMatchObject({ message: "hello" });
    });

    it("maps all ChatRequest fields", async () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      const req = {
        message: "hi",
        problemSlug: "two-sum",
        problemTitle: "Two Sum",
        problemDescription: "desc",
        patternId: "hash-map",
        code: "code",
        language: "java",
        history: [{ role: "user" as const, content: "prev" }],
        errorMessage: "err",
      };
      await aiApiClient.chat(req);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.message).toBe("hi");
      expect(body.problem_slug).toBe("two-sum");
      expect(body.problem_title).toBe("Two Sum");
      expect(body.problem_description).toBe("desc");
      expect(body.pattern_id).toBe("hash-map");
      expect(body.code).toBe("code");
      expect(body.language).toBe("java");
      expect(body.history).toEqual([{ role: "user", content: "prev" }]);
      expect(body.error_message).toBe("err");
    });
  });

  describe("chatStream", () => {
    function streamResponse(chunks: string[], status = 200, ok = true) {
      let idx = 0;
      return {
        ok,
        status,
        json: () => Promise.resolve({}),
        body: {
          getReader: () => ({
            read: async () => {
              if (idx < chunks.length) {
                return { done: false, value: new TextEncoder().encode(chunks[idx++]) };
              }
              return { done: true, value: undefined };
            },
            cancel: () => {},
            releaseLock: () => {},
          }),
        },
      } as unknown as Response;
    }

    function noBodyResponse(status = 200, ok = true) {
      return { ok, status, json: () => Promise.resolve({}), body: null } as unknown as Response;
    }

    it("processes chunks and calls onChunk / onDone", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce(
        streamResponse(['data: {"content":"Hel"}\n\n', 'data: {"content":"lo"}\n\n', "data: [DONE]\n\n"]),
      );

      return new Promise<void>((resolve, reject) => {
        const chunks: string[] = [];
        aiApiClient.chatStream(
          { message: "hi" },
          (chunk) => chunks.push(chunk),
          (err) => reject(new Error(err)),
          () => {
            expect(chunks).toEqual(["Hel", "lo"]);
            resolve();
          },
        );
      });
    });

    it("handles data:{...} format without space", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce(
        streamResponse(['data:{"content":"Hi"}\n\n', 'data:{"done":true}\n\n']),
      );

      return new Promise<void>((resolve, reject) => {
        const chunks: string[] = [];
        aiApiClient.chatStream(
          { message: "hi" },
          (chunk) => chunks.push(chunk),
          (err) => reject(new Error(err)),
          () => {
            expect(chunks).toEqual(["Hi"]);
            resolve();
          },
        );
      });
    });

    it("calls onError when response has error field", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce(
        streamResponse(['data: {"error":"Rate limit exceeded"}\n\n']),
      );

      return new Promise<void>((resolve, reject) => {
        aiApiClient.chatStream(
          { message: "hi" },
          () => {},
          (err) => {
            expect(err).toBe("Rate limit exceeded");
            resolve();
          },
          () => reject(new Error("unexpected done")),
        );
      });
    });

    it("calls onError when response has no body", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce(noBodyResponse());

      return new Promise<void>((resolve, reject) => {
        aiApiClient.chatStream(
          { message: "hi" },
          () => {},
          (err) => {
            expect(err).toBe("No response body");
            resolve();
          },
          () => reject(new Error("unexpected done")),
        );
      });
    });

    it("calls onError on server error (non-401)", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: { message: "Server error" } }),
      } as unknown as Response);

      return new Promise<void>((resolve, reject) => {
        aiApiClient.chatStream(
          { message: "hi" },
          () => {},
          (err) => {
            expect(err).toBe("Server error");
            resolve();
          },
          () => reject(new Error("unexpected done")),
        );
      });
    });

    it("calls onError with fallback message when no error.message", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      } as unknown as Response);

      return new Promise<void>((resolve, reject) => {
        aiApiClient.chatStream(
          { message: "hi" },
          () => {},
          (err) => {
            expect(err).toBe("Failed to connect to AI");
            resolve();
          },
          () => reject(new Error("unexpected done")),
        );
      });
    });

    it("retries on 401 and succeeds", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("expired");
      vi.spyOn(apiClient, "refreshToken").mockResolvedValue("new-token");

      // 1st call → 401
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 } as unknown as Response);
      // 2nd call (retry) → success
      mockFetch.mockResolvedValueOnce(streamResponse(['data: {"content":"retried"}\n', "data: [DONE]\n"]));

      return new Promise<void>((resolve, reject) => {
        const chunks: string[] = [];
        aiApiClient.chatStream(
          { message: "hi" },
          (chunk) => chunks.push(chunk),
          (err) => reject(new Error(err)),
          () => {
            expect(chunks).toEqual(["retried"]);
            resolve();
          },
        );
      });
    });

    it("calls onError when 401 retry also fails", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("expired");
      vi.spyOn(apiClient, "refreshToken").mockResolvedValue(null);

      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 } as unknown as Response);

      return new Promise<void>((resolve, reject) => {
        aiApiClient.chatStream(
          { message: "hi" },
          () => {},
          (err) => {
            expect(err).toBe("Session expired. Please refresh the page.");
            resolve();
          },
          () => reject(new Error("unexpected done")),
        );
      });
    });

    it("abort stops the stream", () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");

      let _abortController: AbortController | undefined;
      mockFetch.mockImplementation(async (_url: string, opts: RequestInit) => {
        _abortController = (opts.signal as AbortSignal).constructor
          ? new AbortController()
          : undefined;
        // Wait until aborted or timeout
        await new Promise<void>((resolve, reject) => {
          if (!opts.signal) return reject(new Error("no signal"));
          opts.signal.onabort = () => resolve();
          setTimeout(() => reject(new Error("timeout")), 100);
        });
        return streamResponse(["data: [DONE]\n"]);
      });

      const abort = aiApiClient.chatStream(
        { message: "hi" },
        () => {},
        () => {},
        () => {},
      );

      // Abort after giving the async IIFE a chance to start
      setTimeout(() => abort(), 10);

      // The test passes if no unhandled rejection occurs — wait briefly
      return new Promise<void>((resolve) => setTimeout(resolve, 50));
    });
  });

  describe("getHint", () => {
    it("sends POST with mapped fields", async () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await aiApiClient.getHint({ problemSlug: "two-sum", problemTitle: "Two Sum", code: "", language: "java" });

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/ai/hint");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    });
  });

  describe("reviewCode", () => {
    it("sends POST with mapped fields", async () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await aiApiClient.reviewCode({ problemSlug: "two-sum", problemTitle: "Two Sum", code: "", language: "java", focusAreas: ["performance"] });

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/ai/review");
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.focus_areas).toEqual(["performance"]);
    });
  });

  describe("explainError", () => {
    it("sends POST with mapped fields", async () => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: {} }) });

      await aiApiClient.explainError({ code: "x", language: "java", errorType: "compile", errorMessage: "syntax", lineNumber: 5 });

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/ai/explain");
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.line_number).toBe(5);
      expect(body.error_type).toBe("compile");
      expect(body.error_message).toBe("syntax");
    });
  });

  describe("session management", () => {
    beforeEach(() => {
      vi.spyOn(apiClient, "getAccessToken").mockReturnValue("tok");
    });

    it("getSessions fetches sessions", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { sessions: [] } }) });

      const res = await aiApiClient.getSessions();

      expect(res.success).toBe(true);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/ai/sessions");
    });

    it("getSessionMessages fetches messages for a session", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { messages: [] } }) });

      await aiApiClient.getSessionMessages("s-1");

      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/ai/sessions/s-1/messages");
    });

    it("clearSession sends DELETE", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { cleared: true } }) });

      const res = await aiApiClient.clearSession("s-1");

      expect(res.data?.cleared).toBe(true);
      expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/ai/sessions/s-1");
    });

    it("archiveSession sends POST with optional title", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { archived: true } }) });

      await aiApiClient.archiveSession("s-1", "My Session");

      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/ai/sessions/s-1/archive");
      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ title: "My Session" });
    });

    it("archiveSession works without title", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { archived: true } }) });

      await aiApiClient.archiveSession("s-1");

      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ title: undefined });
    });

    it("getArchivedSessions sends GET with query param", async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ success: true, data: { sessions: [] } }) });

      await aiApiClient.getArchivedSessions("two-sum");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("/api/v1/ai/sessions/archived");
      expect(url).toContain("problem_slug=two-sum");
    });
  });
});

// ===========================================================================
// 3. seo.ts — SEO Metadata
// ===========================================================================

describe("seo", () => {
  describe("siteConfig", () => {
    it("has expected shape", () => {
      expect(siteConfig).toHaveProperty("name", "AlgoPatterns");
      expect(siteConfig).toHaveProperty("url");
      expect(siteConfig).toHaveProperty("description");
      expect(Array.isArray(siteConfig.keywords)).toBe(true);
      expect(siteConfig.keywords.length).toBeGreaterThan(0);
    });
  });

  describe("defaultMetadata", () => {
    it("has required Metadata fields", () => {
      expect(defaultMetadata).toHaveProperty("metadataBase");
      expect(defaultMetadata).toHaveProperty("title");
      expect(defaultMetadata.title).toHaveProperty("default");
      expect(defaultMetadata.title).toHaveProperty("template");
      expect(defaultMetadata).toHaveProperty("description");
      expect(defaultMetadata).toHaveProperty("keywords");
      expect(defaultMetadata).toHaveProperty("openGraph");
      expect(defaultMetadata).toHaveProperty("twitter");
      expect(defaultMetadata).toHaveProperty("robots");
    });

    it("openGraph has correct shape", () => {
      const og = defaultMetadata.openGraph;
      expect(og).toHaveProperty("type", "website");
      expect(og).toHaveProperty("locale", "en_US");
      expect(og).toHaveProperty("siteName", "AlgoPatterns");
      expect(Array.isArray(og?.images)).toBe(true);
      if (og && "images" in og && Array.isArray(og.images)) {
        expect(og.images[0]).toHaveProperty("url", "/og-image.png");
        expect(og.images[0]).toHaveProperty("width", 1200);
        expect(og.images[0]).toHaveProperty("height", 630);
      }
    });
  });

  describe("patternSEO", () => {
    const expectedSlugs = [
      "arrays-strings", "backtracking", "binary-search", "dynamic-programming",
      "greedy", "graphs", "hash-map", "heap", "intervals", "linked-list",
      "prefix-sum", "sliding-window", "stack", "trees", "trie", "two-pointers",
      "union-find",
    ];

    it("has all 17 pattern entries", () => {
      expect(Object.keys(patternSEO)).toHaveLength(expectedSlugs.length);
    });

    it("contains all expected slugs", () => {
      expectedSlugs.forEach((slug) => {
        expect(patternSEO).toHaveProperty(slug);
      });
    });

    it("each entry has required fields", () => {
      for (const [_slug, entry] of Object.entries(patternSEO)) {
        expect(entry).toHaveProperty("title");
        expect(entry).toHaveProperty("description");
        expect(Array.isArray(entry.keywords)).toBe(true);
        expect(entry.keywords.length).toBeGreaterThan(0);
        expect(typeof entry.title).toBe("string");
        expect(typeof entry.description).toBe("string");
      }
    });
  });

  describe("getPatternMetadata", () => {
    it("returns correct metadata for a known slug", () => {
      const meta = getPatternMetadata("two-pointers", "Two Pointers", "Master two pointers technique.");

      expect(meta.title).toBe("Two Pointers Pattern - Array & String Problems");
      expect(meta.description).toContain("Master two pointers technique");
      expect(Array.isArray(meta.keywords)).toBe(true);
      expect(meta.keywords?.length).toBeGreaterThan(0);
      expect((meta.openGraph as { title?: string })?.title).toBe("Two Pointers Pattern - Array & String Problems");
      expect((meta.openGraph as { url?: string })?.url).toContain("/patterns/two-pointers");
      expect((meta.twitter as { card?: string })?.card).toBe("summary_large_image");
      expect((meta.alternates as { canonical?: string })?.canonical).toContain("/patterns/two-pointers");
    });

    it("falls back for unknown slug", () => {
      const meta = getPatternMetadata("unknown-pattern", "Custom", "Custom description.");

      expect(meta.title).toBe("Custom Pattern - DSA Tutorial");
      expect(meta.description).toBe("Custom description. Learn with interactive visualizations and curated practice problems.");
      expect(meta.keywords).toEqual(["unknown-pattern", "algorithm", "leetcode", "dsa pattern"]);
    });
  });
});

// ===========================================================================
// 4. solutions.ts — Solution Data
// ===========================================================================

describe("solutions", () => {
  const solutionKeys = Object.keys(solutions);

  it("has 10 solutions", () => {
    expect(solutionKeys).toHaveLength(10);
  });

  it("each solution has all required fields", () => {
    for (const [_key, sol] of Object.entries(solutions)) {
      expect(sol).toHaveProperty("approach");
      expect(sol).toHaveProperty("steps");
      expect(sol).toHaveProperty("code");
      expect(sol).toHaveProperty("language");
      expect(sol).toHaveProperty("timeComplexity");
      expect(sol).toHaveProperty("spaceComplexity");

      expect(typeof sol.approach).toBe("string");
      expect(Array.isArray(sol.steps)).toBe(true);
      expect(sol.steps.length).toBeGreaterThan(0);
      expect(typeof sol.code).toBe("string");
      expect(typeof sol.language).toBe("string");
      expect(typeof sol.timeComplexity).toBe("string");
      expect(typeof sol.spaceComplexity).toBe("string");
    }
  });

  it("two-sum has correct data", () => {
    const ts = solutions["two-sum"];
    expect(ts.approach).toContain("hash map");
    expect(ts.language).toBe("java");
    expect(ts.timeComplexity).toContain("O(n)");
    expect(ts.spaceComplexity).toContain("O(n)");
    expect(ts.steps.length).toBe(5);
  });
});

// ===========================================================================
// 5. questions.ts — Questions Data
// ===========================================================================

describe("questions", () => {
  const validDifficulties = ["Easy", "Medium", "Hard"];

  it("has questions", () => {
    expect(questions.length).toBeGreaterThan(200);
  });

  it("each question has required fields", () => {
    questions.forEach((q) => {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("name");
      expect(q).toHaveProperty("url");
      expect(q).toHaveProperty("difficulty");
      expect(q).toHaveProperty("pattern");
      expect(q).toHaveProperty("companies");
      expect(q).toHaveProperty("frequency");
      expect(q).toHaveProperty("category");

      expect(typeof q.id).toBe("string");
      expect(typeof q.name).toBe("string");
      expect(typeof q.url).toBe("string");
      expect(Array.isArray(q.companies)).toBe(true);
      expect(typeof q.frequency).toBe("string");
    });
  });

  it("has no duplicate IDs", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each question has a valid difficulty", () => {
    questions.forEach((q) => {
      expect(validDifficulties).toContain(q.difficulty);
    });
  });

  it("each question has a category in categoryToPatternId", () => {
    questions.forEach((q) => {
      expect(categoryToPatternId).toHaveProperty(q.category);
    });
  });

  describe("getCategories", () => {
    it("returns unique categories", () => {
      const cats = getCategories();
      expect(Array.isArray(cats)).toBe(true);
      expect(cats.length).toBeGreaterThan(10);
      expect(new Set(cats).size).toBe(cats.length);
    });
  });

  describe("getCompanies", () => {
    it("returns sorted unique companies", () => {
      const comps = getCompanies();
      expect(Array.isArray(comps)).toBe(true);
      expect(comps.length).toBeGreaterThan(10);
      expect(new Set(comps).size).toBe(comps.length);
      // check sorted
      for (let i = 1; i < comps.length; i++) {
        expect(comps[i - 1] <= comps[i]).toBe(true);
      }
    });
  });

  describe("getQuestionsByCategory", () => {
    it("returns questions for a valid category", () => {
      const arr = getQuestionsByCategory("Arrays & Strings");
      expect(arr.length).toBeGreaterThan(10);
      arr.forEach((q) => expect(q.category).toBe("Arrays & Strings"));
    });

    it("returns empty array for unknown category", () => {
      expect(getQuestionsByCategory("nonexistent")).toEqual([]);
    });
  });
});

// ===========================================================================
// 6. quizService.ts — Quiz Service
// ===========================================================================

describe("quizService", () => {
  const successResponse = (data: unknown) =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data }),
    });

  const failResponse = (code: string, message: string) =>
    Promise.resolve({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ success: false, error: { code, message } }),
    });

  describe("getQuestions", () => {
    it("builds URL with patternId only", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ patternId: "hash-map", totalQuestions: 5, questions: [] }));

      await quizService.getQuestions("hash-map");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("/api/v1/quiz/questions/hash-map");
      expect(url).not.toContain("?");
    });

    it("appends section slug when provided", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ patternId: "hash-map", totalQuestions: 3, questions: [] }));

      await quizService.getQuestions("hash-map", "section-1");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("section=section-1");
    });
  });

  describe("startAttempt", () => {
    it("sends POST with proper body", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ attemptId: "a1", startedAt: "2025-01-01T00:00:00Z" }));

      const result = await quizService.startAttempt({ patternId: "hash-map", totalQuestions: 5 });

      expect(result.attemptId).toBe("a1");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/quiz/attempts");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
      expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ patternId: "hash-map", totalQuestions: 5 });
    });
  });

  describe("submitResponse", () => {
    it("sends POST with response body", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ isCorrect: true, correctAnswer: "A", explanation: "ok" }));

      const result = await quizService.submitResponse("a1", { questionId: "q1", selectedAnswer: "A" });

      expect(result.isCorrect).toBe(true);
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/quiz/attempts/a1/responses");
      expect(mockFetch.mock.calls[0][1].method).toBe("POST");
    });
  });

  describe("completeAttempt", () => {
    it("sends PATCH with timeTakenSeconds", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ attemptId: "a1", totalQuestions: 5, correctCount: 4, scorePercentage: 80, completedAt: "2025-01-01T00:00:00Z" }));

      const result = await quizService.completeAttempt("a1", { timeTakenSeconds: 120 });

      expect(result.scorePercentage).toBe(80);
      expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/quiz/attempts/a1/complete");
    });

    it("works without request body", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ attemptId: "a1", totalQuestions: 5, correctCount: 3, scorePercentage: 60, completedAt: "2025-01-01T00:00:00Z" }));

      const result = await quizService.completeAttempt("a1");

      expect(result.scorePercentage).toBe(60);
    });
  });

  describe("getAttempt", () => {
    it("fetches attempt by id", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ id: "a1", patternId: "hash-map", totalQuestions: 5, correctCount: 3, startedAt: "", status: "in_progress" }));

      const result = await quizService.getAttempt("a1");

      expect(result.id).toBe("a1");
      expect(mockFetch.mock.calls[0][0]).toContain("/api/v1/quiz/attempts/a1");
    });
  });

  describe("getAttemptHistory", () => {
    it("builds query string with all params", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ attempts: [], totalAttempts: 0 }));

      await quizService.getAttemptHistory("hash-map", "section-1", 20, "cursor-abc");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("pattern_id=hash-map");
      expect(url).toContain("section_slug=section-1");
      expect(url).toContain("limit=20");
      expect(url).toContain("cursor=cursor-abc");
    });

    it("includes only default limit when no params provided", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ attempts: [], totalAttempts: 0 }));

      await quizService.getAttemptHistory();

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("limit=10");
      expect(url).not.toContain("pattern_id");
      expect(url).not.toContain("section_slug");
      expect(url).not.toContain("cursor");
    });

    it("sets default limit of 10", async () => {
      mockFetch.mockResolvedValueOnce(successResponse({ attempts: [], totalAttempts: 0 }));

      await quizService.getAttemptHistory("hash-map");

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("limit=10");
    });
  });

  describe("fetchApi error handling", () => {
    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce(failResponse("BAD_REQUEST", "Invalid pattern"));

      await expect(quizService.getQuestions("invalid")).rejects.toThrow("Invalid pattern");
    });

    it("throws with fallback message when error has no message", async () => {
      mockFetch.mockResolvedValueOnce(
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ success: false, error: {} }),
        }),
      );

      await expect(quizService.getQuestions("x")).rejects.toThrow("Request failed");
    });

    it("throws on success: false with ok: true", async () => {
      mockFetch.mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: false, error: { code: "ERROR", message: "Logic error" } }),
        }),
      );

      await expect(quizService.getQuestions("x")).rejects.toThrow("Logic error");
    });
  });
});

// ===========================================================================
// 7. quotes.ts — Quotes Data
// ===========================================================================

describe("quotes", () => {
  it("has exactly 61 quotes", () => {
    expect(quotes).toHaveLength(61);
  });

  it("each quote has all required fields", () => {
    quotes.forEach((q) => {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("text");
      expect(q).toHaveProperty("author");
      expect(q).toHaveProperty("rationale");
      expect(q).toHaveProperty("tags");
      expect(q).toHaveProperty("attributionCertainty");

      expect(typeof q.id).toBe("string");
      expect(typeof q.text).toBe("string");
      expect(q.text.length).toBeGreaterThan(0);
      expect(typeof q.author).toBe("string");
      expect(q.author.length).toBeGreaterThan(0);
      expect(typeof q.rationale).toBe("string");
      expect(Array.isArray(q.tags)).toBe(true);
      expect(q.tags.length).toBeGreaterThan(0);
      expect(["certain", "uncertain"]).toContain(q.attributionCertainty);
    });
  });

  it("no duplicate IDs", () => {
    const ids = quotes.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all tags are non-empty strings", () => {
    quotes.forEach((q) => {
      q.tags.forEach((tag) => {
        expect(typeof tag).toBe("string");
        expect(tag.length).toBeGreaterThan(0);
      });
    });
  });

  it("attributionCertainty is valid for all quotes", () => {
    quotes.forEach((q) => {
      expect(["certain", "uncertain"]).toContain(q.attributionCertainty);
    });
  });

  it("optional fields are either present with valid types or absent", () => {
    quotes.forEach((q) => {
      if (q.source !== undefined) {
        expect(typeof q.source).toBe("string");
      }
      if (q.year !== undefined) {
        expect(typeof q.year).toBe("number");
      }
    });
  });
});
