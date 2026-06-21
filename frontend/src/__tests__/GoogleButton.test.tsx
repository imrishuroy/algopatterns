import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GoogleButton } from "@/components/ui/GoogleButton";

describe("GoogleButton", () => {
  it("should render with default text", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("should render with custom text", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} text="Sign in with Google" />);

    expect(screen.getByText("Sign in with Google")).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} isLoading />);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("should show loading spinner when isLoading is true", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} isLoading />);

    expect(screen.queryByText("Continue with Google")).not.toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should show Google icon when not loading", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);

    const svg = screen.getByRole("button").querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have correct button type", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("should be accessible", () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} text="Sign in with Google" />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
  });
});
