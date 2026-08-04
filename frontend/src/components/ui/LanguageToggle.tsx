"use client";

interface LanguageToggleProps {
  currentLang: string;
  onChange: (lang: string) => void;
  languages?: string[];
  size?: "sm" | "md";
}

export default function LanguageToggle({
  currentLang,
  onChange,
  languages = ["java", "javascript"],
  size = "md",
}: LanguageToggleProps) {
  const labelMap: Record<string, string> = {
    javascript: size === "sm" ? "JS" : "JavaScript",
    java: "Java",
    python: size === "sm" ? "Py" : "Python",
    cpp: "C++",
    go: "Go",
  };

  const sizeClasses = size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm";

  return (
    <div className="inline-flex bg-gray-800/80 rounded-full p-1 gap-1">
      {languages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => onChange(lang)}
          className={`${sizeClasses} rounded-full font-medium transition-all duration-200 ${
            currentLang === lang
              ? "bg-indigo-500 text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
          }`}
        >
          {labelMap[lang] || lang}
        </button>
      ))}
    </div>
  );
}
