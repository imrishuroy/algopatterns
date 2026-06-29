import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import type { ReactNode } from "react";
import type { ArticleMeta } from "@/content/articles";
import type { QuizQuestion } from "@/types/quiz";
import type { Pattern, Concept } from "@/types";

// Hoisted mock constructors (available in vi.mock factories)

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockUseProgress = vi.hoisted(() => vi.fn());
const mockUseFilter = vi.hoisted(() => vi.fn());
const mockUseTheme = vi.hoisted(() => vi.fn());
const mockUseIsMobile = vi.hoisted(() => vi.fn());
const mockUsePathname = vi.hoisted(() => vi.fn(() => "/"));
const mockGetQuestions = vi.hoisted(() => vi.fn());
const mockStartAttempt = vi.hoisted(() => vi.fn());
const mockSubmitResponse = vi.hoisted(() => vi.fn());
const mockCompleteAttempt = vi.hoisted(() => vi.fn());

// Global vi.mock declarations (hoisted to top)

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock("@/lib/quizService", () => ({
  quizService: {
    getQuestions: mockGetQuestions,
    startAttempt: mockStartAttempt,
    submitResponse: mockSubmitResponse,
    completeAttempt: mockCompleteAttempt,
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/contexts/ProgressContext", () => ({
  useProgress: () => mockUseProgress(),
}));

vi.mock("@/contexts/FilterContext", () => ({
  useFilter: () => mockUseFilter(),
}));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => mockUseTheme(),
}));

vi.mock("@/hooks/useMediaQuery", () => ({
  useIsMobile: () => mockUseIsMobile(),
}));

// Test data

const mockArticle: ArticleMeta = {
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
      title: "Fundamentals of Recursion",
      description: "Learn the basics",
      order: 1,
      estimatedTime: "20 min",
    },
    {
      slug: "types",
      title: "Types of Recursion",
      description: "Explore types",
      order: 2,
      estimatedTime: "25 min",
    },
  ],
};

const mockPattern: Pattern = {
  id: "binary-search",
  category: "Binary Search",
  difficulty: "Medium",
  description: "Binary search description",
  whenToUse: ["Sorted array"],
  codeTemplates: { java: "", python: "", cpp: "", javascript: "" },
  keyInsights: [],
  commonProblems: [],
  timeComplexity: "O(log n)",
  spaceComplexity: "O(1)",
  variations: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const mockQuizQuestion: QuizQuestion = {
  id: "q1",
  patternId: "pattern-1",
  type: "multiple-choice",
  difficulty: "medium",
  questionText: "What is recursion?",
  options: [
    "A loop",
    "A function calling itself",
    "A data structure",
    "An algorithm",
  ],
  displayOrder: 1,
};

// Helpers

function stubMatchMedia(matches = false) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function stubIntersectionObserver() {
  class MockIO {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  vi.stubGlobal("IntersectionObserver", MockIO);
}

beforeEach(() => {
  stubMatchMedia(false);
  window.scrollTo = vi.fn();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

// Footer

describe("Footer", () => {
  it("renders the branding text", async () => {
    const Footer = (await import("@/components/layout/Footer")).default;
    render(<Footer />);
    expect(
      screen.getByText("AlgoPatterns - Interactive Algorithm Visualizations"),
    ).toBeInTheDocument();
  });

  it("renders the version number", async () => {
    const Footer = (await import("@/components/layout/Footer")).default;
    render(<Footer />);
    expect(screen.getByText("v1.1.0")).toBeInTheDocument();
  });

  it("has a footer element", async () => {
    const Footer = (await import("@/components/layout/Footer")).default;
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});

// QuoteSection

describe("QuoteSection", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.mocked(Math.random).mockRestore();
  });

  it("renders a quote text", async () => {
    const QuoteSection = (await import("@/components/QuoteSection")).default;
    const { container } = render(<QuoteSection />);
    await waitFor(() => {
      expect(container.textContent).toContain("Engineering problems");
    });
  });

  it("renders the author name", async () => {
    const QuoteSection = (await import("@/components/QuoteSection")).default;
    const { container } = render(<QuoteSection />);
    await waitFor(() => {
      expect(container.textContent).toContain("Sir Ove Arup");
    });
  });

  it("renders a blockquote element", async () => {
    const QuoteSection = (await import("@/components/QuoteSection")).default;
    const { container } = render(<QuoteSection />);
    expect(container.querySelector("blockquote")).toBeInTheDocument();
  });

  it("uses curly quotes", async () => {
    const QuoteSection = (await import("@/components/QuoteSection")).default;
    const { container } = render(<QuoteSection />);
    const p = container.querySelector("blockquote p");
    expect(p?.innerHTML).toContain("\u201c");
    expect(p?.innerHTML).toContain("\u201d");
  });

  it("picks a random quote via useEffect", async () => {
    vi.mocked(Math.random).mockRestore();
    vi.spyOn(Math, "random").mockReturnValue(15 / 61);
    const QuoteSection = (await import("@/components/QuoteSection")).default;
    const { container } = render(<QuoteSection />);
    await waitFor(() => {
      expect(container.textContent).toContain("Opportunity is missed");
    });
  });
});

// JsonLd

describe("JsonLd", () => {
  it("WebsiteJsonLd renders script tag with correct type", async () => {
    const { WebsiteJsonLd } = await import("@/components/seo/JsonLd");
    const { container } = render(<WebsiteJsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
  });

  it("WebsiteJsonLd has WebSite type and SearchAction", async () => {
    const { WebsiteJsonLd } = await import("@/components/seo/JsonLd");
    const { container } = render(<WebsiteJsonLd />);
    const json = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.innerHTML || "{}");
    expect(json["@type"]).toBe("WebSite");
    expect(json.potentialAction["@type"]).toBe("SearchAction");
  });

  it("OrganizationJsonLd renders with Organization type", async () => {
    const { OrganizationJsonLd } = await import("@/components/seo/JsonLd");
    const { container } = render(<OrganizationJsonLd />);
    const json = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.innerHTML || "{}");
    expect(json["@type"]).toBe("Organization");
    expect(json.sameAs).toHaveLength(2);
  });

  it("CourseJsonLd renders with Course type", async () => {
    const { CourseJsonLd } = await import("@/components/seo/JsonLd");
    const { container } = render(<CourseJsonLd pattern={mockPattern} />);
    const json = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.innerHTML || "{}");
    expect(json["@type"]).toBe("Course");
    expect(json.teaches).toEqual(["Sorted array"]);
    expect(json.isAccessibleForFree).toBe(true);
  });

  it("FAQJsonLd renders FAQPage", async () => {
    const { FAQJsonLd } = await import("@/components/seo/JsonLd");
    const faqs = [
      { question: "Q1?", answer: "A1." },
      { question: "Q2?", answer: "A2." },
    ];
    const { container } = render(<FAQJsonLd faqs={faqs} />);
    const json = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.innerHTML || "{}");
    expect(json["@type"]).toBe("FAQPage");
    expect(json.mainEntity).toHaveLength(2);
    expect(json.mainEntity[0]["@type"]).toBe("Question");
  });

  it("BreadcrumbJsonLd renders BreadcrumbList", async () => {
    const { BreadcrumbJsonLd } = await import("@/components/seo/JsonLd");
    const items = [
      { name: "Home", url: "/" },
      { name: "Patterns", url: "/patterns" },
    ];
    const { container } = render(<BreadcrumbJsonLd items={items} />);
    const json = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.innerHTML || "{}");
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement[0].position).toBe(1);
  });

  it("ConceptJsonLd renders TechArticle", async () => {
    const { ConceptJsonLd } = await import("@/components/seo/JsonLd");
    const mockConcept: Concept = {
      id: "recursion", name: "Recursion", slug: "recursion",
      category: "Java Fundamentals", description: "concept",
      whenToUse: [], codeSnippets: { java: "", python: "", cpp: "", javascript: "" },
      createdAt: "2024-01-01", updatedAt: "2024-01-02", timeComplexity: "O(n)",
    };
    const { container } = render(<ConceptJsonLd concept={mockConcept} />);
    const json = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.innerHTML || "{}");
    expect(json["@type"]).toBe("TechArticle");
    expect(json.headline).toBe("Recursion");
  });

  it("ArticleJsonLd renders Article with author", async () => {
    const { ArticleJsonLd } = await import("@/components/seo/JsonLd");
    const { container } = render(
      <ArticleJsonLd title="Test" description="A" url="/test" datePublished="2024-01-01" author="TA" />,
    );
    const json = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.innerHTML || "{}");
    expect(json["@type"]).toBe("Article");
    expect(json.author.name).toBe("TA");
  });
});

// HeaderProgress

describe("HeaderProgress", () => {
  beforeEach(() => {
    mockUseProgress.mockReturnValue({
      completed: new Set<string>(),
      isLoading: false,
    });
  });

  it("shows 0% when nothing is completed", async () => {
    const HeaderProgress = (await import("@/components/layout/HeaderProgress")).default;
    render(<HeaderProgress />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows Completed label", async () => {
    const HeaderProgress = (await import("@/components/layout/HeaderProgress")).default;
    render(<HeaderProgress />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("shows count as 0 / total", async () => {
    const HeaderProgress = (await import("@/components/layout/HeaderProgress")).default;
    render(<HeaderProgress />);
    expect(screen.getByText(/0 \/ \d+/)).toBeInTheDocument();
  });

  it("renders an SVG with progress circles", async () => {
    const HeaderProgress = (await import("@/components/layout/HeaderProgress")).default;
    const { container } = render(<HeaderProgress />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelectorAll("circle")).toHaveLength(2);
  });

  it("shows percentage text", async () => {
    const HeaderProgress = (await import("@/components/layout/HeaderProgress")).default;
    render(<HeaderProgress />);
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });
});

// Header

describe("Header", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      logout: vi.fn().mockResolvedValue(undefined),
    });
    mockUseProgress.mockReturnValue({
      completed: new Set<string>(),
    });
    mockUseFilter.mockReturnValue({
      companyFilter: "",
      setCompanyFilter: vi.fn(),
    });
    mockUseTheme.mockReturnValue({
      theme: "dark",
      toggleTheme: vi.fn(),
    });
    mockUseIsMobile.mockReturnValue(false);
  });

  it("renders the logo/brand text", async () => {
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    expect(screen.getByText("algo patterns")).toBeInTheDocument();
  });

  it("renders the logo image", async () => {
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    const img = screen.getByAltText("Algo Patterns");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/logo.png");
  });

  it("shows navigation links", async () => {
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    expect(screen.getByText("Fundamentals")).toBeInTheDocument();
    expect(screen.getByText("Pattern Recognition")).toBeInTheDocument();
    expect(screen.getByText("Interview Cheat Sheet")).toBeInTheDocument();
    expect(screen.getByText("Articles")).toBeInTheDocument();
  });

  it("shows Sign in button when not authenticated", async () => {
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("shows theme toggle with dark mode title", async () => {
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    expect(screen.getByTitle("Switch to light mode")).toBeInTheDocument();
  });

  it("shows theme toggle with light mode title", async () => {
    mockUseTheme.mockReturnValue({ theme: "light", toggleTheme: vi.fn() });
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    expect(screen.getByTitle("Switch to dark mode")).toBeInTheDocument();
  });

  it("shows user avatar initials when authenticated", async () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test User", email: "test@test.com" },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn().mockResolvedValue(undefined),
    });
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  it("shows dropdown when avatar is clicked", async () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test User", email: "test@test.com" },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn().mockResolvedValue(undefined),
    });
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    fireEvent.click(screen.getByText("TU"));
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("calls logout when Sign out is clicked", async () => {
    const logoutMock = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: { name: "Test User", email: "test@test.com" },
      isAuthenticated: true,
      isLoading: false,
      logout: logoutMock,
    });
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    fireEvent.click(screen.getByText("TU"));
    fireEvent.click(screen.getByText("Sign out"));
    expect(logoutMock).toHaveBeenCalled();
  });

  it("closes dropdown on outside click", async () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Test User", email: "test@test.com" },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn().mockResolvedValue(undefined),
    });
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    fireEvent.click(screen.getByText("TU"));
    expect(screen.getByText("Test User")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText("Test User")).not.toBeInTheDocument();
    });
  });

  it("shows loading skeleton when auth is loading", async () => {
    mockUseAuth.mockReturnValue({
      user: null, isAuthenticated: false, isLoading: true,
      logout: vi.fn(),
    });
    const Header = (await import("@/components/layout/Header")).default;
    const { container } = render(<Header />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("toggles mobile menu on hamburger click", async () => {
    mockUseIsMobile.mockReturnValue(true);
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    fireEvent.click(screen.getByLabelText("Toggle menu"));
    expect(screen.getAllByText("Fundamentals")).toHaveLength(2);
  });

  it("shows company filter text when set", async () => {
    mockUseFilter.mockReturnValue({ companyFilter: "Google", setCompanyFilter: vi.fn() });
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("calls toggleTheme when theme button clicked", async () => {
    const toggleThemeMock = vi.fn();
    mockUseTheme.mockReturnValue({ theme: "dark", toggleTheme: toggleThemeMock });
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    fireEvent.click(screen.getByTitle("Switch to light mode"));
    expect(toggleThemeMock).toHaveBeenCalled();
  });

  it("shows progress bar with completed/total count", async () => {
    const Header = (await import("@/components/layout/Header")).default;
    const { container } = render(<Header />);
    expect(container.textContent).toMatch(/0\/\d+/);
  });

  it("uses email-derived name for avatar when name is missing", async () => {
    mockUseAuth.mockReturnValue({
      user: { name: undefined, email: "john@test.com" },
      isAuthenticated: true, isLoading: false,
      logout: vi.fn().mockResolvedValue(undefined),
    });
    const Header = (await import("@/components/layout/Header")).default;
    render(<Header />);
    expect(screen.getByText("J")).toBeInTheDocument();
    fireEvent.click(screen.getByText("J"));
    expect(screen.getByText("john")).toBeInTheDocument();
  });
});

// ArticleLayout

describe("ArticleLayout", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/articles/recursion");
  });

  it("renders article title in sidebar", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    const { container } = render(
      <ArticleLayout article={mockArticle}><div>Content</div></ArticleLayout>,
    );
    expect(container.textContent).toContain("Mastering Recursion");
  });

  it("renders children content", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    render(
      <ArticleLayout article={mockArticle}>
        <div data-testid="content">Article content here</div>
      </ArticleLayout>,
    );
    expect(screen.getByTestId("content")).toHaveTextContent("Article content here");
  });

  it("shows difficulty badge", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    const { container } = render(<ArticleLayout article={mockArticle}><div>Content</div></ArticleLayout>);
    expect(container.textContent).toContain("intermediate");
  });

  it("shows estimated time", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    render(<ArticleLayout article={mockArticle}><div>Content</div></ArticleLayout>);
    expect(screen.getByText("2 hours")).toBeInTheDocument();
  });

  it("shows sections in sidebar", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    render(<ArticleLayout article={mockArticle}><div>Content</div></ArticleLayout>);
    expect(screen.getByText("Fundamentals of Recursion")).toBeInTheDocument();
    expect(screen.getByText("Types of Recursion")).toBeInTheDocument();
  });

  it("highlights active section", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    render(
      <ArticleLayout article={mockArticle} currentSection="fundamentals"><div>Content</div></ArticleLayout>,
    );
    const links = screen.getAllByText("Fundamentals of Recursion");
    const activeLink = links.find((l) => l.closest("a")?.className.includes("bg-indigo-500/20"));
    expect(activeLink?.closest("a")?.className).toContain("bg-indigo-500/20");
  });

  it("shows breadcrumb with article title", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    const { container } = render(<ArticleLayout article={mockArticle}><div>Content</div></ArticleLayout>);
    expect(container.textContent).toContain("Articles");
    expect(container.textContent).toContain("Mastering Recursion");
  });

  it("shows current section in breadcrumb", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    const { container } = render(
      <ArticleLayout article={mockArticle} currentSection="types"><div>Content</div></ArticleLayout>,
    );
    expect(container.textContent).toContain("Types of Recursion");
  });

  it("shows next navigation on first section (no previous)", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    const { container } = render(
      <ArticleLayout article={mockArticle} currentSection="fundamentals"><div>Content</div></ArticleLayout>,
    );
    expect(container.textContent).toContain("Next");
    expect(container.textContent).not.toContain("Previous");
  });

  it("shows previous section link for non-first section", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    const { container } = render(
      <ArticleLayout article={mockArticle} currentSection="types"><div>Content</div></ArticleLayout>,
    );
    expect(container.textContent).toContain("Fundamentals of Recursion");
  });

  it("shows Completed! on last section", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    render(
      <ArticleLayout article={mockArticle} currentSection="types"><div>Content</div></ArticleLayout>,
    );
    expect(screen.getByText("Completed!")).toBeInTheDocument();
    expect(screen.getByText("Back to Articles")).toBeInTheDocument();
  });

  it("shows progress indicator in sidebar", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    render(<ArticleLayout article={mockArticle}><div>Content</div></ArticleLayout>);
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("0/2")).toBeInTheDocument();
  });

  it("shows Sections heading", async () => {
    const ArticleLayout = (await import("@/components/articles/ArticleLayout")).default;
    render(<ArticleLayout article={mockArticle}><div>Content</div></ArticleLayout>);
    expect(screen.getByText("Sections")).toBeInTheDocument();
  });
});

// SinglePageArticleLayout

describe("SinglePageArticleLayout", () => {
  beforeEach(() => {
    stubIntersectionObserver();
    window.location.hash = "";
  });

  const MockSection = () => <div data-testid="section-component">Section</div>;

  it("renders the article title", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    const { container } = render(
      <Layout article={mockArticle} sectionComponents={{ fundamentals: MockSection, types: MockSection }} />,
    );
    expect(container.textContent).toContain("Mastering Recursion");
  });

  it("shows difficulty badge", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    const { container } = render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(container.textContent).toContain("intermediate");
  });

  it("shows estimated time", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    const { container } = render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(container.textContent).toContain("2 hours");
  });

  it("renders section components", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    render(
      <Layout article={mockArticle} sectionComponents={{ fundamentals: MockSection, types: MockSection }} />,
    );
    expect(screen.getAllByTestId("section-component")).toHaveLength(2);
  });

  it("shows completion message", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(screen.getByText("You've completed this article!")).toBeInTheDocument();
  });

  it("shows Browse More Articles link", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(screen.getByText("Browse More Articles")).toBeInTheDocument();
  });

  it("renders tags", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(screen.getByText("Recursion")).toBeInTheDocument();
    expect(screen.getByText("Fundamentals")).toBeInTheDocument();
  });

  it("shows Table of Contents", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    const { container } = render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(container.textContent).toContain("Table of Contents");
  });

  it("shows author info", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(screen.getByText("Rishu Kumar")).toBeInTheDocument();
    expect(screen.getByText("2026-02-13")).toBeInTheDocument();
    expect(screen.getByText("RK")).toBeInTheDocument();
  });

  it("shows reading progress", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    const { container } = render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(container.textContent).toContain("Reading progress");
    expect(container.textContent).toContain("1/2");
  });

  it("shows back link to All Articles", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(screen.getAllByText(/All Articles/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows content not found when section component missing", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    render(<Layout article={mockArticle} sectionComponents={{}} />);
    expect(screen.getAllByText("Section content not found")).toHaveLength(2);
  });

  it("expands mobile TOC on click", async () => {
    const Layout = (await import("@/components/articles/SinglePageArticleLayout")).default;
    const { container } = render(<Layout article={mockArticle} sectionComponents={{}} />);
    const tocBtns = screen.getAllByText("Table of Contents");
    const mobileBtn = tocBtns.find((btn) => btn.tagName === "BUTTON" || btn.closest("button"));
    if (mobileBtn) fireEvent.click(mobileBtn);
    await waitFor(() => {
      expect(container.textContent).toContain("Fundamentals of Recursion");
    });
  });
});

// QuizCard

describe("QuizCard", () => {
  it("renders Test Your Knowledge heading", async () => {
    const QuizCard = (await import("@/components/quiz/QuizCard")).default;
    render(<QuizCard patternId="pattern-1" />);
    expect(screen.getByText("Test Your Knowledge")).toBeInTheDocument();
  });

  it("shows default question count of 15", async () => {
    const QuizCard = (await import("@/components/quiz/QuizCard")).default;
    render(<QuizCard patternId="pattern-1" />);
    expect(screen.getByText(/15 question quiz/)).toBeInTheDocument();
  });

  it("shows custom question count", async () => {
    const QuizCard = (await import("@/components/quiz/QuizCard")).default;
    render(<QuizCard patternId="pattern-1" questionCount={5} />);
    expect(screen.getByText(/5 question quiz/)).toBeInTheDocument();
  });

  it("renders Start Quiz button", async () => {
    const QuizCard = (await import("@/components/quiz/QuizCard")).default;
    render(<QuizCard patternId="pattern-1" />);
    expect(screen.getByText("Start Quiz")).toBeInTheDocument();
  });

  it("renders an SVG icon area", async () => {
    const QuizCard = (await import("@/components/quiz/QuizCard")).default;
    const { container } = render(<QuizCard patternId="pattern-1" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

// QuizResults

describe("QuizResults", () => {
  const baseProps = {
    totalQuestions: 10,
    correctCount: 7,
    scorePercentage: 70,
    questions: [mockQuizQuestion],
    answers: new Map([["q1", { selected: 1, isCorrect: true, correctAnswer: 1, explanation: "x" }]]),
    onRetake: vi.fn(),
    onClose: vi.fn(),
  };

  it("shows score percentage", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} />);
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("shows correct/total count text", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} />);
    expect(screen.getByText(/You got 7 out of 10 questions correct/)).toBeInTheDocument();
  });

  it("shows Good job! for 70%", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} />);
    expect(screen.getByText("Good job!")).toBeInTheDocument();
  });

  it("shows Outstanding! for 90%+", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} scorePercentage={95} correctCount={19} totalQuestions={20} />);
    expect(screen.getByText("Outstanding!")).toBeInTheDocument();
  });

  it("shows Excellent! for 80%+", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} scorePercentage={85} correctCount={17} totalQuestions={20} />);
    expect(screen.getByText("Excellent!")).toBeInTheDocument();
  });

  it("shows Nice effort! for 60%+", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} scorePercentage={65} correctCount={13} totalQuestions={20} />);
    expect(screen.getByText("Nice effort!")).toBeInTheDocument();
  });

  it("shows Keep practicing! for below 60%", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} scorePercentage={40} correctCount={4} totalQuestions={10} />);
    expect(screen.getByText("Keep practicing!")).toBeInTheDocument();
  });

  it("renders Retake Quiz button", async () => {
    const onRetake = vi.fn();
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} onRetake={onRetake} />);
    expect(screen.getByText("Retake Quiz")).toBeInTheDocument();
  });

  it("renders Continue Learning button", async () => {
    const onClose = vi.fn();
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} onClose={onClose} />);
    expect(screen.getByText("Continue Learning")).toBeInTheDocument();
  });

  it("calls onRetake when clicked", async () => {
    const onRetake = vi.fn();
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} onRetake={onRetake} />);
    fireEvent.click(screen.getByText("Retake Quiz"));
    expect(onRetake).toHaveBeenCalled();
  });

  it("calls onClose when Continue Learning clicked", async () => {
    const onClose = vi.fn();
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Continue Learning"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows review section with question text", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    render(<QuizResults {...baseProps} />);
    expect(screen.getByText("Review your answers")).toBeInTheDocument();
    expect(screen.getByText(/What is recursion/)).toBeInTheDocument();
  });

  it("shows correct answer checkmark SVG", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    const { container } = render(<QuizResults {...baseProps} />);
    expect(container.querySelector("svg path[d='M5 13l4 4L19 7']")).toBeInTheDocument();
  });

  it("shows incorrect answer X mark SVG", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    const { container } = render(
      <QuizResults
        {...baseProps}
        answers={new Map([["q1", { selected: 0, isCorrect: false, correctAnswer: 1, explanation: "x" }]])}
      />,
    );
    expect(container.querySelector("svg path[d='M6 18L18 6M6 6l12 12']")).toBeInTheDocument();
  });

  it("renders score circle SVG with two circles", async () => {
    const QuizResults = (await import("@/components/quiz/QuizResults")).default;
    const { container } = render(<QuizResults {...baseProps} />);
    expect(container.querySelectorAll("svg circle")).toHaveLength(2);
  });
});

// QuizModal

describe("QuizModal", () => {
  beforeEach(() => {
    mockGetQuestions.mockResolvedValue({
      patternId: "pattern-1",
      questions: [mockQuizQuestion],
      totalQuestions: 1,
    });
    mockStartAttempt.mockResolvedValue({
      attemptId: "attempt-1",
      startedAt: "2024-01-01T00:00:00Z",
    });
    mockSubmitResponse.mockResolvedValue({
      isCorrect: true,
      correctAnswer: 1,
      explanation: "Recursion is when a function calls itself.",
    });
    mockCompleteAttempt.mockResolvedValue({
      attemptId: "attempt-1",
      totalQuestions: 1,
      correctCount: 1,
      scorePercentage: 100,
      completedAt: "2024-01-01T00:00:00Z",
    });
  });

  it("returns null when isOpen is false", async () => {
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    const { container } = render(
      <QuizModal isOpen={false} onClose={vi.fn()} patternId="pattern-1" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows loading spinner when opened", async () => {
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="pattern-1" />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders quiz question after loading", async () => {
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="pattern-1" />);
    await waitFor(() => {
      expect(screen.getByText("What is recursion?")).toBeInTheDocument();
    });
  });

  it("shows Question X of Y header", async () => {
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="pattern-1" />);
    await waitFor(() => {
      expect(screen.getByText("Question 1 of 1")).toBeInTheDocument();
    });
  });

  it("handles answering a question", async () => {
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="pattern-1" />);
    await waitFor(() => expect(screen.getByText("Question 1 of 1")).toBeInTheDocument());
    fireEvent.click(screen.getByText("A function calling itself"));
    await waitFor(() => expect(screen.getByText("Correct!")).toBeInTheDocument());
  });

  it("shows See Results after answering last question", async () => {
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="pattern-1" />);
    await waitFor(() => expect(screen.getByText("Question 1 of 1")).toBeInTheDocument());
    fireEvent.click(screen.getByText("A function calling itself"));
    await waitFor(() => expect(screen.getByText("See Results")).toBeInTheDocument());
  });

  it("shows progress bar percentage", async () => {
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="pattern-1" />);
    await waitFor(() => expect(screen.getByText("100%")).toBeInTheDocument());
  });

  it("calls onClose when backdrop clicked", async () => {
    const onClose = vi.fn();
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    const { container } = render(
      <QuizModal isOpen={true} onClose={onClose} patternId="pattern-1" />,
    );
    await waitFor(() => expect(screen.getByText("Question 1 of 1")).toBeInTheDocument());
    const backdrop = container.querySelector("[class*='bg-black']");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("calls onClose when X button clicked", async () => {
    const onClose = vi.fn();
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={onClose} patternId="pattern-1" />);
    await waitFor(() => expect(screen.getByText("Question 1 of 1")).toBeInTheDocument());
    const btns = screen.getAllByRole("button");
    const xBtn = btns.find((b) => b.innerHTML.includes("M6 18L18 6"));
    if (xBtn) {
      fireEvent.click(xBtn);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it("shows error when no questions available", async () => {
    mockGetQuestions.mockResolvedValue({ patternId: "p", questions: [], totalQuestions: 0 });
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="p" />);
    await waitFor(() =>
      expect(screen.getByText("No questions available for this quiz.")).toBeInTheDocument(),
    );
  });

  it("shows error on API failure", async () => {
    mockGetQuestions.mockRejectedValue(new Error("Failed to load quiz"));
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="p" />);
    await waitFor(() =>
      expect(screen.getByText("Failed to load quiz")).toBeInTheDocument(),
    );
  });

  it("shows Close button in error state", async () => {
    mockGetQuestions.mockRejectedValue(new Error("Failed"));
    const onClose = vi.fn();
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={onClose} patternId="p" />);
    await waitFor(() => expect(screen.getByText("Close")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("disables back button on first question", async () => {
    mockGetQuestions.mockResolvedValue({
      patternId: "p", totalQuestions: 2,
      questions: [mockQuizQuestion, { ...mockQuizQuestion, id: "q2", questionText: "Second?" }],
    });
    const QuizModal = (await import("@/components/quiz/QuizModal")).default;
    render(<QuizModal isOpen={true} onClose={vi.fn()} patternId="p" />);
    await waitFor(() => expect(screen.getByText("Question 1 of 2")).toBeInTheDocument());
    expect(screen.getByText("Back").closest("button")).toBeDisabled();
  });
});
