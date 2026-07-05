"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "./AuthContext";
import {
  isCacheStale,
  getHighlightsFromCache,
  saveHighlightsToCache,
  addHighlightToCache,
  updateHighlightInCache,
  deleteHighlightFromCache,
  markHighlightPendingDelete,
  getPendingOperations,
  updateCacheTimestamp,
  clearCache,
} from "@/lib/highlightDB";
import { ConflictDialog } from "@/components/ui/ConflictDialog";
import type {
  Highlight,
  CreateHighlightRequest,
  UpdateHighlightRequest,
  HighlightColor,
} from "@/types";

interface ConflictState {
  localHighlight: Highlight;
  serverHighlight: Highlight;
  pendingRequest: UpdateHighlightRequest;
}

interface HighlightContextType {
  highlights: Map<string, Highlight[]>;
  isLoading: boolean;
  createHighlight: (
    req: Omit<CreateHighlightRequest, "color"> & { color?: HighlightColor }
  ) => Promise<Highlight | null>;
  updateHighlight: (
    id: string,
    req: UpdateHighlightRequest
  ) => Promise<Highlight | null>;
  deleteHighlight: (id: string) => Promise<boolean>;
  getHighlightsForContent: (
    contentType: string,
    contentId: string
  ) => Highlight[];
  fetchHighlightsForContent: (
    contentType: string,
    contentId: string
  ) => Promise<void>;
  clearHighlights: () => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(
  undefined
);

function getContentKey(contentType: string, contentId: string): string {
  return `${contentType}:${contentId}`;
}

export function HighlightProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [highlights, setHighlights] = useState<Map<string, Highlight[]>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedKeys, setFetchedKeys] = useState<Set<string>>(new Set());
  const [conflict, setConflict] = useState<ConflictState | null>(null);

  const fetchHighlightsForContent = useCallback(
    async (contentType: string, contentId: string) => {
      if (!isAuthenticated) return;

      const key = getContentKey(contentType, contentId);
      if (fetchedKeys.has(key)) return;

      setIsLoading(true);
      try {
        // Check if IndexedDB cache is fresh
        const cacheStale = await isCacheStale(contentType, contentId);

        if (!cacheStale) {
          // Try to get from IndexedDB first
          const cachedHighlights = await getHighlightsFromCache(
            contentType,
            contentId
          );
          if (cachedHighlights && cachedHighlights.length > 0) {
            setHighlights((prev) => {
              const next = new Map(prev);
              next.set(key, cachedHighlights);
              return next;
            });
            setFetchedKeys((prev) => new Set(prev).add(key));
            setIsLoading(false);
            return;
          }
        }

        // Cache miss or stale - fetch from server
        const response = await apiClient.getHighlightsForContent(
          contentType,
          contentId
        );
        if (response.success) {
          const serverHighlights = response.data.highlights;

          // Update React state
          setHighlights((prev) => {
            const next = new Map(prev);
            next.set(key, serverHighlights);
            return next;
          });
          setFetchedKeys((prev) => new Set(prev).add(key));

          // Save to IndexedDB cache
          await saveHighlightsToCache(contentType, contentId, serverHighlights);
          await updateCacheTimestamp(contentType, contentId);
        }
      } catch (error) {
        console.error("Failed to fetch highlights:", error);

        // On network error, try to serve from cache anyway
        const cachedHighlights = await getHighlightsFromCache(
          contentType,
          contentId
        );
        if (cachedHighlights && cachedHighlights.length > 0) {
          setHighlights((prev) => {
            const next = new Map(prev);
            next.set(key, cachedHighlights);
            return next;
          });
          setFetchedKeys((prev) => new Set(prev).add(key));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, fetchedKeys]
  );

  const getHighlightsForContent = useCallback(
    (contentType: string, contentId: string): Highlight[] => {
      const key = getContentKey(contentType, contentId);
      return highlights.get(key) || [];
    },
    [highlights]
  );

  const createHighlight = useCallback(
    async (
      req: Omit<CreateHighlightRequest, "color"> & { color?: HighlightColor }
    ): Promise<Highlight | null> => {
      if (!isAuthenticated) return null;

      const fullReq: CreateHighlightRequest = {
        ...req,
        color: req.color || "yellow",
      };

      const key = getContentKey(req.contentType, req.contentId);

      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const tempHighlight: Highlight = {
        id: tempId,
        userId: "",
        ...fullReq,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      setHighlights((prev) => {
        const next = new Map(prev);
        const existing = next.get(key) || [];
        next.set(key, [...existing, tempHighlight]);
        return next;
      });

      // Add to IndexedDB as pending
      await addHighlightToCache(
        tempHighlight,
        req.contentType,
        req.contentId,
        "pending_create"
      );

      try {
        const response = await apiClient.createHighlight(fullReq);
        if (response.success) {
          // Replace temp with server response in React state
          setHighlights((prev) => {
            const next = new Map(prev);
            const existing = next.get(key) || [];
            next.set(
              key,
              existing.map((h) => (h.id === tempId ? response.data : h))
            );
            return next;
          });

          // Update IndexedDB: remove temp, add real
          await deleteHighlightFromCache(tempId);
          await addHighlightToCache(
            response.data,
            req.contentType,
            req.contentId,
            "synced"
          );

          return response.data;
        } else {
          // Remove optimistic update on error
          setHighlights((prev) => {
            const next = new Map(prev);
            const existing = next.get(key) || [];
            next.set(
              key,
              existing.filter((h) => h.id !== tempId)
            );
            return next;
          });
          await deleteHighlightFromCache(tempId);
          return null;
        }
      } catch (error) {
        // If offline, keep the optimistic update - it's saved in IndexedDB for later sync
        if (!navigator.onLine) {
          console.info(
            "Offline: highlight saved locally, will sync when online"
          );
          return tempHighlight;
        }

        // Online but failed - remove optimistic update
        console.error("Failed to create highlight:", error);
        setHighlights((prev) => {
          const next = new Map(prev);
          const existing = next.get(key) || [];
          next.set(
            key,
            existing.filter((h) => h.id !== tempId)
          );
          return next;
        });
        await deleteHighlightFromCache(tempId);
        return null;
      }
    },
    [isAuthenticated]
  );

  const updateHighlight = useCallback(
    async function updateHighlight(
      id: string,
      req: UpdateHighlightRequest,
      retryCount = 0
    ): Promise<Highlight | null> {
      if (!isAuthenticated) return null;

      const MAX_RETRIES = 2;

      // Optimistic update in React state
      let previousHighlight: Highlight | null = null;
      setHighlights((prev) => {
        const next = new Map(prev);
        for (const [key, list] of next.entries()) {
          const idx = list.findIndex((h) => h.id === id);
          if (idx !== -1) {
            previousHighlight = list[idx];
            const updated = [...list];
            updated[idx] = {
              ...list[idx],
              ...req,
              updatedAt: new Date().toISOString(),
            };
            next.set(key, updated);
            break;
          }
        }
        return next;
      });

      // Optimistic update in IndexedDB
      await updateHighlightInCache(id, req, "pending_update");

      try {
        const response = await apiClient.updateHighlight(id, req);
        if (response.success) {
          // Update React state with server response
          setHighlights((prev) => {
            const next = new Map(prev);
            for (const [key, list] of next.entries()) {
              const idx = list.findIndex((h) => h.id === id);
              if (idx !== -1) {
                const updated = [...list];
                updated[idx] = response.data;
                next.set(key, updated);
                break;
              }
            }
            return next;
          });

          // Update IndexedDB with synced status
          await updateHighlightInCache(id, response.data, "synced");

          return response.data;
        }

        // Handle version conflict
        if (response.error?.code === "VERSION_CONFLICT") {
          const serverHighlight = response.data;

          // If we have retries left and server data, auto-retry
          if (retryCount < MAX_RETRIES && serverHighlight) {
            console.warn(
              `Version conflict for highlight ${id}, retrying with latest version...`
            );
            const retryReq: UpdateHighlightRequest = {
              ...req,
              version: serverHighlight.version,
            };
            return updateHighlight(id, retryReq, retryCount + 1);
          }

          // Max retries exceeded or no server data - show conflict dialog
          if (previousHighlight && serverHighlight) {
            console.warn(
              `Version conflict for highlight ${id}, showing resolution dialog...`
            );
            // Rollback optimistic update first
            setHighlights((prev) => {
              const next = new Map(prev);
              for (const [key, list] of next.entries()) {
                const idx = list.findIndex((h) => h.id === id);
                if (idx !== -1) {
                  const updated = [...list];
                  updated[idx] = previousHighlight!;
                  next.set(key, updated);
                  break;
                }
              }
              return next;
            });
            await updateHighlightInCache(id, previousHighlight, "synced");

            // Show conflict dialog
            const prevH = previousHighlight as Highlight;
            setConflict({
              localHighlight: { ...prevH, ...req } as Highlight,
              serverHighlight,
              pendingRequest: req,
            });
            return null;
          }
        }

        // Rollback on other failures
        if (previousHighlight) {
          setHighlights((prev) => {
            const next = new Map(prev);
            for (const [key, list] of next.entries()) {
              const idx = list.findIndex((h) => h.id === id);
              if (idx !== -1) {
                const updated = [...list];
                updated[idx] = previousHighlight!;
                next.set(key, updated);
                break;
              }
            }
            return next;
          });
          await updateHighlightInCache(id, previousHighlight, "synced");
        }
        return null;
      } catch (error) {
        // If offline, keep the optimistic update - it's saved in IndexedDB for later sync
        if (!navigator.onLine) {
          console.info(
            "Offline: highlight update saved locally, will sync when online"
          );
          // Return updated version so UI shows the change
          if (previousHighlight) {
            const prev = previousHighlight as Highlight;
            return { ...prev, ...req } as Highlight;
          }
          return null;
        }

        console.error("Failed to update highlight:", error);
        // Online but failed - rollback
        if (previousHighlight) {
          setHighlights((prev) => {
            const next = new Map(prev);
            for (const [key, list] of next.entries()) {
              const idx = list.findIndex((h) => h.id === id);
              if (idx !== -1) {
                const updated = [...list];
                updated[idx] = previousHighlight!;
                next.set(key, updated);
                break;
              }
            }
            return next;
          });
          await updateHighlightInCache(id, previousHighlight, "synced");
        }
        return null;
      }
    },
    [isAuthenticated]
  );

  const deleteHighlight = useCallback(
    async (id: string): Promise<boolean> => {
      if (!isAuthenticated) return false;

      // Optimistic delete from React state
      let deletedHighlight: Highlight | null = null;
      let deletedKey: string | null = null;

      setHighlights((prev) => {
        const next = new Map(prev);
        for (const [key, list] of next.entries()) {
          const idx = list.findIndex((h) => h.id === id);
          if (idx !== -1) {
            deletedHighlight = list[idx];
            deletedKey = key;
            next.set(
              key,
              list.filter((h) => h.id !== id)
            );
            break;
          }
        }
        return next;
      });

      // Mark as pending delete in IndexedDB
      await markHighlightPendingDelete(id);

      try {
        const response = await apiClient.deleteHighlight(id);
        if (response.success) {
          // Remove from IndexedDB completely
          await deleteHighlightFromCache(id);
          return true;
        }

        // Restore on failure
        if (deletedHighlight && deletedKey) {
          const keyToRestore = deletedKey as string;
          const highlightToRestore = deletedHighlight as Highlight;
          setHighlights((prev) => {
            const next = new Map(prev);
            const existing = next.get(keyToRestore) || [];
            next.set(keyToRestore, [...existing, highlightToRestore]);
            return next;
          });
          // Restore in IndexedDB
          const [contentType, contentId] = keyToRestore.split(":");
          await addHighlightToCache(
            highlightToRestore,
            contentType,
            contentId,
            "synced"
          );
        }
        return false;
      } catch (error) {
        // If offline, keep the deletion - it's marked pending_delete in IndexedDB
        if (!navigator.onLine) {
          console.info(
            "Offline: highlight deletion saved locally, will sync when online"
          );
          return true;
        }

        console.error("Failed to delete highlight:", error);
        // Online but failed - restore the highlight
        if (deletedHighlight && deletedKey) {
          const keyToRestore = deletedKey as string;
          const highlightToRestore = deletedHighlight as Highlight;
          setHighlights((prev) => {
            const next = new Map(prev);
            const existing = next.get(keyToRestore) || [];
            next.set(keyToRestore, [...existing, highlightToRestore]);
            return next;
          });
          // Restore in IndexedDB
          const [contentType, contentId] = keyToRestore.split(":");
          await addHighlightToCache(
            highlightToRestore,
            contentType,
            contentId,
            "synced"
          );
        }
        return false;
      }
    },
    [isAuthenticated]
  );

  const clearHighlights = useCallback(async () => {
    setHighlights(new Map());
    setFetchedKeys(new Set());
    await clearCache();
  }, []);

  // Sync pending operations when coming back online using batch sync
  const syncPendingOperations = useCallback(async () => {
    if (!isAuthenticated) return;

    const pending = await getPendingOperations();
    if (pending.length === 0) return;

    console.log(`Syncing ${pending.length} pending highlight operations...`);

    // Build batch sync request
    const operations = pending.map((record) => {
      if (record.syncStatus === "pending_create") {
        return {
          op: "create" as const,
          clientId: record.id,
          data: {
            contentType: record.data.contentType,
            contentId: record.data.contentId,
            selectedText: record.data.selectedText,
            startOffset: record.data.startOffset,
            endOffset: record.data.endOffset,
            color: record.data.color,
            note: record.data.note,
            contentHash: record.data.contentHash,
          },
        };
      } else if (record.syncStatus === "pending_update") {
        return {
          op: "update" as const,
          id: record.id,
          update: {
            color: record.data.color,
            note: record.data.note,
            version: record.data.version,
          },
        };
      } else {
        return {
          op: "delete" as const,
          id: record.id,
        };
      }
    });

    try {
      const response = await apiClient.batchSyncHighlights({ operations });

      if (response.success) {
        // Process results
        for (const result of response.data.results) {
          if (result.success) {
            if (result.op === "create" && result.clientId && result.highlight) {
              // Replace temp with server response
              await deleteHighlightFromCache(result.clientId);
              await addHighlightToCache(
                result.highlight,
                result.highlight.contentType,
                result.highlight.contentId,
                "synced"
              );
            } else if (
              result.op === "update" &&
              result.id &&
              result.highlight
            ) {
              await updateHighlightInCache(
                result.id,
                result.highlight,
                "synced"
              );
            } else if (result.op === "delete" && result.id) {
              await deleteHighlightFromCache(result.id);
            }
          } else {
            console.warn(`Sync operation failed:`, result.error);
          }
        }

        console.log(
          `Batch sync completed: ${response.data.results.filter((r) => r.success).length}/${response.data.results.length} succeeded`
        );
      }
    } catch (error) {
      console.warn("Batch sync failed, will retry later:", error);
    }
  }, [isAuthenticated]);

  // Set up online listener for syncing
  useEffect(() => {
    const handleOnline = () => {
      syncPendingOperations();
    };

    window.addEventListener("online", handleOnline);

    // Also sync on mount if online
    if (navigator.onLine) {
      syncPendingOperations();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncPendingOperations]);

  // Conflict resolution handlers
  const handleKeepServer = useCallback(async () => {
    if (!conflict) return;

    const { serverHighlight } = conflict;

    // Update local state with server version
    setHighlights((prev) => {
      const next = new Map(prev);
      for (const [key, list] of next.entries()) {
        const idx = list.findIndex((h) => h.id === serverHighlight.id);
        if (idx !== -1) {
          const updated = [...list];
          updated[idx] = serverHighlight;
          next.set(key, updated);
          break;
        }
      }
      return next;
    });

    // Update IndexedDB with server version
    await updateHighlightInCache(serverHighlight.id, serverHighlight, "synced");

    setConflict(null);
  }, [conflict]);

  const handleKeepLocal = useCallback(async () => {
    if (!conflict) return;

    const { serverHighlight, pendingRequest } = conflict;

    // Retry update with server's current version
    const retryReq: UpdateHighlightRequest = {
      ...pendingRequest,
      version: serverHighlight.version,
    };

    const result = await updateHighlight(serverHighlight.id, retryReq, 0);
    if (result) {
      setConflict(null);
    }
  }, [conflict, updateHighlight]);

  const handleCancelConflict = useCallback(() => {
    setConflict(null);
  }, []);

  return (
    <HighlightContext.Provider
      value={{
        highlights,
        isLoading,
        createHighlight,
        updateHighlight,
        deleteHighlight,
        getHighlightsForContent,
        fetchHighlightsForContent,
        clearHighlights,
      }}
    >
      {children}
      {conflict && (
        <ConflictDialog
          isOpen={true}
          localHighlight={conflict.localHighlight}
          serverHighlight={conflict.serverHighlight}
          onKeepServer={handleKeepServer}
          onKeepLocal={handleKeepLocal}
          onCancel={handleCancelConflict}
        />
      )}
    </HighlightContext.Provider>
  );
}

export function useHighlights() {
  const context = useContext(HighlightContext);
  if (context === undefined) {
    throw new Error("useHighlights must be used within a HighlightProvider");
  }
  return context;
}
