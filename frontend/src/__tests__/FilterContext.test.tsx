import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, renderHook, act } from "@testing-library/react";
import { FilterProvider, useFilter } from "@/contexts/FilterContext";
import type { ReactNode } from "react";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <FilterProvider>{children}</FilterProvider>
);

describe("FilterContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should default companyFilter to empty string", () => {
      const { result } = renderHook(() => useFilter(), { wrapper: Wrapper });

      expect(result.current.companyFilter).toBe("");
    });
  });

  describe("setCompanyFilter", () => {
    it("should update companyFilter when called", () => {
      const { result } = renderHook(() => useFilter(), { wrapper: Wrapper });

      act(() => {
        result.current.setCompanyFilter("google");
      });

      expect(result.current.companyFilter).toBe("google");
    });

    it("should update companyFilter to a different company", () => {
      const { result } = renderHook(() => useFilter(), { wrapper: Wrapper });

      act(() => {
        result.current.setCompanyFilter("amazon");
      });

      expect(result.current.companyFilter).toBe("amazon");
    });

    it("should clear companyFilter when set to empty string", () => {
      const { result } = renderHook(() => useFilter(), { wrapper: Wrapper });

      act(() => {
        result.current.setCompanyFilter("meta");
      });

      expect(result.current.companyFilter).toBe("meta");

      act(() => {
        result.current.setCompanyFilter("");
      });

      expect(result.current.companyFilter).toBe("");
    });
  });

  describe("multiple updates", () => {
    it("should reflect the latest value after multiple setCompanyFilter calls", () => {
      const { result } = renderHook(() => useFilter(), { wrapper: Wrapper });

      act(() => {
        result.current.setCompanyFilter("google");
      });
      expect(result.current.companyFilter).toBe("google");

      act(() => {
        result.current.setCompanyFilter("amazon");
      });
      expect(result.current.companyFilter).toBe("amazon");

      act(() => {
        result.current.setCompanyFilter("microsoft");
      });
      expect(result.current.companyFilter).toBe("microsoft");
    });
  });

  describe("state isolation", () => {
    it("should have independent state for separate providers", () => {
      const { result: result1 } = renderHook(() => useFilter(), {
        wrapper: Wrapper,
      });
      const { result: result2 } = renderHook(() => useFilter(), {
        wrapper: Wrapper,
      });

      act(() => {
        result1.current.setCompanyFilter("google");
      });

      expect(result1.current.companyFilter).toBe("google");
      expect(result2.current.companyFilter).toBe("");
    });
  });

  describe("renders children", () => {
    it("should render children passed to provider", () => {
      const { container } = render(
        <FilterProvider>
          <div data-testid="child">child content</div>
        </FilterProvider>
      );

      expect(container.innerHTML).toContain("child content");
    });
  });
});

describe("useFilter hook", () => {
  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useFilter());
    }).toThrow("useFilter must be used within a FilterProvider");
  });
});
