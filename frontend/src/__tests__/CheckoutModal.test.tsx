import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckoutModal } from "@/components/pricing/CheckoutModal";
import type { Plan, PlanFeatures } from "@/types";

// Mock useSubscription
const mockCreateOrder = vi.fn();
const mockVerifyPayment = vi.fn();
const mockValidateDiscount = vi.fn();

vi.mock("@/contexts/SubscriptionContext", () => ({
  useSubscription: () => ({
    createOrder: mockCreateOrder,
    verifyPayment: mockVerifyPayment,
    validateDiscount: mockValidateDiscount,
  }),
}));

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

const mockPlan: Plan = {
  id: "pro_yearly",
  name: "Pro Yearly",
  price: 120000,
  currency: "INR",
  billing_period: "yearly",
  features: mockProFeatures,
};

describe("CheckoutModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("visibility", () => {
    it("should not render when isOpen is false", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={false}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      expect(screen.queryByText("Upgrade to Pro Yearly")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      expect(screen.getByText("Upgrade to Pro Yearly")).toBeInTheDocument();
    });
  });

  describe("price display", () => {
    it("should display subtotal", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      expect(screen.getByText("Subtotal")).toBeInTheDocument();
      expect(screen.getByText("₹1,200")).toBeInTheDocument();
    });

    it("should display GST rate", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      expect(screen.getByText("GST (18%)")).toBeInTheDocument();
    });

    it("should display total", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      expect(screen.getByText("Total")).toBeInTheDocument();
    });
  });

  describe("discount code", () => {
    it("should render discount code input", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      expect(screen.getByPlaceholderText("Discount code")).toBeInTheDocument();
    });

    it("should have Apply button disabled when discount code is empty", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      const applyButton = screen.getByText("Apply");
      expect(applyButton).toBeDisabled();
    });

    it("should enable Apply button when discount code is entered", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      const input = screen.getByPlaceholderText("Discount code");
      fireEvent.change(input, { target: { value: "SAVE50" } });

      const applyButton = screen.getByText("Apply");
      expect(applyButton).not.toBeDisabled();
    });

    it("should convert discount code to uppercase", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      const input = screen.getByPlaceholderText("Discount code") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "save50" } });
      expect(input.value).toBe("SAVE50");
    });

    it("should validate discount code when Apply is clicked", async () => {
      mockValidateDiscount.mockResolvedValue({
        success: true,
        data: {
          code: "SAVE50",
          discount_type: "percentage",
          discount_value: 50,
          discount_amount: 60000,
          message: "50% off applied!",
        },
      });

      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText("Discount code");
      fireEvent.change(input, { target: { value: "SAVE50" } });

      const applyButton = screen.getByText("Apply");
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockValidateDiscount).toHaveBeenCalledWith("SAVE50", "pro_yearly");
      });
    });

    it("should display applied discount", async () => {
      mockValidateDiscount.mockResolvedValue({
        success: true,
        data: {
          code: "SAVE50",
          discount_type: "percentage",
          discount_value: 50,
          discount_amount: 60000,
          message: "50% off applied!",
        },
      });

      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText("Discount code");
      fireEvent.change(input, { target: { value: "SAVE50" } });
      fireEvent.click(screen.getByText("Apply"));

      await waitFor(() => {
        expect(screen.getByText("Discount (SAVE50)")).toBeInTheDocument();
      });
    });

    it("should show Remove button after discount is applied", async () => {
      mockValidateDiscount.mockResolvedValue({
        success: true,
        data: {
          code: "SAVE50",
          discount_type: "percentage",
          discount_value: 50,
          discount_amount: 60000,
          message: "50% off applied!",
        },
      });

      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText("Discount code");
      fireEvent.change(input, { target: { value: "SAVE50" } });
      fireEvent.click(screen.getByText("Apply"));

      await waitFor(() => {
        expect(screen.getByText("Remove")).toBeInTheDocument();
      });
    });

    it("should display error for invalid discount code", async () => {
      mockValidateDiscount.mockResolvedValue({
        success: false,
        error: "Invalid discount code",
      });

      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText("Discount code");
      fireEvent.change(input, { target: { value: "INVALID" } });
      fireEvent.click(screen.getByText("Apply"));

      await waitFor(() => {
        expect(screen.getByText("Invalid discount code")).toBeInTheDocument();
      });
    });
  });

  describe("close button", () => {
    it("should call onClose when close button is clicked", () => {
      const onClose = vi.fn();
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={onClose}
          onSuccess={vi.fn()}
        />
      );

      const closeButton = screen.getByRole("button", { name: "" });
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose when backdrop is clicked", () => {
      const onClose = vi.fn();
      const { container } = render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={onClose}
          onSuccess={vi.fn()}
        />
      );

      const backdrop = container.querySelector(".bg-black\\/60");
      if (backdrop) {
        fireEvent.click(backdrop);
      }
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("checkout button", () => {
    it("should display Pay button with total amount", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      // The total includes 18% GST: 120000 + 21600 = 141600
      expect(screen.getByText(/Pay ₹1,416/)).toBeInTheDocument();
    });

    it("should display Processing... when payment is processing", async () => {
      mockCreateOrder.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const payButton = screen.getByText(/Pay ₹/);
      fireEvent.click(payButton);

      await waitFor(() => {
        expect(screen.getByText("Processing...")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("should display error when order creation fails", async () => {
      mockCreateOrder.mockResolvedValue({
        success: false,
        error: "Failed to create order",
      });

      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const payButton = screen.getByText(/Pay ₹/);
      fireEvent.click(payButton);

      await waitFor(() => {
        expect(screen.getByText("Failed to create order")).toBeInTheDocument();
      });
    });
  });

  describe("security notice", () => {
    it("should display Razorpay security notice", () => {
      render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );
      expect(
        screen.getByText(/Secured by Razorpay/)
      ).toBeInTheDocument();
    });
  });

  describe("reset on open", () => {
    it("should reset state when modal opens", async () => {
      const { rerender } = render(
        <CheckoutModal
          plan={mockPlan}
          isOpen={false}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      rerender(
        <CheckoutModal
          plan={mockPlan}
          isOpen={true}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText("Discount code") as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });
});
