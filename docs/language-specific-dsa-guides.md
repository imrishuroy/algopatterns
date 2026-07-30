# Language-Specific DSA Guides

## Overview

A new content section providing comprehensive, language-specific guides for Data Structures and Algorithms. Unlike the existing patterns section (algorithm-focused, language-agnostic), this section teaches developers how to effectively use a specific programming language for DSA problems.

**Status:** Design Phase  
**Author:** System  
**Created:** 2026-07-30  
**Target Languages:** Go (initial), with architecture supporting future additions (Rust, etc.)

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [Content Structure](#3-content-structure)
4. [URL and Routing Design](#4-url-and-routing-design)
5. [Data Model](#5-data-model)
6. [Page Components](#6-page-components)
7. [Visual Design and Design Tokens](#7-visual-design-and-design-tokens)
8. [SEO Strategy](#8-seo-strategy)
9. [Navigation Integration](#9-navigation-integration)
10. [Implementation Plan](#10-implementation-plan)
11. [Future Considerations](#11-future-considerations)

---

## 1. Problem Statement

### Current State

AlgoPatterns has excellent algorithm pattern content, but it's primarily language-agnostic. The code templates exist in multiple languages, but they don't teach:

- Language-specific idioms and best practices for DSA
- Built-in data structures and their DSA applications
- Language features that simplify algorithm implementation
- Common gotchas and interview tips specific to each language

### User Need

Developers preparing for interviews in a specific language need to understand:

1. How to use the language's standard library effectively for DSA
2. Language idioms that make code cleaner and more efficient
3. Time/space complexity implications of language-specific choices
4. What interviewers expect from code in that language

### Example: Go Developer

A Go developer needs to know:
- Slices vs arrays for dynamic sizing
- Building and initializing 2D slices for grid, matrix, and DP table problems
- Using slice-backed stacks, queues, and deques without unnecessary allocations
- Maps for O(1) lookups and counting
- Maps as sets, frequency tables, adjacency lists, and memoization caches
- The `sort` package and custom sorting
- `container/heap` for priority queues and top-k problems
- Recursive DFS/backtracking with closures and captured state
- Memoized recursion for DP, graph search, and state-space problems
- Iterative DP patterns using 1D and 2D slices, including rolling-array optimization
- String and rune handling for substring, palindrome, and Unicode-aware problems
- Using channels for certain concurrent problems
- When generics help with reusable DSA helpers, and when simple concrete types are clearer
- Common Go idioms for tree/graph traversal

---

## 2. Goals and Non-Goals

### Goals

| ID | Goal | Priority |
|----|------|----------|
| G1 | Comprehensive Go DSA guide from beginner to advanced | P0 |
| G2 | SEO-optimized for "DSA in Go", "Golang LeetCode", etc. | P0 |
| G3 | Beginner-friendly with progressive complexity | P0 |
| G4 | Practical code examples for each concept | P0 |
| G5 | Architecture supports adding more languages | P1 |
| G6 | Integration with existing pattern content | P2 |

### Non-Goals

- Replacing the existing patterns section
- Real-time code execution (may add later)

---

## 3. Content Structure

### Section Hierarchy

```
DSA in Go (Landing Page)
├── Getting Started
│   ├── Why Go for DSA
│   ├── Go Setup for LeetCode
│   └── Essential Go Concepts
│
├── Core Data Structures
│   ├── Arrays and Slices
│   ├── Strings and Runes
│   ├── Maps (Hash Maps)
│   ├── Sets (Using Maps)
│   ├── Stacks (Using Slices)
│   ├── Queues and Deques
│   ├── Linked Lists
│   ├── Trees and Binary Trees
│   ├── Heaps (container/heap)
│   └── Graphs (Adjacency Representations)
│
├── Essential Algorithms
│   ├── Sorting in Go
│   ├── Searching and Binary Search
│   ├── Two Pointers Techniques
│   ├── Sliding Window
│   ├── Recursion and Backtracking
│   ├── Dynamic Programming
│   ├── BFS and DFS
│   └── Greedy Algorithms
│
├── Go-Specific Techniques
│   ├── Slice Tricks and Idioms
│   ├── String Manipulation
│   ├── Working with container/ Package
│   ├── Custom Sorting
│   ├── Generics for DSA (Go 1.18+)
│   └── Concurrency Patterns (for specific problems)
│
├── Interview Preparation
│   ├── Go Code Style in Interviews
│   ├── Common Mistakes to Avoid
│   ├── Time and Space Analysis
│   └── Top 50 LeetCode Problems in Go
│
└── Cheatsheet
    └── Go DSA Quick Reference
```

### Content Depth Per Topic

Each topic page includes:

1. **Overview**: What this is, why it matters for DSA
2. **Go Implementation**: How to use/implement in Go
3. **Complexity Analysis**: Time/space for Go's implementation
4. **Code Examples**: Multiple practical examples
5. **Common Patterns**: DSA patterns that use this concept
6. **Practice Problems**: Linked LeetCode/problems
7. **Tips and Gotchas**: Go-specific advice

---

## 4. URL and Routing Design

### Simplified Structure (Patterns-Like)

Keep routing simple with only 2 levels, matching how `/patterns/[slug]` works:

```
/languages              # Languages hub - "Learn DSA in Your Favorite Language"
/languages/go           # Go DSA Guide - single page with sections (like /patterns/bit-manipulation)
/languages/rust         # Rust DSA Guide (future)
```

**No deep nesting.** Each language guide is a single page with:
- Left sidebar for section navigation (like patterns)
- Hash-based section routing (`/languages/go#arrays-slices`)
- Tabs for different content types (Tutorial, Problems, Cheatsheet)

### Why This Approach

| Complex Routing (Rejected) | Simple Routing (Adopted) |
|---------------------------|-------------------------|
| `/languages/go/data-structures/arrays` | `/languages/go#arrays-slices` |
| 4 levels of nesting | 2 levels + hash |
| Many pages to maintain | One page per language |
| Complex navigation state | Simple section index |
| Poor for AI context | Full guide context available |

### Route Examples

| URL | Description |
|-----|-------------|
| `/languages` | Hub page: "Learn DSA in Your Favorite Language" with language cards |
| `/languages/go` | Go guide with sidebar, tabs, AI panel (mirrors `/patterns/[slug]`) |
| `/languages/go#getting-started` | Direct link to Getting Started section |
| `/languages/go#arrays-slices` | Direct link to Arrays & Slices section |
| `/languages/go#cheatsheet` | Direct link to Cheatsheet tab |

### File Structure

```
frontend/src/app/languages/
├── page.tsx                    # Hub: language selection
└── [lang]/
    ├── page.tsx                # Server component (metadata, static params)
    └── LanguageGuideClient.tsx # Client component (mirrors PatternPageClient)
```

---

## 5. Data Model

### Structure (Mirrors patterns.json)

The language guide uses a flat section-based structure, similar to how `patterns.json` has `tutorial` sections:

```typescript
// frontend/src/types/languages.ts

export type SupportedGuideLanguage = "go" | "rust" | "java" | "python";

export interface LanguageGuide {
  id: SupportedGuideLanguage;
  name: string;                    // "Go"
  displayName: string;             // "DSA in Go"
  description: string;
  difficulty: string;              // "Beginner to Advanced"
  icon: string;                    // SVG or icon component name
  version: string;                 // "1.22"
  
  // Flat list of sections (like pattern.tutorial)
  sections: LanguageSection[];
  
  // Problems tab content
  commonProblems: string[];
  
  // Cheatsheet tab content
  cheatsheet: CheatsheetContent;
}

export interface LanguageSection {
  id: string;                      // "arrays-slices" (used for hash navigation)
  title: string;                   // "Arrays and Slices"
  category: string;                // "Data Structures" (for sidebar grouping)
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;           // "15 min"
  
  // Content (rendered as markdown or structured)
  content: SectionContent[];
}

export interface SectionContent {
  type: "text" | "code" | "tip" | "warning" | "comparison" | "complexity";
  
  // For type: "text"
  text?: string;
  
  // For type: "code"
  code?: string;
  language?: string;               // Always "go" for Go guide
  filename?: string;               // Optional: "two_sum.go"
  
  // For type: "tip" | "warning"
  title?: string;
  message?: string;
  
  // For type: "comparison"
  items?: { label: string; description: string }[];
  
  // For type: "complexity"
  time?: string;
  space?: string;
  explanation?: string;
}

export interface CheatsheetContent {
  quickReference: QuickRefItem[];
  commonPatterns: QuickRefItem[];
  gotchas: string[];
}

export interface QuickRefItem {
  title: string;
  code: string;
  notes?: string;
}
```

### Example Data Structure (go.json)

```json
{
  "id": "go",
  "name": "Go",
  "displayName": "DSA in Go",
  "description": "Master data structures and algorithms using Go",
  "difficulty": "Beginner to Advanced",
  "version": "1.22",
  "sections": [
    {
      "id": "why-go-for-dsa",
      "title": "Why Go for DSA",
      "category": "Getting Started",
      "difficulty": "beginner",
      "estimatedTime": "5 min",
      "content": [
        {
          "type": "text",
          "text": "Go is an excellent choice for DSA and coding interviews..."
        },
        {
          "type": "comparison",
          "items": [
            { "label": "Fast compilation", "description": "Instant feedback loop" },
            { "label": "Simple syntax", "description": "Less boilerplate than Java/C++" }
          ]
        }
      ]
    },
    {
      "id": "arrays-slices",
      "title": "Arrays and Slices",
      "category": "Data Structures",
      "difficulty": "beginner",
      "estimatedTime": "20 min",
      "content": [
        {
          "type": "text",
          "text": "Slices are Go's primary sequence type for DSA problems..."
        },
        {
          "type": "code",
          "code": "// Creating slices\ns := make([]int, 0, 10)\ns = append(s, 1, 2, 3)",
          "language": "go",
          "filename": "slices.go"
        },
        {
          "type": "complexity",
          "time": "O(1) amortized append, O(n) worst case",
          "space": "O(n)",
          "explanation": "Go doubles capacity when slice is full"
        },
        {
          "type": "tip",
          "title": "Pre-allocate when size is known",
          "message": "Use make([]int, 0, n) to avoid reallocations"
        }
      ]
    }
  ],
  "commonProblems": [
    "Two Sum",
    "Valid Parentheses",
    "Merge Two Sorted Lists"
  ],
  "cheatsheet": {
    "quickReference": [
      {
        "title": "Slice Operations",
        "code": "s = append(s, x)      // push\ns = s[:len(s)-1]      // pop\ns = append(s[:i], s[i+1:]...) // remove at i"
      }
    ],
    "gotchas": [
      "Slices are references - modifying a slice affects the original",
      "Maps are not ordered - use sort.Slice for deterministic iteration"
    ]
  }
}
```

### Data File Structure

Single JSON file per language (like `patterns.json`):

```
frontend/src/lib/languages/
├── index.ts                       # Exports all language guides
├── go.json                        # Complete Go DSA guide (~3000+ lines)
├── rust.json                      # Future
└── types.ts                       # TypeScript interfaces
```

**Why single JSON file?**
- Mirrors `patterns.json` approach (proven pattern)
- SEO-friendly: full content in static HTML
- Easier to manage and update
- Better for static generation (Cloudflare Pages)
- All content available for AI context
- Free content for all users (no auth required)

**Future consideration**: If content protection becomes needed, can migrate to API-based approach later. For now, simplicity wins.

---

## 6. Page Components (Patterns-Like Architecture)

### Architecture Overview

The language guide page mirrors `PatternPageClient.tsx` exactly:

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: [Go Logo] DSA in Go    [Beginner→Advanced]   [AI ◉]   │
│ Tabs: [Tutorial] [Problems] [Cheatsheet]                        │
├────────────────┬────────────────────────────────┬───────────────┤
│                │                                │               │
│   Sidebar      │     Main Content               │   AI Panel    │
│   (Sections)   │     (Scrollable)               │   (Resizable) │
│                │                                │               │
│   Getting      │  ┌────────────────────────┐   │   Ask about   │
│   Started      │  │  Arrays and Slices     │   │   this section│
│   ────────     │  │                        │   │               │
│   □ Why Go     │  │  <Highlightable>       │   │   [Input...]  │
│   □ Setup      │  │    Content here...     │   │               │
│   ✓ Basics     │  │  </Highlightable>      │   │   ───────────│
│                │  │                        │   │   AI Response │
│   Data Structs │  │  Code examples...      │   │               │
│   ────────     │  │                        │   │               │
│   ▶ Arrays  ◀  │  │  Practice problems...  │   │               │
│   □ Maps       │  │                        │   │               │
│   □ Strings    │  └────────────────────────┘   │               │
│                │                                │               │
│   Algorithms   │  [← Previous]  [Next →]       │               │
│   ────────     │                                │               │
│   □ Sorting    │                                │               │
│   ...          │                                │               │
│                │                                │               │
│   [Take Quiz]  │                                │               │
│                │                                │               │
└────────────────┴────────────────────────────────┴───────────────┘
```

### Reused Components (From Patterns)

| Component | Reuse Strategy |
|-----------|----------------|
| `CourseSidebar` | Extend to accept language guide sections |
| `CourseNavigation` | Reuse as-is for prev/next |
| `TutorialSection` | Reuse for rendering section content |
| `AIChatPanel` | Reuse with language-specific context |
| `Highlightable` | Reuse as-is for text highlighting |
| `CodeBlock` | Reuse with Go syntax highlighting |

### New Components Needed

```
frontend/src/components/languages/
├── LanguageCard.tsx            # Card for hub page (language selection)
└── LanguageGuideHeader.tsx     # Header with language logo, progress
```

### Page Files

```
frontend/src/app/languages/
├── page.tsx                    # Hub: "Learn DSA in Your Favorite Language"
└── [lang]/
    ├── page.tsx                # Server: metadata, static params
    ├── LanguageGuideClient.tsx # Client: main orchestrator (like PatternPageClient)
    └── tabs/
        ├── TutorialTab.tsx     # Section-based content with sidebar
        ├── ProblemsTab.tsx     # Practice problems list
        └── CheatsheetTab.tsx   # Quick reference
```

### Feature Parity with Patterns Page

| Feature | Patterns Page | Language Guide |
|---------|---------------|----------------|
| Left sidebar with sections | ✓ CourseSidebar | ✓ Reuse |
| Section navigation via hash | ✓ `#section-slug` | ✓ Same |
| AI panel on right | ✓ AIChatPanel | ✓ Reuse |
| Text highlighting | ✓ Highlightable | ✓ Reuse |
| Tabs (Tutorial/Problems/Cheatsheet) | ✓ | ✓ Same structure |
| Progress tracking | ✓ Per section | ✓ Per section |
| Prev/Next navigation | ✓ CourseNavigation | ✓ Reuse |
| Quiz at end | ✓ | ✓ (Optional) |
| Keyboard shortcuts | ✓ Cmd+Shift+A | ✓ Same |

### Key Differences from Patterns

| Aspect | Patterns | Language Guides |
|--------|----------|-----------------|
| Content focus | Algorithm patterns | Language-specific DSA |
| Code language | Multi-language toggle | Single language (Go) |
| Visualizers | Algorithm visualizers | Minimal/none |
| Sections | Pattern variations | Topic-based chapters |
| Data source | `patterns.json` | `go.json` |

---

## 7. Visual Design and Design Tokens

This section defines the look and feel for the Language Guides section, ensuring consistency with the existing AlgoPatterns design system while creating a distinct identity for language-specific content.

### 7.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Consistency** | Use existing design tokens from `globals.css`, no new color palette |
| **Hierarchy** | Clear visual distinction between categories, topics, and content |
| **Scannability** | Developers should quickly find what they need |
| **Code-First** | Code blocks are the hero element, prominently displayed |
| **Progressive Disclosure** | Show overview first, details on demand |

### 7.2 Design Tokens Reference

All new components must use the existing CSS custom properties:

**Colors**

```css
/* Backgrounds */
--bg-base: #030712;              /* Page background */
--bg-surface: rgba(17,24,39,0.8); /* Cards, panels */
--bg-elevated: rgba(31,41,55,0.7); /* Elevated elements */
--bg-hover: rgba(55,65,81,0.6);   /* Hover states */

/* Accents */
--accent-1: #6366f1;             /* Primary (Indigo) */
--accent-2: #a855f7;             /* Secondary (Purple) */
--accent-gradient: linear-gradient(135deg, #6366f1, #a855f7);

/* Text */
--text-1: #f9fafb;               /* Primary text */
--text-2: #9ca3af;               /* Secondary text */
--text-3: #6b7280;               /* Muted text */

/* Borders */
--border-1: rgba(99,102,241,0.15); /* Subtle */
--border-2: rgba(99,102,241,0.4);  /* Emphasized */
```

**Typography**

```css
--font-heading: 'Inter', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

**Spacing and Radius**

```css
--radius-sm: 0.625rem;   /* 10px - pills, badges */
--radius-md: 0.875rem;   /* 14px - buttons, inputs */
--radius-lg: 1.25rem;    /* 20px - cards */
--radius-xl: 1.75rem;    /* 28px - large panels */
```

**Shadows**

```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.3);
--shadow-md: 0 8px 16px rgba(0,0,0,0.4);
--shadow-lg: 0 16px 32px rgba(0,0,0,0.5);
--shadow-glow: 0 0 20px rgba(99,102,241,0.3);
```

### 7.3 Language Guide Color Accents

Each language gets a subtle accent color for visual differentiation while maintaining the primary indigo/purple palette:

| Language | Accent Color | Usage |
|----------|--------------|-------|
| Go | `#00ADD8` (Go Blue) | Icon tint, subtle borders, hover states |
| Rust | `#DEA584` (Rust Orange) | Icon tint, subtle borders |
| Java | `#ED8B00` (Java Orange) | Future |
| Python | `#3776AB` (Python Blue) | Future |

**Implementation**: Use as a CSS variable scoped to the language:

```css
.language-go { --lang-accent: #00ADD8; }
.language-rust { --lang-accent: #DEA584; }
```

Apply sparingly: language logo backgrounds, active sidebar items, hover glows.

### 7.4 Page Layouts

#### Languages Hub (`/languages`)

Simple selection page: "Learn DSA in Your Favorite Language"

```
┌─────────────────────────────────────────────────────────┐
│  Header (existing)                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │  "Learn DSA in Your Favorite Language"               ││
│  │                                                       ││
│  │  Master data structures and algorithms with          ││
│  │  language-specific guides for coding interviews      ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌────────────────────┐  ┌────────────────────┐         │
│  │  [Go Gopher Logo]  │  │  [Rust Crab Logo]  │         │
│  │                    │  │                    │         │
│  │  Go                │  │  Rust              │         │
│  │  27 sections       │  │  Coming Soon       │         │
│  │  Beginner+         │  │                    │         │
│  │                    │  │                    │         │
│  │  [Start Learning]  │  │  [Notify Me]       │         │
│  └────────────────────┘  └────────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Language Guide Page (`/languages/go`) - Mirrors PatternPageClient

This is a **single page** with tabs and sidebar, exactly like `/patterns/bit-manipulation`:

```
┌─────────────────────────────────────────────────────────────────┐
│ Header                                                           │
├─────────────────────────────────────────────────────────────────┤
│ [← Back] [Go Logo] DSA in Go          [Progress: 65%]  [AI ◉]  │
│                                                                  │
│ [Tutorial]  [Problems]  [Cheatsheet]                            │
├────────────────┬────────────────────────────────┬───────────────┤
│                │                                │               │
│   SIDEBAR      │     MAIN CONTENT               │   AI PANEL    │
│   (Sections)   │     (Scrollable)               │   (Resizable) │
│                │                                │               │
│ Getting        │  Arrays and Slices             │  Ask about    │
│ Started        │  [Beginner] [20 min]           │  Go slices    │
│ ─────────      │                                │               │
│ □ Why Go       │  <Highlightable>               │  [How do I...]│
│ □ Setup        │                                │               │
│ ✓ Basics       │  Slices are Go's primary       │  ────────────│
│                │  sequence type for DSA...      │               │
│ Data           │                                │  AI: Slices   │
│ Structures     │  ┌──────────────────────────┐  │  in Go are... │
│ ─────────      │  │ // Creating slices       │  │               │
│ ▶ Arrays    ◀  │  │ s := make([]int, 0, 10)  │  │               │
│ □ Maps         │  │ s = append(s, 1, 2, 3)   │  │               │
│ □ Strings      │  └──────────────────────────┘  │               │
│ □ Stacks       │                                │               │
│ □ Queues       │  </Highlightable>              │               │
│                │                                │               │
│ Algorithms     │  Complexity                    │               │
│ ─────────      │  ─────────────                 │               │
│ □ Sorting      │  Time: O(1) amortized          │               │
│ □ Two Ptr      │  Space: O(n)                   │               │
│ □ Sliding      │                                │               │
│                │  [← Why Go]    [Maps →]        │               │
│ Go Techniques  │                                │               │
│ ─────────      │                                │               │
│ □ Slice Tricks │                                │               │
│                │                                │               │
│ [Take Quiz]    │                                │               │
│                │                                │               │
└────────────────┴────────────────────────────────┴───────────────┘

URL: /languages/go#arrays-slices
```

**Key Features (same as Patterns page):**

| Feature | Implementation |
|---------|----------------|
| Left sidebar | Grouped by category, shows completion checkmarks |
| Section navigation | Click sidebar item → scroll to top, update hash |
| Hash routing | `#arrays-slices`, `#sorting`, `#cheatsheet` |
| AI panel | Resizable (15-45%), context-aware to current section |
| Highlighting | `<Highlightable>` wraps all content |
| Progress tracking | Per-section completion, stored in context |
| Prev/Next | CourseNavigation component at bottom |
| Tabs | Tutorial (default), Problems, Cheatsheet |

### 7.5 Component Specifications

#### LanguageCard

The card displayed on the Languages Hub for each language.

```
┌────────────────────────────────┐
│  ┌────┐                        │
│  │ Go │  Go                    │
│  │logo│                        │
│  └────┘  Master DSA using Go   │
│          with idiomatic code   │
│                                │
│  27 topics  •  Beginner+       │
│                                │
│  [Start Learning →]            │
└────────────────────────────────┘
```

**Styles:**
```css
.language-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.language-card:hover {
  border-color: var(--lang-accent);
  box-shadow: var(--shadow-md), 0 0 20px rgba(var(--lang-accent-rgb), 0.15);
  transform: translateY(-2px);
}
```

#### DifficultyBadge

Visual indicator for topic difficulty.

| Difficulty | Colors | Icon |
|------------|--------|------|
| Beginner | `bg-emerald-500/20 text-emerald-400` | Circle |
| Intermediate | `bg-amber-500/20 text-amber-400` | Triangle |
| Advanced | `bg-rose-500/20 text-rose-400` | Diamond |

```tsx
<span className="px-2 py-0.5 rounded-full text-xs font-medium
  bg-emerald-500/20 text-emerald-400">
  Beginner
</span>
```

#### TopicSidebar

Collapsible sidebar for navigation within a language guide.

**Behavior:**
- Current category expanded by default
- Other categories collapsed
- Active topic highlighted with `var(--lang-accent)`
- Sticky positioning on desktop
- Drawer on mobile (slide from left)

**Styles:**
```css
.sidebar-item {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  transition: all 0.15s ease;
}

.sidebar-item:hover {
  background: var(--bg-hover);
  color: var(--text-1);
}

.sidebar-item.active {
  background: rgba(var(--lang-accent-rgb), 0.15);
  color: var(--lang-accent);
  border-left: 2px solid var(--lang-accent);
}
```

#### CodeBlock Enhancement

Reuse existing `CodeBlock.tsx` with these additions for language guides:

1. **Go-specific syntax highlighting** (already supported via Prism/highlight.js)
2. **"Copy & Run" hint** for executable snippets
3. **Complexity badge** inline with code title

```
┌─────────────────────────────────────────────┐
│ ● ● ●  arrays.go         O(n) time  [Copy] │
├─────────────────────────────────────────────┤
│ 1 │ // Creating a slice with capacity      │
│ 2 │ s := make([]int, 0, 10)                │
│ 3 │ s = append(s, 1, 2, 3)                 │
│ 4 │                                         │
│ 5 │ // Length vs Capacity                  │
│ 6 │ fmt.Println(len(s), cap(s)) // 3, 10   │
└─────────────────────────────────────────────┘
```

#### TimeEstimate

Small component showing estimated reading/learning time.

```tsx
<span className="flex items-center gap-1 text-sm text-[var(--text-3)]">
  <ClockIcon className="w-4 h-4" />
  15 min
</span>
```

### 7.6 Responsive Design

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (`< 640px`) | Single column, sidebar becomes drawer, cards stack vertically |
| Tablet (`640-1024px`) | 2-column grid for cards, sidebar collapsible |
| Desktop (`> 1024px`) | Full layout with sticky sidebar |

**Mobile Sidebar:**
- Hamburger menu in header (left side)
- Slides in from left as overlay
- Backdrop blur effect
- Close on selection or outside tap

### 7.7 Animations and Transitions

Use subtle animations consistent with existing patterns:

```css
/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

/* Sidebar expand/collapse */
.sidebar-category {
  overflow: hidden;
  transition: max-height 0.2s ease;
}

/* Code block appearance */
.code-block {
  animation: fadeIn 0.3s ease forwards;
}

/* Progress bar */
.progress-fill {
  transition: width 0.5s ease;
  background: var(--accent-gradient);
}
```

### 7.8 Dark/Light Mode

All components must support both themes using existing CSS variable system:

```css
/* Dark (default) */
:root, .dark {
  --bg-surface: rgba(17, 24, 39, 0.8);
  --lang-accent-go: #00ADD8;
}

/* Light */
.light {
  --bg-surface: rgba(255, 255, 255, 0.95);
  --lang-accent-go: #007d9c; /* Darker for contrast */
}
```

### 7.9 Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | All text meets WCAG AA (4.5:1 for normal, 3:1 for large) |
| Keyboard navigation | All interactive elements focusable, visible focus rings |
| Screen readers | Proper ARIA labels, semantic HTML, skip links |
| Reduced motion | Respect `prefers-reduced-motion` media query |
| Focus management | Focus moves logically, trapped in modals |

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 7.10 Visual Examples

#### Language Card States

```
Default:
┌────────────────────────┐
│ [Go logo] Go           │
│ bg: var(--bg-surface)  │
│ border: var(--border-1)│
└────────────────────────┘

Hover:
┌────────────────────────┐
│ [Go logo] Go           │
│ border: #00ADD8        │
│ shadow: glow effect    │
│ transform: -2px        │
└────────────────────────┘

Focus:
┌────────────────────────┐
│ [Go logo] Go           │
│ outline: 2px solid     │
│          var(--accent-1)│
│ outline-offset: 2px    │
└────────────────────────┘
```

#### Progress Indicator

```
┌─────────────────────────────────────────────┐
│ Your Progress                               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░  65%  │
│                                             │
│ 18/27 topics completed                      │
└─────────────────────────────────────────────┘

Progress bar gradient: var(--accent-gradient)
Track: var(--bg-elevated)
```

---

## 8. SEO Strategy

### Target Keywords

**Primary (Go):**
- "DSA in Golang"
- "Go data structures and algorithms"
- "Golang LeetCode"
- "Go coding interview"
- "Golang arrays slices DSA"

**Long-tail:**
- "How to implement stack in Go"
- "Go heap priority queue"
- "Golang two pointers technique"
- "Go interview preparation"

### Metadata Strategy

```typescript
// Example for /languages/go (single page, all content)
export const metadata: Metadata = {
  title: "DSA in Go - Complete Guide | AlgoPatterns",
  description: "Master data structures and algorithms in Go. Learn slices, maps, sorting, and more with practical examples for LeetCode and coding interviews.",
  keywords: [
    "dsa in golang",
    "go data structures",
    "golang algorithms",
    "go leetcode",
    "golang coding interview",
    "go slices arrays",
  ],
  openGraph: {
    title: "DSA in Go - Complete Guide for Coding Interviews",
    description: "Learn data structures and algorithms using Go with practical examples...",
    type: "article",
    url: "/languages/go",
  },
};
```

**Note**: Since it's a single page with hash navigation, SEO focuses on the main page. Individual sections are not separate URLs, but the comprehensive content on one page is actually better for SEO (longer dwell time, complete topic coverage).

### Structured Data

Add JSON-LD for:
- Article schema for each topic
- HowTo schema for implementation guides
- FAQ schema for common questions
- BreadcrumbList for navigation

### Internal Linking

- Link from topics to related patterns (e.g., Arrays → Two Pointers pattern)
- Link from patterns to language-specific implementations
- Cross-link between language guides (when Rust is added)

---

## 9. Navigation Integration

### Header Changes

Add "Languages" to the main navigation:

```typescript
// components/layout/Header.tsx
const navLinks = [
  { href: "/dsa-fundamentals", label: "Fundamentals" },
  { href: "/languages", label: "Languages" },           // NEW
  { href: "/pattern-recognition", label: "Pattern Recognition" },
  { href: "/interview-cheatsheet", label: "Interview Cheat Sheet" },
  { href: "/articles", label: "Articles" },
  { href: "/chat", label: "Chat" },
];
```

### Sidebar Navigation

Within a language guide, show:
- Current category (expanded)
- Other categories (collapsed)
- Progress indicator (if logged in)

---

## 10. Implementation Plan

### Phase 1: Foundation (Week 1)

Since we're reusing most components from patterns, foundation is quick:

1. **Types**: Create `frontend/src/types/languages.ts`
2. **Routes**: Set up `/languages` and `/languages/[lang]`
3. **Hub Page**: Simple language selection page
4. **LanguageGuideClient**: Clone and adapt `PatternPageClient.tsx`
5. **Navigation**: Add "Languages" link to Header

**Files to create:**
```
frontend/src/app/languages/
├── page.tsx                      # Hub page
└── [lang]/
    ├── page.tsx                  # Server component
    └── LanguageGuideClient.tsx   # Adapted from PatternPageClient

frontend/src/components/languages/
└── LanguageCard.tsx              # Card for hub page

frontend/src/lib/languages/
├── index.ts                      # Exports
└── go.json                       # Go guide content (start with 5 sections)

frontend/src/types/languages.ts   # TypeScript types
```

### Phase 2: Go Guide Content (Week 2-3)

1. Create initial `go.json` with 5 sections:
   - Why Go for DSA
   - Arrays and Slices
   - Maps
   - Strings and Runes
   - Stacks and Queues

2. Wire up to LanguageGuideClient
3. Test sidebar navigation, hash routing
4. Test AI panel integration
5. Test highlighting

### Phase 3: Expand Content (Week 4-5)

1. Add remaining Data Structures sections:
   - Linked Lists, Trees, Heaps, Graphs

2. Add Algorithms sections:
   - Sorting, Binary Search, Two Pointers, BFS/DFS

3. Add Go-Specific Techniques:
   - Slice tricks, container/ package, Generics

### Phase 4: Polish and Launch (Week 6)

1. Cheatsheet tab content
2. Problems tab with linked LeetCode problems
3. SEO optimization (metadata, JSON-LD)
4. Mobile testing
5. Internal linking to/from patterns

### Phase 5: Future Languages (TBD)

1. Rust DSA Guide
2. Enhanced Java guide (beyond fundamentals)
3. Enhanced Python guide

---

## 11. Future Considerations

### Potential Enhancements

1. **Progress Tracking**: Track completed topics per language
2. **Code Playground**: Run Go code in browser (via WASM or API)
3. **Quizzes**: Per-topic knowledge checks
4. **AI Integration**: "Explain this Go code" feature
5. **Problem Recommendations**: Based on completed topics

### Content Expansion

- Add video explanations
- Add visualizations for Go-specific concepts
- Community-contributed examples
- Language comparison tables

---

## Appendix A: Go DSA Quick Reference (Sample Content)

```go
// Slice Operations
s := make([]int, 0, 10)      // length 0, capacity 10
s = append(s, 1, 2, 3)       // append elements
copy(dst, src)               // copy slices
s = s[:len(s)-1]             // remove last element
s = append(s[:i], s[i+1:]...) // remove element at index i

// Map Operations
m := make(map[string]int)
m["key"] = value             // set
val, ok := m["key"]          // get with existence check
delete(m, "key")             // delete

// Stack (using slice)
stack = append(stack, x)     // push
x = stack[len(stack)-1]      // peek
stack = stack[:len(stack)-1] // pop

// Queue (using slice)
queue = append(queue, x)     // enqueue
x = queue[0]                 // front
queue = queue[1:]            // dequeue

// Heap (container/heap)
import "container/heap"
// Implement heap.Interface: Len, Less, Swap, Push, Pop

// Sorting
sort.Ints(nums)
sort.Slice(arr, func(i, j int) bool {
    return arr[i] < arr[j]
})

// Binary Search
idx := sort.Search(len(arr), func(i int) bool {
    return arr[i] >= target
})
```

---

## Appendix B: Content Migration Opportunities

Some content from `dsa-fundamentals.ts` can be enhanced and linked:

| Existing Concept | Language Guide Enhancement |
|------------------|---------------------------|
| Priority Queue & Heap | Go `container/heap` deep dive |
| HashMap Techniques | Go maps with struct keys, sync.Map |
| Stack/Queue Patterns | Go slice idioms for stack/queue |

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Content storage | Static `go.json` | Simple, SEO-friendly, mirrors patterns.json |
| Access | Free for all users | No auth required to view content |
| Routing | `/languages/go#section` | Simple, matches patterns page UX |
| Components | Reuse from patterns | Less code, consistent UX |

## Open Questions

1. Should we track progress separately for each language guide?
2. Should the cheatsheet be printable/downloadable?
3. What sections should be prioritized for initial Go content?

---

**Next Steps:**
1. Review and approve this design
2. Create `go.json` with initial 5-10 sections
3. Implement `/languages` hub and `/languages/go` page
4. Test with patterns-like features (sidebar, AI, highlighting)
