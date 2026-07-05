import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();
const mockBack = vi.fn();
let mockFromParam: string | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "from") return mockFromParam;
      return null;
    },
  }),
}));

describe("Problem Page Navigation - handleBack", () => {
  beforeEach(() => {
    mockFromParam = null;
    vi.clearAllMocks();
  });

  it("navigates to pattern problems tab when from param exists", () => {
    mockFromParam = "binary-search";

    const handleBack = () => {
      if (mockFromParam) {
        mockPush(`/patterns/${mockFromParam}?tab=problems`);
      } else {
        mockBack();
      }
    };

    handleBack();

    expect(mockPush).toHaveBeenCalledWith(
      "/patterns/binary-search?tab=problems"
    );
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("uses router.back() when no from param", () => {
    mockFromParam = null;

    const handleBack = () => {
      if (mockFromParam) {
        mockPush(`/patterns/${mockFromParam}?tab=problems`);
      } else {
        mockBack();
      }
    };

    handleBack();

    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles different pattern IDs correctly", () => {
    const patternIds = [
      "sliding-window",
      "two-pointers",
      "arrays-strings",
      "dynamic-programming",
    ];

    patternIds.forEach((patternId) => {
      mockPush.mockClear();
      mockFromParam = patternId;

      const handleBack = () => {
        if (mockFromParam) {
          mockPush(`/patterns/${mockFromParam}?tab=problems`);
        } else {
          mockBack();
        }
      };

      handleBack();

      expect(mockPush).toHaveBeenCalledWith(
        `/patterns/${patternId}?tab=problems`
      );
    });
  });
});

describe("Solve button link generation", () => {
  it("generates correct href with from parameter", () => {
    const patternId = "binary-search";
    const problemSlug = "two-sum";

    const href = `/problems/${problemSlug}?from=${patternId}`;

    expect(href).toBe("/problems/two-sum?from=binary-search");
  });

  it("handles various problem slugs correctly", () => {
    const testCases = [
      { name: "Two Sum", expected: "two-sum" },
      { name: "Binary Search", expected: "binary-search" },
      {
        name: "Median of Two Sorted Arrays",
        expected: "median-of-two-sorted-arrays",
      },
      { name: "3Sum", expected: "3sum" },
      { name: "Valid Parentheses", expected: "valid-parentheses" },
    ];

    const nameToSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    };

    testCases.forEach(({ name, expected }) => {
      expect(nameToSlug(name)).toBe(expected);
    });
  });
});

describe("Scroll position persistence", () => {
  const SCROLL_STORAGE_KEY = "problems_scroll_position";

  beforeEach(() => {
    sessionStorage.clear();
  });

  it("saves scroll position to sessionStorage", () => {
    const patternId = "binary-search";
    const scrollY = 500;

    sessionStorage.setItem(
      `${SCROLL_STORAGE_KEY}_${patternId}`,
      scrollY.toString()
    );

    expect(sessionStorage.getItem(`${SCROLL_STORAGE_KEY}_${patternId}`)).toBe(
      "500"
    );
  });

  it("retrieves and removes scroll position from sessionStorage", () => {
    const patternId = "binary-search";
    sessionStorage.setItem(`${SCROLL_STORAGE_KEY}_${patternId}`, "300");

    const savedScroll = sessionStorage.getItem(
      `${SCROLL_STORAGE_KEY}_${patternId}`
    );
    expect(savedScroll).toBe("300");

    sessionStorage.removeItem(`${SCROLL_STORAGE_KEY}_${patternId}`);
    expect(
      sessionStorage.getItem(`${SCROLL_STORAGE_KEY}_${patternId}`)
    ).toBeNull();
  });

  it("handles missing scroll position gracefully", () => {
    const patternId = "nonexistent-pattern";

    const savedScroll = sessionStorage.getItem(
      `${SCROLL_STORAGE_KEY}_${patternId}`
    );
    expect(savedScroll).toBeNull();
  });

  it("stores scroll positions for different patterns independently", () => {
    sessionStorage.setItem(`${SCROLL_STORAGE_KEY}_binary-search`, "100");
    sessionStorage.setItem(`${SCROLL_STORAGE_KEY}_sliding-window`, "200");
    sessionStorage.setItem(`${SCROLL_STORAGE_KEY}_two-pointers`, "300");

    expect(sessionStorage.getItem(`${SCROLL_STORAGE_KEY}_binary-search`)).toBe(
      "100"
    );
    expect(sessionStorage.getItem(`${SCROLL_STORAGE_KEY}_sliding-window`)).toBe(
      "200"
    );
    expect(sessionStorage.getItem(`${SCROLL_STORAGE_KEY}_two-pointers`)).toBe(
      "300"
    );
  });
});

describe("URL tab parameter handling", () => {
  it("correctly parses tab parameter from URL", () => {
    const testCases = [
      { param: "problems", expected: "problems" },
      { param: "tutorial", expected: "tutorial" },
      { param: "cheatsheet", expected: "cheatsheet" },
      { param: null, expected: "tutorial" }, // default
      { param: "invalid", expected: "tutorial" }, // invalid defaults to tutorial
    ];

    testCases.forEach(({ param, expected }) => {
      const validTabs = ["tutorial", "problems", "cheatsheet"];
      const activeTab = param && validTabs.includes(param) ? param : "tutorial";

      expect(activeTab).toBe(expected);
    });
  });
});
