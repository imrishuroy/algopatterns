"use client";

import { memo } from "react";
import type { AIMessage } from "@/types/ai";

interface ChatMessageProps {
  message: AIMessage;
}

function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[90%] rounded-md px-3 py-2 text-sm ${
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-gray-800 text-gray-200 border border-gray-700"
        }`}
      >
        <MessageContent content={message.content} isStreaming={message.isStreaming} />
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-indigo-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  if (!content && isStreaming) {
    return (
      <div className="flex items-center gap-1 py-1">
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    );
  }

  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="leading-relaxed space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
          if (match) {
            const [, lang, code] = match;
            return (
              <pre
                key={`code-${index}`} // skipcq: JS-0437
                className="bg-gray-900 rounded-md p-2 my-2 overflow-x-auto text-xs font-mono"
              >
                {lang && (
                  <div className="text-[10px] text-gray-500 mb-1 uppercase">{lang}</div>
                )}
                <code className="text-gray-300">{code.trim()}</code>
              </pre>
            );
          }
        }
        return <FormattedText key={`text-${index}`} text={part} />; // skipcq: JS-0437
      })}
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  // Process line by line for headers and lists
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join("\n");
      elements.push(
        <p key={elements.length} className="whitespace-pre-wrap">
          {formatInlineText(paragraphText)}
        </p>
      );
      currentParagraph = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      elements.push(
        // skipcq: JS-0437
        <h4 key={`h4-${i}`} className="font-semibold text-white mt-3 mb-1">
          {formatInlineText(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      elements.push(
        // skipcq: JS-0437
        <h3 key={`h3-${i}`} className="font-semibold text-white mt-3 mb-1 text-base">
          {formatInlineText(trimmed.slice(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushParagraph();
      elements.push(
        // skipcq: JS-0437
        <h2 key={`h2-${i}`} className="font-bold text-white mt-3 mb-2 text-base">
          {formatInlineText(trimmed.slice(2))}
        </h2>
      );
    }
    // Bullet lists
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      elements.push(
        // skipcq: JS-0437
        <div key={`li-${i}`} className="flex gap-2 ml-2">
          <span className="text-gray-500">•</span>
          <span>{formatInlineText(trimmed.slice(2))}</span>
        </div>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          // skipcq: JS-0437
          <div key={`ol-${i}`} className="flex gap-2 ml-2">
            <span className="text-gray-500 min-w-[1.2em]">{match[1]}.</span>
            <span>{formatInlineText(match[2])}</span>
          </div>
        );
      }
    }
    // Horizontal rule
    else if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushParagraph();
      elements.push(
        // skipcq: JS-0437
        <hr key={`hr-${i}`} className="border-gray-700 my-2" />
      );
    }
    // Empty line
    else if (trimmed === "") {
      flushParagraph();
    }
    // Regular text
    else {
      currentParagraph.push(line);
    }
  });

  flushParagraph();

  return elements;
}

function formatInlineText(text: string): React.ReactNode { // skipcq: JS-R1005
  // Handle bold, italic, inline code
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*([\s\S]*)/);
    if (boldMatch) {
      if (boldMatch[1]) {
        parts.push(...processInlineCode(boldMatch[1], keyIndex++));
      }
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-white">
          {boldMatch[2]}
        </strong>
      );
      remaining = boldMatch[3];
      continue;
    }

    // Italic *text* or _text_
    const italicMatch = remaining.match(/^([\s\S]*?)(?:\*([^*]+)\*|_([^_]+)_)([\s\S]*)/);
    if (italicMatch) {
      if (italicMatch[1]) {
        parts.push(...processInlineCode(italicMatch[1], keyIndex++));
      }
      parts.push(
        <em key={`italic-${keyIndex++}`} className="italic">
          {italicMatch[2] || italicMatch[3]}
        </em>
      );
      remaining = italicMatch[4];
      continue;
    }

    // No more formatting, process remaining for inline code
    parts.push(...processInlineCode(remaining, keyIndex));
    break;
  }

  return parts.length === 1 ? parts[0] : parts;
}

function processInlineCode(text: string, startKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const segments = text.split(/(`[^`]+`)/g);

  segments.forEach((segment, i) => {
    if (segment.startsWith("`") && segment.endsWith("`")) {
      parts.push(
        <code
          key={`code-${startKey}-${i}`} // skipcq: JS-0437
          className="bg-gray-900 px-1 py-0.5 rounded-md text-xs font-mono text-indigo-300"
        >
          {segment.slice(1, -1)}
        </code>
      );
    } else if (segment) {
      parts.push(segment);
    }
  });

  return parts;
}

export const ChatMessage = memo(ChatMessageComponent);
