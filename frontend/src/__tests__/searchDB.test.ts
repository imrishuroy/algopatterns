import { describe, it, expect, beforeEach } from "vitest";
import { searchDB } from "@/lib/searchDB";
import type { RecentViewItem, FavoriteItem } from "@/types";

describe("searchDB", () => {
  beforeEach(async () => {
    // Clear all stores before each test
    await searchDB.clearSearches();
    await searchDB.clearRecentViews();
    // Clear favorites by syncing empty array
    await searchDB.sync({ favorites: [] });
  });

  describe("init", () => {
    it("should initialize successfully", async () => {
      // Init is called internally, just verify getAll works
      const data = await searchDB.getAll();
      expect(data).toHaveProperty("searches");
      expect(data).toHaveProperty("recentViews");
      expect(data).toHaveProperty("favorites");
      expect(data).toHaveProperty("lastSyncAt");
    });
  });

  describe("addSearch", () => {
    it("should add a search entry", async () => {
      await searchDB.addSearch({
        query: "two pointers",
        mode: "keyword",
        resultCount: 5,
        createdAt: new Date().toISOString(),
      });

      const data = await searchDB.getAll();
      expect(data.searches).toHaveLength(1);
      expect(data.searches[0].query).toBe("two pointers");
      expect(data.searches[0].mode).toBe("keyword");
      expect(data.searches[0].resultCount).toBe(5);
    });

    it("should add multiple search entries", async () => {
      await searchDB.addSearch({
        query: "binary search",
        mode: "keyword",
        resultCount: 3,
        createdAt: new Date().toISOString(),
      });
      await searchDB.addSearch({
        query: "dynamic programming",
        mode: "ai",
        resultCount: 10,
        createdAt: new Date().toISOString(),
      });

      const data = await searchDB.getAll();
      expect(data.searches).toHaveLength(2);
    });

    it("should keep only last 20 searches", async () => {
      // Add 25 searches
      for (let i = 0; i < 25; i++) {
        await searchDB.addSearch({
          query: `search ${i}`,
          mode: "keyword",
          resultCount: i,
          createdAt: new Date(Date.now() + i * 1000).toISOString(),
        });
      }

      const data = await searchDB.getAll();
      expect(data.searches.length).toBeLessThanOrEqual(20);
    });
  });

  describe("addRecentView", () => {
    it("should add a recent view entry", async () => {
      const item: RecentViewItem = {
        id: "view-1",
        contentType: "pattern",
        contentId: "two-pointers",
        title: "Two Pointers Pattern",
        url: "/patterns/two-pointers",
        viewCount: 1,
        lastViewedAt: new Date().toISOString(),
      };

      await searchDB.addRecentView(item);

      const data = await searchDB.getAll();
      expect(data.recentViews).toHaveLength(1);
      expect(data.recentViews[0].contentId).toBe("two-pointers");
      expect(data.recentViews[0].title).toBe("Two Pointers Pattern");
    });

    it("should update existing recent view", async () => {
      const item: RecentViewItem = {
        id: "view-1",
        contentType: "pattern",
        contentId: "two-pointers",
        title: "Two Pointers Pattern",
        url: "/patterns/two-pointers",
        viewCount: 1,
        lastViewedAt: new Date().toISOString(),
      };

      await searchDB.addRecentView(item);

      // Update with same id but new viewCount
      const updatedItem: RecentViewItem = {
        ...item,
        viewCount: 2,
        lastViewedAt: new Date().toISOString(),
      };

      await searchDB.addRecentView(updatedItem);

      const data = await searchDB.getAll();
      expect(data.recentViews).toHaveLength(1);
      expect(data.recentViews[0].viewCount).toBe(2);
    });
  });

  describe("addFavorite / removeFavorite", () => {
    it("should add a favorite", async () => {
      const item: FavoriteItem = {
        id: "fav-1",
        contentType: "pattern",
        contentId: "sliding-window",
        title: "Sliding Window",
        url: "/patterns/sliding-window",
        createdAt: new Date().toISOString(),
      };

      await searchDB.addFavorite(item);

      const data = await searchDB.getAll();
      expect(data.favorites).toHaveLength(1);
      expect(data.favorites[0].contentId).toBe("sliding-window");
    });

    it("should remove a favorite", async () => {
      const item: FavoriteItem = {
        id: "fav-1",
        contentType: "pattern",
        contentId: "sliding-window",
        title: "Sliding Window",
        url: "/patterns/sliding-window",
        createdAt: new Date().toISOString(),
      };

      await searchDB.addFavorite(item);
      await searchDB.removeFavorite("fav-1");

      const data = await searchDB.getAll();
      expect(data.favorites).toHaveLength(0);
    });
  });

  describe("clearSearches", () => {
    it("should clear all search history", async () => {
      await searchDB.addSearch({
        query: "test",
        mode: "keyword",
        resultCount: 1,
        createdAt: new Date().toISOString(),
      });

      await searchDB.clearSearches();

      const data = await searchDB.getAll();
      expect(data.searches).toHaveLength(0);
    });
  });

  describe("clearRecentViews", () => {
    it("should clear all recent views", async () => {
      const item: RecentViewItem = {
        id: "view-1",
        contentType: "pattern",
        contentId: "two-pointers",
        title: "Two Pointers",
        url: "/patterns/two-pointers",
        viewCount: 1,
        lastViewedAt: new Date().toISOString(),
      };

      await searchDB.addRecentView(item);
      await searchDB.clearRecentViews();

      const data = await searchDB.getAll();
      expect(data.recentViews).toHaveLength(0);
    });
  });

  describe("sync", () => {
    it("should sync all data from server", async () => {
      const serverData = {
        searches: [
          {
            id: "search-1",
            query: "synced search",
            mode: "ai" as const,
            resultCount: 10,
            createdAt: new Date().toISOString(),
          },
        ],
        recentViews: [
          {
            id: "view-1",
            contentType: "question" as const,
            contentId: "two-sum",
            title: "Two Sum",
            url: "/problems/two-sum",
            viewCount: 3,
            lastViewedAt: new Date().toISOString(),
          },
        ],
        favorites: [
          {
            id: "fav-1",
            contentType: "pattern" as const,
            contentId: "backtracking",
            title: "Backtracking",
            url: "/patterns/backtracking",
            createdAt: new Date().toISOString(),
          },
        ],
      };

      await searchDB.sync(serverData);

      const data = await searchDB.getAll();
      expect(data.searches).toHaveLength(1);
      expect(data.searches[0].query).toBe("synced search");
      expect(data.recentViews).toHaveLength(1);
      expect(data.recentViews[0].contentId).toBe("two-sum");
      expect(data.favorites).toHaveLength(1);
      expect(data.favorites[0].contentId).toBe("backtracking");
      expect(data.lastSyncAt).toBeGreaterThan(0);
    });

    it("should replace existing data on sync", async () => {
      // Add some local data
      await searchDB.addSearch({
        query: "local search",
        mode: "keyword",
        resultCount: 1,
        createdAt: new Date().toISOString(),
      });

      // Sync with server data
      await searchDB.sync({
        searches: [
          {
            id: "server-search",
            query: "server search",
            mode: "ai",
            resultCount: 5,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      const data = await searchDB.getAll();
      expect(data.searches).toHaveLength(1);
      expect(data.searches[0].query).toBe("server search");
    });
  });

  describe("getAll", () => {
    it("should return empty arrays when no data", async () => {
      const data = await searchDB.getAll();
      expect(data.searches).toEqual([]);
      expect(data.recentViews).toEqual([]);
      expect(data.favorites).toEqual([]);
    });

    it("should return searches sorted by createdAt descending", async () => {
      await searchDB.addSearch({
        query: "older",
        mode: "keyword",
        resultCount: 1,
        createdAt: "2024-01-01T00:00:00Z",
      });
      await searchDB.addSearch({
        query: "newer",
        mode: "keyword",
        resultCount: 2,
        createdAt: "2024-01-02T00:00:00Z",
      });

      const data = await searchDB.getAll();
      expect(data.searches[0].query).toBe("newer");
      expect(data.searches[1].query).toBe("older");
    });
  });
});
