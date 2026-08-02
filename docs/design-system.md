# AlgoPatterns Design System

A comprehensive design system for the AlgoPatterns platform, defining visual language, tokens, components, and patterns used across the frontend.

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing and Layout](#4-spacing-and-layout)
5. [Border Radius](#5-border-radius)
6. [Shadows and Effects](#6-shadows-and-effects)
7. [Components](#7-components)
8. [Animations](#8-animations)
9. [Theming](#9-theming)
10. [Usage Guidelines](#10-usage-guidelines)

---

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Dark-First** | Dark theme is the default; light theme adapts gracefully |
| **Code-First** | Code blocks are hero elements, prominently displayed with syntax highlighting |
| **Consistency** | Use existing design tokens; no ad-hoc values |
| **Hierarchy** | Clear visual distinction between headings, body, and muted text |
| **Scannability** | Developers can quickly find what they need |
| **Glass Morphism** | Subtle transparency and blur effects for depth |
| **Progressive Disclosure** | Show overview first, details on demand |

---

## 2. Color System

### 2.1 Design Tokens (CSS Custom Properties)

All colors are defined in `frontend/src/app/globals.css` and should be referenced via CSS variables.

#### Backgrounds

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--bg-base` | `#030712` | `#f1f5f9` | Page background |
| `--bg-surface` | `rgba(17, 24, 39, 0.8)` | `rgba(255, 255, 255, 0.95)` | Cards, panels |
| `--bg-elevated` | `rgba(31, 41, 55, 0.7)` | `rgba(255, 255, 255, 1)` | Elevated elements, hover states |
| `--bg-hover` | `rgba(55, 65, 81, 0.6)` | `rgba(241, 245, 249, 1)` | Hover states |
| `--card-bg` | `rgba(17, 24, 39, 0.6)` | `rgba(255, 255, 255, 0.85)` | Glass card backgrounds |

#### Accent Colors (Indigo/Purple Palette)

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--accent-1` | `#6366f1` | `#4f46e5` | Primary accent (Indigo) |
| `--accent-2` | `#a855f7` | `#7c3aed` | Secondary accent (Purple) |
| `--accent-gradient` | `linear-gradient(135deg, #6366f1, #a855f7)` | `linear-gradient(135deg, #4f46e5, #7c3aed)` | Gradient for buttons, badges |

#### Text Colors

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--text-1` | `#f9fafb` | `#0f172a` | Primary text, headings |
| `--text-2` | `#9ca3af` | `#334155` | Secondary text, descriptions |
| `--text-3` | `#6b7280` | `#64748b` | Muted text, placeholders |

#### Borders

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--border-1` | `rgba(99, 102, 241, 0.15)` | `rgba(99, 102, 241, 0.25)` | Subtle borders |
| `--border-2` | `rgba(99, 102, 241, 0.4)` | `rgba(99, 102, 241, 0.6)` | Emphasized borders |

### 2.2 Semantic Colors

Used with Tailwind classes for status indicators:

| Status | Color | Tailwind Class | Usage |
|--------|-------|----------------|-------|
| Success | `#22c55e` | `green-500` | Completed, passed |
| Warning | `#eab308` | `yellow-500` | Pending, caution |
| Error | `#ef4444` | `red-500` | Failed, error |
| Info | `#3b82f6` | `blue-500` | Information |

### 2.3 Language-Specific Accents

For language guide pages:

| Language | Accent Color | CSS Variable |
|----------|--------------|--------------|
| Go | `#00ADD8` | `--lang-accent: #00ADD8` |
| Rust | `#DEA584` | `--lang-accent: #DEA584` |
| Java | `#ED8B00` | `--lang-accent: #ED8B00` |
| Python | `#3776AB` | `--lang-accent: #3776AB` |

Apply with scoped class: `.language-go { --lang-accent: #00ADD8; }`

---

## 3. Typography

### 3.1 Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-heading` | `'Inter', system-ui, sans-serif` | Headings (h1-h6) |
| `--font-body` | `'Inter', system-ui, sans-serif` | Body text |
| `--font-mono` | `'JetBrains Mono', monospace` | Code, pre, technical |

Fonts are loaded from Google Fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

### 3.2 Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | `400` | Body text |
| Medium | `500` | Emphasized text, labels |
| Semibold | `600` | Subheadings, buttons |
| Bold | `700` | Headings |

### 3.3 Text Sizes (Tailwind)

| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 0.75rem (12px) | Badges, metadata |
| `text-sm` | 0.875rem (14px) | Secondary text, labels |
| `text-base` | 1rem (16px) | Body text |
| `text-lg` | 1.125rem (18px) | Large body, small headings |
| `text-xl` | 1.25rem (20px) | Section headings |
| `text-2xl` | 1.5rem (24px) | Page headings |

### 3.4 Line Height

- Code blocks: `line-height: 1.6`
- Body text: Default Tailwind (`leading-normal`)

---

## 4. Spacing and Layout

### 4.1 Spacing Scale

Use Tailwind's default spacing scale. Common values:

| Value | Pixels | Usage |
|-------|--------|-------|
| `1` | 4px | Tight spacing |
| `2` | 8px | Small gaps |
| `3` | 12px | Button padding (y) |
| `4` | 16px | Standard padding |
| `6` | 24px | Section spacing |
| `8` | 32px | Large spacing |

### 4.2 Container Widths

| Context | Width | Class |
|---------|-------|-------|
| Content max | 1152px | `max-w-6xl` |
| Full width | 100% | `w-full` |

### 4.3 Standard Padding

| Element | Padding |
|---------|---------|
| Page container | `px-4 md:px-6` |
| Cards | `p-4` or `px-4 py-3` |
| Buttons | `px-3 py-1.5` or `px-4 py-2.5` |

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `0.625rem` (10px) | Pills, badges |
| `--radius-md` | `0.875rem` (14px) | Buttons, inputs |
| `--radius-lg` | `1.25rem` (20px) | Cards |
| `--radius-xl` | `1.75rem` (28px) | Large panels |
| `--radius-full` | `9999px` | Circular elements |

Tailwind equivalents: `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full`

---

## 6. Shadows and Effects

### 6.1 Shadow Tokens

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.3)` | `0 1px 3px rgba(0,0,0,0.08)` | Subtle elevation |
| `--shadow-md` | `0 8px 16px rgba(0,0,0,0.4)` | `0 4px 12px rgba(0,0,0,0.08)` | Cards, dropdowns |
| `--shadow-lg` | `0 16px 32px rgba(0,0,0,0.5)` | `0 10px 25px rgba(0,0,0,0.1)` | Modals, overlays |
| `--shadow-glow` | `0 0 60px rgba(99,102,241,0.2), 0 0 100px rgba(168,85,247,0.1)` | `0 0 30px rgba(99,102,241,0.12)` | Accent glow |

### 6.2 Glass Effect

```css
--blur: 20px;
backdrop-filter: blur(var(--blur));
background: var(--card-bg);
```

### 6.3 Body Gradient (Dark Theme)

```css
background:
  radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent),
  radial-gradient(ellipse 60% 40% at 100% 100%, rgba(168, 85, 247, 0.1), transparent),
  var(--bg-base);
```

---

## 7. Components

### 7.1 Buttons

**Primary Button**
```tsx
<button
  className="px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
  style={{
    background: "var(--accent-gradient)",
    color: "white",
    borderRadius: "var(--radius-md)"
  }}
>
  Action
</button>
```

**Secondary Button**
```tsx
<button
  className="px-3 py-1.5 text-sm font-medium transition-colors rounded-md border"
  style={{
    background: "var(--bg-surface)",
    color: "var(--text-1)",
    border: "1px solid var(--border-1)"
  }}
>
  Secondary
</button>
```

**Ghost Button (Hover only)**
```tsx
<button className="p-2 rounded-md transition-colors hover:bg-white/10">
  <Icon />
</button>
```

### 7.2 Cards

**Standard Card**
```tsx
<div
  className="rounded-lg border overflow-hidden"
  style={{
    background: "var(--bg-surface)",
    border: "1px solid var(--border-1)"
  }}
>
  {/* Content */}
</div>
```

**Glass Card**
```tsx
<div
  className="rounded-lg backdrop-blur-md"
  style={{
    background: "var(--card-bg)",
    border: "1px solid var(--border-1)"
  }}
>
  {/* Content */}
</div>
```

### 7.3 Code Blocks

Code blocks use a dedicated dark theme (`#011627`) regardless of app theme. Key elements:

- Header bar with macOS-style dots (red, yellow, green)
- Language label
- Copy button with success state
- Syntax highlighting via `react-syntax-highlighter` with `oneDark` theme
- Line numbers in muted gray (`#4a5568`)

See `frontend/src/components/ui/CodeBlock.tsx` for implementation.

### 7.4 Inputs

```tsx
<input
  className="w-full px-4 py-3 text-sm transition-all"
  style={{
    background: "var(--bg-surface)",
    border: "1px solid var(--border-1)",
    borderRadius: "var(--radius-lg)",
    color: "var(--text-1)"
  }}
  placeholder="Search..."
/>
```

Focus state: `border-color: var(--accent-1)`

### 7.5 Dropdowns

Use design tokens for consistency. See `frontend/src/components/ui/Dropdown.tsx`.

Key styles:
- Trigger: `var(--bg-surface)`, `var(--border-1)`
- Menu: `var(--bg-surface)`, `var(--shadow-lg)`
- Selected item: `rgba(var(--accent-1-rgb), 0.1)` background
- Hover: `var(--bg-elevated)`

### 7.6 Badges

```tsx
<span
  className="px-2 py-0.5 text-xs font-medium"
  style={{
    background: "rgba(99, 102, 241, 0.2)",
    color: "var(--accent-1)",
    borderRadius: "var(--radius-sm)"
  }}
>
  Badge
</span>
```

Status variants:
- Success: `bg-green-500/20 text-green-400`
- Warning: `bg-yellow-500/20 text-yellow-400`
- Error: `bg-red-500/20 text-red-400`
- Info: `bg-blue-500/20 text-blue-400`

### 7.7 Progress Indicators

**Linear Progress Bar**
```tsx
<div
  className="h-1.5 overflow-hidden"
  style={{
    background: "var(--bg-elevated)",
    borderRadius: "var(--radius-full)"
  }}
>
  <div
    className="h-full transition-all duration-500"
    style={{
      width: `${percent}%`,
      background: "var(--accent-gradient)"
    }}
  />
</div>
```

**Circular Progress**
See `frontend/src/components/layout/HeaderProgress.tsx` for SVG implementation.

### 7.8 Tooltips

```css
.tooltip-wrap {
  position: relative;
}
.tooltip-wrap::after {
  content: attr(data-tooltip);
  position: absolute;
  top: calc(100% + 1px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: #1f2937;
  color: #e5e7eb;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #374151;
  opacity: 0;
  transition: opacity 0.1s ease;
  z-index: 9999;
}
.tooltip-wrap:hover::after {
  opacity: 1;
}
```

---

## 8. Animations

### 8.1 Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease forwards;
}
```

### 8.2 Highlight Fade In

For text highlighting:
```css
@keyframes highlightFadeIn {
  0% { opacity: 0; transform: scaleX(0.92) scaleY(0.85); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: scaleX(1) scaleY(1); }
}
```

### 8.3 Transitions

Standard transition for interactive elements:
```css
transition-colors  /* Color changes */
transition-all     /* All properties */
duration-200       /* 200ms duration */
duration-500       /* 500ms for progress bars */
```

---

## 9. Theming

### 9.1 Theme Classes

- `.dark` or `:root` (default): Dark theme
- `.light`: Light theme

Theme is toggled via class on root element, managed by `ThemeContext`.

### 9.2 Theme-Safe Components

Use `.theme-dark` class wrapper to preserve dark styling for components that should always be dark (e.g., code blocks):

```tsx
<div className="theme-dark">
  {/* Always dark, even in light mode */}
</div>
```

### 9.3 Light Theme Overrides

Light theme overrides are defined in `globals.css` using CSS nesting:
```css
.light {
  & .bg-gray-900 { background-color: #ffffff !important; }
  & .text-white { color: #0f172a !important; }
  /* ... */
}
```

---

## 10. Usage Guidelines

### 10.1 Do's

- Always use CSS custom properties for colors, not hard-coded values
- Use Tailwind utility classes for spacing and layout
- Apply transitions to interactive elements
- Test both dark and light themes
- Use semantic color names (success, warning, error)

### 10.2 Don'ts

- Don't create new color values without adding to design tokens
- Don't use inline styles for colors (use `style={{ color: "var(--text-1)" }}`)
- Don't mix px and rem inconsistently
- Don't add decorative dividers in code comments

### 10.3 Adding New Components

1. Check if an existing component can be reused
2. Use design tokens from `globals.css`
3. Follow existing patterns in `components/ui/`
4. Support both themes
5. Add appropriate transitions and hover states

### 10.4 File Locations

| File | Purpose |
|------|---------|
| `frontend/src/app/globals.css` | Design tokens, global styles |
| `frontend/src/components/ui/` | Reusable UI components |
| `frontend/src/components/layout/` | Header, Footer, navigation |

---

## Quick Reference: Common Patterns

### Accent Gradient Text
```tsx
<span
  className="bg-clip-text text-transparent"
  style={{ backgroundImage: "var(--accent-gradient)" }}
>
  Gradient Text
</span>
```

### Glass Panel
```tsx
<div
  className="backdrop-blur-md rounded-lg"
  style={{
    background: "var(--card-bg)",
    border: "1px solid var(--border-1)"
  }}
/>
```

### Interactive Link
```tsx
<a
  className="transition-colors hover:opacity-80"
  style={{ color: "var(--accent-1)" }}
>
  Link
</a>
```

### Scrollbar Styling
```css
.scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: var(--bg-elevated); border-radius: 4px; }
```
