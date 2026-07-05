import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  cleanup,
} from "@testing-library/react";
import React from "react";
import type { User, Subscription, Plan, PlanFeatures } from "@/types";

// ──────────────────────────────────────────────
// Module-level mocks
// ──────────────────────────────────────────────

const mockUseSearchParams = vi.fn(() => new URLSearchParams());
vi.mock("next/navigation", () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  };
  return {
    useRouter: () => mockRouter,
    usePathname: () => "",
    useSearchParams: () => mockUseSearchParams(),
    notFound: vi.fn(),
  };
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    [key: string]: unknown;
  }) => React.createElement("a", { href, className, ...props }, children),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
    ...props
  }: {
    alt?: string;
    className?: string;
    [key: string]: unknown;
  }) => React.createElement("img", { alt, className, ...props }),
}));

vi.mock("next/script", () => ({
  default: () => null,
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
  Fredoka: () => ({ variable: "--font-fredoka" }),
}));

// ── AuthContext ──
const mockAuth: {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: ReturnType<typeof vi.fn>;
  register: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  loginWithGoogle: ReturnType<typeof vi.fn>;
  handleGoogleCallback: ReturnType<typeof vi.fn>;
  refreshUser: ReturnType<typeof vi.fn>;
} = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  loginWithGoogle: vi.fn(),
  handleGoogleCallback: vi.fn(),
  refreshUser: vi.fn(),
};
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ── SubscriptionContext ──
const mockSub: {
  subscription: Subscription | null;
  plans: Plan[];
  isLoading: boolean;
  isPro: boolean;
  features: PlanFeatures;
  refreshSubscription: ReturnType<typeof vi.fn>;
  createOrder: ReturnType<typeof vi.fn>;
  verifyPayment: ReturnType<typeof vi.fn>;
  validateDiscount: ReturnType<typeof vi.fn>;
  cancelSubscription: ReturnType<typeof vi.fn>;
} = {
  subscription: null,
  plans: [],
  isLoading: false,
  isPro: false,
  features: {
    max_patterns: 3,
    max_visualizers: 2,
    quiz_questions_per_pattern: 3,
    has_quiz_history: false,
    has_code_playground: false,
    has_progress_sync: false,
    has_highlighting: false,
    has_solutions_access: false,
    has_offline_export: false,
  },
  refreshSubscription: vi.fn(),
  createOrder: vi.fn(),
  verifyPayment: vi.fn(),
  validateDiscount: vi.fn(),
  cancelSubscription: vi.fn(),
};
vi.mock("@/contexts/SubscriptionContext", () => ({
  useSubscription: () => mockSub,
  SubscriptionProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ── ProgressContext ──
vi.mock("@/contexts/ProgressContext", () => ({
  useProgress: () => ({
    completed: new Set<string>(),
    isLoading: false,
    toggleComplete: vi.fn(),
    resetProgress: vi.fn(),
    syncFromLocal: vi.fn(),
    celebrationKey: 0,
  }),
  ProgressProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ── FilterContext ──
vi.mock("@/contexts/FilterContext", () => ({
  useFilter: () => ({
    companyFilter: "",
    setCompanyFilter: vi.fn(),
  }),
  FilterProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ── ThemeContext ──
vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark", toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ── HighlightContext ──
vi.mock("@/contexts/HighlightContext", () => ({
  useHighlights: () => ({
    highlights: new Map(),
    isLoading: false,
    createHighlight: vi.fn(),
    updateHighlight: vi.fn(),
    deleteHighlight: vi.fn(),
    getHighlightsForContent: vi.fn(),
    fetchHighlightsForContent: vi.fn(),
    clearHighlights: vi.fn(),
  }),
  HighlightProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ── LanguageContext ──
vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ language: "java", setLanguage: vi.fn() }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ── Child component mocks ──
vi.mock("@/components/layout/Header", () => ({
  default: () =>
    React.createElement("header", { "data-testid": "header" }, "Header"),
}));
vi.mock("@/components/layout/Footer", () => ({
  default: () =>
    React.createElement("footer", { "data-testid": "footer" }, "Footer"),
}));
vi.mock("@/components/patterns/Dashboard", () => ({
  default: ({ questions }: { questions: unknown[] }) =>
    React.createElement(
      "div",
      { "data-testid": "dashboard" },
      `Dashboard: ${questions.length} questions`
    ),
}));
vi.mock("@/components/ui/GoogleButton", () => ({
  GoogleButton: ({
    onClick,
    isLoading,
    text,
  }: {
    onClick?: () => void;
    isLoading?: boolean;
    text?: string;
  }) =>
    React.createElement(
      "button",
      { "data-testid": "google-button", onClick, disabled: isLoading },
      isLoading ? "Loading..." : text || "Continue with Google"
    ),
}));
vi.mock("@/components/pricing/PricingCard", () => ({
  PricingCard: ({
    plan,
    onSelect,
  }: {
    plan: { id: string; name: string };
    onSelect: (plan: unknown) => void;
  }) =>
    React.createElement(
      "button",
      {
        "data-testid": `pricing-card-${plan.id}`,
        onClick: () => onSelect(plan),
      },
      plan.name
    ),
}));
vi.mock("@/components/pricing/CheckoutModal", () => ({
  CheckoutModal: ({ isOpen }: { isOpen?: boolean }) =>
    isOpen
      ? React.createElement(
          "div",
          { "data-testid": "checkout-modal" },
          "Checkout Modal"
        )
      : null,
}));
vi.mock("@/components/articles/SinglePageArticleLayout", () => ({
  default: ({
    article,
    sectionComponents,
  }: {
    article: { slug: string };
    sectionComponents: Record<string, unknown>;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "article-layout" },
      `Article: ${article.slug}, Sections: ${Object.keys(sectionComponents).length}`
    ),
}));
vi.mock("@/components/ui/CodeBlock", () => ({
  default: ({ code }: { code?: string }) =>
    React.createElement(
      "pre",
      { "data-testid": "code-block" },
      code?.slice(0, 50)
    ),
}));
vi.mock("@/components/ui/LanguageToggle", () => ({
  default: ({
    currentLang,
    _onChange,
    languages,
  }: {
    currentLang?: string;
    _onChange?: (lang: string) => void;
    languages?: string[];
  }) =>
    React.createElement(
      "div",
      { "data-testid": "language-toggle" },
      languages?.join(", ") || currentLang
    ),
}));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLdScript: () => null,
  WebsiteJsonLd: () => null,
  OrganizationJsonLd: () => null,
  FAQJsonLd: () => null,
  ArticleJsonLd: () => null,
  BreadcrumbJsonLd: () => null,
}));

// ── Data mocks ──
vi.mock("@/lib/questions", () => ({
  questions: [
    {
      id: "q1",
      name: "Test Question",
      category: "Arrays & Strings",
      companies: ["Google"],
    },
    {
      id: "q2",
      name: "Test Question 2",
      category: "Two Pointers",
      companies: ["Amazon"],
    },
  ],
  categoryToPatternId: {
    "Arrays & Strings": "arrays-strings",
    "Two Pointers": "two-pointers",
  },
}));

const mockArticles: {
  title: string;
  slug: string;
  description: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  difficulty: "intermediate" | "beginner" | "advanced";
  estimatedTime: string;
  tags: string[];
  sections: {
    slug: string;
    title: string;
    description: string;
    order: number;
    estimatedTime: string;
  }[];
}[] = [
  {
    title: "Mastering Recursion",
    slug: "recursion",
    description: "A comprehensive guide to recursion",
    author: "Rishu Kumar",
    authorAvatar: "RK",
    publishedAt: "2026-02-13",
    difficulty: "intermediate",
    estimatedTime: "2 hours",
    tags: ["Recursion", "Fundamentals"],
    sections: [
      {
        slug: "fundamentals",
        title: "Fundamentals",
        description: "Basics",
        order: 1,
        estimatedTime: "20 min",
      },
      {
        slug: "types",
        title: "Types",
        description: "Types of recursion",
        order: 2,
        estimatedTime: "25 min",
      },
    ],
  },
  {
    title: "Recursion vs Backtracking vs DP vs Greedy",
    slug: "algorithm-paradigms",
    description: "Learn how to identify which algorithm paradigm to use",
    author: "Rishu Kumar",
    authorAvatar: "RK",
    publishedAt: "2026-05-02",
    difficulty: "intermediate",
    estimatedTime: "30 min",
    tags: ["Algorithms", "DP"],
    sections: [
      {
        slug: "quick-comparison",
        title: "Quick Comparison",
        description: "Side-by-side",
        order: 1,
        estimatedTime: "5 min",
      },
      {
        slug: "key-differences",
        title: "Key Differences",
        description: "Visual examples",
        order: 2,
        estimatedTime: "8 min",
      },
    ],
  },
];

vi.mock("@/content/articles", () => ({
  articles: mockArticles,
  getArticleBySlug: (slug: string) =>
    mockArticles.find((a: { slug: string }) => a.slug === slug),
}));

vi.mock("@/content/articles/recursion/sections", () => ({
  sections: {
    fundamentals: () =>
      React.createElement("div", null, "Fundamentals Content"),
  },
}));

vi.mock("@/content/articles/algorithm-paradigms/sections", () => ({
  sections: {
    "quick-comparison": () =>
      React.createElement("div", null, "Quick Comparison Content"),
  },
}));

// ── Global stubs ──
beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
  );
  vi.stubGlobal("scrollTo", vi.fn());
  mockAuth.user = null;
  mockAuth.isAuthenticated = false;
  mockAuth.isLoading = false;
  mockSub.isLoading = false;
  mockSub.isPro = false;
  mockSub.subscription = null;
  mockSub.plans = [];
  (vi.mocked(useRouter()).push as ReturnType<typeof vi.fn>).mockClear();
});

afterEach(async () => {
  await act(async () => {
    cleanup();
  });
  vi.unstubAllGlobals();
});

import { useRouter, notFound } from "next/navigation";

// ══════════════════════════════════════════════
// 1. Home page (app/page.tsx)
// ══════════════════════════════════════════════

describe("Home page", () => {
  it("renders the Dashboard with questions", async () => {
    const Home = (await import("@/app/page")).default;
    render(React.createElement(Home));
    expect(screen.getByTestId("dashboard")).toHaveTextContent(
      "Dashboard: 2 questions"
    );
  });

  it("has correct metadata exports", async () => {
    const mod = await import("@/app/page");
    const title =
      typeof mod.metadata.title === "object" &&
      mod.metadata.title !== null &&
      "absolute" in mod.metadata.title
        ? (mod.metadata.title as { absolute: string }).absolute
        : String(mod.metadata.title);
    expect(title).toContain("AlgoPatterns");
    expect(mod.metadata.description).toContain("Master");
  });
});

// ══════════════════════════════════════════════
// 2. Login page (app/login/page.tsx)
// ══════════════════════════════════════════════

describe("Login page", () => {
  beforeEach(() => {
    mockAuth.isLoading = false;
    mockAuth.isAuthenticated = false;
  });

  it("renders the login form with all elements", async () => {
    const LoginPage = (await import("@/app/login/page")).default;
    render(React.createElement(LoginPage));
    expect(
      screen.getByRole("heading", { name: /welcome back/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/continue with email/i)).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create one/i })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(screen.getByText(/continue as guest/i)).toHaveAttribute("href", "/");
    expect(screen.getByTestId("google-button")).toBeInTheDocument();
  });

  it("shows loading spinner when authLoading is true", async () => {
    mockAuth.isLoading = true;
    const LoginPage = (await import("@/app/login/page")).default;
    const { container } = render(React.createElement(LoginPage));
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("returns null when already authenticated", async () => {
    mockAuth.isAuthenticated = true;
    const LoginPage = (await import("@/app/login/page")).default;
    const { container } = render(React.createElement(LoginPage));
    expect(container.innerHTML).toBe("");
  });

  it("redirects authenticated users on mount", async () => {
    mockAuth.isAuthenticated = true;
    mockAuth.isLoading = false;
    const LoginPage = (await import("@/app/login/page")).default;
    render(React.createElement(LoginPage));
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith("/");
    });
  });

  it("displays error message after failed login", async () => {
    mockAuth.isLoading = false;
    mockAuth.isAuthenticated = false;
    mockAuth.login.mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });
    const LoginPage = (await import("@/app/login/page")).default;
    render(React.createElement(LoginPage));
    await act(async () => { // skipcq: JS-0116
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrong" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")! // skipcq: JS-0339
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("navigates to home on successful login", async () => {
    mockAuth.login.mockResolvedValue({ success: true });
    const LoginPage = (await import("@/app/login/page")).default;
    render(React.createElement(LoginPage));
    await act(async () => { // skipcq: JS-0116
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")! // skipcq: JS-0339
      );
    });
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith("/");
    });
  });

  it("toggles password visibility", async () => {
    const LoginPage = (await import("@/app/login/page")).default;
    render(React.createElement(LoginPage));
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");
    const toggleBtn = passwordInput.parentElement!.querySelector("button")!;
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("calls loginWithGoogle when Google button is clicked", async () => {
    mockAuth.loginWithGoogle.mockResolvedValue(undefined);
    const LoginPage = (await import("@/app/login/page")).default;
    render(React.createElement(LoginPage));
    fireEvent.click(screen.getByTestId("google-button"));
    expect(mockAuth.loginWithGoogle).toHaveBeenCalled();
  });

  it("shows loading state on login button during submission", async () => {
    mockAuth.login.mockImplementation(() => new Promise(() => {}));
    const LoginPage = (await import("@/app/login/page")).default;
    const { container } = render(React.createElement(LoginPage));
    await act(async () => { // skipcq: JS-0116
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /sign in/i }).closest("form")! // skipcq: JS-0339
      );
    });
    expect(container.querySelector('button[type="submit"]')).toBeDisabled();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 3. Register page (app/register/page.tsx)
// ══════════════════════════════════════════════

describe("Register page", () => {
  beforeEach(() => {
    mockAuth.isLoading = false;
    mockAuth.isAuthenticated = false;
  });

  it("renders the registration form with all elements", async () => {
    const RegisterPage = (await import("@/app/register/page")).default;
    render(React.createElement(RegisterPage));
    expect(
      screen.getByRole("heading", { name: /create an account/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByText(/continue as guest/i)).toHaveAttribute("href", "/");
    expect(screen.getByTestId("google-button")).toHaveTextContent(
      "Sign up with Google"
    );
  });

  it("shows loading spinner when authLoading is true", async () => {
    mockAuth.isLoading = true;
    const RegisterPage = (await import("@/app/register/page")).default;
    const { container } = render(React.createElement(RegisterPage));
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("returns null when already authenticated", async () => {
    mockAuth.isAuthenticated = true;
    const RegisterPage = (await import("@/app/register/page")).default;
    const { container } = render(React.createElement(RegisterPage));
    expect(container.innerHTML).toBe("");
  });

  it("shows error when passwords do not match", async () => {
    const RegisterPage = (await import("@/app/register/page")).default;
    render(React.createElement(RegisterPage));
    await act(async () => { // skipcq: JS-0116
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "different" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /create account/i }).closest("form")! // skipcq: JS-0339
      );
    });
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  });

  it("shows error when password is too short", async () => {
    const RegisterPage = (await import("@/app/register/page")).default;
    render(React.createElement(RegisterPage));
    await act(async () => { // skipcq: JS-0116
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "short" },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "short" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /create account/i }).closest("form")! // skipcq: JS-0339
      );
    });
    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("handles successful registration", async () => {
    mockAuth.register.mockResolvedValue({ success: true });
    const RegisterPage = (await import("@/app/register/page")).default;
    render(React.createElement(RegisterPage));
    await act(async () => { // skipcq: JS-0116
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "password123" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /create account/i }).closest("form")! // skipcq: JS-0339
      );
    });
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith("/");
    });
  });

  it("handles registration error", async () => {
    mockAuth.register.mockResolvedValue({
      success: false,
      error: "Email already exists",
    });
    const RegisterPage = (await import("@/app/register/page")).default;
    render(React.createElement(RegisterPage));
    await act(async () => { // skipcq: JS-0116
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "existing@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "password123" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /create account/i }).closest("form")! // skipcq: JS-0339
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("shows loading state on submit button while registering", async () => {
    mockAuth.register.mockImplementation(() => new Promise(() => {}));
    const RegisterPage = (await import("@/app/register/page")).default;
    const { container } = render(React.createElement(RegisterPage));
    await act(async () => { // skipcq: JS-0116
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: "Test" },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "test@test.com" },
      });
      fireEvent.change(screen.getByLabelText(/^password$/i), {
        target: { value: "password123" },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: "password123" },
      });
      fireEvent.submit(
        screen.getByRole("button", { name: /create account/i }).closest("form")! // skipcq: JS-0339
      );
    });
    expect(container.querySelector('button[type="submit"]')).toBeDisabled();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("calls loginWithGoogle when Google button is clicked", async () => {
    const RegisterPage = (await import("@/app/register/page")).default;
    render(React.createElement(RegisterPage));
    fireEvent.click(screen.getByTestId("google-button"));
    expect(mockAuth.loginWithGoogle).toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════
// 4. Root layout (app/layout.tsx)
// ══════════════════════════════════════════════

describe("Root layout", () => {
  it("renders children wrapped with providers and layout", async () => {
    const RootLayout = (await import("@/app/layout")).default;
    render(
      React.createElement(
        RootLayout,
        null,
        React.createElement("div", { "data-testid": "child" }, "Content")
      )
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toHaveTextContent("Content");
  });

  it("skips html element check (jsdom limitation)", async () => {
    const RootLayout = (await import("@/app/layout")).default;
    render(
      React.createElement(
        RootLayout,
        null,
        React.createElement("div", { "data-testid": "child" }, "test")
      )
    );
    expect(screen.getByTestId("child")).toHaveTextContent("test");
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("has metadata export", async () => {
    const mod = await import("@/app/layout");
    expect(mod.metadata).toBeDefined();
    expect((mod.metadata.title as { default: string }).default).toContain(
      "AlgoPatterns"
    );
  });
});

// ══════════════════════════════════════════════
// 5. Account page (app/account/page.tsx)
// ══════════════════════════════════════════════

describe("Account page", () => {
  beforeEach(() => {
    mockAuth.user = {
      id: "user-1",
      email: "test@test.com",
      name: "Test User",
      emailVerified: true,
    };
    mockAuth.isAuthenticated = true;
    mockAuth.isLoading = false;
    mockSub.isLoading = false;
    mockSub.isPro = false;
    mockSub.subscription = null;
    mockSub.features = {
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
  });

  it("renders the account page with profile info", async () => {
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(
      screen.getByRole("heading", { name: /account settings/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/test@test.com/)).toBeInTheDocument();
    expect(screen.getByText(/Test User/)).toBeInTheDocument();
    expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
  });

  it("shows subscription section with Free plan", async () => {
    mockSub.subscription = null;
    mockSub.isPro = false;
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(screen.getByText(/subscription/i)).toBeInTheDocument();
    expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
  });

  it("shows Pro subscription details when user is pro", async () => {
    mockSub.isPro = true;
    mockSub.subscription = {
      plan_id: "pro_monthly",
      status: "active",
      current_period_start: "2026-01-01T00:00:00Z",
      current_period_end: "2026-02-01T00:00:00Z",
      cancel_at_period_end: false,
      features: mockSub.features,
    };
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/pro monthly/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel subscription/i)).toBeInTheDocument();
  });

  it("shows cancel modal when cancel button is clicked", async () => {
    mockSub.isPro = true;
    mockSub.subscription = {
      plan_id: "pro_monthly",
      status: "active",
      current_period_start: "2026-01-01T00:00:00Z",
      current_period_end: "2026-02-01T00:00:00Z",
      cancel_at_period_end: false,
      features: mockSub.features,
    };
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    fireEvent.click(screen.getByText(/cancel subscription/i));
    expect(screen.getByText(/we're sorry to see you go/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm cancel/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /keep subscription/i })
    ).toBeInTheDocument();
  });

  it("shows cancelled subscription message when cancel_at_period_end is true", async () => {
    mockSub.isPro = true;
    mockSub.subscription = {
      plan_id: "pro_monthly",
      status: "active",
      current_period_start: "2026-01-01T00:00:00Z",
      current_period_end: "2026-02-01T00:00:00Z",
      cancel_at_period_end: true,
      features: mockSub.features,
    };
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(
      screen.getByText(/your subscription has been cancelled/i)
    ).toBeInTheDocument();
  });

  it("shows lifetime access message for pro_lifetime plan", async () => {
    mockSub.isPro = true;
    mockSub.subscription = {
      plan_id: "pro_lifetime",
      status: "active",
      features: mockSub.features,
    };
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(
      screen.getByText(/lifetime access - no renewal required/i)
    ).toBeInTheDocument();
  });

  it("shows loading state when auth is loading", async () => {
    mockAuth.isLoading = true;
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows loading state when subscription is loading", async () => {
    mockSub.isLoading = true;
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("redirects unauthenticated users", async () => {
    mockAuth.isAuthenticated = false;
    mockAuth.isLoading = false;
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith("/login?redirect=/account");
    });
  });

  it("returns null when not authenticated after redirect", async () => {
    mockAuth.isAuthenticated = false;
    const AccountPage = (await import("@/app/account/page")).default;
    const { container } = render(React.createElement(AccountPage));
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalled();
    });
    expect(container.innerHTML).not.toContain("Account Settings");
  });

  it("calls logout and redirects on sign out", async () => {
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    fireEvent.click(screen.getByText(/sign out/i));
    expect(mockAuth.logout).toHaveBeenCalled();
    expect(useRouter().push).toHaveBeenCalledWith("/");
  });

  it("closes cancel modal when Keep Subscription is clicked", async () => {
    mockSub.isPro = true;
    mockSub.subscription = {
      plan_id: "pro_monthly",
      status: "active",
      current_period_end: "2026-02-01T00:00:00Z",
      cancel_at_period_end: false,
      features: mockSub.features,
    };
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    fireEvent.click(screen.getByText(/cancel subscription/i));
    expect(screen.getByText(/we're sorry to see you go/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /keep subscription/i }));
    expect(
      screen.queryByText(/we're sorry to see you go/i)
    ).not.toBeInTheDocument();
  });

  it("handles cancel subscription error", async () => {
    mockSub.isPro = true;
    mockSub.cancelSubscription.mockResolvedValue({
      success: false,
      error: "Failed to cancel",
    });
    mockSub.subscription = {
      plan_id: "pro_monthly",
      status: "active",
      current_period_end: "2026-02-01T00:00:00Z",
      cancel_at_period_end: false,
      features: mockSub.features,
    };
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    fireEvent.click(screen.getByText(/cancel subscription/i));
    fireEvent.click(screen.getByRole("button", { name: /confirm cancel/i }));
    await waitFor(() => {
      expect(screen.getByText("Failed to cancel")).toBeInTheDocument();
    });
  });

  it("handles successful cancel subscription", async () => {
    mockSub.isPro = true;
    mockSub.cancelSubscription.mockResolvedValue({ success: true });
    mockSub.subscription = {
      plan_id: "pro_monthly",
      status: "active",
      current_period_end: "2026-02-01T00:00:00Z",
      cancel_at_period_end: false,
      features: mockSub.features,
    };
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    fireEvent.click(screen.getByText(/cancel subscription/i));
    fireEvent.click(screen.getByRole("button", { name: /confirm cancel/i }));
    await waitFor(() => {
      expect(
        screen.queryByText(/we're sorry to see you go/i)
      ).not.toBeInTheDocument();
    });
  });

  it("shows features section with correct values", async () => {
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(screen.getByText(/your features/i)).toBeInTheDocument();
    expect(screen.getByText(/3 patterns/)).toBeInTheDocument();
    expect(screen.getByText(/2 visualizers/)).toBeInTheDocument();
    expect(screen.getAllByText(/not available/i).length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("shows unlimited for -1 feature values", async () => {
    mockSub.isPro = true;
    mockSub.features = {
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
    const AccountPage = (await import("@/app/account/page")).default;
    render(React.createElement(AccountPage));
    expect(screen.getAllByText(/unlimited/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/enabled/i).length).toBeGreaterThanOrEqual(1);
  });
});

// ══════════════════════════════════════════════
// 6. Pricing page (app/pricing/page.tsx)
// ══════════════════════════════════════════════

describe("Pricing page", () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = true;
    mockSub.isLoading = false;
    mockSub.plans = [
      {
        id: "free",
        name: "Free",
        price: 0,
        currency: "INR",
        billing_period: "monthly",
        features: {
          max_patterns: 3,
          max_visualizers: 2,
          has_quiz_history: false,
          has_code_playground: false,
          has_progress_sync: false,
          has_highlighting: false,
          has_solutions_access: false,
          has_offline_export: false,
          quiz_questions_per_pattern: 3,
        },
      },
      {
        id: "pro_monthly",
        name: "Pro Monthly",
        price: 49900,
        currency: "INR",
        billing_period: "monthly",
        savings_percentage: 0,
        features: {
          max_patterns: -1,
          max_visualizers: -1,
          has_quiz_history: true,
          has_code_playground: true,
          has_progress_sync: true,
          has_highlighting: true,
          has_solutions_access: true,
          has_offline_export: false,
          quiz_questions_per_pattern: -1,
        },
        is_recommended: true,
      },
      {
        id: "pro_yearly",
        name: "Pro Yearly",
        price: 249900,
        currency: "INR",
        billing_period: "yearly",
        savings_percentage: 50,
        original_price: 499900,
        features: {
          max_patterns: -1,
          max_visualizers: -1,
          has_quiz_history: true,
          has_code_playground: true,
          has_progress_sync: true,
          has_highlighting: true,
          has_solutions_access: true,
          has_offline_export: true,
          quiz_questions_per_pattern: -1,
        },
      },
      {
        id: "pro_lifetime",
        name: "Pro Lifetime",
        price: 999900,
        currency: "INR",
        billing_period: "lifetime",
        savings_percentage: 80,
        original_price: 4999900,
        features: {
          max_patterns: -1,
          max_visualizers: -1,
          has_quiz_history: true,
          has_code_playground: true,
          has_progress_sync: true,
          has_highlighting: true,
          has_solutions_access: true,
          has_offline_export: true,
          quiz_questions_per_pattern: -1,
        },
      },
    ];
    mockSub.subscription = {
      plan_id: "free",
      status: "active",
      features: mockSub.features,
    };
  });

  it("renders pricing page with header", async () => {
    const PricingPage = (await import("@/app/pricing/page")).default;
    render(React.createElement(PricingPage));
    expect(
      screen.getByRole("heading", { name: /choose your plan/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/why upgrade to pro/i)).toBeInTheDocument();
    expect(screen.getByText(/lifetime access promise/i)).toBeInTheDocument();
  });

  it("renders all pricing plan cards", async () => {
    const PricingPage = (await import("@/app/pricing/page")).default;
    render(React.createElement(PricingPage));
    expect(screen.getByTestId("pricing-card-free")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-card-pro_monthly")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-card-pro_yearly")).toBeInTheDocument();
    expect(screen.getByTestId("pricing-card-pro_lifetime")).toBeInTheDocument();
  });

  it("shows loading state", async () => {
    mockSub.isLoading = true;
    const PricingPage = (await import("@/app/pricing/page")).default;
    render(React.createElement(PricingPage));
    expect(screen.getByText(/loading plans/i)).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login on plan select", async () => {
    mockAuth.isAuthenticated = false;
    const PricingPage = (await import("@/app/pricing/page")).default;
    render(React.createElement(PricingPage));
    fireEvent.click(screen.getByTestId("pricing-card-pro_monthly"));
    expect(useRouter().push).toHaveBeenCalledWith("/login?redirect=/pricing");
  });

  it("opens checkout modal when authenticated user clicks a paid plan", async () => {
    const PricingPage = (await import("@/app/pricing/page")).default;
    render(React.createElement(PricingPage));
    expect(screen.queryByTestId("checkout-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("pricing-card-pro_monthly"));
    expect(screen.getByTestId("checkout-modal")).toBeInTheDocument();
  });

  it("does not open checkout for free plan", async () => {
    const PricingPage = (await import("@/app/pricing/page")).default;
    render(React.createElement(PricingPage));
    fireEvent.click(screen.getByTestId("pricing-card-free"));
    expect(screen.queryByTestId("checkout-modal")).not.toBeInTheDocument();
  });

  it("shows success modal after checkout", async () => {
    const PricingPage = (await import("@/app/pricing/page")).default;
    render(React.createElement(PricingPage));
    expect(screen.queryByText(/welcome to pro/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("pricing-card-pro_monthly"));
    expect(screen.getByTestId("checkout-modal")).toBeInTheDocument();
  });

  it("renders Why Upgrade section with feature highlights", async () => {
    const PricingPage = (await import("@/app/pricing/page")).default;
    render(React.createElement(PricingPage));
    expect(screen.getAllByText(/all patterns/i).length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getByText(/interactive visualizers/i)).toBeInTheDocument();
    expect(screen.getByText(/complete solutions/i)).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 7. Pricing layout (app/pricing/layout.tsx)
// ══════════════════════════════════════════════

describe("Pricing layout", () => {
  it("renders children", async () => {
    const PricingLayout = (await import("@/app/pricing/layout")).default;
    render(
      React.createElement(
        PricingLayout,
        null,
        React.createElement(
          "div",
          { "data-testid": "pricing-child" },
          "Pricing Content"
        )
      )
    );
    expect(screen.getByTestId("pricing-child")).toHaveTextContent(
      "Pricing Content"
    );
  });

  it("has correct metadata", async () => {
    const mod = await import("@/app/pricing/layout");
    expect(mod.metadata.title).toContain("Pricing");
    expect(mod.metadata.description).toContain("Choose your AlgoPatterns plan");
    expect(mod.metadata.keywords).toContain("algopatterns pricing");
  });
});

// ══════════════════════════════════════════════
// 8. Interview Cheatsheet page (app/interview-cheatsheet/page.tsx)
// ══════════════════════════════════════════════

describe("Interview Cheatsheet page", () => {
  it("renders the main heading and intro", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(
      screen.getByRole("heading", { name: /interview cheat sheet/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/quick revision guide/i)).toBeInTheDocument();
  });

  it("renders the Golden Rule section", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(
      screen.getByText(/the golden rule: check constraints first/i)
    ).toBeInTheDocument();
  });

  it("renders constraints table", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(screen.getByText(/n ≤ 15/)).toBeInTheDocument();
    expect(screen.getByText(/n ≤ 1,000,000/)).toBeInTheDocument();
    expect(screen.getByText(/O\(n!\) or O\(2\^n\)/)).toBeInTheDocument();
  });

  it("renders pattern selector table", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(screen.getByText(/quick pattern selector/i)).toBeInTheDocument();
    expect(screen.getByText(/sorted array, find pair/i)).toBeInTheDocument();
    expect(screen.getAllByText(/two pointers/i).length).toBeGreaterThanOrEqual(
      1
    );
  });

  it("renders all 14 pattern cards", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(
      screen.getByText(/all patterns with templates/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/1\. Two Pointers/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Sliding Window/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Prefix Sum/)).toBeInTheDocument();
    expect(screen.getByText(/4\. Binary Search/)).toBeInTheDocument();
    expect(screen.getByText(/14\. Linked List/)).toBeInTheDocument();
  });

  it("expands a pattern card when clicked", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(
      screen.queryByText(/Reduces O\(n²\) brute force/)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/1\. Two Pointers/));
    expect(screen.getByText(/Reduces O\(n²\) brute force/)).toBeInTheDocument();
    expect(screen.getByText(/Two Sum II/)).toBeInTheDocument();
  });

  it("collapses a pattern card when clicked again", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    fireEvent.click(screen.getByText(/1\. Two Pointers/));
    expect(screen.getByText(/Reduces O\(n²\) brute force/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/1\. Two Pointers/));
    expect(
      screen.queryByText(/Reduces O\(n²\) brute force/)
    ).not.toBeInTheDocument();
  });

  it("renders keyword to algorithm section", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(screen.getByText(/keyword to algorithm/i)).toBeInTheDocument();
    expect(screen.getByText(/Top K \/ Kth largest/)).toBeInTheDocument();
  });

  it("renders decision tree section", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(screen.getByText(/quick decision tree/i)).toBeInTheDocument();
    expect(screen.getByText(/is it about ARRAYS/i)).toBeInTheDocument();
  });

  it("renders complexity reference table", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(screen.getByText(/complexity reference/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Two Pointers/).length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByText(/O\(n\)/).length).toBeGreaterThan(0);
  });

  it("renders common mistakes section", async () => {
    const CheatsheetPage = (
      await import("@/app/interview-cheatsheet/InterviewCheatsheetClient")
    ).default;
    render(React.createElement(CheatsheetPage));
    expect(screen.getByText(/common mistakes to avoid/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Forgetting to sort the array first/)
    ).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 9. Interview Cheatsheet layout (app/interview-cheatsheet/layout.tsx)
// ══════════════════════════════════════════════

describe("Interview Cheatsheet layout", () => {
  it("renders children", async () => {
    const CheatLayout = (await import("@/app/interview-cheatsheet/layout"))
      .default;
    render(
      React.createElement(
        CheatLayout,
        null,
        React.createElement(
          "div",
          { "data-testid": "cheat-child" },
          "Cheat Sheet Content"
        )
      )
    );
    expect(screen.getByTestId("cheat-child")).toHaveTextContent(
      "Cheat Sheet Content"
    );
  });

  it("has correct metadata", async () => {
    // Metadata moved from layout.tsx to page.tsx for correctness (layout metadata
    // was overridden by page metadata and caused duplicate FAQJsonLd structured data).
    const mod = await import("@/app/interview-cheatsheet/page");
    expect(mod.metadata.title).toContain("Interview Cheatsheet");
    expect(mod.metadata.description as string).toContain("cheatsheet");
  });
});

// ══════════════════════════════════════════════
// 10. Pattern Recognition page (app/pattern-recognition/page.tsx)
// ══════════════════════════════════════════════

describe("Pattern Recognition page", () => {
  it("renders the main heading", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    expect(
      screen.getByRole("heading", { name: /pattern recognition guide/i })
    ).toBeInTheDocument();
  });

  it("renders tab navigation", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    expect(screen.getByText(/quick cheatsheet/i)).toBeInTheDocument();
    expect(screen.getByText(/by constraints/i)).toBeInTheDocument();
    expect(screen.getByText(/by pattern/i)).toBeInTheDocument();
    expect(screen.getByText(/by keywords/i)).toBeInTheDocument();
  });

  it("shows cheatsheet tab by default", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    expect(
      screen.getByText(/the golden rule: check constraints first/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/quick pattern lookup/i)).toBeInTheDocument();
    expect(screen.getByText(/simple decision flow/i)).toBeInTheDocument();
  });

  it("switches to constraints tab", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    fireEvent.click(screen.getByText(/by constraints/i));
    expect(screen.getByText(/n ≤ 20/)).toBeInTheDocument();
    expect(screen.getByText(/n ≤ 3000/)).toBeInTheDocument();
    expect(screen.getByText(/n ≤ 10⁶/)).toBeInTheDocument();
    expect(screen.getByText(/n > 10⁶/)).toBeInTheDocument();
  });

  it("switches between constraint size options", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    fireEvent.click(screen.getByText(/by constraints/i));
    fireEvent.click(screen.getByText(/n ≤ 3000/));
    expect(screen.getByText(/nested loops are ok/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/n > 10⁶/));
    expect(
      screen.getByText(/binary search or math formulas only/i)
    ).toBeInTheDocument();
  });

  it("switches to patterns tab", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    fireEvent.click(screen.getByText(/by pattern/i));
    expect(screen.getByText(/two pointers/i)).toBeInTheDocument();
    expect(screen.getByText(/sliding window/i)).toBeInTheDocument();
    expect(
      screen.getByText(/click a pattern above to see details/i)
    ).toBeInTheDocument();
  });

  it("shows pattern detail when a pattern is selected", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    fireEvent.click(screen.getByText(/by pattern/i));
    fireEvent.click(screen.getByText(/two pointers/i));
    expect(
      screen.getByText(/sorted array, find pairs, palindrome check/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/two sum ii/i)).toBeInTheDocument();
    expect(screen.getByText(/container with most water/i)).toBeInTheDocument();
  });

  it("deselects pattern when clicked again", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    fireEvent.click(screen.getByText(/by pattern/i));
    fireEvent.click(screen.getByRole("button", { name: /two pointers/i }));
    expect(
      screen.getByText(/sorted array, find pairs, palindrome check/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /two pointers/i }));
    expect(
      screen.getByText(/click a pattern above to see details/i)
    ).toBeInTheDocument();
  });

  it("switches to keywords tab", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    fireEvent.click(screen.getByText(/by keywords/i));
    expect(screen.getByText(/dynamic programming/i)).toBeInTheDocument();
    expect(screen.getByText(/"number of ways"/i)).toBeInTheDocument();
    expect(screen.getByText(/"shortest path"/i)).toBeInTheDocument();
  });

  it("displays input-to-pattern mappings in cheatsheet tab", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    expect(screen.getAllByText(/sorted array/i).length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getByText(/unsorted array/i)).toBeInTheDocument();
    expect(screen.getAllByText(/tree/i).length).toBeGreaterThanOrEqual(1);
  });

  it("displays output-to-pattern mappings in cheatsheet tab", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    expect(screen.getByText(/all combinations\/subsets/i)).toBeInTheDocument();
    expect(screen.getByText(/shortest path/i)).toBeInTheDocument();
  });

  it("displays 4-step decision flow", async () => {
    const Page = (
      await import("@/app/pattern-recognition/PatternRecognitionClient")
    ).default;
    render(React.createElement(Page));
    expect(screen.getByText(/check n/i)).toBeInTheDocument();
    expect(screen.getByText(/look at input type/i)).toBeInTheDocument();
    expect(
      screen.getByText(/check what output is needed/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/spot keywords/i)).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 11. Articles index page (app/articles/page.tsx)
// ══════════════════════════════════════════════

describe("Articles index page", () => {
  it("renders the page header", async () => {
    const ArticlesPage = (await import("@/app/articles/page")).default;
    render(React.createElement(ArticlesPage));
    expect(
      screen.getByRole("heading", { name: "Articles", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/deep dives into programming concepts/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/back to home/i)).toBeInTheDocument();
  });

  it("renders all article cards", async () => {
    const ArticlesPage = (await import("@/app/articles/page")).default;
    render(React.createElement(ArticlesPage));
    expect(screen.getByText(/mastering recursion/i)).toBeInTheDocument();
    expect(screen.getByText(/recursion vs backtracking/i)).toBeInTheDocument();
  });

  it("renders article metadata (difficulty, time, author, tags)", async () => {
    const ArticlesPage = (await import("@/app/articles/page")).default;
    render(React.createElement(ArticlesPage));
    expect(screen.getAllByText(/intermediate/).length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByText(/2 hours/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/RK/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rishu Kumar/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Recursion/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders sections preview for each article", async () => {
    const ArticlesPage = (await import("@/app/articles/page")).default;
    render(React.createElement(ArticlesPage));
    expect(screen.getAllByText(/fundamentals/i).length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getByText(/types/i)).toBeInTheDocument();
  });

  it("links articles to their detail pages", async () => {
    const ArticlesPage = (await import("@/app/articles/page")).default;
    render(React.createElement(ArticlesPage));
    const recursionLink = screen.getByText(/mastering recursion/i).closest("a");
    expect(recursionLink).toHaveAttribute("href", "/articles/recursion");
    const paradigmsLink = screen
      .getByText(/recursion vs backtracking/i)
      .closest("a");
    expect(paradigmsLink).toHaveAttribute(
      "href",
      "/articles/algorithm-paradigms"
    );
  });

  it("renders 'More Articles Coming Soon' section", async () => {
    const ArticlesPage = (await import("@/app/articles/page")).default;
    render(React.createElement(ArticlesPage));
    expect(screen.getByText(/more articles coming soon/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /get notified/i })
    ).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 12. Article detail page (app/articles/[slug]/page.tsx)
// ══════════════════════════════════════════════

describe("Article detail page", () => {
  it("renders ArticleOverviewContent for a valid slug", async () => {
    const ArticlePage = (await import("@/app/articles/[slug]/page")).default;
    const element = await ArticlePage({
      params: Promise.resolve({ slug: "recursion" }),
    });
    render(element);
    expect(screen.getByTestId("article-layout")).toHaveTextContent(
      "Article: recursion"
    );
  });

  it("calls notFound for an unknown slug", async () => {
    const notFoundMock = vi.mocked(notFound);
    const ArticlePage = (await import("@/app/articles/[slug]/page")).default;
    await ArticlePage({ params: Promise.resolve({ slug: "nonexistent" }) });
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("generates static params from articles", async () => {
    const mod = await import("@/app/articles/[slug]/page");
    const params = mod.generateStaticParams();
    expect(params).toEqual([
      { slug: "recursion" },
      { slug: "algorithm-paradigms" },
    ]);
  });
});

// ══════════════════════════════════════════════
// 13. ArticleOverviewContent (app/articles/[slug]/ArticleOverviewContent.tsx)
// ══════════════════════════════════════════════

describe("ArticleOverviewContent", () => {
  it("renders SinglePageArticleLayout with correct article", async () => {
    const ArticleOverviewContent = (
      await import("@/app/articles/[slug]/ArticleOverviewContent")
    ).default;
    const article = mockArticles[0];
    render(React.createElement(ArticleOverviewContent, { article }));
    expect(screen.getByTestId("article-layout")).toHaveTextContent(
      "Article: recursion"
    );
  });

  it("maps section components for recursion article", async () => {
    const ArticleOverviewContent = (
      await import("@/app/articles/[slug]/ArticleOverviewContent")
    ).default;
    const article = mockArticles[0];
    render(React.createElement(ArticleOverviewContent, { article }));
    await waitFor(() => {
      expect(screen.getByTestId("article-layout")).toHaveTextContent(
        "Article: recursion"
      );
    });
  });

  it("returns empty section components for unknown slug", async () => {
    const ArticleOverviewContent = (
      await import("@/app/articles/[slug]/ArticleOverviewContent")
    ).default;
    const unknownArticle = {
      ...mockArticles[0],
      slug: "unknown-article",
    };
    render(
      React.createElement(ArticleOverviewContent, { article: unknownArticle })
    );
    await waitFor(() => {
      expect(screen.getByTestId("article-layout")).toHaveTextContent(
        "Sections: 0"
      );
    });
  });
});

// ══════════════════════════════════════════════
// 14. Google callback page (app/auth/google/callback/page.tsx)
// ══════════════════════════════════════════════

describe("Google callback page", () => {
  beforeEach(() => {
    mockAuth.isAuthenticated = false;
    mockAuth.handleGoogleCallback.mockReset();
    mockAuth.handleGoogleCallback.mockResolvedValue({ success: true });
    mockUseSearchParams.mockReset();
    const searchParams = new URLSearchParams();
    searchParams.set("code", "test-code");
    searchParams.set("state", "test-state");
    mockUseSearchParams.mockReturnValue(searchParams);
  });

  it("shows loading state while processing callback", async () => {
    mockAuth.handleGoogleCallback.mockResolvedValue({ success: true });
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    await waitFor(() => {
      expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
      expect(
        screen.getByText(/please wait while we complete your Google sign in/i)
      ).toBeInTheDocument();
    });
    await act(async () => {
      await expect(mockAuth.handleGoogleCallback).toHaveBeenCalled();
    });
  });

  it("shows error when error param is present", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("error", "access_denied");
    mockUseSearchParams.mockReturnValue(searchParams);
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    await waitFor(() => {
      expect(
        screen.getByText(/Google login was cancelled or failed/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  it("shows error when code and state are missing", async () => {
    const searchParams = new URLSearchParams();
    mockUseSearchParams.mockReturnValue(searchParams);
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    await waitFor(() => {
      expect(screen.getByText(/invalid callback/i)).toBeInTheDocument();
    });
  });

  it("redirects when already authenticated", async () => {
    mockAuth.isAuthenticated = true;
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith("/");
    });
  });

  it("calls handleGoogleCallback on mount", async () => {
    mockAuth.handleGoogleCallback.mockResolvedValue({ success: true });
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    await waitFor(() => {
      expect(mockAuth.handleGoogleCallback).toHaveBeenCalledWith(
        "test-code",
        "test-state"
      );
    });
  });

  it("navigates to home on successful callback", async () => {
    mockAuth.handleGoogleCallback.mockResolvedValue({ success: true });
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    await waitFor(() => {
      expect(useRouter().push).toHaveBeenCalledWith("/");
    });
  });

  it("shows error on failed callback", async () => {
    mockAuth.handleGoogleCallback.mockResolvedValue({
      success: false,
      error: "Token exchange failed",
    });
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    await waitFor(() => {
      expect(screen.getByText(/token exchange failed/i)).toBeInTheDocument();
    });
  });

  it("shows back to login button on error", async () => {
    const searchParams = new URLSearchParams();
    searchParams.set("error", "access_denied");
    mockUseSearchParams.mockReturnValue(searchParams);
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    await waitFor(() => {
      const backBtn = screen.getByText(/back to login/i);
      expect(backBtn).toBeInTheDocument();
    });
  });

  it("renders the callback content inside Suspense", async () => {
    mockAuth.handleGoogleCallback.mockResolvedValue({ success: true });
    const GoogleCallbackPage = (await import("@/app/auth/google/callback/page"))
      .default;
    render(React.createElement(GoogleCallbackPage));
    expect(screen.getByText(/completing sign in/i)).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════
// 15. Expand Around Center guide (app/guides/expand-around-center/page.tsx)
// ══════════════════════════════════════════════

describe("Expand Around Center guide", () => {
  it("renders the breadcrumb", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(screen.getByText(/← back to problems/i)).toBeInTheDocument();
  });

  it("renders the main heading with badges", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(
      screen.getByRole("heading", { name: /expand around center pattern/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/medium/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/string pattern/i)).toBeInTheDocument();
  });

  it("renders table of contents with all links", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(screen.getByText(/in this guide/i)).toBeInTheDocument();
    expect(screen.getAllByText(/core idea/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/key insight: types of centers/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/algorithm/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/complexity analysis/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/code template/i).length).toBeGreaterThanOrEqual(
      1
    );
    expect(
      screen.getAllByText(/problems to practice/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/when to use \/ not use/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/common mistakes/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders core idea section", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(
      screen.getByText(/a palindrome reads the same forwards and backwards/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/think of it like dropping a pebble in water/i)
    ).toBeInTheDocument();
  });

  it("renders key insight section with odd and even length palindromes", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(screen.getByText(/odd length palindromes/i)).toBeInTheDocument();
    expect(screen.getByText(/even length palindromes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/call:/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders algorithm steps", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(
      screen.getByText(/for each index i from 0 to n-1:/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/call expand\(i, i\) for odd-length palindromes/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/call expand\(i, i\+1\) for even-length palindromes/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/in expand\(\): while characters match, expand outward/i)
    ).toBeInTheDocument();
  });

  it("renders complexity analysis section", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(screen.getByText(/time: O\(n²\)/i)).toBeInTheDocument();
    expect(screen.getByText(/space: O\(1\)/i)).toBeInTheDocument();
  });

  it("renders code template with language toggle", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(screen.getByTestId("language-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("code-block")).toBeInTheDocument();
  });

  it("renders problems to practice section", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(
      screen.getAllByText(/palindromic substrings/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/longest palindromic substring/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/valid palindrome ii/i)).toBeInTheDocument();
  });

  it("renders when to use / not use section", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(screen.getByText(/use this pattern/i)).toBeInTheDocument();
    expect(
      screen.getByText(/don't use \(use dp instead\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/key distinction:/i)).toBeInTheDocument();
  });

  it("renders common mistakes section", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(
      screen.getByText(/forgetting the even-length case/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/wrong boundary checks in expand\(\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/confusing substring vs subsequence/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/off-by-one in calculating start\/end indices/i)
    ).toBeInTheDocument();
  });

  it("renders advanced note about Manacher's algorithm", async () => {
    const Guide = (
      await import("@/app/guides/expand-around-center/ExpandAroundCenterClient")
    ).default;
    render(React.createElement(Guide));
    expect(
      screen.getByText(/advanced: manacher's algorithm/i)
    ).toBeInTheDocument();
  });
});
