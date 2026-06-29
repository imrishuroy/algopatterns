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
  languages = ["javascript", "java"],
  size = "md",
}: LanguageToggleProps) {
  const labelMap: Record<string, string> = {
    javascript: size === "sm" ? "JS" : "JavaScript",
    java: "Java",
    python: size === "sm" ? "Py" : "Python",
    cpp: "C++",
    go: "Go",
  };

  return (
    <div className="flex bg-gray-800 rounded-md p-1">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={`px-3 py-1 text-sm rounded-md transition ${
            currentLang === lang
              ? "bg-indigo-500 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {labelMap[lang] || lang}
        </button>
      ))}
    </div>
  );
}
