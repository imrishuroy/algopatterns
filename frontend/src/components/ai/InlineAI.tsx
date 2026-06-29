"use client";

import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { aiApiClient } from "@/lib/ai-api";
import Image from "next/image";

interface InlineAIProps {
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
  selectedCode: string;
  fullCode: string;
  language: string;
  problemSlug: string;
  problemTitle: string;
  onApply: (newCode: string) => void;
}

type ActionType = "explain" | "improve" | "debug" | "complexity" | "custom";

export function InlineAI({
  isOpen,
  onClose,
  position,
  selectedCode,
  fullCode,
  language,
  problemSlug,
}: InlineAIProps) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setActiveAction] = useState<ActionType | null>(null);
  const [computedTop, setComputedTop] = useState(0);
  const [computedLeft, setComputedLeft] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    startTransition(() => {
      setComputedTop(Math.min(position.top, window.innerHeight - 400));
      setComputedLeft(Math.min(position.left, window.innerWidth - 400));
    });
  }, [position.top, position.left]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleAction = useCallback(
    (action: ActionType, customPrompt?: string) => {
      setIsLoading(true);
      setActiveAction(action);
      setResponse("");

      const prompts: Record<ActionType, string> = {
        explain: `Explain what this code does step by step:\n\`\`\`${language}\n${selectedCode}\n\`\`\``,
        improve: `Suggest improvements for this code (don't give the full solution, just guidance):\n\`\`\`${language}\n${selectedCode}\n\`\`\``,
        debug: `Help me understand what might be wrong with this code:\n\`\`\`${language}\n${selectedCode}\n\`\`\``,
        complexity: `Analyze the time and space complexity of this code:\n\`\`\`${language}\n${selectedCode}\n\`\`\``,
        custom: customPrompt || "",
      };

      const message = prompts[action];
      if (!message) {
        setIsLoading(false);
        return;
      }

      aiApiClient.chatStream(
        {
          message,
          problemSlug,
          code: fullCode,
          language,
        },
        (chunk) => {
          setResponse((prev) => prev + chunk);
        },
        (error) => {
          setResponse(`Error: ${error}`);
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        }
      );
    },
    [selectedCode, fullCode, language, problemSlug]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const prompt = selectedCode
        ? `Regarding this code:\n\`\`\`${language}\n${selectedCode}\n\`\`\`\n\n${input}`
        : input;
      handleAction("custom", prompt);
      setInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-gray-900 border border-gray-700 rounded-md shadow-2xl overflow-hidden"
      style={{
        top: computedTop,
        left: computedLeft,
        width: "380px",
        maxHeight: "350px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
            <Image src="/thor_ai_icon.png" alt="Thor AI" width={16} height={16} className="object-cover rounded-full" />
          </div>
          <span className="text-sm font-medium text-white">Thor AI</span>
          <span className="text-xs text-gray-500">⌘K</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Quick Actions */}
      {!response && !isLoading && selectedCode && (
        <div className="flex flex-wrap gap-1.5 p-2 border-b border-gray-800">
          <ActionButton icon="💡" label="Explain" onClick={() => handleAction("explain")} />
          <ActionButton icon="✨" label="Improve" onClick={() => handleAction("improve")} />
          <ActionButton icon="🐛" label="Debug" onClick={() => handleAction("debug")} />
          <ActionButton icon="⏱️" label="Complexity" onClick={() => handleAction("complexity")} />
        </div>
      )}

      {/* Response Area */}
      {(response || isLoading) && (
        <div className="p-3 max-h-[200px] overflow-y-auto">
          {isLoading && !response && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Thinking...
            </div>
          )}
          {response && (
            <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
              {response}
              {isLoading && <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-400 animate-pulse" />}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedCode ? "Ask about this code..." : "Ask anything..."}
            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-md text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs transition-colors"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
