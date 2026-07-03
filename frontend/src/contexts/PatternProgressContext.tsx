"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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
}

const PatternProgressContext = createContext<
  PatternProgressContextType | undefined
>(undefined); // skipcq: JS-W1042

const STORAGE_KEY = "pattern_progress";

export const PatternProgressProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const hasSyncedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const converted: ProgressState = {};
          for (const [patternId, indices] of Object.entries(parsed)) {
            converted[patternId] = new Set(indices as number[]);
          }
          setProgress(converted);
        } catch {
          // Invalid data, start fresh
        }
      }
      setIsLoaded(true);
    });
  }, []);

  // Save to localStorage when progress changes
  useEffect(() => {
    if (!isLoaded) return;

    const serializable: { [key: string]: number[] } = {};
    for (const [patternId, indices] of Object.entries(progress)) {
      serializable[patternId] = Array.from(indices);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }, [progress, isLoaded]);

  // Sync with backend when user logs in
  useEffect(() => {
    if (!user || !isLoaded || hasSyncedRef.current) return;

    const syncWithBackend = async () => {
      try {
        // Get local progress
        const localProgress: { [key: string]: number[] } = {};
        for (const [patternId, indices] of Object.entries(progress)) {
          localProgress[patternId] = Array.from(indices);
        }

        // Sync with backend (sends local, gets merged result)
        const response = await apiClient.syncPatternProgress(localProgress);

        if (response.success && response.data?.progress) {
          const merged: ProgressState = {};
          for (const [patternId, indices] of Object.entries(response.data.progress)) {
            merged[patternId] = new Set(indices);
          }
          setProgress(merged);
        }

        hasSyncedRef.current = true;
      } catch {
        // Silently fail - local progress still works
      }
    };

    syncWithBackend();
  }, [user, isLoaded, progress]);

  // Reset sync flag when user changes
  useEffect(() => {
    if (!user) {
      hasSyncedRef.current = false;
    }
  }, [user]);

  const isCompleted = useCallback(
    (patternId: string, sectionIndex: number): boolean => {
      return progress[patternId]?.has(sectionIndex) ?? false;
    },
    [progress]
  );

  const markComplete = useCallback(
    (patternId: string, sectionIndex: number) => {
      setProgress((prev) => {
        const updated = { ...prev };
        if (!updated[patternId]) {
          updated[patternId] = new Set();
        }
        updated[patternId] = new Set(updated[patternId]);
        updated[patternId].add(sectionIndex);
        return updated;
      });

      // Sync to backend if user is logged in
      if (user) {
        apiClient.markSectionComplete(patternId, sectionIndex).catch(() => {
          // Silently fail - local progress still works
        });
      }
    },
    [user]
  );

  const markIncomplete = useCallback(
    (patternId: string, sectionIndex: number) => {
      setProgress((prev) => {
        const updated = { ...prev };
        if (updated[patternId]) {
          updated[patternId] = new Set(updated[patternId]);
          updated[patternId].delete(sectionIndex);
        }
        return updated;
      });

      // Sync to backend if user is logged in
      if (user) {
        apiClient.markSectionIncomplete(patternId, sectionIndex).catch(() => {
          // Silently fail - local progress still works
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
    }),
    [
      isCompleted,
      markComplete,
      markIncomplete,
      toggleComplete,
      getCompletedCount,
      getProgress,
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
