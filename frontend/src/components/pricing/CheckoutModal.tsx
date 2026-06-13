"use client";

import { useState, useEffect, useCallback } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import type { Plan, CreateOrderResponse, ValidateDiscountResponse } from "@/types";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    email?: string;
    name?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CheckoutModalProps {
  plan: Plan;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
  userName?: string;
}

export function CheckoutModal({
  plan,
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  userName,
}: CheckoutModalProps) {
  const { createOrder, verifyPayment, validateDiscount } = useSubscription();
  const [discountCode, setDiscountCode] = useState("");
  const [discountValidation, setDiscountValidation] =
    useState<ValidateDiscountResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null);

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
      setError(null);
      setDiscountCode("");
      setDiscountValidation(null);
      setOrderData(null);
    }
  }, [isOpen, loadRazorpayScript]);

  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) return;

    setIsValidating(true);
    setError(null);
    const result = await validateDiscount(discountCode.trim(), plan.id);
    setIsValidating(false);

    if (result.success && result.data) {
      setDiscountValidation(result.data);
    } else {
      setError(result.error || "Invalid discount code");
      setDiscountValidation(null);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await createOrder(
        plan.id,
        discountValidation?.code || undefined
      );

      if (!result.success || !result.data) {
        setError(result.error || "Failed to create order");
        setIsProcessing(false);
        return;
      }

      setOrderData(result.data);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway");
        setIsProcessing(false);
        return;
      }

      const options: RazorpayOptions = {
        key: result.data.razorpay_key_id,
        amount: result.data.pricing.total,
        currency: result.data.pricing.currency,
        name: "AlgoPatterns",
        description: `${result.data.plan.name} - ${result.data.plan.billing_period}`,
        order_id: result.data.razorpay_order_id,
        handler: async (response: RazorpayResponse) => {
          const verifyResult = await verifyPayment(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );

          if (verifyResult.success) {
            onSuccess();
          } else {
            setError(verifyResult.error || "Payment verification failed");
          }
          setIsProcessing(false);
        },
        prefill: {
          email: userEmail,
          name: userName,
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      setError("An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const formatPrice = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (!isOpen) return null;

  const pricing = orderData?.pricing || {
    subtotal: plan.price,
    discount_amount: discountValidation?.discount_amount || 0,
    gst_rate: 18,
    gst_amount: Math.round(
      ((plan.price - (discountValidation?.discount_amount || 0)) * 18) / 100
    ),
    total:
      plan.price -
      (discountValidation?.discount_amount || 0) +
      Math.round(
        ((plan.price - (discountValidation?.discount_amount || 0)) * 18) / 100
      ),
    currency: plan.currency,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          Upgrade to {plan.name}
        </h2>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal</span>
            <span>{formatPrice(pricing.subtotal, pricing.currency)}</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Discount code"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              disabled={!!discountValidation}
            />
            {discountValidation ? (
              <button
                onClick={() => {
                  setDiscountCode("");
                  setDiscountValidation(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={handleValidateDiscount}
                disabled={isValidating || !discountCode.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg"
              >
                {isValidating ? "..." : "Apply"}
              </button>
            )}
          </div>

          {discountValidation && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount ({discountValidation.code})</span>
              <span>
                -{formatPrice(discountValidation.discount_amount, pricing.currency)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-gray-400 text-sm">
            <span>GST ({pricing.gst_rate}%)</span>
            <span>{formatPrice(pricing.gst_amount, pricing.currency)}</span>
          </div>

          <div className="border-t border-gray-700 pt-4 flex justify-between text-white font-semibold text-lg">
            <span>Total</span>
            <span>{formatPrice(pricing.total, pricing.currency)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-lg transition-colors"
        >
          {isProcessing ? "Processing..." : `Pay ${formatPrice(pricing.total, pricing.currency)}`}
        </button>

        <p className="mt-4 text-center text-gray-500 text-xs">
          Secured by Razorpay. By proceeding, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
