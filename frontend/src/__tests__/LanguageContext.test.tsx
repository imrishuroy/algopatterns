import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";

const TestComponent = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="current-language">{language}</span>
      <button onClick={() => setLanguage("python")}>Set Python</button>
      <button onClick={() => setLanguage("cpp")}>Set C++</button>
      <button onClick={() => setLanguage("javascript")}>Set JavaScript</button>
      <button onClick={() => setLanguage("java")}>Set Java</button>
    </div>
  );
};

describe("LanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("provides default language as java", () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(screen.getByTestId("current-language")).toHaveTextContent("java");
  });

  it("changes language when setLanguage is called", async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Set Python"));
    });

    expect(screen.getByTestId("current-language")).toHaveTextContent("python");
  });

  it("persists language choice to localStorage", async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Set C++"));
    });

    expect(localStorage.getItem("preferredLanguage")).toBe("cpp");
  });

  it("loads language from localStorage on mount", async () => {
    localStorage.setItem("preferredLanguage", "javascript");

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(screen.getByTestId("current-language")).toHaveTextContent(
      "javascript"
    );
  });

  it("throws error when useLanguage is used outside provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useLanguage must be used within a LanguageProvider"
    );

    consoleError.mockRestore();
  });

  it("ignores invalid language values from localStorage", async () => {
    localStorage.setItem("preferredLanguage", "invalid-lang");

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(screen.getByTestId("current-language")).toHaveTextContent("java");
  });

  it("supports all valid languages", async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Set Python"));
    });
    expect(screen.getByTestId("current-language")).toHaveTextContent("python");

    await act(async () => {
      fireEvent.click(screen.getByText("Set C++"));
    });
    expect(screen.getByTestId("current-language")).toHaveTextContent("cpp");

    await act(async () => {
      fireEvent.click(screen.getByText("Set JavaScript"));
    });
    expect(screen.getByTestId("current-language")).toHaveTextContent("javascript");

    await act(async () => {
      fireEvent.click(screen.getByText("Set Java"));
    });
    expect(screen.getByTestId("current-language")).toHaveTextContent("java");
  });
});
