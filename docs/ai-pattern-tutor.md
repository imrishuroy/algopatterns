# AI Pattern Tutor - Design Document

**Version:** 1.0
**Author:** Staff AI Engineer
**Date:** 2026-06-27
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Non-Goals](#goals--non-goals)
4. [Content Inventory](#content-inventory)
5. [User Personas & Use Cases](#user-personas--use-cases)
6. [UI/UX Design](#uiux-design)
7. [AI Prompt Design](#ai-prompt-design)
8. [API Design](#api-design)
9. [Implementation Plan](#implementation-plan)
10. [Success Metrics](#success-metrics)

---

## Executive Summary

The patterns page is a rich educational resource but is **read-only** — users consume content but cannot interact with it. This doc proposes adding the AI tutor to the patterns page so users can ask questions, clarify doubts, and deepen their understanding of DSA patterns through dialogue.

Unlike the problem-page AI (which focuses on debugging user code), the pattern AI focuses on **conceptual understanding, pattern recognition, and connecting theory to practice**.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **UI Pattern** | Floating side panel (reuse AIChatPanel) | Consistent with problem page UX, minimal rework |
| **Context Source** | Current pattern content (RAG) | Patterns.json has rich structured data perfect for Q&A |
| **Quick Actions** | Pattern-specific: Explain concept, Compare patterns, When to use, Tutorial walkthrough | Different from problem-page (hint/review/explain) |
| **Backend** | New prompt templates + existing endpoints | No new API needed, just prompt variation |
| **Session Scope** | Per-pattern, not per-problem | Conversations are about understanding the pattern itself |

---

## Problem Statement

### Current State

The patterns page (`/patterns/[slug]`) offers three tabs:
- **Tutorial** — Rich markdown content with interactive visualizers
- **Problems** — Curated problem list with filters
- **Cheatsheet** — Quick-reference summary

Users read, watch visualizers, and solve problems — but have **no way to ask questions** about the content.

### Pain Points

1. **One-way content** — Users hit a confusing concept and have nowhere to ask "why?"
2. **No concept clarification** — "What's the difference between this pattern and X?" is unanswered
3. **Tutorial sections are dense** — Users may want a simplified explanation of a specific section
4. **Pattern comparison missing** — Users can't ask "should I use this or sliding window?"
5. **No bridge to practice** — "How do I apply this pattern to the problems below?"

### Opportunity

An AI tutor on the patterns page can:
- Answer conceptual questions in real-time
- Adapt explanations to user's pace and understanding
- Connect pattern theory to the curated problem list
- Serve as a 24/7 teaching assistant alongside the static content
- Reuse existing AI infrastructure (LLM, RAG, streaming)

---

## Goals & Non-Goals

### Goals

| Priority | Goal | Success Metric |
|----------|------|----------------|
| P0 | Answer pattern-specific questions | >70% of responses rated helpful |
| P0 | Keep answers grounded in pattern content | <5% hallucinated pattern facts |
| P1 | Clarify confusing tutorial sections | >60% of "explain this section" requests resolved |
| P1 | Compare patterns on demand | Users can articulate differences after chat |
| P2 | Recommend relevant problems based on pattern | Click-through on problem recommendations |
| P2 | Suggest next patterns to learn based on current one | Adoption of learning path suggestions |

### Non-Goals (v1)

- **Code execution** — No Judge0 integration on patterns page
- **Problem solving** — Users solve problems on the problem page, not here
- **Tutorial content editing** — AI reads content, doesn't modify it
- **Multi-pattern conversation memory** — Each pattern session is isolated

---

## Content Inventory

### Available Context for AI

| Content Type | Fields | Quality | AI Suitability |
|---|---|---|---|
| **Pattern metadata** | category, difficulty, description, timeComplexity, spaceComplexity | High | Excellent — perfect for overview questions |
| **When to Use** | string[] | High | Excellent — core conceptual knowledge |
| **Key Insights** | string[] | High | Excellent — numbered actionable points |
| **Common Mistakes** | string[] | High | Excellent — perfect for "why is my approach wrong?" |
| **Code Templates** | Java, JavaScript | High | Excellent — used for "show me the template" requests |
| **Variations** | name, desc, when, template, problems | High | Excellent — detailed sub-patterns with examples |
| **Tutorial Sections** | title, content (markdown), code | High | Excellent — rich full-text content for deep Q&A |
| **Related Problems** | commonProblems[] | Medium | Good — can recommend specific problems |

**Total content per pattern:** ~5-15KB structured text
**Estimated tokens per pattern:** ~1.5K-4K tokens
**Tutorial content:** Up to 15 sections per pattern (e.g. Trees, DP)

---

## User Personas & Use Cases

### Persona 1: Confused Learner (Sameer)

**Profile:** Learning a pattern for the first time, stuck on a concept in the tutorial.

**Use Cases:**
1. "I don't understand the definition section" → Ask for simplified explanation
2. "Explain the difference between variation 1 and variation 2" → Compare sub-patterns
3. "Why is this O(n log n)?" → Complexity analysis walkthrough
4. "Show me a simpler example" → Request concrete example

**AI Behavior:**
- Start with simple analogies
- Reference the specific tutorial section
- Ask comprehension-check questions

### Persona 2: Pattern Comparer (Priya)

**Profile:** Knows some patterns, wants to understand when to use this vs another.

**Use Cases:**
1. "When should I use this vs sliding window?" → Pattern comparison
2. "Is this better than two pointers for this type of problem?" → Trade-off analysis
3. "What problems look like this pattern but aren't?" → Anti-pattern detection

**AI Behavior:**
- Compare by dimension: input type, time complexity, use case
- Use the patterns.json content for both patterns
- Suggest a mental checklist for pattern selection

### Persona 3: Practice Seeker (Arjun)

**Profile:** Understands the pattern, wants to apply it to problems.

**Use Cases:**
1. "Which problem should I start with?" → Problem recommendation
2. "How do I recognize this pattern in a new problem?" → Recognition guide
3. "What variation of this pattern should I focus on?" → Learning prioritization
4. "Suggest a progression path" → Ordered problem list

**AI Behavior:**
- Reference the pattern's `commonProblems` by difficulty
- Connect to the curated `ProblemsTab` list
- Suggest variation mastery order

---

## UI/UX Design

### Layout

The AI panel on the patterns page follows the same pattern as the problem page — a slide-in side panel:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Sticky Header: "Two Pointers" ● Medium  │ O(n) O(1) │ [Stats Ring] │ [AI] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [Tutorial] [Problems (12)] [Cheatsheet]          ┌──────────────────────┐  │
│                                                    │  AI Assistant        │  │
│  ┌────────────────────────────────────┐            │  ┌────────────────┐ │  │
│  │ Section 1: Introduction            │            │  │ How is two     │ │  │
│  │ Markdown content here...           │            │  │ pointer diff.. │ │  │
│  │                                    │            │  └────────────────┘ │  │
│  │  [Code Block ▼]                    │            │  ┌────────────────┐ │  │
│  └────────────────────────────────────┘            │  │ Great question! │ │  │
│                                                    │  │ Two pointers is │ │  │
│  ┌────────────────────────────────────┐            │  │ different from │ │  │
│  │ Section 2: Key Technique           │            │  │ sliding window  │ │  │
│  │ ...                                │            │  │ because...      │ │  │
│  └────────────────────────────────────┘            │  └────────────────┘ │  │
│                                                    │                     │  │
│  ┌────────────────────────────────────┐            │  [Quick Actions]    │  │
│  │ Interactive Visualizer             │            │  ┌─────┬──────┬───┐ │  │
│  └────────────────────────────────────┘            │  │Exp. │Comp. │Use│ │  │
│                                                    │  └─────┴──────┴───┘ │  │
│                                                    │  [Type a message...] │  │
│                                                    └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### AI Toggle

- **Button in sticky header**: Sparkle icon `✨` next to the stats ring
- **Keyboard shortcut**: `Cmd+Shift+A` (same as problem page)
- **Mobile**: Full-screen overlay (same pattern as problem page)

### Quick Actions (Pattern-Specific)

Instead of the problem-page actions (hint/review/explain/optimize/pattern), the pattern page gets:

| Action | Purpose |
|--------|---------|
| 📖 **Explain Concept** | Simplify a concept from the current tutorial section |
| 🔀 **Compare Patterns** | Compare this pattern with another (user picks) |
| 💡 **When to Use** | Summarize when this pattern applies |
| 🧩 **Walk Through** | Step-by-step walkthrough of a specific tutorial section |
| 🎯 **Practice Next** | Recommend which problem to solve first |

### Context-Aware Suggestions

When the user scrolls to a specific tutorial section, the AI should be aware of which section is visible and offer contextual help:

- Scrolled to "Common Mistakes" → Quick action: "Explain why this mistake happens"
- Scrolled to a variation → Quick action: "Show me more examples of this variation"
- Scrolled to code template → Quick action: "Walk me through the template step by step"

---

## AI Prompt Design

### Base System Prompt — Pattern Tutor

```
You are a DSA pattern tutor for AlgoPatterns.

You help users understand coding patterns — their concepts, variations,
and applications. You work alongside a detailed tutorial page.

CORE RULES:
1. Ground all answers in the PATTERN CONTEXT provided below
2. If the question is outside the pattern content, say so
3. Use analogies and examples from the content
4. Never invent pattern properties — only use what's in the context
5. For comparisons with other patterns, acknowledge what you know
   from context and suggest the user view that pattern's page
```

### Pattern Context Injection

The prompt receives the full pattern content as context:

```
PATTERN: {category}
DIFFICULTY: {difficulty}
DESCRIPTION: {description}

WHEN TO USE:
{whenToUse as bullet list}

KEY INSIGHTS:
{keyInsights as bullet list}

COMMON MISTAKES:
{commonMistakes as bullet list}

VARIATIONS:
{variations.map(v => `- ${v.name}: ${v.desc}. Use when: ${v.when}`)}

TIME COMPLEXITY: {timeComplexity}
SPACE COMPLEXITY: {spaceComplexity}

CURRENT TUTORIAL SECTION: {activeSectionTitle | "General Overview"}

TUTORIAL CONTENT (relevant sections):
{tutorialSections where section matches query}
```

### Response Style

```
EXPLAIN: Clear analogy → Core idea → Code-level view
COMPARE: Dimension 1 → Dimension 2 → Recommendation
WALKTHROUGH: Step 1 (what/why) → Step 2 → ... → Summary
PRACTICE: Which problem → Why it's a good start → What to focus on
```

---

## API Design

### Reuse Existing Endpoints

The existing `/api/v1/ai/chat` and `/api/v1/ai/chat/stream` endpoints are sufficient. The pattern page sends:

```json
{
  "message": "Explain the difference between variation 1 and 2",
  "session_id": "sess_pattern_abc",
  "problem_slug": "two-pointers",
  "pattern_id": "two-pointers",
  "code": "",
  "language": "java",
  "active_section": "variations",
  "history": [...]
}
```

Key: The backend detects `pattern_id` is set but `code` is empty → uses **Pattern Tutor** prompt instead of **Problem Tutor** prompt.

### No New Endpoints Required

| Endpoint | Used? | Notes |
|----------|-------|-------|
| `POST /ai/chat` | Yes | Same endpoint, different prompt |
| `POST /ai/chat/stream` | Yes | Same endpoint, different prompt |
| `POST /ai/hint` | No | Hints are problem-specific |
| `POST /ai/review` | No | No code to review |
| `POST /ai/explain` | No | No error to explain |

### Backend Changes

Minor change to `internal/ai/service.go` — detect if `patternId` is set and `code` is empty, route to a pattern-specific prompt builder.

Add to `internal/ai/prompts/templates.go`:

```go
const PatternTutorPrompt = `# PATTERN TUTORING

You are helping the user understand the {patternName} pattern.

## CONTEXT
The user is viewing the pattern's tutorial page.
Active section: {activeSection}

## RESPONSE MODES

### Explain (default)
Simplify the concept. Use analogies. Reference the tutorial.

### Compare
Compare this pattern with another. Cover:
- What problem each solves
- Input requirements
- Time/space tradeoffs
- How to decide between them

### WalkThrough
Step through a tutorial section:
1. What's happening
2. Why it works
3. How to remember it

### Practice
Recommend problems in order:
- Start here (covers core idea)
- Then this (adds twist)
- Finally this (full mastery)`
```

---

## Implementation Plan

### Phase 1: Backend Prompt Support (2 days)

| Task | Files | Description |
|------|-------|-------------|
| 1. Create pattern prompt template | `internal/ai/prompts/templates.go` | Add `PatternTutorPrompt` and `BuildPatternChatPrompt()` |
| 2. Update service router | `internal/ai/service.go` | Detect pattern-only mode (patternId present, code empty) |
| 3. Add pattern context builder | `internal/ai/service.go` | Method to build RAG context from pattern data |

### Phase 2: Frontend — AI Panel on Patterns Page (2 days)

| Task | Files | Description |
|------|-------|-------------|
| 1. Add AI state to PatternPageClient | `PatternPageClient.tsx` | `useState` for panel open/close, pass pattern as context |
| 2. Add AI toggle button | `PatternPageClient.tsx` | Sparkle icon in sticky header |
| 3. Render AIChatPanel | `PatternPageClient.tsx` | Reuse existing component, pass pattern data |
| 4. Add pattern quick actions | New component or modify existing | Explain, Compare, WhenToUse, WalkThrough, Practice |

### Phase 3: Context-Aware Features (1 day)

| Task | Description |
|------|-------------|
| 1. Track active section | Detect which tutorial section is in viewport |
| 2. Send section context to AI | Include `activeSection` in chat request |
| 3. Contextual quick actions | Quick actions change based on visible section |

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| AI panel adoption | >25% of pattern page visitors | Panel open events |
| Questions per session | >3 | Chat messages per pattern session |
| Helpful rating | >70% | Thumbs up/down on responses |
| Pattern understanding | +20% quiz score improvement | A/B test on quiz completion |
| Tutorial completion rate | +15% | Users who view all sections |
| Problem page conversion | +10% | Click from pattern → problem page |

---

## Appendix: Frontend Integration Points

### PatternPageClient.tsx Changes

```tsx
// New imports
import { AIChatPanel } from "@/components/ai";

// New state
const [isAIChatOpen, setIsAIChatOpen] = useState(false);
const [activeSection, setActiveSection] = useState<string>("");

// Track scroll position for active section
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveSection(entry.target.getAttribute("data-section-id") || "");
      }
    });
  }, { threshold: 0.5 });
  // Observe tutorial sections
  document.querySelectorAll("[data-section-id]").forEach(el => observer.observe(el));
  return () => observer.disconnect();
}, [pattern.id]);

// AI Toggle in header
<button onClick={() => setIsAIChatOpen(!isAIChatOpen)}>
  <SparkleIcon />
</button>

// AI Panel (side panel or mobile overlay)
<AIChatPanel
  problemSlug={pattern.id}
  problemTitle={pattern.category}
  problemDescription={pattern.description}
  activeSection={activeSection}
  code=""  // No code in pattern view
  language="java"
  isOpen={isAIChatOpen}
  onClose={() => setIsAIChatOpen(false)}
/>
```

### Reuse of Existing Components

| Component | Status | Changes Needed |
|-----------|--------|----------------|
| `AIChatPanel` | Reuse as-is | No props changes needed |
| `ChatMessage` | Reuse as-is | No changes |
| `ChatInput` | Reuse as-is | No changes |
| `QuickActions` | New variant needed | Pattern-specific actions instead of problem actions |
| `AIToggleButton` | Reuse as-is | Just a button wrapper |

### New Component: PatternQuickActions

Extend or create a variant of `QuickActions` with pattern-specific buttons:

```tsx
interface PatternQuickActionsProps {
  patternId: string;
  patternName: string;
  activeSection: string;
  onExplainConcept: () => void;
  onComparePatterns: () => void;
  onWhenToUse: () => void;
  onWalkThrough: () => void;
  onPracticeNext: () => void;
}
```

Each action sends a pre-prompted message through the existing `sendMessage` hook. For example, "Explain Concept" sends: *"Please explain the {activeSection} section in simpler terms with an example."*
