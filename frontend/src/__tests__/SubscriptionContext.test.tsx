import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import type { ReactNode } from "react";
import type { Subscription, Plan, PlanFeatures } from "@/types";

// Mock useAuth
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: true,
    user: { id: "user-123", email: "test@test.com", name: "Test", emailVerified: true },
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
    loginWithGoogle: vi.fn(),
    handleGoogleCallback: vi.fn(),
  })),
}));

// Mock the API client
vi.mock("@/lib/api", () => ({
  apiClient: {
    getSubscription: vi.fn(),
    getPlans: vi.fn(),
    createOrder: vi.fn(),
    verifyPayment: vi.fn(),
    validateDiscount: vi.fn(),
    cancelSubscription: vi.fn(),
  },
}));

// Import mocked modules
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const mockProFeatures: PlanFeatures = {
  max_patterns: -1,
  max_visualizers: -1,
  quiz_questions_per_pattern: -1,
  has_quiz_history: true,
  has_code_playground: true,
  has_progress_sync: true,
  has_highlighting: true,
  has_solutions_access: true,
  has_offline_export: true,
};

const mockFreeFeatures: PlanFeatures = {
  max_patterns: 3,
  max_visualizers: 2,
  quiz_questions_per_pattern: 3,
  has_quiz_history: false,
  has_code_playground: false,
  has_progress_sync: false,
  has_highlighting: false,
  has_solutions_access: false,
  has_offline_export: false,
};

const mockProSubscription: Subscription = {
  id: "sub-123",
  plan_id: "pro_yearly",
  status: "active",
  current_period_start: "2024-01-01T00:00:00Z",
  current_period_end: "2025-01-01T00:00:00Z",
  cancel_at_period_end: false,
  features: mockProFeatures,
};

const mockFreeSubscription: Subscription = {
  plan_id: "free",
  status: "active",
  features: mockFreeFeatures,
};

const mockPlans: Plan[] = [
  {
    id: "pro_monthly",
    name: "Pro Monthly",
    price: 29900,
    currency: "INR",
    billing_period: "monthly",
    features: mockProFeatures,
  },
  {
    id: "pro_yearly",
    name: "Pro Yearly",
    price: 120000,
    original_price: 358800,
    currency: "INR",
    billing_period: "yearly",
    savings_percentage: 67,
    is_recommended: true,
    features: mockProFeatures,
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <SubscriptionProvider>{children}</SubscriptionProvider>
);

describe("SubscriptionContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-123", email: "test@test.com", name: "Test", emailVerified: true },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      refreshUser: vi.fn(),
      loginWithGoogle: vi.fn(),
      handleGoogleCallback: vi.fn(),
    });
    vi.mocked(apiClient.getPlans).mockResolvedValue({
      success: true,
      data: { plans: mockPlans },
    });
  });

  describe("initial state", () => {
    it("should start with loading state", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockProSubscription,
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      // Initial loading state
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should fetch subscription on mount for authenticated users", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockProSubscription,
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.subscription).toEqual(mockProSubscription);
        expect(result.current.isPro).toBe(true);
      });
    });

    it("should return free features for unauthenticated users", async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
        refreshUser: vi.fn(),
        loginWithGoogle: vi.fn(),
        handleGoogleCallback: vi.fn(),
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.subscription).toBeNull();
        expect(result.current.isPro).toBe(false);
        expect(result.current.features.max_patterns).toBe(3);
      });
    });
  });

  describe("isPro", () => {
    it("should return true for active pro subscription", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockProSubscription,
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isPro).toBe(true);
      });
    });

    it("should return false for free subscription", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockFreeSubscription,
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isPro).toBe(false);
      });
    });

    it("should return false for cancelled subscription", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: { ...mockProSubscription, status: "cancelled" },
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isPro).toBe(false);
      });
    });
  });

  describe("features", () => {
    it("should return pro features for pro users", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockProSubscription,
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.features.max_patterns).toBe(-1);
        expect(result.current.features.has_code_playground).toBe(true);
        expect(result.current.features.has_solutions_access).toBe(true);
      });
    });

    it("should return free features for free users", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockFreeSubscription,
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.features.max_patterns).toBe(3);
        expect(result.current.features.has_code_playground).toBe(false);
        expect(result.current.features.has_solutions_access).toBe(false);
      });
    });
  });

  describe("plans", () => {
    it("should fetch plans on mount", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockFreeSubscription,
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.plans).toHaveLength(2);
        expect(result.current.plans[0].id).toBe("pro_monthly");
        expect(result.current.plans[1].id).toBe("pro_yearly");
      });
    });
  });

  describe("createOrder", () => {
    it("should create order successfully", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockFreeSubscription,
      });
      vi.mocked(apiClient.createOrder).mockResolvedValue({
        success: true,
        data: {
          order_id: "order-123",
          razorpay_order_id: "rzp_order_123",
          razorpay_key_id: "rzp_key_123",
          plan: { id: "pro_yearly", name: "Pro Yearly", billing_period: "yearly" },
          pricing: {
            subtotal: 120000,
            discount_amount: 0,
            gst_rate: 18,
            gst_amount: 21600,
            total: 141600,
            currency: "INR",
          },
        },
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let orderResult: { success: boolean; error?: string; data?: { razorpay_order_id: string } } | undefined;
      await act(async () => {
        orderResult = await result.current.createOrder("pro_yearly");
      });

      expect(orderResult!.success).toBe(true);
      expect(orderResult!.data?.razorpay_order_id).toBe("rzp_order_123");
    });

    it("should handle order creation failure", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockFreeSubscription,
      });
      vi.mocked(apiClient.createOrder).mockResolvedValue({
        success: false,
        data: { order_id: "", razorpay_order_id: "", razorpay_key_id: "", plan: { id: "", name: "", billing_period: "" }, pricing: { subtotal: 0, discount_amount: 0, gst_rate: 0, gst_amount: 0, total: 0, currency: "INR" } },
        error: { code: "ERROR", message: "Plan not found" },
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let orderResult: { success: boolean; error?: string; data?: { razorpay_order_id: string } } | undefined;
      await act(async () => {
        orderResult = await result.current.createOrder("invalid_plan");
      });

      expect(orderResult!.success).toBe(false);
      expect(orderResult!.error).toBe("Plan not found");
    });
  });

  describe("validateDiscount", () => {
    it("should validate discount code successfully", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockFreeSubscription,
      });
      vi.mocked(apiClient.validateDiscount).mockResolvedValue({
        success: true,
        data: {
          code: "SAVE50",
          discount_type: "percentage",
          discount_value: 50,
          discount_amount: 60000,
          message: "50% off applied!",
        },
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let discountResult: { success: boolean; error?: string; data?: { discount_amount: number } } | undefined;
      await act(async () => {
        discountResult = await result.current.validateDiscount("SAVE50", "pro_yearly");
      });

      expect(discountResult!.success).toBe(true);
      expect(discountResult!.data?.discount_amount).toBe(60000);
    });

    it("should handle invalid discount code", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockFreeSubscription,
      });
      vi.mocked(apiClient.validateDiscount).mockResolvedValue({
        success: false,
        data: { code: "", discount_type: "", discount_value: 0, discount_amount: 0, message: "" },
        error: { code: "INVALID", message: "Invalid discount code" },
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let discountResult: { success: boolean; error?: string; data?: { discount_amount: number } } | undefined;
      await act(async () => {
        discountResult = await result.current.validateDiscount("INVALID", "pro_yearly");
      });

      expect(discountResult!.success).toBe(false);
      expect(discountResult!.error).toBe("Invalid discount code");
    });
  });

  describe("verifyPayment", () => {
    it("should verify payment and update subscription", async () => {
      vi.mocked(apiClient.getSubscription).mockResolvedValue({
        success: true,
        data: mockFreeSubscription,
      });
      vi.mocked(apiClient.verifyPayment).mockResolvedValue({
        success: true,
        data: {
          payment_id: "pay-123",
          subscription: mockProSubscription,
        },
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let verifyResult: { success: boolean; error?: string; data?: { payment_id: string; subscription: Subscription } } | undefined;
      await act(async () => {
        verifyResult = await result.current.verifyPayment("pay_123", "order_123", "sig_123");
      });

      expect(verifyResult!.success).toBe(true);
      expect(result.current.subscription).toEqual(mockProSubscription);
      expect(result.current.isPro).toBe(true);
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel subscription and refresh", async () => {
      vi.mocked(apiClient.getSubscription)
        .mockResolvedValueOnce({ success: true, data: mockProSubscription })
        .mockResolvedValueOnce({ success: true, data: { ...mockProSubscription, cancel_at_period_end: true } });
      vi.mocked(apiClient.cancelSubscription).mockResolvedValue({
        success: true,
        data: {
          id: "sub-123",
          status: "cancelled",
          cancel_at_period_end: true,
        },
      });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let cancelResult: { success: boolean; error?: string } | undefined;
      await act(async () => {
        cancelResult = await result.current.cancelSubscription("too_expensive", "Just testing");
      });

      expect(cancelResult!.success).toBe(true);
    });
  });

  describe("refreshSubscription", () => {
    it("should refresh subscription data", async () => {
      vi.mocked(apiClient.getSubscription)
        .mockResolvedValueOnce({ success: true, data: mockFreeSubscription })
        .mockResolvedValueOnce({ success: true, data: mockProSubscription });

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.subscription?.plan_id).toBe("free");
      });

      await act(async () => {
        await result.current.refreshSubscription();
      });

      expect(result.current.subscription?.plan_id).toBe("pro_yearly");
    });
  });

  describe("error handling", () => {
    it("should handle API errors gracefully", async () => {
      vi.mocked(apiClient.getSubscription).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useSubscription(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.subscription).toBeNull();
      });
    });
  });
});

describe("useSubscription hook", () => {
  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useSubscription());
    }).toThrow("useSubscription must be used within a SubscriptionProvider");
  });
});
