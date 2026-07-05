# About

This document describes the design of the global search feature for AlgoPatterns. It covers the motivation, architecture, data model, and implementation considerations for a Spotlight-style search interface that enables users to quickly find patterns, questions, articles, and more across the entire platform. This is a living document and may be updated as the implementation evolves.

# Overview

AlgoPatterns is an educational platform for learning algorithm patterns through code templates, insights, and tutorials. The primary design goals for the global search feature are **speed**, **discoverability**, and **unified access**. Users should be able to find any content on the platform within seconds, preview results before navigating, and access their search history and favorites from a single interface.

The entry point for global search is the keyboard shortcut `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux), which opens a centered modal overlay similar to macOS Spotlight or VS Code's command palette. The modal provides real-time search results grouped by content type, with keyboard navigation and a preview panel for quick content inspection before navigation.

Global search is implemented as a server-side API with optional AI-powered semantic search mode. This architecture supports:
- Full-text search across all content types with ranking
- User-specific results (recently viewed, favorites, highlights)
- Semantic search via the existing RAG/embedding infrastructure
- Scalable indexing as content grows

AlgoPatterns achieves speed:
- Debounced search requests (300ms) minimize API calls while typing
- Instant local results for recent searches and favorites (cached in IndexedDB)
- Server-side full-text indexes ensure sub-100ms query times
- Optimistic UI shows cached results while fresh results load

AlgoPatterns achieves discoverability:
- Search across 6 content types: patterns, questions, concepts, articles, solutions, highlights
- AI-powered semantic mode understands intent ("array problems for interviews" finds relevant questions)
- Faceted results show content grouped by type with counts
- Preview panel shows key details without leaving the search modal

AlgoPatterns achieves unified access:
- Single shortcut (`Cmd/Ctrl+K`) from anywhere in the app
- Recent searches persist across sessions
- Recently viewed content appears as suggestions
- Favorites/bookmarks are searchable alongside regular content

# Architecture

AlgoPatterns implements a layered architecture for the global search feature. The frontend centers on the `SearchModal` component, which manages UI state, keyboard interactions, and result rendering. It communicates with the `SearchService` for API calls and `SearchCache` (IndexedDB) for local persistence. The backend follows the standard handler-service-repository pattern, with a dedicated `SearchService` that orchestrates queries across multiple repositories.

```
+-------------------------------------------------------------------+
|                       Frontend (Next.js 16)                       |
|                                                                   |
|  +-------------+    +-------------+    +-------------+            |
|  |  SearchModal|    |   Search    |    |   Search    |            |
|  | (Cmd+K UI)  |--->|   Context   |--->|   Service   |            |
|  +-------------+    +-------------+    +-------------+            |
|        |                  |                  |                    |
|        v                  v                  |                    |
|  +-------------+    +-------------+          |                    |
|  |   Preview   |    |  IndexedDB  |          |                    |
|  |    Panel    |    |    Cache    |          |                    |
|  +-------------+    +-------------+          |                    |
|                                              |                    |
+----------------------------------------------+--------------------+
                                               |
                                               | HTTPS
                                               v
+-------------------------------------------------------------------+
|                          Backend (Go)                             |
|                                                                   |
|  +-------------+    +-------------+    +------------------+       |
|  |   Search    |    |   Search    |    |   Repositories   |       |
|  |   Handler   |--->|   Service   |--->| Pattern/Problem/ |       |
|  +-------------+    +-------------+    | Article/Highlight|       |
|        |                  |            +------------------+       |
|        v                  v                                       |
|  +-------------+    +-------------+                               |
|  |    Auth     |    |  RAG/AI     |                               |
|  | Middleware  |    |  Service    |                               |
|  | (Optional)  |    | (Optional)  |                               |
|  +-------------+    +-------------+                               |
|                                                                   |
+-----------------------------------+-------------------------------+
                                    |
                                    | SQL
                                    v
                          +------------------+
                          |   CockroachDB    |
                          |                  |
                          | - patterns       |
                          | - problems       |
                          | - user_highlights|
                          | - search_history |
                          +------------------+
```

The SearchModal component is rendered at the root layout level, ensuring it's accessible from any page. It captures the `Cmd+K` / `Ctrl+K` keyboard shortcut globally via a `useEffect` hook that listens for `keydown` events. When opened, the modal renders:
- A search input with mode toggle (keyword vs AI)
- Quick access section (recent searches, recently viewed, favorites)
- Grouped search results with type icons
- Preview panel for the currently highlighted result
- Keyboard navigation hints

The SearchContext maintains global search state: open/closed status, search query, selected result index, search mode (keyword/AI), and cached results. It provides methods for opening/closing the modal, executing searches, and managing recent searches.

# Content Types

Global search indexes the following content types, each with specific searchable fields and preview data:

| Content Type | Searchable Fields | Preview Shows | Source |
|-------------|-------------------|---------------|--------|
| Pattern | id, category, description, whenToUse, keyInsights | Description, difficulty, complexity | patterns table |
| Question | name, pattern, category, companies | Difficulty, pattern, companies, LeetCode link | problems table |
| Concept | name, description, category, keyPoints | Description, time/space complexity, code snippet | concepts table |
| Article | title, description, tags, section content | Description, difficulty, estimated time, tags | articles table |
| Solution | problem name, approach, steps | Approach, complexity, code preview | solutions table |
| Highlight | selected_text, note | Context (pattern/code), note, color | user_highlights |

For user-specific content (highlights, favorites), results are filtered by authenticated user. Anonymous users only see public content.

# Search Modes

The search feature supports two modes, toggled via a button in the search input:

## Keyword Mode (Default)

Uses PostgreSQL full-text search with `tsvector` and `tsquery`:
- Tokenizes query into terms
- Matches against indexed fields
- Ranks by relevance (term frequency, field weight)
- Supports prefix matching ("two-po" matches "two-pointers")
- Fast and predictable results

## AI Mode (Optional)

Uses the existing RAG infrastructure for semantic search:
- Generates embedding from query text
- Performs vector similarity search against indexed content
- Returns semantically similar results even without keyword matches
- Better for natural language queries ("problems about finding cycles")
- Requires authenticated user (rate-limited resource)

Mode selection persists in localStorage and is remembered across sessions.

# Data Model

The search feature requires minimal schema changes, primarily adding search history tracking and ensuring full-text indexes exist.

## New Tables

```sql
-- Search history for recent searches and suggestions
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    query TEXT NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'keyword'
        CHECK (mode IN ('keyword', 'ai')),
    result_count INT NOT NULL DEFAULT 0,
    
    -- For anonymous users, store a session identifier
    session_id VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON search_history(user_id, created_at DESC);
CREATE INDEX idx_search_history_session ON search_history(session_id, created_at DESC)
    WHERE session_id IS NOT NULL;

-- User favorites/bookmarks (if not already exists)
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX idx_favorites_user ON user_favorites(user_id, created_at DESC);

-- Recently viewed content tracking
CREATE TABLE IF NOT EXISTS user_recent_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content_type VARCHAR(50) NOT NULL,
    content_id VARCHAR(100) NOT NULL,
    
    view_count INT NOT NULL DEFAULT 1,
    last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, content_type, content_id)
);

CREATE INDEX idx_recent_views_user ON user_recent_views(user_id, last_viewed_at DESC);
```

## Full-Text Indexes

```sql
-- Add full-text search columns to patterns
ALTER TABLE patterns ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_pattern_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.when_to_use::text, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.key_insights::text, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pattern_search_update
    BEFORE INSERT OR UPDATE ON patterns
    FOR EACH ROW EXECUTE FUNCTION update_pattern_search_vector();

CREATE INDEX idx_patterns_search ON patterns USING gin(search_vector);

-- Similar for problems table
ALTER TABLE problems ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_problem_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.slug, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.hints::text, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER problem_search_update
    BEFORE INSERT OR UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION update_problem_search_vector();

CREATE INDEX idx_problems_search ON problems USING gin(search_vector);
```

# API Design

The search API follows REST conventions consistent with the existing AlgoPatterns API.

## Search Endpoint

```
GET /api/v1/search?q={query}&mode={keyword|ai}&types={pattern,question,concept}&limit=20
Authorization: Bearer <token> (optional)
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| q | string | Yes | Search query (min 2 chars) |
| mode | string | No | Search mode: "keyword" (default) or "ai" |
| types | string | No | Comma-separated content types to search (default: all) |
| limit | int | No | Max results per type (default: 5, max: 20) |

**Response:**

```json
{
  "success": true,
  "data": {
    "query": "two pointers",
    "mode": "keyword",
    "totalResults": 23,
    "results": {
      "patterns": [
        {
          "id": "two-pointers",
          "type": "pattern",
          "title": "Two Pointers",
          "description": "Use two pointers to traverse array/string efficiently...",
          "difficulty": "Easy-Medium",
          "url": "/patterns/two-pointers",
          "preview": {
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)",
            "category": "Array/String"
          },
          "score": 0.95
        }
      ],
      "questions": [
        {
          "id": "two-sum-ii",
          "type": "question",
          "title": "Two Sum II - Input Array Is Sorted",
          "description": "Find two numbers that add up to target...",
          "difficulty": "Medium",
          "url": "/problems/two-sum-ii",
          "preview": {
            "pattern": "Two Pointers",
            "companies": ["Amazon", "Google", "Meta"],
            "leetcodeUrl": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted"
          },
          "score": 0.89
        }
      ],
      "concepts": [],
      "articles": [],
      "solutions": [],
      "highlights": []
    },
    "suggestions": [
      "two pointers sliding window",
      "two pointers linked list"
    ]
  }
}
```

## Search History Endpoint

```
GET /api/v1/search/history?limit=10
Authorization: Bearer <token>
```

Returns recent searches for the authenticated user.

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid-1",
        "query": "binary search",
        "mode": "keyword",
        "resultCount": 15,
        "createdAt": "2026-07-05T10:30:00Z"
      }
    ]
  }
}
```

## Clear Search History

```
DELETE /api/v1/search/history
Authorization: Bearer <token>
```

Clears all search history for the authenticated user.

## Recently Viewed Endpoint

```
GET /api/v1/search/recent?limit=10
Authorization: Bearer <token>
```

Returns recently viewed content.

```json
{
  "success": true,
  "data": {
    "recent": [
      {
        "contentType": "pattern",
        "contentId": "sliding-window",
        "title": "Sliding Window",
        "url": "/patterns/sliding-window",
        "lastViewedAt": "2026-07-05T09:15:00Z",
        "viewCount": 5
      }
    ]
  }
}
```

## Track View Endpoint

```
POST /api/v1/search/track-view
Authorization: Bearer <token>
Content-Type: application/json

{
  "contentType": "pattern",
  "contentId": "two-pointers"
}
```

Tracks a content view for the recently viewed list.

## Favorites Endpoints

```
GET /api/v1/favorites?limit=20
POST /api/v1/favorites
DELETE /api/v1/favorites/{id}
Authorization: Bearer <token>
```

# Frontend Implementation

The frontend implementation centers on three key components: the `SearchModal`, `SearchContext`, and `SearchService`.

## Keyboard Shortcut Handler

```typescript
// In root layout or a global hook
function useGlobalSearch() {
  const { openSearch } = useSearch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);
}
```

## SearchModal Component

The modal uses a Portal to render at the document root, with a backdrop overlay and centered content.

```typescript
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"keyword" | "ai">("keyword");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await searchService.search(query, mode);
      setResults(res);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, mode]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const flatResults = flattenResults(results);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          navigateToResult(flatResults[selectedIndex]);
          onClose();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
      case "Tab":
        e.preventDefault();
        setMode((m) => (m === "keyword" ? "ai" : "keyword"));
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative flex items-start justify-center pt-[15vh]">
          <div
            className="w-full max-w-2xl bg-gray-900 rounded-xl 
                        border border-gray-700 shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <SearchIcon className="w-5 h-5 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search patterns, questions, articles..."
                className="flex-1 bg-transparent text-white placeholder-gray-500
                           outline-none text-lg"
              />
              <ModeToggle mode={mode} onChange={setMode} />
              <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-800 rounded">
                ESC
              </kbd>
            </div>

            {/* Results Area */}
            <div className="flex max-h-[60vh]">
              {/* Results List */}
              <div className="flex-1 overflow-y-auto">
                {query.length < 2 ? (
                  <QuickAccess />
                ) : isLoading ? (
                  <SearchSkeleton />
                ) : results ? (
                  <SearchResults
                    results={results}
                    selectedIndex={selectedIndex}
                    onSelect={(result) => {
                      navigateToResult(result);
                      onClose();
                    }}
                  />
                ) : null}
              </div>

              {/* Preview Panel */}
              {results && flattenResults(results)[selectedIndex] && (
                <PreviewPanel result={flattenResults(results)[selectedIndex]} />
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2 
                          border-t border-gray-800 text-xs text-gray-500"
            >
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">
                    Arrow Up/Down
                  </kbd>{" "}
                  to navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Enter</kbd>{" "}
                  to select
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Tab</kbd>{" "}
                  toggle AI mode
                </span>
              </div>
              {mode === "ai" && (
                <span className="flex items-center gap-1 text-purple-400">
                  <SparklesIcon className="w-3 h-3" />
                  AI-powered
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
```

## Quick Access Section

Shows recent searches, recently viewed, and favorites when the search input is empty or has fewer than 2 characters.

```typescript
function QuickAccess() {
  const { recentSearches, recentlyViewed, favorites } = useSearch();

  return (
    <div className="p-4 space-y-6">
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">
            Recent Searches
          </h3>
          <div className="space-y-1">
            {recentSearches.slice(0, 5).map((search) => (
              <button
                key={search.id}
                onClick={() => setQuery(search.query)}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg
                           hover:bg-gray-800 text-left transition-colors"
              >
                <HistoryIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">{search.query}</span>
                <span className="ml-auto text-xs text-gray-600">
                  {search.resultCount} results
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">
            Recently Viewed
          </h3>
          <div className="space-y-1">
            {recentlyViewed.slice(0, 5).map((item) => (
              <RecentItem key={`${item.contentType}-${item.contentId}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">
            Favorites
          </h3>
          <div className="space-y-1">
            {favorites.slice(0, 5).map((item) => (
              <FavoriteItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {recentSearches.length === 0 &&
        recentlyViewed.length === 0 &&
        favorites.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <SearchIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Start typing to search patterns, questions, and more</p>
          </div>
        )}
    </div>
  );
}
```

## Preview Panel

Shows detailed information about the currently selected result.

```typescript
interface PreviewPanelProps {
  result: SearchResult;
}

function PreviewPanel({ result }: PreviewPanelProps) {
  return (
    <div className="w-80 border-l border-gray-800 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <ContentTypeIcon type={result.type} className="w-8 h-8" />
        <div>
          <h3 className="font-medium text-white">{result.title}</h3>
          <span className="text-xs text-gray-500 capitalize">{result.type}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 mb-4 line-clamp-3">
        {result.description}
      </p>

      {/* Type-specific preview */}
      {result.type === "pattern" && <PatternPreview data={result.preview} />}
      {result.type === "question" && <QuestionPreview data={result.preview} />}
      {result.type === "article" && <ArticlePreview data={result.preview} />}
      {result.type === "highlight" && <HighlightPreview data={result.preview} />}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <button
          className="flex items-center gap-2 text-sm text-teal-400 
                     hover:text-teal-300 transition-colors"
        >
          <ExternalLinkIcon className="w-4 h-4" />
          Open in new tab
        </button>
      </div>
    </div>
  );
}

function PatternPreview({ data }: { data: PatternPreviewData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DifficultyBadge difficulty={data.difficulty} />
        <span className="text-xs text-gray-500">{data.category}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/50 rounded px-2 py-1">
          <span className="text-gray-500">Time:</span>{" "}
          <span className="text-gray-300">{data.timeComplexity}</span>
        </div>
        <div className="bg-gray-800/50 rounded px-2 py-1">
          <span className="text-gray-500">Space:</span>{" "}
          <span className="text-gray-300">{data.spaceComplexity}</span>
        </div>
      </div>
    </div>
  );
}

function QuestionPreview({ data }: { data: QuestionPreviewData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DifficultyBadge difficulty={data.difficulty} />
        <span className="text-xs text-gray-500">{data.pattern}</span>
      </div>
      {data.companies.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.companies.slice(0, 5).map((company) => (
            <span
              key={company}
              className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded"
            >
              {company}
            </span>
          ))}
          {data.companies.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">
              +{data.companies.length - 5} more
            </span>
          )}
        </div>
      )}
      {data.leetcodeUrl && (
        <a
          href={data.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-orange-400 
                     hover:text-orange-300"
        >
          <LeetCodeIcon className="w-3 h-3" />
          View on LeetCode
        </a>
      )}
    </div>
  );
}
```

## SearchContext

Manages global search state and provides methods for search operations.

```typescript
interface SearchContextValue {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  recentSearches: SearchHistoryItem[];
  recentlyViewed: RecentViewItem[];
  favorites: FavoriteItem[];
  addToHistory: (query: string, mode: string, resultCount: number) => void;
  trackView: (contentType: string, contentId: string) => void;
  clearHistory: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentViewItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { isAuthenticated } = useAuth();

  // Load data on mount
  useEffect(() => {
    loadSearchData();
  }, [isAuthenticated]);

  const loadSearchData = async () => {
    // Load from IndexedDB first (instant)
    const cached = await searchDB.getAll();
    setRecentSearches(cached.searches);
    setRecentlyViewed(cached.recentViews);
    setFavorites(cached.favorites);

    // Then fetch fresh data from server if authenticated
    if (isAuthenticated) {
      const [historyRes, recentRes, favRes] = await Promise.all([
        searchService.getHistory(),
        searchService.getRecentViews(),
        searchService.getFavorites(),
      ]);
      setRecentSearches(historyRes.history);
      setRecentlyViewed(recentRes.recent);
      setFavorites(favRes.favorites);

      // Update IndexedDB cache
      await searchDB.sync({
        searches: historyRes.history,
        recentViews: recentRes.recent,
        favorites: favRes.favorites,
      });
    }
  };

  const addToHistory = async (query: string, mode: string, resultCount: number) => {
    const item = { query, mode, resultCount, createdAt: new Date().toISOString() };

    // Optimistic update
    setRecentSearches((prev) => [item, ...prev.slice(0, 9)]);

    // Persist
    if (isAuthenticated) {
      await searchService.addToHistory(query, mode, resultCount);
    }
    await searchDB.addSearch(item);
  };

  const trackView = async (contentType: string, contentId: string) => {
    if (isAuthenticated) {
      await searchService.trackView(contentType, contentId);
    }
    await searchDB.addRecentView(contentType, contentId);
  };

  return (
    <SearchContext.Provider
      value={{
        isOpen,
        openSearch: () => setIsOpen(true),
        closeSearch: () => setIsOpen(false),
        recentSearches,
        recentlyViewed,
        favorites,
        addToHistory,
        trackView,
        clearHistory: async () => {
          setRecentSearches([]);
          if (isAuthenticated) {
            await searchService.clearHistory();
          }
          await searchDB.clearSearches();
        },
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
```

## IndexedDB Cache

Local persistence for instant access to recent data.

```typescript
const DB_NAME = "algopatterns-search";
const DB_VERSION = 1;

interface SearchDB {
  searches: SearchHistoryItem[];
  recentViews: RecentViewItem[];
  favorites: FavoriteItem[];
  lastSyncAt: number;
}

class SearchDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore("searches", { keyPath: "id", autoIncrement: true });
        db.createObjectStore("recentViews", { keyPath: "id" });
        db.createObjectStore("favorites", { keyPath: "id" });
        db.createObjectStore("meta", { keyPath: "key" });
      };
    });
  }

  async getAll(): Promise<SearchDB> {
    // Implementation
  }

  async addSearch(item: SearchHistoryItem): Promise<void> {
    // Implementation
  }

  async addRecentView(contentType: string, contentId: string): Promise<void> {
    // Implementation
  }

  async sync(data: Partial<SearchDB>): Promise<void> {
    // Implementation
  }

  async clearSearches(): Promise<void> {
    // Implementation
  }
}

export const searchDB = new SearchDBService();
```

# Backend Implementation

The backend implementation follows the handler-service-repository pattern.

## Search Handler

```go
// internal/handlers/search_handler.go

type SearchHandler struct {
    searchService services.SearchServiceInterface
}

func NewSearchHandler(searchService services.SearchServiceInterface) *SearchHandler {
    return &SearchHandler{searchService: searchService}
}

func (h *SearchHandler) RegisterRoutes(r *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
    search := r.Group("/search")
    {
        search.GET("", h.Search)                    // Public search
        search.GET("/history", authMiddleware, h.GetHistory)
        search.DELETE("/history", authMiddleware, h.ClearHistory)
        search.GET("/recent", authMiddleware, h.GetRecentViews)
        search.POST("/track-view", authMiddleware, h.TrackView)
    }
}

func (h *SearchHandler) Search(c *gin.Context) {
    query := c.Query("q")
    if len(query) < 2 {
        response.BadRequest(c, "Query must be at least 2 characters")
        return
    }

    mode := c.DefaultQuery("mode", "keyword")
    types := strings.Split(c.DefaultQuery("types", "pattern,question,concept,article"), ",")
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
    if limit > 20 {
        limit = 20
    }

    // Get user ID if authenticated (for highlights search)
    var userID *uuid.UUID
    if claims, exists := c.Get("user"); exists {
        if userClaims, ok := claims.(*models.JWTClaims); ok {
            userID = &userClaims.UserID
        }
    }

    req := &models.SearchRequest{
        Query:   query,
        Mode:    mode,
        Types:   types,
        Limit:   limit,
        UserID:  userID,
    }

    results, err := h.searchService.Search(c.Request.Context(), req)
    if err != nil {
        response.InternalError(c, "Search failed", err)
        return
    }

    response.Success(c, results)
}
```

## Search Service

```go
// internal/services/search_service.go

type SearchService struct {
    patternRepo   repository.PatternRepositoryInterface
    problemRepo   repository.ProblemRepositoryInterface
    highlightRepo repository.HighlightRepositoryInterface
    ragService    *ai.RAGService // Optional AI search
}

func (s *SearchService) Search(ctx context.Context, req *models.SearchRequest) (*models.SearchResults, error) {
    results := &models.SearchResults{
        Query:        req.Query,
        Mode:         req.Mode,
        Results:      make(map[string][]models.SearchResult),
        TotalResults: 0,
    }

    // Use appropriate search method based on mode
    var searchFn func(ctx context.Context, query string, limit int) ([]models.SearchResult, error)
    
    if req.Mode == "ai" && s.ragService != nil {
        searchFn = s.aiSearch
    } else {
        searchFn = s.keywordSearch
    }

    // Search each requested content type in parallel
    var wg sync.WaitGroup
    var mu sync.Mutex
    
    for _, contentType := range req.Types {
        wg.Add(1)
        go func(ct string) {
            defer wg.Done()
            
            var items []models.SearchResult
            var err error
            
            switch ct {
            case "pattern":
                items, err = s.searchPatterns(ctx, req.Query, req.Mode, req.Limit)
            case "question":
                items, err = s.searchQuestions(ctx, req.Query, req.Mode, req.Limit)
            case "concept":
                items, err = s.searchConcepts(ctx, req.Query, req.Mode, req.Limit)
            case "article":
                items, err = s.searchArticles(ctx, req.Query, req.Mode, req.Limit)
            case "highlight":
                if req.UserID != nil {
                    items, err = s.searchHighlights(ctx, req.Query, *req.UserID, req.Limit)
                }
            }
            
            if err == nil && len(items) > 0 {
                mu.Lock()
                results.Results[ct] = items
                results.TotalResults += len(items)
                mu.Unlock()
            }
        }(contentType)
    }
    
    wg.Wait()
    
    // Generate suggestions based on query
    results.Suggestions = s.generateSuggestions(ctx, req.Query)
    
    return results, nil
}

func (s *SearchService) searchPatterns(ctx context.Context, query, mode string, limit int) ([]models.SearchResult, error) {
    patterns, err := s.patternRepo.FullTextSearch(ctx, query, limit)
    if err != nil {
        return nil, err
    }
    
    results := make([]models.SearchResult, len(patterns))
    for i, p := range patterns {
        results[i] = models.SearchResult{
            ID:          p.ID,
            Type:        "pattern",
            Title:       p.Category,
            Description: truncate(p.Description, 200),
            Difficulty:  p.Difficulty,
            URL:         fmt.Sprintf("/patterns/%s", p.ID),
            Preview: map[string]interface{}{
                "timeComplexity":  p.TimeComplexity,
                "spaceComplexity": p.SpaceComplexity,
                "category":        p.Category,
            },
            Score: p.SearchRank,
        }
    }
    
    return results, nil
}

func (s *SearchService) aiSearch(ctx context.Context, query string, contentType string, limit int) ([]models.SearchResult, error) {
    // Use RAG service for semantic search
    embeddings, err := s.ragService.GetQueryEmbedding(ctx, query)
    if err != nil {
        return nil, err
    }
    
    return s.ragService.SimilaritySearch(ctx, embeddings, contentType, limit)
}
```

## Search Repository

```go
// internal/repository/pattern_repository.go (add method)

func (r *PatternRepository) FullTextSearch(ctx context.Context, query string, limit int) ([]models.PatternWithRank, error) {
    sql := `
        SELECT 
            p.*,
            ts_rank(p.search_vector, plainto_tsquery('english', $1)) as search_rank
        FROM patterns p
        WHERE p.search_vector @@ plainto_tsquery('english', $1)
        ORDER BY search_rank DESC
        LIMIT $2
    `
    
    rows, err := r.db.QueryContext(ctx, sql, query, limit)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var results []models.PatternWithRank
    for rows.Next() {
        var p models.PatternWithRank
        if err := rows.Scan(/* fields */); err != nil {
            return nil, err
        }
        results = append(results, p)
    }
    
    return results, nil
}
```

# Security Considerations

**Rate Limiting**: Search endpoints are rate-limited to prevent abuse:
- Keyword search: 60 requests per minute per IP
- AI search: 20 requests per minute per user (requires auth)
- History endpoints: 30 requests per minute per user

**Input Validation**: All search queries are validated:
- Minimum 2 characters
- Maximum 200 characters
- SQL injection prevention via parameterized queries
- XSS prevention (React auto-escaping)

**Authorization**: User-specific content (highlights, favorites, history) requires authentication. Results are filtered by user ID at the repository level.

**Privacy**: Search history is per-user and not shared. Users can clear their search history at any time. Anonymous users' search data uses session IDs and is auto-deleted after 30 days.

# Performance Considerations

**Database**:
- Full-text indexes (`tsvector`/`gin`) for sub-100ms keyword searches
- Vector indexes (pgvector) for AI semantic search
- Connection pooling for concurrent searches
- Query timeout of 5 seconds

**Frontend**:
- 300ms debounce on search input
- IndexedDB cache for instant recent/favorites display
- Skeleton loading states during search
- Virtualized list for large result sets

**Caching**:
- Browser: Recent searches cached in IndexedDB
- CDN: Static content type metadata (patterns list) cached 1 hour
- Server: RAG embeddings cached in memory

# Monitoring and Observability

The search feature emits the following metrics:

- `algopatterns_search_requests_total`: Counter of searches, labeled by mode
- `algopatterns_search_latency_seconds`: Histogram of search latency
- `algopatterns_search_results_count`: Histogram of results per search
- `algopatterns_search_no_results_total`: Counter of searches with zero results
- `algopatterns_ai_search_tokens_used`: Counter of AI search token usage

Alerts:
- Search API error rate > 5% over 5 minutes
- Search P99 latency > 2 seconds
- AI search error rate > 10% (may indicate embedding service issues)

# Accessibility

The search modal follows ARIA best practices:

- `role="dialog"` with `aria-modal="true"`
- `aria-label` on the search input
- `role="listbox"` for results with `aria-activedescendant`
- Focus trap within the modal
- `Escape` key closes the modal
- Screen reader announcements for result count changes

```typescript
// Result item with accessibility
<div
  role="option"
  id={`search-result-${index}`}
  aria-selected={index === selectedIndex}
  tabIndex={-1}
>
  {/* content */}
</div>

// Announce results to screen readers
<div role="status" aria-live="polite" className="sr-only">
  {results ? `${results.totalResults} results found` : ""}
</div>
```

# Implementation Plan

## Phase 1: Core Search Infrastructure

- [x] Database migrations for search tables
- [x] Full-text indexes on patterns and problems tables
- [x] Backend: SearchHandler with keyword search endpoint
- [x] Backend: SearchService with pattern/question search
- [x] Frontend: SearchModal component with basic UI
- [x] Frontend: Keyboard shortcut handler (Cmd+K)
- [x] Frontend: SearchContext for state management

## Phase 2: Search Results & Preview

- [x] Backend: Add concept and article search
- [ ] Backend: Search history endpoints
- [x] Frontend: Grouped results display (tabbed UI)
- [x] Frontend: Preview panel implementation
- [x] Frontend: Keyboard navigation (up/down/enter)
- [x] Frontend: Result type icons and badges

## Phase 3: Recent & Favorites

- [ ] Backend: Recently viewed tracking endpoints
- [ ] Backend: Favorites CRUD endpoints
- [x] Frontend: Quick access section (recent searches, views, favorites)
- [x] Frontend: IndexedDB caching layer
- [ ] Frontend: Track view on page navigation

## Phase 4: AI Search Mode

- [x] Backend: Integrate RAG service for semantic search
- [x] Backend: Extended RAG indexer for all content types (2,068 embeddings)
- [ ] Backend: Rate limiting for AI search
- [x] Frontend: Mode toggle (keyword/AI) with Search/AI labels
- [x] Frontend: AI mode indicator (sparkle icon in footer)
- [x] Frontend: Local fuzzy search with Fuse.js
- [ ] Testing: AI search quality validation

## Phase 5: Polish & Optimization

- [x] Performance optimization (debounce, caching, local search)
- [ ] Accessibility audit and fixes
- [ ] Mobile responsiveness
- [ ] Search analytics dashboard
- [x] Documentation and user guide (this doc updated)

# Files to Create

```
Frontend:
src/
  components/
    search/
      SearchModal.tsx           # Main modal container
      SearchInput.tsx           # Input with mode toggle
      SearchResults.tsx         # Grouped results list
      ResultItem.tsx            # Individual result row
      PreviewPanel.tsx          # Right-side preview
      QuickAccess.tsx           # Recent/favorites section
      ModeToggle.tsx            # Keyword/AI toggle
      index.ts
  contexts/
    SearchContext.tsx           # Global search state
  lib/
    searchDB.ts                 # IndexedDB service
    searchService.ts            # API client for search
  hooks/
    useGlobalSearch.ts          # Keyboard shortcut hook
  types/
    search.ts                   # TypeScript interfaces

Backend:
internal/
  handlers/
    search_handler.go           # HTTP handlers
  services/
    search_service.go           # Business logic
  repository/
    search_repository.go        # Search history/favorites
  models/
    search.go                   # Search DTOs
migrations/
  00X_search_tables.up.sql
  00X_search_fulltext.up.sql
```

# Implemented Features

This section documents features that have been implemented and are available in the current codebase.

## Fuzzy Search with Fuse.js

Local fuzzy search is implemented using Fuse.js for instant, typo-tolerant results:

- **Location**: `frontend/src/lib/localSearch.ts`
- **Indexed content**: Patterns, questions, concepts, articles, tutorials
- **Typo tolerance**: Threshold of 0.3 allows approximate matches
- **Source of truth**: `frontend/src/lib/patterns.json` (static content)

```typescript
// Fuse.js configuration
const options = {
  threshold: 0.3,
  keys: [
    { name: "title", weight: 2 },
    { name: "category", weight: 1.5 },
    { name: "description", weight: 1 },
  ],
};
```

Local search results are merged with API results using score-based deduplication.

## AI/Keyword Toggle Switch

The search input includes a toggle switch to choose between keyword and AI semantic search:

- **Location**: `frontend/src/components/search/SearchInput.tsx`
- **Default mode**: Keyword search (left position)
- **AI mode**: Violet accent color when active
- **Labels**: "Search" and "AI" labels on toggle ends
- **Persistence**: Mode saved to localStorage

The toggle uses a large knob that extends slightly outside the track for better visibility, with left-[-1px] and right-[-1px] positioning.

## AI Semantic Search Indicator

When AI mode is active, the search modal footer shows:
- Sparkle icon with violet color
- "AI semantic search" text indicator
- Tab key hint to toggle modes

## Tabbed Results UI

Search results are grouped into tabs with counts:
- All | Patterns | Questions | Concepts | Articles
- Each tab shows result count badge
- Tab state persists during search session

## Pattern Section Navigation

Navigation to pattern detail sections (e.g., `/patterns/two-pointers#template`) uses `window.location.href` instead of Next.js router to ensure hash fragments scroll correctly.

## DSA Fundamentals URLs

Concept results link to `/dsa-fundamentals/{slug}` (not `/fundamentals/`), matching the actual route structure.

## Extended RAG Indexer

The backend RAG indexer (`backend/cmd/indexer/`) now indexes all content types:

| Content Type | Count | Source |
|--------------|-------|--------|
| problems | 721 | patterns.json questions |
| tutorials | 642 | patterns.json pattern tutorials |
| questions | 315 | patterns.json conceptual questions |
| concepts | 186 | patterns.json DSA concepts |
| patterns | 171 | patterns.json pattern metadata |
| solutions | 20 | patterns.json problem solutions |
| articles | 13 | patterns.json articles |

**Total**: 2,068 embeddings indexed

The indexer uses content hashing to skip unchanged content on re-indexing.

# Future Considerations

Several features were considered but deferred:

**Voice Search**: Allow voice input for search queries. Would require browser Speech Recognition API integration.

**Search Filters UI**: Expose difficulty, category, and other filters in the search modal for power users.

**Search Analytics for Users**: Show users their search patterns, most-viewed content, and learning trends.

**Collaborative Favorites**: Share favorite collections with other users or make them public.

These will be considered based on user feedback after initial launch.

# References

- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html) - For keyword search implementation
- [pgvector](https://github.com/pgvector/pgvector) - For AI semantic search with embeddings
- [macOS Spotlight HIG](https://developer.apple.com/design/human-interface-guidelines/search) - Design inspiration
- [ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) - Accessibility guidelines
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) - Client-side caching
