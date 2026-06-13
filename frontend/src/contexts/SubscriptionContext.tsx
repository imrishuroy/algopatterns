"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "./AuthContext";
import type {
  Plan,
  Subscription,
  PlanFeatures,
  CreateOrderResponse,
  ValidateDiscountResponse,
} from "@/types";

interface SubscriptionContextType {
  subscription: Subscription | null;
  plans: Plan[];
  isLoading: boolean;
  isPro: boolean;
  features: PlanFeatures;
  refreshSubscription: () => Promise<void>;
  createOrder: (
    planId: string,
    discountCode?: string
  ) => Promise<{ success: boolean; data?: CreateOrderResponse; error?: string }>;
  verifyPayment: (
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ) => Promise<{ success: boolean; error?: string }>;
  validateDiscount: (
    code: string,
    planId: string
  ) => Promise<{ success: boolean; data?: ValidateDiscountResponse; error?: string }>;
  cancelSubscription: (
    reason?: string,
    feedback?: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const FREE_FEATURES: PlanFeatures = {
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

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.getSubscription();
      if (response.success) {
        setSubscription(response.data);
      } else {
        setSubscription(null);
      }
    } catch {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await apiClient.getPlans();
      if (response.success) {
        setPlans(response.data.plans);
      }
    } catch {
      console.error("Failed to fetch plans");
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      refreshSubscription();
      fetchPlans();
    }
  }, [authLoading, refreshSubscription, fetchPlans]);

  const createOrder = useCallback(
    async (planId: string, discountCode?: string) => {
      const idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      try {
        const response = await apiClient.createOrder(
          { plan_id: planId, discount_code: discountCode },
          idempotencyKey
        );
        if (response.success) {
          return { success: true, data: response.data };
        }
        return {
          success: false,
          error: response.error?.message || "Failed to create order",
        };
      } catch {
        return { success: false, error: "An error occurred" };
      }
    },
    []
  );

  const verifyPayment = useCallback(
    async (
      razorpayPaymentId: string,
      razorpayOrderId: string,
      razorpaySignature: string
    ) => {
      try {
        const response = await apiClient.verifyPayment({
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          razorpay_signature: razorpaySignature,
        });
        if (response.success) {
          setSubscription(response.data.subscription);
          return { success: true };
        }
        return {
          success: false,
          error: response.error?.message || "Payment verification failed",
        };
      } catch {
        return { success: false, error: "An error occurred" };
      }
    },
    []
  );

  const validateDiscount = useCallback(
    async (code: string, planId: string) => {
      try {
        const response = await apiClient.validateDiscount({
          code,
          plan_id: planId,
        });
        if (response.success) {
          return { success: true, data: response.data };
        }
        return {
          success: false,
          error: response.error?.message || "Invalid discount code",
        };
      } catch {
        return { success: false, error: "An error occurred" };
      }
    },
    []
  );

  const cancelSubscription = useCallback(
    async (reason?: string, feedback?: string) => {
      try {
        const response = await apiClient.cancelSubscription({ reason, feedback });
        if (response.success) {
          await refreshSubscription();
          return { success: true };
        }
        return {
          success: false,
          error: response.error?.message || "Failed to cancel subscription",
        };
      } catch {
        return { success: false, error: "An error occurred" };
      }
    },
    [refreshSubscription]
  );

  const isPro =
    subscription?.status === "active" && subscription?.plan_id !== "free";

  const features = subscription?.features || FREE_FEATURES;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plans,
        isLoading: isLoading || authLoading,
        isPro,
        features,
        refreshSubscription,
        createOrder,
        verifyPayment,
        validateDiscount,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}
