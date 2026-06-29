"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  startTransition,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "@/lib/api";

const STORAGE_KEY = "algopatterns-completed";

interface ProgressContextType {
  completed: Set<string>;
  isLoading: boolean;
  toggleComplete: (id: string) => void;
  resetProgress: () => void;
  syncFromLocal: () => Promise<void>;
  celebrationKey: number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [hasSynced, setHasSynced] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);

  // Load progress on mount and when auth state changes
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);

      if (isAuthenticated) {
        try {
          const response = await apiClient.getProgress();
          if (response.success) {
            setCompleted(new Set(response.data.questionIds));
          }
        } catch {
          // Fall back to local storage
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            setCompleted(new Set(JSON.parse(saved)));
          }
        }
      } else {
        // Not authenticated, use local storage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setCompleted(new Set(JSON.parse(saved)));
        }
      }

      setIsLoading(false);
    };

    loadProgress();
  }, [isAuthenticated, user?.id]);

  // Auto-sync local progress when user logs in for the first time
  useEffect(() => {
    const syncOnLogin = async () => {
      if (isAuthenticated && !hasSynced && !isLoading) {
        const localProgress = localStorage.getItem(STORAGE_KEY);
        if (localProgress) {
          const localIds = JSON.parse(localProgress) as string[];
          if (localIds.length > 0) {
            try {
              const response = await apiClient.syncProgress(localIds);
              if (response.success) {
                setCompleted(new Set(response.data.questionIds));
                // Clear local storage after successful sync
                localStorage.removeItem(STORAGE_KEY);
              }
            } catch {
              // Keep local storage if sync fails
            }
          }
        }
        setHasSynced(true);
      }
    };

    syncOnLogin();
  }, [isAuthenticated, hasSynced, isLoading]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      startTransition(() => {
        setHasSynced(false);
      });
    }
  }, [isAuthenticated]);

  const toggleComplete = useCallback(
    async (id: string) => {
      const isCompleted = completed.has(id);
      const newCompleted = new Set(completed);

      if (isCompleted) {
        newCompleted.delete(id);
      } else {
        newCompleted.add(id);
        setCelebrationKey((prev) => prev + 1);
      }

      setCompleted(newCompleted);

      if (isAuthenticated) {
        try {
          const response = await apiClient.toggleProgress(id, !isCompleted);
          if (response.success) {
            setCompleted(new Set(response.data.questionIds));
          }
        } catch {
          // Revert on error
          setCompleted(completed);
        }
      } else {
        // Save to local storage for guests
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...newCompleted]));
      }
    },
    [completed, isAuthenticated]
  );

  const resetProgress = useCallback(async () => {
    if (!confirm("Reset all progress? This cannot be undone.")) {
      return;
    }

    setCompleted(new Set());

    if (isAuthenticated) {
      // For authenticated users, we'd need a backend endpoint to clear all progress
      // For now, just clear locally
      try {
        // Toggle off each completed item (not ideal but works)
        for (const id of completed) {
          await apiClient.toggleProgress(id, false);
        }
      } catch {
        // Ignore errors during reset
      }
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [completed, isAuthenticated]);

  const syncFromLocal = useCallback(async () => {
    if (!isAuthenticated) return;

    const localProgress = localStorage.getItem(STORAGE_KEY);
    if (localProgress) {
      const localIds = JSON.parse(localProgress) as string[];
      if (localIds.length > 0) {
        try {
          const response = await apiClient.syncProgress(localIds);
          if (response.success) {
            setCompleted(new Set(response.data.questionIds));
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          // Keep local storage if sync fails
        }
      }
    }
  }, [isAuthenticated]);

  return (
    <ProgressContext.Provider
      value={{
        completed,
        isLoading,
        toggleComplete,
        resetProgress,
        syncFromLocal,
        celebrationKey,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
