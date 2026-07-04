"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";
import { apiClient } from "@/lib/api";

interface ProgressState {
  [patternId: string]: Set<number>;
}

interface PatternProgressContextType {
  isCompleted: (patternId: string, sectionIndex: number) => boolean;
  markComplete: (patternId: string, sectionIndex: number) => void;
  markIncomplete: (patternId: string, sectionIndex: number) => void;
  toggleComplete: (patternId: string, sectionIndex: number) => void;
  getCompletedCount: (patternId: string) => number;
  getProgress: (patternId: string, totalSections: number) => number;
  isLoading: boolean;
}

const PatternProgressContext = createContext<
  PatternProgressContextType | undefined
>(undefined); // skipcq: JS-W1042

export const PatternProgressProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState<ProgressState>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from DB when user changes (wait for auth to finish loading first)
  useEffect(() => {
    // Wait for auth to finish initializing
    if (authLoading) {
      return;
    }

    const loadProgress = async () => {
      // Not logged in - no progress
      if (!user) {
        setProgress({});
        setIsLoading(false);
        return;
      }

      // Fetch from backend (DB is source of truth)
      setIsLoading(true);
      try {
        const response = await apiClient.getPatternProgress();
        if (response.success && response.data?.progress) {
          const serverProgress: ProgressState = {};
          for (const [patternId, indices] of Object.entries(response.data.progress)) {
            serverProgress[patternId] = new Set(indices);
          }
          setProgress(serverProgress);
        } else {
          setProgress({});
        }
      } catch {
        setProgress({});
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [user, authLoading]);

  const isCompleted = useCallback(
    (patternId: string, sectionIndex: number): boolean => {
      return progress[patternId]?.has(sectionIndex) ?? false;
    },
    [progress]
  );

  const markComplete = useCallback(
    async (patternId: string, sectionIndex: number) => {
      if (!user) return;

      // Optimistic update
      setProgress((prev) => {
        const updated = { ...prev };
        if (!updated[patternId]) {
          updated[patternId] = new Set();
        }
        updated[patternId] = new Set(updated[patternId]);
        updated[patternId].add(sectionIndex);
        return updated;
      });

      // Sync to backend
      try {
        await apiClient.markSectionComplete(patternId, sectionIndex);
      } catch {
        // Revert on failure
        setProgress((prev) => {
          const updated = { ...prev };
          if (updated[patternId]) {
            updated[patternId] = new Set(updated[patternId]);
            updated[patternId].delete(sectionIndex);
          }
          return updated;
        });
      }
    },
    [user]
  );

  const markIncomplete = useCallback(
    async (patternId: string, sectionIndex: number) => {
      if (!user) return;

      // Optimistic update
      setProgress((prev) => {
        const updated = { ...prev };
        if (updated[patternId]) {
          updated[patternId] = new Set(updated[patternId]);
          updated[patternId].delete(sectionIndex);
        }
        return updated;
      });

      // Sync to backend
      try {
        await apiClient.markSectionIncomplete(patternId, sectionIndex);
      } catch {
        // Revert on failure
        setProgress((prev) => {
          const updated = { ...prev };
          if (!updated[patternId]) {
            updated[patternId] = new Set();
          }
          updated[patternId] = new Set(updated[patternId]);
          updated[patternId].add(sectionIndex);
          return updated;
        });
      }
    },
    [user]
  );

  const toggleComplete = useCallback(
    (patternId: string, sectionIndex: number) => {
      if (isCompleted(patternId, sectionIndex)) {
        markIncomplete(patternId, sectionIndex);
      } else {
        markComplete(patternId, sectionIndex);
      }
    },
    [isCompleted, markComplete, markIncomplete]
  );

  const getCompletedCount = useCallback(
    (patternId: string): number => {
      return progress[patternId]?.size ?? 0;
    },
    [progress]
  );

  const getProgress = useCallback(
    (patternId: string, totalSections: number): number => {
      if (totalSections === 0) return 0;
      const completed = getCompletedCount(patternId);
      return Math.round((completed / totalSections) * 100);
    },
    [getCompletedCount]
  );

  const value = useMemo(
    () => ({
      isCompleted,
      markComplete,
      markIncomplete,
      toggleComplete,
      getCompletedCount,
      getProgress,
      isLoading,
    }),
    [
      isCompleted,
      markComplete,
      markIncomplete,
      toggleComplete,
      getCompletedCount,
      getProgress,
      isLoading,
    ]
  );

  return (
    <PatternProgressContext.Provider value={value}>
      {children}
    </PatternProgressContext.Provider>
  );
};

export const usePatternProgress = (): PatternProgressContextType => {
  const context = useContext(PatternProgressContext);
  if (!context) {
    throw new Error(
      "usePatternProgress must be used within a PatternProgressProvider"
    );
  }
  return context;
};
