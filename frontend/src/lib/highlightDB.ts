/**
 * IndexedDB service for caching highlights locally.
 * Provides offline support and reduces API calls.
 */

import type { Highlight } from "@/types";

const DB_NAME = "algopatterns_highlights";
const DB_VERSION = 1;
const HIGHLIGHTS_STORE = "highlights";
const META_STORE = "meta";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface HighlightRecord {
  id: string;
  data: Highlight;
  contentKey: string; // contentType:contentId
  syncStatus: "synced" | "pending_create" | "pending_update" | "pending_delete";
  lastModified: number;
}

interface MetaRecord {
  key: string;
  lastFetched: number;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Open or create the IndexedDB database
 */
// skipcq: JS-0067
function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Highlights store
      if (!db.objectStoreNames.contains(HIGHLIGHTS_STORE)) {
        const highlightStore = db.createObjectStore(HIGHLIGHTS_STORE, {
          keyPath: "id",
        });
        highlightStore.createIndex("contentKey", "contentKey", {
          unique: false,
        });
        highlightStore.createIndex("syncStatus", "syncStatus", {
          unique: false,
        });
      }

      // Meta store for tracking fetch timestamps
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
  });
}

/**
 * Check if cache is stale for a content key
 */
// skipcq: JS-0067
export async function isCacheStale(
  contentType: string,
  contentId: string
): Promise<boolean> {
  try {
    const db = await openDB();
    const key = `${contentType}:${contentId}`;

    return new Promise((resolve) => {
      const tx = db.transaction(META_STORE, "readonly");
      const store = tx.objectStore(META_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        const meta = request.result as MetaRecord | undefined;
        if (!meta) {
          resolve(true); // No cache, consider stale
          return;
        }
        const isStale = Date.now() - meta.lastFetched > CACHE_TTL;
        resolve(isStale);
      };

      request.onerror = () => resolve(true);
    });
  } catch {
    return true;
  }
}

/**
 * Update cache timestamp for a content key
 */
// skipcq: JS-0067
export async function updateCacheTimestamp(
  contentType: string,
  contentId: string
): Promise<void> {
  try {
    const db = await openDB();
    const key = `${contentType}:${contentId}`;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(META_STORE, "readwrite");
      const store = tx.objectStore(META_STORE);

      const meta: MetaRecord = {
        key,
        lastFetched: Date.now(),
      };

      const request = store.put(meta);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("Failed to update cache timestamp:", error);
    return;
  }
}

/**
 * Get highlights from IndexedDB for a content key
 */
export async function getHighlightsFromCache(
  contentType: string,
  contentId: string
): Promise<Highlight[] | null> {
  try {
    const db = await openDB();
    const contentKey = `${contentType}:${contentId}`;

    return new Promise((resolve) => {
      const tx = db.transaction(HIGHLIGHTS_STORE, "readonly");
      const store = tx.objectStore(HIGHLIGHTS_STORE);
      const index = store.index("contentKey");
      const request = index.getAll(contentKey);

      request.onsuccess = () => {
        const records = request.result as HighlightRecord[];
        // Filter out pending deletes
        const highlights = records
          .filter((r) => r.syncStatus !== "pending_delete")
          .map((r) => r.data);
        resolve(highlights.length > 0 ? highlights : null);
      };

      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Save highlights to IndexedDB
 */
export async function saveHighlightsToCache(
  contentType: string,
  contentId: string,
  highlights: Highlight[]
): Promise<void> {
  try {
    const db = await openDB();
    const contentKey = `${contentType}:${contentId}`;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(HIGHLIGHTS_STORE, "readwrite");
      const store = tx.objectStore(HIGHLIGHTS_STORE);

      // First, remove existing highlights for this content key that are synced
      const index = store.index("contentKey");
      const cursorRequest = index.openCursor(contentKey);

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          const record = cursor.value as HighlightRecord;
          // Only delete synced records, keep pending ones
          if (record.syncStatus === "synced") {
            cursor.delete();
          }
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        // Now add the new highlights
        const tx2 = db.transaction(HIGHLIGHTS_STORE, "readwrite");
        const store2 = tx2.objectStore(HIGHLIGHTS_STORE);

        for (const highlight of highlights) {
          const record: HighlightRecord = {
            id: highlight.id,
            data: highlight,
            contentKey,
            syncStatus: "synced",
            lastModified: Date.now(),
          };
          store2.put(record);
        }

        tx2.oncomplete = () => resolve();
        tx2.onerror = () => reject(tx2.error);
      };

      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn("Failed to save highlights to cache:", error);
    return;
  }
}

/**
 * Add a single highlight to cache
 */
export async function addHighlightToCache(
  highlight: Highlight,
  contentType: string,
  contentId: string,
  syncStatus: HighlightRecord["syncStatus"] = "synced"
): Promise<void> {
  try {
    const db = await openDB();
    const contentKey = `${contentType}:${contentId}`;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(HIGHLIGHTS_STORE, "readwrite");
      const store = tx.objectStore(HIGHLIGHTS_STORE);

      const record: HighlightRecord = {
        id: highlight.id,
        data: highlight,
        contentKey,
        syncStatus,
        lastModified: Date.now(),
      };

      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("Failed to add highlight to cache:", error);
    return;
  }
}

/**
 * Update a highlight in cache
 */
export async function updateHighlightInCache(
  id: string,
  updates: Partial<Highlight>,
  syncStatus: HighlightRecord["syncStatus"] = "synced"
): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(HIGHLIGHTS_STORE, "readwrite");
      const store = tx.objectStore(HIGHLIGHTS_STORE);

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result as HighlightRecord | undefined;
        if (record) {
          record.data = { ...record.data, ...updates };
          record.syncStatus = syncStatus;
          record.lastModified = Date.now();
          store.put(record);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn("Failed to update highlight in cache:", error);
    return;
  }
}

/**
 * Delete a highlight from cache
 */
export async function deleteHighlightFromCache(id: string): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(HIGHLIGHTS_STORE, "readwrite");
      const store = tx.objectStore(HIGHLIGHTS_STORE);

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn("Failed to delete highlight from cache:", error);
    return;
  }
}

/**
 * Mark a highlight as pending delete (for offline support)
 */
export async function markHighlightPendingDelete(id: string): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(HIGHLIGHTS_STORE, "readwrite");
      const store = tx.objectStore(HIGHLIGHTS_STORE);

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const record = getRequest.result as HighlightRecord | undefined;
        if (record) {
          record.syncStatus = "pending_delete";
          record.lastModified = Date.now();
          store.put(record);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn("Failed to mark highlight pending delete:", error);
    return;
  }
}

/**
 * Get all pending operations for sync
 */
export async function getPendingOperations(): Promise<HighlightRecord[]> {
  try {
    const db = await openDB();

    return new Promise((resolve) => {
      const tx = db.transaction(HIGHLIGHTS_STORE, "readonly");
      const store = tx.objectStore(HIGHLIGHTS_STORE);
      const index = store.index("syncStatus");

      const pending: HighlightRecord[] = [];

      const request1 = index.getAll("pending_create");
      request1.onsuccess = () => {
        pending.push(...(request1.result as HighlightRecord[]));
      };

      const request2 = index.getAll("pending_update");
      request2.onsuccess = () => {
        pending.push(...(request2.result as HighlightRecord[]));
      };

      const request3 = index.getAll("pending_delete");
      request3.onsuccess = () => {
        pending.push(...(request3.result as HighlightRecord[]));
      };

      tx.oncomplete = () => resolve(pending);
      tx.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([HIGHLIGHTS_STORE, META_STORE], "readwrite");
      tx.objectStore(HIGHLIGHTS_STORE).clear();
      tx.objectStore(META_STORE).clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.warn("Failed to clear cache:", error);
    return;
  }
}
