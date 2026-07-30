"use client";

import {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
  KeyboardEvent,
} from "react";

export interface ChatInputHandle {
  focus: () => void;
  setValue: (value: string) => void;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput(
    {
      onSend,
      onStop,
      isLoading,
      placeholder = "Ask a question...",
      disabled = false,
      defaultValue = "",
    },
    ref
  ) {
    const [input, setInput] = useState(defaultValue);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      setValue: (value: string) => {
        setInput(value);
        // Resize textarea: reset to auto first, then set actual height
        // skipcq: JS-W1032 - Intentional double assignment for auto-resize pattern
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
      },
    }));

    // Sync with defaultValue when it changes externally
    useEffect(() => {
      if (defaultValue) {
        setInput(defaultValue);
      }
    }, [defaultValue]);

    const handleSend = useCallback(() => {
      if (input.trim() && !isLoading && !disabled) {
        onSend(input.trim());
        setInput("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }, [input, isLoading, disabled, onSend]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const textarea = e.target;
      textarea.style.height = "auto"; // skipcq: JS-W1032
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    };

    return (
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-2.5 text-sm resize-none disabled:opacity-50 focus:outline-none transition-colors bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-gray-600 overflow-y-hidden"
          style={{
            minHeight: "44px",
            maxHeight: "120px",
          }}
        />
        {isLoading ? (
          <button
            onClick={onStop}
            className="flex-shrink-0 w-10 h-10 bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center rounded-lg"
            title="Stop"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`flex-shrink-0 w-10 h-10 transition-all flex items-center justify-center rounded-lg ${
              !input.trim() || disabled
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
            title="Send"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
