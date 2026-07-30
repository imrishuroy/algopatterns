"use client";

import Link from "next/link";
import { LanguageMeta, languageAccents } from "@/types/languages";

interface LanguageCardProps {
  language: LanguageMeta;
}

// Language icon components
const GoIcon = () => (
  <svg viewBox="0 0 120 120" className="w-12 h-12">
    <path
      fill="#00ADD8"
      d="M20.3 55.4c-.2 0-.3-.1-.2-.3l.7-1c.1-.2.3-.3.5-.3h12.5c.2 0 .3.1.2.3l-.6.9c-.1.2-.3.3-.5.3l-12.6.1zM14.2 59.4c-.2 0-.3-.1-.2-.3l.7-1c.1-.2.3-.3.5-.3h16c.2 0 .3.2.2.3l-.3.9c0 .2-.2.3-.4.3l-16.5.1zM23.1 63.4c-.2 0-.3-.2-.2-.3l.5-1c.1-.2.3-.3.4-.3h7c.2 0 .3.1.3.3l-.1.9c0 .2-.2.3-.3.3l-7.6.1z"
    />
    <path
      fill="#00ADD8"
      d="M73.7 54.2c-2.1.5-3.5.9-5.6 1.4-.5.1-.5.1-.9-.3-.5-.5-.8-.8-1.5-1.1-2-1-4-.7-5.7.5-2.1 1.4-3.2 3.5-3.1 6 .1 2.4 1.7 4.4 4.1 4.8 2.1.3 3.8-.4 5.2-2 .3-.3.5-.7.8-1.2h-5.8c-.7 0-.8-.4-.6-1 .4-1 1.2-2.7 1.6-3.5.1-.2.3-.5.8-.5h10.8c-.1.9-.1 1.8-.3 2.7-.4 2.4-1.3 4.5-2.8 6.4-2.3 3-5.3 4.9-9.2 5.3-3.2.4-6.2-.2-8.8-2.1-2.3-1.7-3.7-4-4.1-6.9-.5-3.4.4-6.6 2.3-9.3 2.1-3 4.9-5 8.5-5.6 2.9-.5 5.7-.2 8.2 1.3 1.6 1 2.9 2.4 3.6 4.3.2.3.1.5-.3.6z"
    />
    <path
      fill="#00ADD8"
      d="M89.6 74.5c-2.9-.1-5.5-.9-7.7-2.8-1.9-1.6-3.1-3.7-3.4-6.2-.5-3.6.5-6.8 2.6-9.6 2.3-3 5.2-4.8 8.9-5.3 3.1-.4 6-.1 8.6 1.6 2.4 1.6 3.9 3.8 4.3 6.7.5 4.1-.6 7.6-3.3 10.6-1.9 2.2-4.3 3.6-7.2 4.3-1 .3-2.1.4-2.8.7zm7.5-12.3c0-.4 0-.7-.1-1-.6-3.2-3.6-4.9-6.6-4.1-2.9.7-4.7 2.6-5.4 5.5-.5 2.5.6 5.1 2.9 6.2 1.7.8 3.4.7 5-.2 2.5-1.3 3.9-3.4 4.2-6.4z"
    />
  </svg>
);

const RustIcon = () => (
  <svg viewBox="0 0 120 120" className="w-12 h-12">
    <circle
      cx="60"
      cy="60"
      r="40"
      fill="none"
      stroke="#DEA584"
      strokeWidth="4"
    />
    <path
      fill="#DEA584"
      d="M60 30v10M60 80v10M30 60h10M80 60h10M38 38l7 7M75 75l7 7M38 82l7-7M75 45l7-7"
    />
    <text x="48" y="68" fill="#DEA584" fontSize="24" fontWeight="bold">
      R
    </text>
  </svg>
);

const JavaIcon = () => (
  <svg viewBox="0 0 120 120" className="w-12 h-12">
    <path
      fill="#ED8B00"
      d="M47.5 70.5s-3.5 2 2.5 2.7c7.3.8 11 .7 19-0.8 0 0 2.1 1.3 5 2.5-17.8 7.6-40.3-.4-26.5-4.4zM45 61.5s-3.9 2.9 2.1 3.5c7.7.8 13.9.9 24.5-1.2 0 0 1.5 1.5 3.8 2.3-21.5 6.3-45.5.5-30.4-4.6z"
    />
    <path
      fill="#ED8B00"
      d="M62.5 45c4.5 5.2-1.2 9.8-1.2 9.8s11.4-5.9 6.2-13.2c-4.9-6.8-8.7-10.2 11.7-21.8 0 0-32 8-16.7 25.2z"
    />
    <path
      fill="#ED8B00"
      d="M83.5 77s2.6 2.1-2.9 3.8c-10.4 3.1-43.3 4-52.4 0.1-3.3-1.4 2.9-3.4 4.9-3.8 2.1-0.4 3.3-0.4 3.3-0.4-3.8-2.7-24.5 5.2-10.5 7.5 38.2 6.2 69.6-2.8 57.6-7.2z"
    />
  </svg>
);

const PythonIcon = () => (
  <svg viewBox="0 0 120 120" className="w-12 h-12">
    <path
      fill="#3776AB"
      d="M60 25c-20 0-19 9-19 9v9h20v3H35s-14-1.5-14 20 12 21 14 21h8v-10s-0.5-12 12-12h20s11 0.2 11-11V35s1.7-10-16-10zm-11 6c2 0 3.5 1.5 3.5 3.5S51 38 49 38s-3.5-1.5-3.5-3.5S47 31 49 31z"
    />
    <path
      fill="#FFD43B"
      d="M60 95c20 0 19-9 19-9v-9H59v-3h26s14 1.5 14-20-12-21-14-21h-8v10s0.5 12-12 12H45s-11-0.2-11 11v19s-1.7 10 16 10zm11-6c-2 0-3.5-1.5-3.5-3.5S69 82 71 82s3.5 1.5 3.5 3.5S73 89 71 89z"
    />
  </svg>
);

const languageIcons: Record<string, React.FC> = {
  go: GoIcon,
  rust: RustIcon,
  java: JavaIcon,
  python: PythonIcon,
};

const LanguageCard = ({ language }: LanguageCardProps) => {
  const Icon = languageIcons[language.icon] || GoIcon;
  const accentColor = languageAccents[language.id] || "#6366f1";

  if (!language.available) {
    return (
      <div
        className="relative rounded-xl p-6 transition-all duration-200 opacity-60"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-1)",
        }}
      >
        <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
          Coming Soon
        </div>

        <div className="flex items-start gap-4">
          <div
            className="p-3 rounded-xl"
            style={{ background: `${accentColor}15` }}
          >
            <Icon />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {language.displayName}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {language.description}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <button
            disabled
            className="w-full py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-500 cursor-not-allowed"
          >
            Notify Me
          </button>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/languages/${language.id}`}>
      <div
        className="group relative rounded-xl p-6 transition-all duration-200 cursor-pointer hover:-translate-y-1"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accentColor;
          e.currentTarget.style.boxShadow = `0 8px 30px ${accentColor}20, 0 0 20px ${accentColor}15`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="p-3 rounded-xl transition-transform duration-200 group-hover:scale-110"
            style={{ background: `${accentColor}15` }}
          >
            <Icon />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white">
              {language.displayName}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {language.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {language.sectionCount} topics
          </span>
          <span className="flex items-center gap-1">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {language.difficulty}
          </span>
          {language.version && (
            <span className="flex items-center gap-1">
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              v{language.version}
            </span>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800">
          <div
            className="w-full py-2 rounded-lg text-sm font-medium text-center transition-colors"
            style={{
              background: `${accentColor}20`,
              color: accentColor,
            }}
          >
            Start Learning
            <svg
              className="inline-block w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LanguageCard;
