import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentGuard } from "@/components/pricing/PaymentGuard";
import type { PlanFeatures } from "@/types";

// Mock useSubscription
const mockUseSubscription = vi.fn();
vi.mock("@/contexts/SubscriptionContext", () => ({
  useSubscription: () => mockUseSubscription(),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
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

describe("PaymentGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("should show loading spinner when isLoading is true", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: true,
      });

      render(
        <PaymentGuard feature="has_code_playground">
          <div>Protected Content</div>
        </PaymentGuard>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("with access", () => {
    it("should render children when user has boolean feature access", () => {
      mockUseSubscription.mockReturnValue({
        features: mockProFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="has_code_playground">
          <div>Protected Content</div>
        </PaymentGuard>
      );

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
      expect(screen.queryByText("Premium Feature")).not.toBeInTheDocument();
    });

    it("should render children when user has unlimited (-1) feature access", () => {
      mockUseSubscription.mockReturnValue({
        features: mockProFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="max_patterns">
          <div>All Patterns</div>
        </PaymentGuard>
      );

      expect(screen.getByText("All Patterns")).toBeInTheDocument();
    });

    it("should render children when user has limited (>0) feature access", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="max_patterns">
          <div>Some Patterns</div>
        </PaymentGuard>
      );

      // Free features have max_patterns = 3, which is > 0
      expect(screen.getByText("Some Patterns")).toBeInTheDocument();
    });
  });

  describe("without access", () => {
    it("should show upgrade overlay when user lacks boolean feature access", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="has_code_playground">
          <div>Protected Content</div>
        </PaymentGuard>
      );

      expect(screen.getByText("Premium Feature")).toBeInTheDocument();
      expect(screen.getByText("Upgrade to Pro")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Upgrade to Pro/i })
      ).toHaveAttribute("href", "/pricing");
    });

    it("should show correct description for code playground feature", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="has_code_playground">
          <div>Protected Content</div>
        </PaymentGuard>
      );

      expect(
        screen.getByText(
          "Practice coding with our interactive code playground."
        )
      ).toBeInTheDocument();
    });

    it("should show correct description for solutions access feature", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="has_solutions_access">
          <div>Solutions</div>
        </PaymentGuard>
      );

      expect(
        screen.getByText(
          "Get detailed solutions and explanations for all problems."
        )
      ).toBeInTheDocument();
    });

    it("should show correct description for highlighting feature", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="has_highlighting">
          <div>Highlighting</div>
        </PaymentGuard>
      );

      expect(
        screen.getByText(
          "Highlight and annotate content for better note-taking."
        )
      ).toBeInTheDocument();
    });

    it("should show correct description for quiz history feature", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="has_quiz_history">
          <div>Quiz History</div>
        </PaymentGuard>
      );

      expect(
        screen.getByText(
          "Track your quiz performance and review past attempts."
        )
      ).toBeInTheDocument();
    });

    it("should show correct description for progress sync feature", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="has_progress_sync">
          <div>Progress Sync</div>
        </PaymentGuard>
      );

      expect(
        screen.getByText("Sync your learning progress across all devices.")
      ).toBeInTheDocument();
    });

    it("should show correct description for offline export feature", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="has_offline_export">
          <div>Export</div>
        </PaymentGuard>
      );

      expect(
        screen.getByText("Export content for offline learning.")
      ).toBeInTheDocument();
    });

    it("should blur the protected content", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      const { container } = render(
        <PaymentGuard feature="has_code_playground">
          <div>Protected Content</div>
        </PaymentGuard>
      );

      const blurredDiv = container.querySelector(".blur-sm");
      expect(blurredDiv).toBeInTheDocument();
      expect(blurredDiv).toHaveClass("pointer-events-none");
    });
  });

  describe("custom fallback", () => {
    it("should render custom fallback when provided and user lacks access", () => {
      mockUseSubscription.mockReturnValue({
        features: mockFreeFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard
          feature="has_code_playground"
          fallback={<div>Custom Upgrade Message</div>}
        >
          <div>Protected Content</div>
        </PaymentGuard>
      );

      expect(screen.getByText("Custom Upgrade Message")).toBeInTheDocument();
      expect(screen.queryByText("Premium Feature")).not.toBeInTheDocument();
    });
  });

  describe("numeric feature access (0 = no access)", () => {
    it("should show upgrade overlay when numeric feature is 0", () => {
      const noAccessFeatures: PlanFeatures = {
        ...mockFreeFeatures,
        max_visualizers: 0, // No access
      };

      mockUseSubscription.mockReturnValue({
        features: noAccessFeatures,
        isLoading: false,
      });

      render(
        <PaymentGuard feature="max_visualizers">
          <div>Visualizers</div>
        </PaymentGuard>
      );

      expect(screen.getByText("Premium Feature")).toBeInTheDocument();
    });
  });

  describe("all feature descriptions", () => {
    const featureDescriptions: Record<keyof PlanFeatures, string> = {
      max_patterns:
        "Access all algorithm patterns and their detailed tutorials.",
      max_visualizers:
        "Use interactive visualizers to understand algorithms better.",
      quiz_questions_per_pattern:
        "Test your knowledge with quizzes for each pattern.",
      has_quiz_history: "Track your quiz performance and review past attempts.",
      has_code_playground:
        "Practice coding with our interactive code playground.",
      has_progress_sync: "Sync your learning progress across all devices.",
      has_highlighting:
        "Highlight and annotate content for better note-taking.",
      has_solutions_access:
        "Get detailed solutions and explanations for all problems.",
      has_offline_export: "Export content for offline learning.",
    };

    Object.entries(featureDescriptions).forEach(([feature, description]) => {
      it(`should show correct description for ${feature}`, () => {
        const noAccessFeatures: PlanFeatures = {
          max_patterns: 0,
          max_visualizers: 0,
          quiz_questions_per_pattern: 0,
          has_quiz_history: false,
          has_code_playground: false,
          has_progress_sync: false,
          has_highlighting: false,
          has_solutions_access: false,
          has_offline_export: false,
        };

        mockUseSubscription.mockReturnValue({
          features: noAccessFeatures,
          isLoading: false,
        });

        render(
          <PaymentGuard feature={feature as keyof PlanFeatures}>
            <div>Content</div>
          </PaymentGuard>
        );

        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });
  });
});
