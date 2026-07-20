import type { SearchHistoryItem, RecentViewItem, FavoriteItem } from "@/types";

const DB_NAME = "algopatterns-search";
const DB_VERSION = 1;

interface SearchCacheData {
  searches: SearchHistoryItem[];
  recentViews: RecentViewItem[];
  favorites: FavoriteItem[];
  lastSyncAt: number;
}

class SearchDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = new Promise((resolve) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        resolve();
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("Failed to open search IndexedDB:", request.error);
        resolve(); // Don't fail, just work without cache
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for search history
        if (!db.objectStoreNames.contains("searches")) {
          const searchStore = db.createObjectStore("searches", {
            keyPath: "id",
            autoIncrement: true,
          });
          searchStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Store for recent views
        if (!db.objectStoreNames.contains("recentViews")) {
          const recentStore = db.createObjectStore("recentViews", {
            keyPath: "id",
          });
          recentStore.createIndex("lastViewedAt", "lastViewedAt", {
            unique: false,
          });
        }

        // Store for favorites
        if (!db.objectStoreNames.contains("favorites")) {
          const favStore = db.createObjectStore("favorites", { keyPath: "id" });
          favStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Store for metadata
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      };
    });

    await this.initPromise;
  }

  private async ensureDB(): Promise<IDBDatabase | null> {
    await this.init();
    return this.db;
  }

  async getAll(): Promise<SearchCacheData> {
    const db = await this.ensureDB();
    if (!db) {
      return {
        searches: [],
        recentViews: [],
        favorites: [],
        lastSyncAt: 0,
      };
    }

    return new Promise((resolve) => {
      const transaction = db.transaction(
        ["searches", "recentViews", "favorites", "meta"],
        "readonly"
      );

      const result: SearchCacheData = {
        searches: [],
        recentViews: [],
        favorites: [],
        lastSyncAt: 0,
      };

      const searchStore = transaction.objectStore("searches");
      const recentStore = transaction.objectStore("recentViews");
      const favStore = transaction.objectStore("favorites");
      const metaStore = transaction.objectStore("meta");

      const searchRequest = searchStore
        .index("createdAt")
        .openCursor(null, "prev");
      searchRequest.onsuccess = () => {
        const cursor = searchRequest.result;
        if (cursor && result.searches.length < 20) {
          result.searches.push(cursor.value);
          cursor.continue();
        }
      };

      const recentRequest = recentStore
        .index("lastViewedAt")
        .openCursor(null, "prev");
      recentRequest.onsuccess = () => {
        const cursor = recentRequest.result;
        if (cursor && result.recentViews.length < 20) {
          result.recentViews.push(cursor.value);
          cursor.continue();
        }
      };

      const favRequest = favStore.index("createdAt").openCursor(null, "prev");
      favRequest.onsuccess = () => {
        const cursor = favRequest.result;
        if (cursor && result.favorites.length < 50) {
          result.favorites.push(cursor.value);
          cursor.continue();
        }
      };

      const metaRequest = metaStore.get("lastSyncAt");
      metaRequest.onsuccess = () => {
        if (metaRequest.result) {
          result.lastSyncAt = metaRequest.result.value;
        }
      };

      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => {
        console.error("Failed to read search cache");
        resolve(result);
      };
    });
  }

  async addSearch(item: Omit<SearchHistoryItem, "id">): Promise<void> {
    const db = await this.ensureDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const transaction = db.transaction("searches", "readwrite");
      const store = transaction.objectStore("searches");

      // Add with auto-generated id
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
      };
      store.add(newItem);

      // Cleanup old entries (keep last 20)
      const index = store.index("createdAt");
      const countRequest = index.count();
      countRequest.onsuccess = () => {
        const count = countRequest.result;
        if (count > 20) {
          const deleteCount = count - 20;
          let deleted = 0;
          const cursorReq = index.openCursor();
          cursorReq.onsuccess = () => {
            const cur = cursorReq.result;
            if (cur && deleted < deleteCount) {
              store.delete(cur.primaryKey);
              deleted++;
              cur.continue();
            }
          };
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  async addRecentView(item: RecentViewItem): Promise<void> {
    const db = await this.ensureDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const transaction = db.transaction("recentViews", "readwrite");
      const store = transaction.objectStore("recentViews");

      // Use put to update if exists
      store.put(item);

      // Cleanup old entries (keep last 20)
      const index = store.index("lastViewedAt");
      const countRequest = index.count();
      countRequest.onsuccess = () => {
        const count = countRequest.result;
        if (count > 20) {
          const deleteCount = count - 20;
          let deleted = 0;
          const cursorReq = index.openCursor();
          cursorReq.onsuccess = () => {
            const cur = cursorReq.result;
            if (cur && deleted < deleteCount) {
              store.delete(cur.primaryKey);
              deleted++;
              cur.continue();
            }
          };
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  async addFavorite(item: FavoriteItem): Promise<void> {
    const db = await this.ensureDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const transaction = db.transaction("favorites", "readwrite");
      const store = transaction.objectStore("favorites");
      store.put(item);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  async removeFavorite(id: string): Promise<void> {
    const db = await this.ensureDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const transaction = db.transaction("favorites", "readwrite");
      const store = transaction.objectStore("favorites");
      store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  async clearSearches(): Promise<void> {
    const db = await this.ensureDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const transaction = db.transaction("searches", "readwrite");
      const store = transaction.objectStore("searches");
      store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  async clearRecentViews(): Promise<void> {
    const db = await this.ensureDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const transaction = db.transaction("recentViews", "readwrite");
      const store = transaction.objectStore("recentViews");
      store.clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  // skipcq: JS-R1005
  async sync(data: Partial<SearchCacheData>): Promise<void> {
    const db = await this.ensureDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const storeNames = ["searches", "recentViews", "favorites", "meta"];
      const transaction = db.transaction(storeNames, "readwrite");

      if (data.searches) {
        const store = transaction.objectStore("searches");
        store.clear();
        for (const item of data.searches) {
          store.add(item);
        }
      }

      if (data.recentViews) {
        const store = transaction.objectStore("recentViews");
        store.clear();
        for (const item of data.recentViews) {
          store.add(item);
        }
      }

      if (data.favorites) {
        const store = transaction.objectStore("favorites");
        store.clear();
        for (const item of data.favorites) {
          store.add(item);
        }
      }

      // Update last sync time
      const metaStore = transaction.objectStore("meta");
      metaStore.put({ key: "lastSyncAt", value: Date.now() });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }
}

export const searchDB = new SearchDBService();
