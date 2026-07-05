"use client";

import { useEffect, useRef } from "react";
import type { Highlight } from "@/types";

interface ConflictDialogProps {
  isOpen: boolean;
  localHighlight: Highlight;
  serverHighlight: Highlight;
  onKeepServer: () => void;
  onKeepLocal: () => void;
  onCancel: () => void;
}

export function ConflictDialog({
  isOpen,
  localHighlight,
  serverHighlight,
  onKeepServer,
  onKeepLocal,
  onCancel,
}: ConflictDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-transparent p-0 m-auto backdrop:bg-black/60"
      onClose={onCancel}
    >
      <div className="bg-gray-900 rounded-md border border-gray-700 shadow-2xl max-w-lg w-full p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 bg-yellow-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Sync Conflict Detected
              </h2>
              <p className="text-sm text-gray-400">
                This highlight was modified on another device
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Server Version */}
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                Server Version
              </span>
              <span className="text-xs text-gray-500">
                v{serverHighlight.version} ·{" "}
                {formatDate(serverHighlight.updatedAt)}
              </span>
            </div>
            <div className="px-4 py-3 bg-gray-800/50">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: getColorValue(serverHighlight.color),
                  }}
                />
                <span className="text-sm text-gray-300 capitalize">
                  {serverHighlight.color}
                </span>
              </div>
              {serverHighlight.note && (
                <p className="text-sm text-gray-400 bg-gray-900/50 rounded-md px-3 py-2">
                  {serverHighlight.note}
                </p>
              )}
              {!serverHighlight.note && (
                <p className="text-sm text-gray-500 italic">No note</p>
              )}
            </div>
          </div>

          {/* Local Version */}
          <div className="rounded-md border border-indigo-500/50 overflow-hidden">
            <div className="px-4 py-2 bg-indigo-900/30 border-b border-indigo-500/50 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-300">
                Your Changes
              </span>
              <span className="text-xs text-indigo-400">Local</span>
            </div>
            <div className="px-4 py-3 bg-indigo-900/10">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: getColorValue(localHighlight.color),
                  }}
                />
                <span className="text-sm text-gray-300 capitalize">
                  {localHighlight.color}
                </span>
              </div>
              {localHighlight.note && (
                <p className="text-sm text-gray-400 bg-gray-900/50 rounded-md px-3 py-2">
                  {localHighlight.note}
                </p>
              )}
              {!localHighlight.note && (
                <p className="text-sm text-gray-500 italic">No note</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onKeepServer}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors"
          >
            Keep Server Version
          </button>
          <button
            onClick={onKeepLocal}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Use My Changes
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
}

function getColorValue(color: string): string {
  const colors: Record<string, string> = {
    yellow: "#F97316",
    green: "#14B8A6",
    blue: "#6366F1",
    pink: "#F43F5E",
    purple: "#06B6D4",
  };
  return colors[color] || colors.yellow;
}
