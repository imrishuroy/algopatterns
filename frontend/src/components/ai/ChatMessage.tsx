"use client";

import { memo, useMemo, useDeferredValue } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AIMessage, Intent } from "@/types/ai";
import { MermaidBlock } from "./MermaidBlock";
import CodeBlock from "@/components/ui/CodeBlock";

interface ChatMessageProps {
  message: AIMessage;
  showIntentBadge?: boolean;
}

// Intent badge colors
const intentColors: Record<Intent, string> = {
  byop: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  syntax: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  complexity: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  diagram: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  intersection: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  concept: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  out_of_scope: "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

// Create markdown component overrides
// Defined before ChatMessageComponent to avoid "used before defined" warning
const createMarkdownComponents = (
  isStreaming: boolean
): React.ComponentPropsWithoutRef<typeof ReactMarkdown>["components"] => ({
  p: ({ children }) => (
    <p className="my-2 leading-relaxed text-gray-300">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
  h1: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-bold text-white">{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 className="mb-1.5 mt-3 text-base font-semibold text-white">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="mb-1 mt-2 text-sm font-semibold text-gray-100">
      {children}
    </h5>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-inside list-disc space-y-0.5 text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-inside list-decimal space-y-0.5 text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-gray-300">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-indigo-400 underline hover:text-indigo-300"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-gray-600 pl-3 italic text-gray-400">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="min-w-full border border-gray-700 text-sm text-gray-300">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-gray-700 px-3 py-1.5 text-left font-semibold text-gray-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-gray-800 px-3 py-1.5">{children}</td>
  ),
  hr: () => <hr className="my-3 border-gray-700" />,
  // Code block override with Mermaid support
  code: ({ className, children }) => {
    const match = /language-(\w+)/.exec(className || "");
    const lang = match ? match[1] : "";
    const codeString = String(children).replace(/\n$/, "");

    // Check if this is an inline code (no language class and short content)
    const isInline = !className && !codeString.includes("\n");

    if (isInline) {
      return (
        <code className="rounded bg-gray-900 px-1.5 py-0.5 text-xs text-indigo-300 font-mono">
          {children}
        </code>
      );
    }

    // Mermaid diagrams
    if (lang === "mermaid") {
      return <MermaidBlock chart={codeString} isStreaming={isStreaming} />;
    }

    // Regular code blocks
    return <CodeBlock language={lang || "text"} code={codeString} />;
  },
  // skipcq: JS-0424 - Fragment required by ReactMarkdown's pre component interface
  pre: ({ children }) => <>{children}</>,
});

// skipcq: JS-0067
function ChatMessageComponent({
  message,
  showIntentBadge = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {/* Thor AI avatar for assistant messages */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <Image
            src="/thor_ai_icon.png"
            alt="Thor AI"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      )}
      <div
        className={`max-w-[90%] rounded-lg px-4 py-3 text-sm ${
          isUser
            ? "bg-indigo-600 text-white max-w-[85%]"
            : "bg-gray-800/50 text-gray-200 border border-gray-700/50"
        }`}
      >
        {/* Intent badge for assistant messages */}
        {!isUser && showIntentBadge && message.intent && (
          <div className="mb-2">
            <span
              className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded border ${intentColors[message.intent]}`}
            >
              {message.intent}
            </span>
          </div>
        )}
        <MessageContent
          content={message.content}
          isStreaming={message.isStreaming}
          isUser={isUser}
        />
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-indigo-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}

// skipcq: JS-0067
function MessageContent({
  content,
  isStreaming,
  isUser,
}: {
  content: string;
  isStreaming?: boolean;
  isUser?: boolean;
}) {
  // Create markdown components with isStreaming in closure.
  // Must be before early return to satisfy rules of hooks.
  const components = useMemo(
    () => createMarkdownComponents(isStreaming ?? false),
    [isStreaming]
  );

  // Defer content updates during streaming so ReactMarkdown does not
  // re-tokenize on every token. React batches the deferred value and
  // commits it at most once per paint, eliminating the per-chunk
  // re-render cascade that caused visible flicker.
  const deferredContent = useDeferredValue(content);
  const renderContent = isStreaming ? deferredContent : content;

  // Thinking indicator while waiting for response
  if (!content && isStreaming) {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="text-gray-400 text-sm">Thinking</span>
        <div className="flex items-center gap-1">
          <span
            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    );
  }

  // User messages are rendered as plain text with preserved whitespace.
  // This avoids markdown misinterpreting code pastes (e.g. `*` as emphasis,
  // backticks as inline code, blank lines as paragraph breaks) which
  // previously caused only fragments of pasted code to highlight.
  if (isUser) {
    return (
      <div className="whitespace-pre-wrap break-words leading-relaxed">
        {content}
      </div>
    );
  }

  return (
    <div className="max-w-none leading-relaxed overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {renderContent}
      </ReactMarkdown>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
