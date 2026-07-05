import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import type { ReactNode } from "react";

const originalLocalStorage = globalThis.localStorage;
const originalClassList = document.documentElement.classList;

beforeEach(() => {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const k in store) delete store[k];
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_index: number) => null),
  };

  Object.defineProperty(globalThis, "localStorage", {
    value: mockLocalStorage,
    writable: true,
    configurable: true,
  });

  // Use a fresh DOMTokenList-like mock for classList
  const classSet = new Set<string>();
  const classListMock = {
    add: vi.fn((...tokens: string[]) => {
      for (const t of tokens) classSet.add(t);
    }),
    remove: vi.fn((...tokens: string[]) => {
      for (const t of tokens) classSet.delete(t);
    }),
    contains: vi.fn((token: string) => classSet.has(token)),
    get length() {
      return classSet.size;
    },
    toString: () => [...classSet].join(" "),
    value: "",
    entries: () => classSet.values(),
    forEach: (cb: (v: string) => void) => classSet.forEach(cb),
    item: (index: number) => [...classSet][index] || null,
    keys: () => classSet.values(),
    values: () => classSet.values(),
    [Symbol.iterator]: function* () {
      yield* classSet;
    },
  };

  Object.defineProperty(document, "documentElement", {
    value: { classList: classListMock },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: originalLocalStorage,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(document, "documentElement", {
    value: { classList: originalClassList },
    writable: true,
    configurable: true,
  });
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeContext", () => {
  describe("initial state", () => {
    it("should default theme to dark", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

      expect(result.current.theme).toBe("dark");
    });

    it("should apply dark class to documentElement on mount", () => {
      renderHook(() => useTheme(), { wrapper: Wrapper });

      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        "dark"
      );
    });

    it("should persist theme to localStorage on mount", () => {
      renderHook(() => useTheme(), { wrapper: Wrapper });

      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
        "theme",
        "dark"
      );
    });
  });

  describe("localStorage restore", () => {
    it("should restore theme from localStorage when saved", () => {
      globalThis.localStorage.getItem = vi.fn((key: string) =>
        key === "theme" ? "light" : null
      );

      const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

      // Effect runs after mount, so we need to wait for state to update
      act(() => {
        // Effects flush synchronously in test
      });

      expect(result.current.theme).toBe("light");
    });

    it("should fall back to dark when no theme saved in localStorage", () => {
      globalThis.localStorage.getItem = vi.fn(() => null);

      const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

      expect(result.current.theme).toBe("dark");
    });
  });

  describe("toggleTheme", () => {
    it("should toggle from dark to light", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

      expect(result.current.theme).toBe("dark");

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("light");
    });

    it("should toggle from light back to dark", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe("light");

      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe("dark");
    });

    it("should update localStorage on toggle", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

      act(() => {
        result.current.toggleTheme();
      });

      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
        "theme",
        "light"
      );
    });

    it("should update documentElement classList on toggle", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

      act(() => {
        result.current.toggleTheme();
      });

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
        "light",
        "dark"
      );
      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        "light"
      );
    });
  });

  describe("multiple toggles", () => {
    it("should toggle correctly multiple times", () => {
      const { result } = renderHook(() => useTheme(), { wrapper: Wrapper });

      const expectedSequence = ["light", "dark", "light", "dark", "light"];

      for (const expected of expectedSequence) {
        act(() => {
          result.current.toggleTheme();
        });
        expect(result.current.theme).toBe(expected);
      }
    });
  });

  describe("renders children", () => {
    it("should render children passed to provider", () => {
      const { container } = render(
        <ThemeProvider>
          <div data-testid="child">child content</div>
        </ThemeProvider>
      );

      expect(container.innerHTML).toContain("child content");
    });
  });
});

describe("useTheme hook", () => {
  it("should throw error when used outside provider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used within a ThemeProvider");
  });
});
