import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  UpgradePrompt,
  LockedOverlay,
} from "@/components/pricing/UpgradePrompt";

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

describe("UpgradePrompt", () => {
  describe("default variant", () => {
    it("should render default title", () => {
      render(<UpgradePrompt />);
      expect(screen.getByText("Premium Content")).toBeInTheDocument();
    });

    it("should render custom title when provided", () => {
      render(<UpgradePrompt title="Custom Title" />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("should render default description with feature", () => {
      render(<UpgradePrompt feature="code playground" />);
      expect(
        screen.getByText(/Upgrade to Pro to unlock code playground/)
      ).toBeInTheDocument();
    });

    it("should render custom description when provided", () => {
      render(<UpgradePrompt description="Custom description text" />);
      expect(screen.getByText("Custom description text")).toBeInTheDocument();
    });

    it("should render Upgrade to Pro button", () => {
      render(<UpgradePrompt />);
      const link = screen.getByText("Upgrade to Pro");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "/pricing");
    });

    it("should display pricing information", () => {
      render(<UpgradePrompt />);
      expect(
        screen.getByText("Starting at just ₹299/month")
      ).toBeInTheDocument();
    });

    it("should display lock emoji", () => {
      render(<UpgradePrompt />);
      expect(screen.getByText("🔒")).toBeInTheDocument();
    });
  });

  describe("compact variant", () => {
    it("should render compact version when compact is true", () => {
      render(<UpgradePrompt compact />);
      // Should have "Upgrade" button instead of "Upgrade to Pro"
      expect(screen.getByText("Upgrade")).toBeInTheDocument();
      expect(screen.queryByText("Upgrade to Pro")).not.toBeInTheDocument();
    });

    it("should render feature text in compact mode", () => {
      render(<UpgradePrompt feature="quiz history" compact />);
      expect(
        screen.getByText("Upgrade to Pro to access quiz history")
      ).toBeInTheDocument();
    });

    it("should render default feature text in compact mode", () => {
      render(<UpgradePrompt compact />);
      expect(
        screen.getByText("Upgrade to Pro to access this content")
      ).toBeInTheDocument();
    });

    it("should have link to pricing in compact mode", () => {
      render(<UpgradePrompt compact />);
      const link = screen.getByText("Upgrade");
      expect(link.closest("a")).toHaveAttribute("href", "/pricing");
    });

    it("should display lock emoji in compact mode", () => {
      render(<UpgradePrompt compact />);
      expect(screen.getByText("🔒")).toBeInTheDocument();
    });

    it("should not display pricing info in compact mode", () => {
      render(<UpgradePrompt compact />);
      expect(screen.queryByText(/Starting at/)).not.toBeInTheDocument();
    });
  });
});

describe("LockedOverlay", () => {
  it("should render children", () => {
    render(
      <LockedOverlay>
        <div>Protected Content</div>
      </LockedOverlay>
    );
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should blur the children", () => {
    const { container } = render(
      <LockedOverlay>
        <div>Protected Content</div>
      </LockedOverlay>
    );
    const blurredDiv = container.querySelector(".blur-sm");
    expect(blurredDiv).toBeInTheDocument();
    expect(blurredDiv).toHaveClass("pointer-events-none");
    expect(blurredDiv).toHaveClass("select-none");
  });

  it("should render compact upgrade prompt overlay", () => {
    render(
      <LockedOverlay>
        <div>Protected Content</div>
      </LockedOverlay>
    );
    // Should show compact version (has "Upgrade" not "Upgrade to Pro")
    expect(screen.getByText("Upgrade")).toBeInTheDocument();
  });

  it("should have backdrop blur overlay", () => {
    const { container } = render(
      <LockedOverlay>
        <div>Protected Content</div>
      </LockedOverlay>
    );
    const overlay = container.querySelector(".backdrop-blur-\\[2px\\]");
    expect(overlay).toBeInTheDocument();
  });
});
