import { describe, it, expect, beforeEach } from "vitest";
import {
  isCacheStale,
  updateCacheTimestamp,
  getHighlightsFromCache,
  saveHighlightsToCache,
  addHighlightToCache,
  updateHighlightInCache,
  deleteHighlightFromCache,
  markHighlightPendingDelete,
  getPendingOperations,
  clearCache,
} from "@/lib/highlightDB";
import type { Highlight } from "@/types";

const createMockHighlight = (
  overrides: Partial<Highlight> = {}
): Highlight => ({
  id: `highlight-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  userId: "user-123",
  contentType: "pattern_tutorial",
  contentId: "two-pointers",
  startOffset: 0,
  endOffset: 50,
  selectedText: "test selected text",
  color: "yellow",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: 1,
  ...overrides,
});

describe("highlightDB", () => {
  beforeEach(async () => {
    await clearCache();
  });

  describe("cache staleness", () => {
    it("should report cache as stale when never fetched", async () => {
      const stale = await isCacheStale("pattern_tutorial", "new-content");
      expect(stale).toBe(true);
    });

    it("should report cache as fresh after updating timestamp", async () => {
      await updateCacheTimestamp("pattern_tutorial", "test-content");
      const stale = await isCacheStale("pattern_tutorial", "test-content");
      expect(stale).toBe(false);
    });
  });

  describe("saveHighlightsToCache / getHighlightsFromCache", () => {
    it("should save and retrieve highlights", async () => {
      const highlights = [
        createMockHighlight({ id: "h1", selectedText: "first" }),
        createMockHighlight({ id: "h2", selectedText: "second" }),
      ];

      await saveHighlightsToCache("pattern_tutorial", "test-id", highlights);
      const cached = await getHighlightsFromCache(
        "pattern_tutorial",
        "test-id"
      );

      expect(cached).toHaveLength(2);
      expect(cached![0].selectedText).toBe("first");
      expect(cached![1].selectedText).toBe("second");
    });

    it("should return null for non-existent content", async () => {
      const cached = await getHighlightsFromCache(
        "pattern_tutorial",
        "non-existent"
      );
      expect(cached).toBeNull();
    });

    it("should filter out pending_delete highlights when retrieving", async () => {
      const highlight = createMockHighlight({ id: "to-delete" });
      await addHighlightToCache(
        highlight,
        "pattern_tutorial",
        "test-id",
        "synced"
      );
      await markHighlightPendingDelete("to-delete");

      const cached = await getHighlightsFromCache(
        "pattern_tutorial",
        "test-id"
      );
      expect(cached).toBeNull(); // No visible highlights
    });
  });

  describe("addHighlightToCache", () => {
    it("should add a highlight with synced status", async () => {
      const highlight = createMockHighlight({ id: "new-h" });
      await addHighlightToCache(
        highlight,
        "pattern_tutorial",
        "test-id",
        "synced"
      );

      const cached = await getHighlightsFromCache(
        "pattern_tutorial",
        "test-id"
      );
      expect(cached).toHaveLength(1);
      expect(cached![0].id).toBe("new-h");
    });

    it("should add a highlight with pending_create status", async () => {
      const highlight = createMockHighlight({ id: "pending-h" });
      await addHighlightToCache(
        highlight,
        "pattern_tutorial",
        "test-id",
        "pending_create"
      );

      const pending = await getPendingOperations();
      expect(
        pending.some(
          (p) => p.id === "pending-h" && p.syncStatus === "pending_create"
        )
      ).toBe(true);
    });
  });

  describe("updateHighlightInCache", () => {
    it("should update highlight data", async () => {
      const highlight = createMockHighlight({
        id: "update-test",
        color: "yellow",
      });
      await addHighlightToCache(
        highlight,
        "pattern_tutorial",
        "test-id",
        "synced"
      );

      await updateHighlightInCache("update-test", { color: "blue" }, "synced");

      const cached = await getHighlightsFromCache(
        "pattern_tutorial",
        "test-id"
      );
      expect(cached![0].color).toBe("blue");
    });

    it("should update sync status", async () => {
      const highlight = createMockHighlight({ id: "status-test" });
      await addHighlightToCache(
        highlight,
        "pattern_tutorial",
        "test-id",
        "synced"
      );

      await updateHighlightInCache("status-test", {}, "pending_update");

      const pending = await getPendingOperations();
      expect(
        pending.some(
          (p) => p.id === "status-test" && p.syncStatus === "pending_update"
        )
      ).toBe(true);
    });
  });

  describe("deleteHighlightFromCache", () => {
    it("should remove highlight from cache", async () => {
      const highlight = createMockHighlight({ id: "delete-test" });
      await addHighlightToCache(
        highlight,
        "pattern_tutorial",
        "test-id",
        "synced"
      );

      await deleteHighlightFromCache("delete-test");

      const cached = await getHighlightsFromCache(
        "pattern_tutorial",
        "test-id"
      );
      expect(cached).toBeNull();
    });
  });

  describe("markHighlightPendingDelete", () => {
    it("should mark highlight as pending_delete", async () => {
      const highlight = createMockHighlight({ id: "mark-delete" });
      await addHighlightToCache(
        highlight,
        "pattern_tutorial",
        "test-id",
        "synced"
      );

      await markHighlightPendingDelete("mark-delete");

      const pending = await getPendingOperations();
      expect(
        pending.some(
          (p) => p.id === "mark-delete" && p.syncStatus === "pending_delete"
        )
      ).toBe(true);
    });
  });

  describe("getPendingOperations", () => {
    it("should return all pending operations", async () => {
      const h1 = createMockHighlight({ id: "pending-1" });
      const h2 = createMockHighlight({ id: "pending-2" });
      const h3 = createMockHighlight({ id: "synced-1" });

      await addHighlightToCache(
        h1,
        "pattern_tutorial",
        "test-1",
        "pending_create"
      );
      await addHighlightToCache(
        h2,
        "pattern_tutorial",
        "test-2",
        "pending_update"
      );
      await addHighlightToCache(h3, "pattern_tutorial", "test-3", "synced");

      const pending = await getPendingOperations();
      expect(pending).toHaveLength(2);
      expect(pending.map((p) => p.id).sort()).toEqual([
        "pending-1",
        "pending-2",
      ]);
    });

    it("should return empty array when no pending operations", async () => {
      const pending = await getPendingOperations();
      expect(pending).toEqual([]);
    });
  });

  describe("clearCache", () => {
    it("should clear all cached data", async () => {
      const highlight = createMockHighlight({ id: "clear-test" });
      await addHighlightToCache(
        highlight,
        "pattern_tutorial",
        "test-id",
        "synced"
      );
      await updateCacheTimestamp("pattern_tutorial", "test-id");

      await clearCache();

      const cached = await getHighlightsFromCache(
        "pattern_tutorial",
        "test-id"
      );
      const stale = await isCacheStale("pattern_tutorial", "test-id");

      expect(cached).toBeNull();
      expect(stale).toBe(true);
    });
  });
});
