import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PricingCard } from "@/components/pricing/PricingCard";
import type { Plan, PlanFeatures } from "@/types";

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

const mockMonthlyPlan: Plan = {
  id: "pro_monthly",
  name: "Pro Monthly",
  price: 29900,
  currency: "INR",
  billing_period: "monthly",
  features: mockProFeatures,
};

const mockYearlyPlan: Plan = {
  id: "pro_yearly",
  name: "Pro Yearly",
  price: 120000,
  original_price: 358800,
  currency: "INR",
  billing_period: "yearly",
  savings_percentage: 67,
  is_recommended: true,
  features: mockProFeatures,
};

const mockLifetimePlan: Plan = {
  id: "pro_lifetime",
  name: "Pro Lifetime",
  price: 250000,
  original_price: 500000,
  currency: "INR",
  billing_period: "lifetime",
  savings_percentage: 50,
  features: mockProFeatures,
};

const mockFreePlan: Plan = {
  id: "free",
  name: "Free",
  price: 0,
  currency: "INR",
  billing_period: "monthly",
  features: mockFreeFeatures,
};

describe("PricingCard", () => {
  describe("plan display", () => {
    it("should display plan name", () => {
      render(<PricingCard plan={mockMonthlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("Pro Monthly")).toBeInTheDocument();
    });

    it("should display formatted price for INR", () => {
      render(<PricingCard plan={mockMonthlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("₹299")).toBeInTheDocument();
    });

    it("should display monthly billing label", () => {
      render(<PricingCard plan={mockMonthlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("/month")).toBeInTheDocument();
    });

    it("should display yearly billing label", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("/year")).toBeInTheDocument();
    });

    it("should display one-time billing label for lifetime", () => {
      render(<PricingCard plan={mockLifetimePlan} onSelect={vi.fn()} />);
      expect(screen.getByText(/one-time/)).toBeInTheDocument();
    });
  });

  describe("original price and savings", () => {
    it("should display strikethrough original price", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      const strikethroughPrice = screen.getByText("₹3,588");
      expect(strikethroughPrice).toBeInTheDocument();
      expect(strikethroughPrice).toHaveClass("line-through");
    });

    it("should display savings percentage badge", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("Save 67%")).toBeInTheDocument();
    });

    it("should not display original price if not provided", () => {
      render(<PricingCard plan={mockMonthlyPlan} onSelect={vi.fn()} />);
      const strikethroughElements = document.querySelectorAll(".line-through");
      expect(strikethroughElements.length).toBe(0);
    });
  });

  describe("recommended badge", () => {
    it("should display Most Popular badge for recommended plan", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("Most Popular")).toBeInTheDocument();
    });

    it("should not display badge for non-recommended plan", () => {
      render(<PricingCard plan={mockMonthlyPlan} onSelect={vi.fn()} />);
      expect(screen.queryByText("Most Popular")).not.toBeInTheDocument();
    });
  });

  describe("features list", () => {
    it("should display unlimited patterns for pro plan", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("All patterns")).toBeInTheDocument();
    });

    it("should display limited patterns for free plan", () => {
      render(<PricingCard plan={mockFreePlan} onSelect={vi.fn()} />);
      expect(screen.getByText("3 patterns")).toBeInTheDocument();
    });

    it("should display unlimited visualizers for pro plan", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("All visualizers")).toBeInTheDocument();
    });

    it("should display limited visualizers for free plan", () => {
      render(<PricingCard plan={mockFreePlan} onSelect={vi.fn()} />);
      expect(screen.getByText("2 visualizers")).toBeInTheDocument();
    });

    it("should display feature items with checkmarks for included features", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("Quiz history")).toBeInTheDocument();
      expect(screen.getByText("Code playground")).toBeInTheDocument();
      expect(screen.getByText("Progress sync")).toBeInTheDocument();
      expect(screen.getByText("Highlighting")).toBeInTheDocument();
      expect(screen.getByText("Solutions access")).toBeInTheDocument();
    });
  });

  describe("lifetime plan", () => {
    it("should display future updates message for lifetime plan", () => {
      render(<PricingCard plan={mockLifetimePlan} onSelect={vi.fn()} />);
      expect(
        screen.getByText("All future updates included")
      ).toBeInTheDocument();
    });

    it("should display future updates message for all paid plans", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      expect(
        screen.getByText("All future updates included")
      ).toBeInTheDocument();
    });
  });

  describe("button interactions", () => {
    it("should call onSelect when button is clicked", () => {
      const onSelect = vi.fn();
      render(<PricingCard plan={mockYearlyPlan} onSelect={onSelect} />);

      fireEvent.click(screen.getByText("Upgrade Now"));
      expect(onSelect).toHaveBeenCalledWith(mockYearlyPlan);
    });

    it("should display Current Plan for current plan", () => {
      render(
        <PricingCard plan={mockYearlyPlan} isCurrentPlan onSelect={vi.fn()} />
      );
      expect(screen.getByText("Current Plan")).toBeInTheDocument();
    });

    it("should be disabled when isCurrentPlan is true", () => {
      const onSelect = vi.fn();
      render(
        <PricingCard plan={mockYearlyPlan} isCurrentPlan onSelect={onSelect} />
      );

      const button = screen.getByText("Current Plan");
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("should display Loading... when isLoading is true", () => {
      render(
        <PricingCard plan={mockYearlyPlan} isLoading onSelect={vi.fn()} />
      );
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should be disabled when isLoading is true", () => {
      const onSelect = vi.fn();
      render(
        <PricingCard plan={mockYearlyPlan} isLoading onSelect={onSelect} />
      );

      const button = screen.getByText("Loading...");
      expect(button).toBeDisabled();
    });

    it("should display Get Started for free plan", () => {
      render(<PricingCard plan={mockFreePlan} onSelect={vi.fn()} />);
      expect(screen.getByText("Get Started")).toBeInTheDocument();
    });

    it("should display Upgrade Now for paid plans", () => {
      render(<PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />);
      expect(screen.getByText("Upgrade Now")).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("should have emerald border for recommended plan", () => {
      const { container } = render(
        <PricingCard plan={mockYearlyPlan} onSelect={vi.fn()} />
      );
      const card = container.firstChild;
      expect(card).toHaveClass("border-emerald-500");
    });

    it("should have gray border for non-recommended plan", () => {
      const { container } = render(
        <PricingCard plan={mockMonthlyPlan} onSelect={vi.fn()} />
      );
      const card = container.firstChild;
      expect(card).toHaveClass("border-gray-700");
    });
  });
});
