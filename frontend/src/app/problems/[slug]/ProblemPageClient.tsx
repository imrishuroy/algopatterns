"use client";

import {
  useState,
  useEffect,
  use,
  useCallback,
  useRef,
  startTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import type {
  Problem,
  TestCase,
  ProblemTemplate,
  Language,
  Submission,
  SubmissionResult,
  SubmissionStatus,
  RunCodeResult,
} from "@/types";
import { solutions } from "@/lib/solutions";
import type { Monaco } from "@monaco-editor/react";
import { AIChatPanel, InlineAI } from "@/components/ai";
import { useInlineAI } from "@/hooks/useInlineAI";
import { useEditorPreferences } from "@/hooks/useEditorPreferences";
import type { OnMount } from "@monaco-editor/react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

// Configure Monaco with better Java highlighting
const ABSTRACT_JAVA_TYPES = {
  Queue: "LinkedList, PriorityQueue, or ArrayDeque",
  List: "ArrayList or LinkedList",
  Map: "HashMap, TreeMap, or LinkedHashMap",
  Set: "HashSet, TreeSet, or LinkedHashSet",
  Deque: "ArrayDeque or LinkedList",
  Collection: "ArrayList, HashSet, or another concrete collection",
  Iterable: "a concrete collection like ArrayList or HashSet",
  Iterator: "a collection's iterator() method",
  NavigableMap: "TreeMap",
  NavigableSet: "TreeSet",
  SortedMap: "TreeMap",
  SortedSet: "TreeSet",
} as const;

const JAVA_INTERFACE_PATTERN =
  /\bnew\s+(Queue|List|Map|Set|Deque|Collection|Iterable|Iterator|NavigableMap|NavigableSet|SortedMap|SortedSet)\s*([<(])/;

const JAVA_KEYWORDS = new Set([
  "abstract",
  "assert",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extends",
  "final",
  "finally",
  "float",
  "for",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "native",
  "new",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "strictfp",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "try",
  "void",
  "volatile",
  "while",
  "true",
  "false",
  "null",
  "var",
  "String",
  "Integer",
  "Long",
  "Double",
  "Float",
  "Boolean",
  "Character",
  "Object",
  "Class",
  "System",
  "Math",
  "StringBuilder",
  "StringBuffer",
  "List",
  "ArrayList",
  "LinkedList",
  "Map",
  "HashMap",
  "TreeMap",
  "LinkedHashMap",
  "Set",
  "HashSet",
  "TreeSet",
  "LinkedHashSet",
  "Queue",
  "Deque",
  "Stack",
  "ArrayDeque",
  "PriorityQueue",
  "Vector",
  "Arrays",
  "Collections",
  "Optional",
  "Stream",
  "Collectors",
  "Iterator",
  "Comparable",
  "Comparator",
  "Exception",
  "RuntimeException",
  "Scanner",
  "Random",
  "Pattern",
  "Matcher",
  "Error",
  "Throwable",
]);

// skipcq: JS-0067
function setupJavaValidation(
  editor: Monaco["editor"]["IStandaloneCodeEditor"],
  monaco: Monaco
) {
  const model = editor.getModel();
  if (!model || model.getLanguageId() !== "java") return;

  let timer: ReturnType<typeof setTimeout>;
  const validate = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const markers: Parameters<(typeof monaco.editor)["setModelMarkers"]>[2] =
        [];
      const lines = model.getValue().split("\n");
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (
          !trimmed ||
          trimmed.startsWith("//") ||
          trimmed.startsWith("/*") ||
          trimmed.startsWith("*") ||
          trimmed.startsWith("import ") ||
          trimmed.startsWith("package ")
        )
          continue;

        const match = trimmed.match(/^\s*([a-zA-Z_$][\w$]*)\s*;?\s*$/);
        if (match && !JAVA_KEYWORDS.has(match[1])) {
          const col = lines[i].indexOf(match[1]) + 1;
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: "not a statement",
            startLineNumber: i + 1,
            startColumn: col,
            endLineNumber: i + 1,
            endColumn: col + match[1].length,
          });
        }

        const interfaceMatch = trimmed.match(JAVA_INTERFACE_PATTERN);
        if (interfaceMatch) {
          const typeName =
            interfaceMatch[1] as keyof typeof ABSTRACT_JAVA_TYPES;
          const nameCol = trimmed.indexOf(interfaceMatch[1]) + 1;
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            message: `${typeName} cannot be instantiated; use ${ABSTRACT_JAVA_TYPES[typeName]} instead`,
            startLineNumber: i + 1,
            startColumn: nameCol,
            endLineNumber: i + 1,
            endColumn: nameCol + typeName.length,
          });
        }
      }

      const parenStack: { char: string; line: number; col: number }[] = [];
      for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines[i].length; j++) {
          const ch = lines[i][j];
          if (ch === "(" || ch === "[" || ch === "{") {
            parenStack.push({ char: ch, line: i, col: j });
          } else if (ch === ")" || ch === "]" || ch === "}") {
            const expected = ch === ")" ? "(" : ch === "]" ? "[" : "{";
            if (
              parenStack.length === 0 ||
              parenStack[parenStack.length - 1].char !== expected
            ) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                message: `unexpected '${ch}'`,
                startLineNumber: i + 1,
                startColumn: j + 1,
                endLineNumber: i + 1,
                endColumn: j + 2,
              });
              parenStack.pop();
            } else {
              parenStack.pop();
            }
          }
        }
      }
      parenStack.forEach((p) => {
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: `expected '${p.char === "(" ? ")" : p.char === "[" ? "]" : "}"}'`,
          startLineNumber: p.line + 1,
          startColumn: p.col + 1,
          endLineNumber: p.line + 1,
          endColumn: p.col + 2,
        });
      });

      monaco.editor.setModelMarkers(model, "java-validator", markers);
    }, 400);
  };

  model.onDidChangeContent(validate);
  validate();
}

// skipcq: JS-0067
function handleEditorWillMount(monaco: Monaco) {
  // Define custom theme with better Java type highlighting
  monaco.editor.defineTheme("algopatterns-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "type.identifier.java", foreground: "4EC9B0" },
      { token: "identifier.java", foreground: "9CDCFE" },
    ],
    colors: {},
  });

  monaco.editor.defineTheme("algopatterns-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "type.identifier.java", foreground: "267f99" },
      { token: "identifier.java", foreground: "001080" },
    ],
    colors: {},
  });

  // Enhance Java language configuration
  monaco.languages.setMonarchTokensProvider("java", {
    defaultToken: "",
    tokenPostfix: ".java",

    keywords: [
      "abstract",
      "continue",
      "for",
      "new",
      "switch",
      "assert",
      "default",
      "goto",
      "package",
      "synchronized",
      "boolean",
      "do",
      "if",
      "private",
      "this",
      "break",
      "double",
      "implements",
      "protected",
      "throw",
      "byte",
      "else",
      "import",
      "public",
      "throws",
      "case",
      "enum",
      "instanceof",
      "return",
      "transient",
      "catch",
      "extends",
      "int",
      "short",
      "try",
      "char",
      "final",
      "interface",
      "static",
      "void",
      "class",
      "finally",
      "long",
      "strictfp",
      "volatile",
      "const",
      "float",
      "native",
      "super",
      "while",
      "true",
      "false",
      "null",
    ],

    typeKeywords: [
      "boolean",
      "byte",
      "char",
      "double",
      "float",
      "int",
      "long",
      "short",
      "void",
    ],

    // Common Java types that should be highlighted
    builtinTypes: [
      "String",
      "Integer",
      "Long",
      "Double",
      "Float",
      "Boolean",
      "Character",
      "Object",
      "Class",
      "System",
      "Math",
      "StringBuilder",
      "StringBuffer",
      "List",
      "ArrayList",
      "LinkedList",
      "Map",
      "HashMap",
      "TreeMap",
      "LinkedHashMap",
      "Set",
      "HashSet",
      "TreeSet",
      "LinkedHashSet",
      "Queue",
      "Deque",
      "Stack",
      "ArrayDeque",
      "PriorityQueue",
      "Vector",
      "Arrays",
      "Collections",
      "Optional",
      "Stream",
      "Collectors",
      "Iterator",
      "Comparable",
      "Comparator",
      "Exception",
      "RuntimeException",
      "Scanner",
      "Random",
      "Pattern",
      "Matcher",
    ],

    operators: [
      "=",
      ">",
      "<",
      "!",
      "~",
      "?",
      ":",
      "==",
      "<=",
      ">=",
      "!=",
      "&&",
      "||",
      "++",
      "--",
      "+",
      "-",
      "*",
      "/",
      "&",
      "|",
      "^",
      "%",
      "<<",
      ">>",
      ">>>",
      "+=",
      "-=",
      "*=",
      "/=",
      "&=",
      "|=",
      "^=",
      "%=",
      "<<=",
      ">>=",
      ">>>=",
    ],

    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,

    tokenizer: {
      root: [
        // Type identifiers (capitalized words)
        [
          /[A-Z][\w$]*/,
          {
            cases: {
              "@builtinTypes": "type.identifier",
              "@default": "type.identifier",
            },
          },
        ],

        // Identifiers and keywords
        [
          /[a-z_$][\w$]*/,
          {
            cases: {
              "@keywords": "keyword",
              "@default": "identifier",
            },
          },
        ],

        // Whitespace
        { include: "@whitespace" },

        // Delimiters and operators
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],

        // Annotations
        [/@\s*[a-zA-Z_$][\w$]*/, "annotation"],

        // Numbers
        [/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, "number.float"],
        [/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, "number.float"],
        [/0[xX][0-9a-fA-F_]*[0-9a-fA-F][Ll]?/, "number.hex"],
        [/0[0-7_]*[0-7][Ll]?/, "number.octal"],
        [/0[bB][0-1_]*[0-1][Ll]?/, "number.binary"],
        [/(@digits)[fFdD]/, "number.float"],
        [/(@digits)[lL]?/, "number"],

        // Delimiter: after number because of .\d floats
        [/[;,.]/, "delimiter"],

        // Strings
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string"],

        // Characters
        [/'[^\\']'/, "string"],
        [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
        [/'/, "string.invalid"],
      ],

      whitespace: [
        [/[ \t\r\n]+/, ""],
        [/\/\*\*(?!\/)/, "comment.doc", "@javadoc"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
      ],

      comment: [
        [/[^\/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],

      javadoc: [
        [/[^\/*]+/, "comment.doc"],
        [/\*\//, "comment.doc", "@pop"],
        [/[\/*]/, "comment.doc"],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, "string", "@pop"],
      ],
    },
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const languageToMonaco: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  go: "go",
};

const statusColors: Record<SubmissionStatus, string> = {
  pending: "text-gray-400",
  running: "text-blue-400",
  accepted: "text-emerald-400",
  wrong_answer: "text-red-400",
  time_limit_exceeded: "text-amber-400",
  memory_limit_exceeded: "text-amber-400",
  runtime_error: "text-red-400",
  compilation_error: "text-red-400",
  internal_error: "text-gray-400",
};

const statusLabels: Record<SubmissionStatus, string> = {
  pending: "Pending",
  running: "Running...",
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  time_limit_exceeded: "Time Limit Exceeded",
  memory_limit_exceeded: "Memory Limit Exceeded",
  runtime_error: "Runtime Error",
  compilation_error: "Compilation Error",
  internal_error: "Internal Error",
};

const difficultyColors: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-red-400",
};

function getStorageKey(slug: string, languageId: number) {
  return `code_${slug}_${languageId}`;
}

// skipcq: JS-0067, JS-R1005
export default function ProblemPageClient({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPattern = searchParams.get("from");
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const editorTheme =
    theme === "dark" ? "algopatterns-dark" : "algopatterns-light";
  const panelRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (fromPattern) {
      router.push(`/patterns/${fromPattern}?tab=problems`);
    } else {
      router.back();
    }
  };

  const [problem, setProblem] = useState<Problem | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [templates, setTemplates] = useState<ProblemTemplate[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
    null
  );
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [runResults, setRunResults] = useState<RunCodeResult[] | null>(null);
  const [activeTab, setActiveTab] = useState<
    "description" | "submissions" | "hints" | "solution"
  >("description");
  const [resultTab, setResultTab] = useState<"testcases" | "console">(
    "testcases"
  );

  // UI state - editor preferences (persisted to localStorage)
  const {
    fontSize,
    setFontSize,
    wordWrap,
    tabSize: prefTabSize,
    setTabSize: setPrefTabSize,
    leftPanelWidth,
    setLeftPanelWidth,
    rightPanelWidth,
    setRightPanelWidth,
    editorHeight,
    setEditorHeight,
  } = useEditorPreferences();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const aiDividerRef = useRef<HTMLDivElement>(null);
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [expandedTestCase, setExpandedTestCase] = useState<number | null>(null);
  // Setter unused for now but keeping state for future toggle feature
  const [showDescription] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Mobile state
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"problem" | "code" | "results">(
    "problem"
  );

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [problemSolved, setProblemSolved] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Track last saved code to derive save status
  const [lastSavedCode, setLastSavedCode] = useState<string | null>(null);
  // tabSize comes from useEditorPreferences (persisted); alias to keep existing references working
  const tabSize = prefTabSize;
  const setTabSize = setPrefTabSize;

  // AI Tutor state
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const [errorForAI, setErrorForAI] = useState<string>();

  // Editor instance for inline AI
  const [editorInstance, setEditorInstance] = useState<
    Parameters<OnMount>[0] | null
  >(null);
  const inlineAI = useInlineAI(editorInstance);

  // Monaco ref for error markers/decorations
  const monacoRef = useRef<Monaco | null>(null);
  const errorDecorationsRef = useRef<string[]>([]);
  const wrapperLineOffsetRef = useRef(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && !problemSolved) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, problemSolved]);

  // Load saved timer from localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem(`timer_${slug}`);
    if (savedTime) {
      startTransition(() => {
        setTimerSeconds(parseInt(savedTime, 10));
      });
    }
  }, [slug]);

  // Save timer to localStorage
  useEffect(() => {
    if (timerSeconds > 0) {
      localStorage.setItem(`timer_${slug}`, timerSeconds.toString());
    }
  }, [timerSeconds, slug]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format code using indentation-aware formatting (available for future toolbar button)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _formatCode = useCallback(() => {
    if (!editorInstance) return;

    const MONACO_FORMATTED_LANGS = new Set([
      "javascript",
      "typescript",
      "json",
      "html",
      "css",
    ]);
    const lang = editorInstance.getModel()?.getLanguageId() ?? "";

    // For JS/TS/JSON Monaco has a built-in formatter — use it.
    if (MONACO_FORMATTED_LANGS.has(lang)) {
      editorInstance.getAction("editor.action.formatDocument")?.run();
      return;
    }

    // For Java / Go / Python: re-indent the code using brace/colon-based rules.
    const indentStr = " ".repeat(tabSize);
    const lines = code.split("\n");
    let indentLevel = 0;
    const formatted = lines
      .map((raw) => {
        const line = raw.trim();
        if (line === "") return "";

        // Decrease indent before closing braces/brackets (Java/Go)
        if (/^[}\])]/.test(line)) indentLevel = Math.max(0, indentLevel - 1);

        const result = indentStr.repeat(indentLevel) + line;

        // Increase indent after lines ending with { or : (Python colons)
        if (/[{:]$/.test(line) && !/^\s*\/\//.test(line)) indentLevel += 1;

        return result;
      })
      .join("\n")
      // Collapse 3+ consecutive blank lines to at most 2
      .replace(/\n{3,}/g, "\n\n");

    // Push directly into Monaco's model so it always applies,
    // even when the formatted string equals the current React state.
    const model = editorInstance.getModel();
    if (model) {
      const fullRange = model.getFullModelRange();
      model.pushEditOperations(
        [],
        [{ range: fullRange, text: formatted }],
        () => null
      );
      editorInstance.pushUndoStop();
    }
    setCode(formatted);
  }, [editorInstance, code, tabSize]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // skipcq: JS-R1005
  // Load problem data
  useEffect(() => {
    const fetchProblem = async () => {
      // skipcq: JS-R1005
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.getProblemBySlug(slug);
        if (response.success) {
          setProblem(response.data.problem);
          setTestCases(response.data.sampleTestCases || []);
          setTemplates(response.data.templates || []);
          setLanguages(response.data.languages || []);

          if (response.data.templates?.length > 0) {
            // Restore last-used language for this problem, fall back to Java, then first
            const savedLangId = localStorage.getItem("editor_language");
            const savedTemplate = savedLangId
              ? response.data.templates.find(
                  (t) => t.languageId === parseInt(savedLangId, 10)
                )
              : null;
            const javaTemplate = response.data.templates.find(
              (t) => t.languageSlug === "java"
            );
            const defaultTemplate =
              savedTemplate ?? javaTemplate ?? response.data.templates[0];
            setSelectedLanguageId(defaultTemplate.languageId);

            // Compute wrapper line offset
            const parts = defaultTemplate.wrapperCode.split("{{USER_CODE}}");
            wrapperLineOffsetRef.current = parts[0].split("\n").length - 1;

            // Try to load saved code from localStorage
            const savedCode = localStorage.getItem(
              getStorageKey(slug, defaultTemplate.languageId)
            );
            setCode(savedCode || defaultTemplate.templateCode);
          }
        } else {
          setError(response.error?.message || "Failed to fetch problem");
        }
      } catch {
        setError("Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [slug]);

  // Save code to localStorage — debounced 1 s to avoid writing on every keystroke
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive save status from whether current code matches last saved code
  // Available for future save indicator in UI
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _saveStatus = lastSavedCode === code ? "saved" : "unsaved";

  useEffect(() => {
    if (selectedLanguageId && code) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        localStorage.setItem(getStorageKey(slug, selectedLanguageId), code);
        startTransition(() => setLastSavedCode(code));
      }, 1000);
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [code, slug, selectedLanguageId]);

  const loadSubmissions = useCallback(async () => {
    if (!problem) return;
    setLoadingSubmissions(true);
    try {
      const response = await apiClient.getSubmissions(problem.id);
      if (response.success) {
        setSubmissions(response.data || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoadingSubmissions(false);
    }
  }, [problem]);

  // Load submissions when tab changes
  useEffect(() => {
    if (activeTab === "submissions" && problem && isAuthenticated) {
      startTransition(() => {
        loadSubmissions();
      });
    }
  }, [activeTab, problem, isAuthenticated, loadSubmissions]);

  // Handle language change
  const handleLanguageChange = (languageId: number) => {
    // Save current code before switching
    if (selectedLanguageId) {
      localStorage.setItem(getStorageKey(slug, selectedLanguageId), code);
    }

    setSelectedLanguageId(languageId);
    localStorage.setItem("editor_language", languageId.toString());

    // Load saved code or template for new language
    const savedCode = localStorage.getItem(getStorageKey(slug, languageId));
    const template = templates.find((t) => t.languageId === languageId);
    setCode(savedCode || template?.templateCode || "");

    // Compute wrapper line offset for error highlighting
    if (template?.wrapperCode) {
      const parts = template.wrapperCode.split("{{USER_CODE}}");
      wrapperLineOffsetRef.current = parts[0].split("\n").length - 1;
    }
  };

  // Reset code to template
  const handleReset = () => {
    const template = templates.find((t) => t.languageId === selectedLanguageId);
    if (template) {
      setCode(template.templateCode);
      if (selectedLanguageId) {
        localStorage.removeItem(getStorageKey(slug, selectedLanguageId));
      }
    }
  };

  // Parse line numbers from compiler error messages
  const parseErrorLines = useCallback(
    (errorText: string): { line: number; message: string }[] => {
      const results: { line: number; message: string }[] = [];
      const offset = wrapperLineOffsetRef.current;
      const lines = errorText.split("\n");
      const seen = new Set<number>();

      for (const [, line] of lines.entries()) {
        // Java/C/C++/C#: Main.java:21: error: message
        const compiledMatch = line.match(
          /(?:Main|Solution|main)\.(?:java|cpp|cc|c|cxx|c\+\+|cs):(\d+):(?:\d+:)?\s*(?:error|warning):\s*(.+)/
        );
        if (compiledMatch) {
          const rawLine = parseInt(compiledMatch[1], 10);
          const editorLine = rawLine - offset;
          const fullTail = compiledMatch[2];

          if (editorLine < 1 || seen.has(editorLine)) continue;
          seen.add(editorLine);

          // Extract clean message
          let message = fullTail
            .replace(/\s+\^.*?\d+\s+error(s?)\s*$/g, "")
            .trim();
          if (!message) message = fullTail.trim();

          results.push({ line: editorLine, message });
          continue;
        }

        // Python: File "main.py", line 21
        const pythonMatch = line.match(
          /(?:File\s+".+",\s*)?line\s+(\d+)(?:,?\s+in\s+.+)?/
        );
        if (
          pythonMatch &&
          (line.includes("error") ||
            line.includes("Error") ||
            line.includes("Traceback") ||
            line.includes("SyntaxError"))
        ) {
          const editorLine = parseInt(pythonMatch[1], 10);
          if (editorLine < 1 || seen.has(editorLine)) continue;
          seen.add(editorLine);
          results.push({ line: editorLine, message: line.trim() });
          continue;
        }

        // JavaScript: main.js:21
        const jsMatch = line.match(/main\.js:(\d+)(?::\d+)?/);
        if (jsMatch) {
          const editorLine = parseInt(jsMatch[1], 10);
          if (editorLine < 1 || seen.has(editorLine)) continue;
          seen.add(editorLine);
          results.push({ line: editorLine, message: line.trim() });
          continue;
        }
      }

      return results;
    },
    []
  );

  // Apply error highlights to the Monaco editor (full-line squiggly underline)
  const applyEditorErrors = useCallback(
    (errors: { line: number; message: string }[]) => {
      const editor = editorInstance;
      const monaco = monacoRef.current;
      if (!editor || !monaco || errors.length === 0) return;

      const model = editor.getModel();
      if (!model) return;

      // Set markers with full-line squiggly underlines
      const markers = errors.map((err) => ({
        severity: monaco.MarkerSeverity.Error,
        message: err.message,
        startLineNumber: err.line,
        startColumn: 1,
        endLineNumber: err.line,
        endColumn: model.getLineMaxColumn(err.line),
      }));
      monaco.editor.setModelMarkers(model, "compilation-error", markers);

      // Set decorations (red tint + left gutter marker)
      const decorations = errors.map((err) => ({
        range: new monaco.Range(err.line, 1, err.line, 1),
        options: {
          isWholeLine: true,
          className: "monaco-error-line",
          glyphMarginClassName: "monaco-error-glyph",
        },
      }));
      errorDecorationsRef.current = editor.deltaDecorations(
        errorDecorationsRef.current,
        decorations
      );

      // Reveal the first error line
      editor.revealLineInCenter(errors[0].line);
    },
    [editorInstance]
  );

  // Clear all error highlights from the editor
  const clearEditorErrors = useCallback(() => {
    const editor = editorInstance;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    monaco.editor.setModelMarkers(model, "compilation-error", []);
    errorDecorationsRef.current = editor.deltaDecorations(
      errorDecorationsRef.current,
      []
    );
  }, [editorInstance]);

  // Run code against sample test cases
  const handleRun = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!problem || !selectedLanguageId) return;

    setIsRunning(true);
    setSubmission(null);
    setRunResults(null);
    setConsoleOutput("");
    setError(null);
    clearEditorErrors();

    try {
      const response = await apiClient.runCode({
        problemId: problem.id,
        languageId: selectedLanguageId,
        code,
        customInput: useCustomInput ? customInput : undefined,
      });

      if (response.success) {
        setRunResults(response.data.results);
        // Collect console output
        const stdout = response.data.results
          .map((r) => r.stdout)
          .filter(Boolean)
          .join("\n");
        const stderr = response.data.results
          .map((r) => r.stderr || r.errorMessage)
          .filter(Boolean)
          .join("\n");
        setConsoleOutput(
          stdout + (stderr ? "\n--- Errors ---\n" + stderr : "")
        );
        // Highlight error lines in editor
        if (stderr) {
          applyEditorErrors(parseErrorLines(stderr));
        }
        // Build detailed error context for AI tutor
        const failedTests = response.data.results.filter(
          (r) => r.status !== "accepted"
        );
        if (failedTests.length > 0) {
          const errorContext = failedTests
            .map(
              (t) =>
                `Test ${t.testCaseIndex + 1}: ${t.status.replace(/_/g, " ")}\n  Input: ${t.input}\n  Expected: ${t.expectedOutput}\n  Got: ${t.actualOutput || "(no output)"}\n${t.errorMessage ? `  Error: ${t.errorMessage}` : ""}`
            )
            .join("\n\n");
          setErrorForAI(
            stderr
              ? `${stderr}\n\nFailed Tests:\n${errorContext}`
              : `Failed Tests:\n${errorContext}`
          );
        } else {
          setErrorForAI(undefined); // skipcq: JS-W1042
        }
      } else {
        const errMsg = response.error?.message || "Run failed";
        setConsoleOutput(`Error: ${errMsg}`);
        setErrorForAI(errMsg);
        setResultTab("console");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to run code";
      setConsoleOutput(`Error: ${errMsg}`);
      setErrorForAI(errMsg);
      setResultTab("console");
    } finally {
      setIsRunning(false);
    }
  }, [
    isAuthenticated,
    problem,
    selectedLanguageId,
    code,
    useCustomInput,
    customInput,
    applyEditorErrors,
    clearEditorErrors,
    parseErrorLines,
    router,
  ]);

  // Submit code
  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!problem || !selectedLanguageId) return;

    setIsSubmitting(true);
    setSubmission(null);
    setRunResults(null);
    setConsoleOutput("");
    setError(null);
    clearEditorErrors();

    try {
      const response = await apiClient.submitCode({
        problemId: problem.id,
        languageId: selectedLanguageId,
        code,
      });

      if (response.success) {
        setSubmission(response.data);
        // Mark as solved and stop timer if accepted
        if (response.data.status === "accepted") {
          setProblemSolved(true);
          setTimerRunning(false);
          setErrorForAI(undefined); // skipcq: JS-W1042
          clearEditorErrors();
        }
        // Reload submissions list
        loadSubmissions();
        // Collect console output from results
        if (response.data.results) {
          const stdout = response.data.results
            .map((r) => r.actualOutput)
            .filter(Boolean)
            .join("\n");
          const stderr = response.data.results
            .map((r) => r.errorMessage)
            .filter(Boolean)
            .join("\n");
          setConsoleOutput(
            stdout + (stderr ? "\n--- Errors ---\n" + stderr : "")
          );
          // Highlight error lines in editor
          if (stderr) {
            applyEditorErrors(parseErrorLines(stderr));
          }
          // Build detailed error context for AI tutor
          const failedTests = response.data.results.filter(
            (r) => r.status !== "accepted"
          );
          if (failedTests.length > 0 && response.data.status !== "accepted") {
            const errorContext = failedTests
              .slice(0, 3)
              .map(
                (t, i) =>
                  `Test ${i + 1}: ${t.status.replace(/_/g, " ")}\n  Input: ${t.input}\n  Expected: ${t.expectedOutput}\n  Got: ${t.actualOutput || "(no output)"}\n${t.errorMessage ? `  Error: ${t.errorMessage}` : ""}`
              )
              .join("\n\n");
            setErrorForAI(
              stderr
                ? `${stderr}\n\nFailed Tests:\n${errorContext}`
                : `Failed Tests:\n${errorContext}`
            );
          }
        }
      } else {
        const errMsg = response.error?.message || "Submission failed";
        setConsoleOutput(`Error: ${errMsg}`);
        setErrorForAI(errMsg);
        setResultTab("console");
      }
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to submit code";
      setConsoleOutput(`Error: ${errMsg}`);
      setErrorForAI(errMsg);
      setResultTab("console");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isAuthenticated,
    problem,
    selectedLanguageId,
    code,
    loadSubmissions,
    applyEditorErrors,
    clearEditorErrors,
    parseErrorLines,
    router,
  ]);

  // Keyboard shortcuts
  const handleRunRef = useRef(handleRun);
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleRunRef.current = handleRun;
    handleSubmitRef.current = handleSubmit;
    // skipcq: JS-R1005
  });
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // skipcq: JS-R1005
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRunRef.current();
        } else {
          handleSubmitRef.current();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        // Code is auto-saved, but we can show a toast or something
      }
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
      }
      if (e.key === "?" && !(e.metaKey || e.ctrlKey)) {
        // Don't intercept while the user is typing in an editor, input, or textarea
        const target = e.target as HTMLElement;
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          target.closest(".monaco-editor") !== null
        ) {
          return;
        }
        e.preventDefault();
        setShowShortcuts((s) => !s);
      }
    },
    [isFullScreen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Resizable left panel (Description)
  const handleLeftResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = leftPanelWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const container = panelRef.current;
        if (!container) return;
        const containerWidth = container.offsetWidth;
        const delta = e.clientX - startX;
        const newWidth = startWidth + (delta / containerWidth) * 100;
        // Min 20%, max depends on AI panel
        const maxWidth = isAIChatOpen ? 60 : 70;
        setLeftPanelWidth(Math.min(Math.max(newWidth, 20), maxWidth));
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [leftPanelWidth, isAIChatOpen, setLeftPanelWidth]
  );

  // Resizable right panel (AI Chat)
  const handleRightResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = rightPanelWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const container = panelRef.current;
        if (!container) return;
        const containerWidth = container.offsetWidth;
        const delta = startX - e.clientX; // Reversed because dragging left increases width
        const newWidth = startWidth + (delta / containerWidth) * 100;
        setRightPanelWidth(Math.min(Math.max(newWidth, 15), 40));
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [rightPanelWidth, setRightPanelWidth]
  );

  // Vertical resizer for editor/results split
  const editorPanelRef = useRef<HTMLDivElement>(null);
  const handleVerticalResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = editorHeight;

      const handleMouseMove = (e: MouseEvent) => {
        const container = editorPanelRef.current;
        if (!container) return;
        const containerHeight = container.offsetHeight;
        const delta = e.clientY - startY;
        const newHeight = startHeight + (delta / containerHeight) * 100;
        setEditorHeight(Math.min(Math.max(newHeight, 20), 80));
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [editorHeight, setEditorHeight]
  );

  // Parse hints from problem
  const hints =
    problem?.hints
      ?.split(/Hint \d+:/)
      .filter(Boolean)
      .map((h) => h.trim()) || [];

  const toggleHint = (index: number) => {
    const newRevealed = new Set(revealedHints);
    if (newRevealed.has(index)) {
      newRevealed.delete(index);
    } else {
      newRevealed.add(index);
    }
    setRevealedHints(newRevealed);
  };

  const selectedLanguage = languages.find((l) => l.id === selectedLanguageId);
  const monacoLanguage = selectedLanguage
    ? languageToMonaco[selectedLanguage.slug] || "plaintext"
    : "plaintext";

  const hasResults = true; // Always show the test case panel

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-400">{error || "Problem not found"}</div>
      </div>
    );
  }

  // Full screen mode
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFullScreen(false)}
              className="p-1.5 text-gray-400 hover:text-white transition tooltip-wrap"
              data-tooltip="Exit full screen (Esc)"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <span className="text-white font-medium">{problem.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedLanguageId || ""}
              onChange={(e) => handleLanguageChange(Number(e.target.value))}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-white text-sm h-8"
            >
              {templates.map((t) => (
                <option key={t.languageId} value={t.languageId}>
                  {t.languageName}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 bg-gray-800 rounded-md px-3 border border-gray-700 h-8">
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 2))}
                className="p-1.5 text-gray-400 hover:text-white tooltip-wrap"
                data-tooltip="Decrease font size"
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
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-gray-400 text-sm w-6 text-center font-mono">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="p-1.5 text-gray-400 hover:text-white tooltip-wrap"
                data-tooltip="Increase font size"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            <span className="tooltip-wrap" data-tooltip="Tab size">
              <span className="flex rounded-md border border-gray-700 overflow-hidden">
                <button
                  onClick={() => setTabSize(2)}
                  className={`px-2.5 py-1 text-xs font-mono transition cursor-pointer h-8 ${
                    tabSize === 2
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setTabSize(4)}
                  className={`px-2.5 py-1 text-xs font-mono transition cursor-pointer ${
                    tabSize === 4
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  4
                </button>
              </span>
            </span>
            <button
              onClick={handleReset}
              className="p-1.5 text-gray-400 hover:text-white tooltip-wrap"
              data-tooltip="Reset to template"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`px-4 py-1.5 rounded-md text-sm ${
                isRunning
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {isRunning ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="animate-spin w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Run
                </span>
              ) : (
                "Run"
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-1.5 rounded-md text-sm ${
                isSubmitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="animate-spin w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submit
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
        {/* Editor */}
        <div className="flex-1">
          <MonacoEditor
            height="100%"
            language={monacoLanguage}
            value={code}
            onChange={(value) => {
              setCode(value || "");
            }}
            theme={editorTheme}
            beforeMount={handleEditorWillMount}
            onMount={(editor, monaco) => {
              setEditorInstance(editor);
              monacoRef.current = monaco;
              setupJavaValidation(editor, monaco);
            }}
            options={{
              fontSize,
              tabSize,
              fontFamily: "JetBrains Mono, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              lineNumbers: "on",
              renderLineHighlight: "line",
              automaticLayout: true,
              bracketPairColorization: { enabled: true },
              renderIndentGuides: "always" as const,
              folding: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              wordWrap: wordWrap ? "on" : "off",
            }}
          />
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        {/* Mobile Tab Bar */}
        <div className="flex border-b border-gray-800 bg-gray-900">
          <button
            onClick={handleBack}
            className="px-2 py-3 text-gray-500 hover:text-white transition"
            title="Back to problems"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => setMobileView("problem")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              mobileView === "problem"
                ? "text-white border-b-2 border-indigo-500"
                : "text-gray-400"
            }`}
          >
            Problem
          </button>
          <button
            onClick={() => setMobileView("code")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              mobileView === "code"
                ? "text-white border-b-2 border-indigo-500"
                : "text-gray-400"
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setMobileView("results")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              mobileView === "results"
                ? "text-white border-b-2 border-indigo-500"
                : "text-gray-400"
            }`}
          >
            Results
          </button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {mobileView === "problem" && (
            <div className="h-full overflow-y-auto overscroll-y-contain">
              {/* Problem Tabs - scrollable */}
              <div className="flex border-b border-gray-800 bg-gray-900/50 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 transition ${
                    activeTab === "description"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("submissions")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 transition ${
                    activeTab === "submissions"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  Submissions
                </button>
                <button
                  onClick={() => setActiveTab("hints")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 transition ${
                    activeTab === "hints"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  Hints
                </button>
                <button
                  onClick={() => setActiveTab("solution")}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0 transition ${
                    activeTab === "solution"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  Solution
                </button>
              </div>

              {/* Problem Content */}
              <div className="p-4">
                {activeTab === "description" ? (
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-xl font-bold text-white mb-1">
                        {problem.title}
                      </h1>
                      <span
                        className={`text-sm font-medium ${difficultyColors[problem.difficulty]}`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="text-gray-300 text-sm whitespace-pre-wrap">
                      {problem.description}
                    </div>
                    {testCases.length > 0 && (
                      <div>
                        <h3 className="text-base font-semibold text-white mb-2">
                          Examples
                        </h3>
                        <div className="space-y-3">
                          {testCases.map((tc, i) => (
                            <div
                              key={tc.id}
                              className="bg-gray-900 rounded-md p-3 border border-gray-800 text-sm"
                            >
                              <div className="text-gray-400 mb-1">
                                Example {i + 1}
                              </div>
                              <div className="space-y-1">
                                <div>
                                  <span className="text-gray-400">Input: </span>
                                  <code className="text-white font-mono bg-gray-800 px-1.5 py-0.5 rounded-md text-xs">
                                    {tc.input.replace(/\n/g, ", ")}
                                  </code>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    Output:{" "}
                                  </span>
                                  <code className="text-white font-mono bg-gray-800 px-1.5 py-0.5 rounded-md text-xs">
                                    {tc.expectedOutput}
                                  </code>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {problem.constraints && (
                      <div>
                        <h3 className="text-base font-semibold text-white mb-2">
                          Constraints
                        </h3>
                        <div className="text-gray-300 whitespace-pre-wrap font-mono text-xs bg-gray-900 rounded-md p-3 border border-gray-800">
                          {problem.constraints}
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeTab === "submissions" ? (
                  <div className="space-y-3">
                    {!isAuthenticated ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>Sign in to view your submissions</p>
                        <button
                          onClick={() => router.push("/login")}
                          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm"
                        >
                          Sign in
                        </button>
                      </div>
                    ) : loadingSubmissions ? (
                      <div className="text-center py-8 text-gray-400">
                        Loading...
                      </div>
                    ) : submissions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No submissions yet
                      </div>
                    ) : (
                      submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className={`p-3 rounded-md border text-sm ${
                            sub.status === "accepted"
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-gray-900 border-gray-800"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-medium ${statusColors[sub.status]}`}
                            >
                              {statusLabels[sub.status]}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {sub.testCasesPassed}/{sub.testCasesTotal}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : activeTab === "hints" ? (
                  <div className="space-y-3">
                    {hints.length === 0 ? (
                      <div className="text-gray-500">No hints available.</div>
                    ) : (
                      hints.map((hint, i) => (
                        <div
                          key={hint.slice(0, 40)}
                          className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleHint(i)}
                            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800/50 transition"
                          >
                            <span className="text-white font-medium text-sm">
                              Hint {i + 1}
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${revealedHints.has(i) ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {revealedHints.has(i) && (
                            <div className="px-3 pb-3 text-gray-300 text-sm border-t border-gray-800 pt-2">
                              {hint}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!solutions[slug] ? (
                      <div className="text-center py-8 text-gray-400">
                        Solution coming soon!
                      </div>
                    ) : !problemSolved && !showSolution ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4 text-sm">
                          Solve the problem to unlock the solution
                        </div>
                        <button
                          onClick={() => setShowSolution(true)}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm"
                        >
                          Reveal Solution
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-gray-900 rounded-md border border-gray-800 p-3">
                          <h4 className="text-white font-medium text-sm mb-2">
                            Approach
                          </h4>
                          <p className="text-gray-300 text-sm">
                            {solutions[slug].approach}
                          </p>
                        </div>
                        <div className="bg-gray-900 rounded-md border border-gray-800 p-3">
                          <h4 className="text-white font-medium text-sm mb-2">
                            Complexity
                          </h4>
                          <p className="text-gray-400 text-xs">
                            Time: {solutions[slug].timeComplexity}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Space: {solutions[slug].spaceComplexity}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileView === "code" && (
            <div className="h-full flex flex-col">
              {/* Mobile Code Toolbar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-gray-900">
                <div className="relative" ref={langDropdownRef}>
                  <button
                    onClick={() => setShowLangDropdown(!showLangDropdown)}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded-md text-white text-xs"
                  >
                    <span>{selectedLanguage?.name || "Language"}</span>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showLangDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-xl z-50">
                      {templates.map((t) => (
                        <button
                          key={t.languageId}
                          onClick={() => {
                            handleLanguageChange(t.languageId);
                            setShowLangDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-xs text-left hover:bg-gray-700 ${
                            selectedLanguageId === t.languageId
                              ? "text-indigo-400"
                              : "text-white"
                          }`}
                        >
                          {t.languageName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono ${problemSolved ? "text-emerald-400" : "text-white"}`}
                  >
                    {formatTime(timerSeconds)}
                  </span>
                  <button
                    onClick={handleReset}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Reset to template"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Editor */}
              <div className="flex-1 min-h-0">
                <MonacoEditor
                  height="100%"
                  language={monacoLanguage}
                  value={code}
                  onChange={(value) => {
                    setCode(value || "");
                  }}
                  theme={editorTheme}
                  beforeMount={handleEditorWillMount}
                  onMount={(editor, monaco) =>
                    setupJavaValidation(editor, monaco)
                  }
                  options={{
                    fontSize,
                    tabSize,
                    fontFamily: "JetBrains Mono, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 8 },
                    lineNumbers: "on",
                    automaticLayout: true,
                    wordWrap: "on",
                    bracketPairColorization: { enabled: true },
                    renderIndentGuides: "always" as const,
                    folding: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                  }}
                />
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex gap-2 p-3 border-t border-gray-800 bg-gray-900">
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className={`flex-1 py-2 rounded-md font-medium text-sm ${
                    isRunning
                      ? "bg-gray-700 text-gray-400"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {isRunning ? "Running..." : "Run"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 rounded-md font-medium text-sm ${
                    isSubmitting
                      ? "bg-gray-700 text-gray-400"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}

          {mobileView === "results" && (
            <div className="h-full overflow-y-auto overscroll-y-contain p-4">
              {/* Result Tabs */}
              <div className="flex mb-3 border-b border-gray-800">
                <button
                  onClick={() => setResultTab("testcases")}
                  className={`px-3 py-2 text-sm font-medium ${
                    resultTab === "testcases"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setResultTab("console")}
                  className={`px-3 py-2 text-sm font-medium ${
                    resultTab === "console"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-gray-400"
                  }`}
                >
                  Console
                </button>
              </div>

              {resultTab === "testcases" ? (
                <div className="space-y-2">
                  {submission && (
                    <div className="flex items-center justify-between mb-3 p-2 rounded-md bg-gray-900">
                      <span
                        className={`font-semibold text-sm ${statusColors[submission.status]}`}
                      >
                        {statusLabels[submission.status]}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {submission.testCasesPassed}/{submission.testCasesTotal}{" "}
                        passed
                      </span>
                    </div>
                  )}

                  {runResults && (
                    <div className="flex items-center justify-between mb-3 p-2 rounded-md bg-gray-900">
                      <span className="font-semibold text-sm text-blue-400">
                        Run Results
                      </span>
                      <span className="text-gray-400 text-xs">
                        {
                          runResults.filter((r) => r.status === "accepted")
                            .length
                        }
                        /{runResults.length} passed
                      </span>
                    </div>
                  )}

                  {submission?.results?.map(
                    (result: SubmissionResult, i: number) => (
                      <div
                        key={result.id}
                        className={`p-2 rounded-md border text-sm ${
                          result.status === "accepted"
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : "bg-red-500/10 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white text-xs">
                            Test {i + 1}
                          </span>
                          <span
                            className={`text-xs ${statusColors[result.status]}`}
                          >
                            {statusLabels[result.status]}
                          </span>
                        </div>
                        {result.status !== "accepted" && (
                          <div className="text-xs space-y-0.5">
                            <div>
                              <span className="text-gray-400">Expected:</span>{" "}
                              <code className="text-emerald-400">
                                {result.expectedOutput}
                              </code>
                            </div>
                            <div>
                              <span className="text-gray-400">Got:</span>{" "}
                              <code className="text-red-400">
                                {result.actualOutput || "No output"}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {runResults?.map((result: RunCodeResult, i: number) => (
                    <div
                      key={i}
                      className={`p-2 rounded-md border text-sm ${
                        result.status === "accepted"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-xs">
                          Test {i + 1}
                        </span>
                        <span
                          className={`text-xs ${statusColors[result.status]}`}
                        >
                          {statusLabels[result.status]}
                        </span>
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div>
                          <span className="text-gray-400">Expected:</span>{" "}
                          <code className="text-emerald-400">
                            {result.expectedOutput}
                          </code>
                        </div>
                        <div>
                          <span className="text-gray-400">Output:</span>{" "}
                          <code
                            className={
                              result.status === "accepted"
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          >
                            {result.actualOutput || "No output"}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!submission &&
                    !runResults &&
                    testCases.map((tc, i) => (
                      <div
                        key={tc.id}
                        className="p-2 rounded-md border bg-gray-800/50 border-gray-700 text-sm"
                      >
                        <div className="font-medium text-white text-xs mb-1">
                          Case {i + 1}
                        </div>
                        <div className="text-xs space-y-0.5">
                          <div>
                            <span className="text-gray-400">Input:</span>{" "}
                            <code className="text-white">
                              {tc.input.replace(/\n/g, ", ")}
                            </code>
                          </div>
                          <div>
                            <span className="text-gray-400">Expected:</span>{" "}
                            <code className="text-emerald-400">
                              {tc.expectedOutput}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                  {consoleOutput || "No console output"}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* AI Toggle Button for Mobile */}
        {!isAIChatOpen && (
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="fixed bottom-4 right-4 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-lg transition-colors z-40 tooltip-wrap"
            data-tooltip="Open Thor AI"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        )}
        {/* AI Panel Overlay for Mobile */}
        {isAIChatOpen && problem && (
          <div className="fixed inset-0 z-50 bg-gray-900">
            <AIChatPanel
              problemSlug={slug}
              problemTitle={problem.title}
              problemDescription={problem.description}
              code={code}
              language={
                languages.find((l) => l.id === selectedLanguageId)?.slug ||
                "java"
              }
              errorMessage={errorForAI}
              isOpen={isAIChatOpen}
              onClose={() => setIsAIChatOpen(false)}
            />
          </div>
        )}
      </div>
    );
  }

  // Get current language name for AI
  const currentLanguageName =
    languages.find((l) => l.id === selectedLanguageId)?.slug || "java";

  // Calculate middle panel width
  const effectiveLeftWidth = showDescription ? leftPanelWidth : 0;
  const middlePanelWidth = isAIChatOpen
    ? 100 - effectiveLeftWidth - rightPanelWidth
    : 100 - effectiveLeftWidth;

  // Desktop Layout
  return (
    <div ref={panelRef} className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* skipcq: JS-0415 */}
      {/* Left Panel - Problem Description */}
      {showDescription && (
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Tabs - scrollable */}
          <div className="flex items-center border-b border-gray-800 overflow-x-auto scrollbar-none">
            <button
              onClick={handleBack}
              className="px-3 py-3 text-gray-500 hover:text-white transition flex-shrink-0"
              title="Back to problems"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === "description"
                  ? "text-white border-b-2 border-indigo-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === "submissions"
                  ? "text-white border-b-2 border-indigo-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => setActiveTab("hints")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === "hints"
                  ? "text-white border-b-2 border-indigo-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Hints
            </button>
            <button
              onClick={() => setActiveTab("solution")}
              className={`px-4 py-3 font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === "solution"
                  ? "text-white border-b-2 border-indigo-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Solution
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-y-contain p-6">
            {activeTab === "description" ? (
              <div className="space-y-6">
                {/* Title & Difficulty */}
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    {problem.title}
                  </h1>
                  <span
                    className={`text-sm font-medium ${difficultyColors[problem.difficulty]}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                {/* Description */}
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {problem.description}
                  </div>
                </div>

                {/* Examples */}
                {testCases.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Examples
                    </h3>
                    <div className="space-y-4">
                      {testCases.map((tc, i) => (
                        <div
                          key={tc.id}
                          className="bg-gray-900 rounded-md p-4 border border-gray-800"
                        >
                          <div className="text-sm text-gray-400 mb-2">
                            Example {i + 1}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <span className="text-gray-400">Input: </span>
                              <code className="text-white font-mono bg-gray-800 px-2 py-0.5 rounded-md">
                                {tc.input.replace(/\n/g, ", ")}
                              </code>
                            </div>
                            <div>
                              <span className="text-gray-400">Output: </span>
                              <code className="text-white font-mono bg-gray-800 px-2 py-0.5 rounded-md">
                                {tc.expectedOutput}
                              </code>
                            </div>
                            {tc.explanation && (
                              <div className="text-gray-400 text-sm mt-2">
                                {tc.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Constraints
                    </h3>
                    <div className="text-gray-300 whitespace-pre-wrap font-mono text-sm bg-gray-900 rounded-md p-4 border border-gray-800">
                      {problem.constraints}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === "submissions" ? (
              <div className="space-y-4">
                {!isAuthenticated ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>Sign in to view your submissions</p>
                    <button
                      onClick={() => router.push("/login")}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md"
                    >
                      Sign in
                    </button>
                  </div>
                ) : loadingSubmissions ? (
                  <div className="text-center py-8 text-gray-400">
                    Loading submissions...
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No submissions yet
                  </div>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-md border ${
                        sub.status === "accepted"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-gray-900 border-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-medium ${statusColors[sub.status]}`}
                          >
                            {statusLabels[sub.status]}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {sub.testCasesPassed}/{sub.testCasesTotal} passed
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {sub.runtimeMs && <span>{sub.runtimeMs}ms</span>}
                          <span>
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : activeTab === "hints" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Progressive Hints
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Try to solve the problem on your own first. Click to reveal
                  hints one at a time.
                </p>
                {hints.length === 0 ? (
                  <div className="text-gray-500">
                    No hints available for this problem.
                  </div>
                ) : (
                  hints.map((hint, i) => (
                    <div
                      key={hint.slice(0, 40)}
                      className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleHint(i)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition"
                      >
                        <span className="text-white font-medium">
                          Hint {i + 1}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${revealedHints.has(i) ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {revealedHints.has(i) && (
                        <div className="px-4 pb-4 text-gray-300 border-t border-gray-800 pt-3">
                          {hint}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : activeTab === "solution" ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Solution
                </h3>
                {!solutions[slug] ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-600 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <div className="text-gray-400 mb-2">
                      Solution coming soon!
                    </div>
                    <p className="text-gray-500 text-sm">
                      We&apos;re working on adding detailed solutions for all
                      problems.
                    </p>
                  </div>
                ) : !problemSolved && !showSolution ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      Solve the problem first to unlock the solution, or click
                      below to reveal it.
                    </div>
                    <button
                      onClick={() => setShowSolution(true)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition"
                    >
                      Reveal Solution
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-900 rounded-md border border-gray-800 p-4">
                      <h4 className="text-white font-medium mb-3">Approach</h4>
                      <div className="text-gray-300 text-sm space-y-2">
                        <p>{solutions[slug].approach}</p>
                        <ol className="list-decimal list-inside space-y-1 text-gray-400 mt-3">
                          {solutions[slug].steps.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                        <h4 className="text-white font-medium">
                          Solution Code
                        </h4>
                        <span className="text-xs text-gray-500 capitalize">
                          {solutions[slug].language}
                        </span>
                      </div>
                      <div className="h-72">
                        <MonacoEditor
                          height="100%"
                          language={solutions[slug].language}
                          value={solutions[slug].code}
                          theme={editorTheme}
                          beforeMount={handleEditorWillMount}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            lineNumbers: "on",
                            folding: false,
                            padding: { top: 12 },
                            bracketPairColorization: { enabled: true },
                            renderIndentGuides: "always" as const,
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-md border border-gray-800 p-4">
                      <h4 className="text-white font-medium mb-2">
                        Complexity Analysis
                      </h4>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>
                          <span className="text-gray-300">Time:</span>{" "}
                          {solutions[slug].timeComplexity}
                        </p>
                        <p>
                          <span className="text-gray-300">Space:</span>{" "}
                          {solutions[slug].spaceComplexity}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Resizer */}
      {showDescription && (
        <div
          ref={dividerRef}
          onMouseDown={handleLeftResize}
          className="w-1 bg-gray-800 hover:bg-indigo-500 cursor-col-resize transition-colors flex-shrink-0"
        />
      )}

      {/* Middle Panel - Code Editor */}
      <div
        ref={editorPanelRef}
        className="flex flex-col h-full overflow-hidden"
        style={{ width: `${middlePanelWidth}%` }}
      >
        {/* Toolbar - Clean single row like LeetCode */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 gap-3">
          {/* Left section - can shrink */}
          <div className="flex items-center gap-2 min-w-0 flex-shrink overflow-hidden">
            {/* Language dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-white text-sm font-medium hover:bg-gray-700 transition-colors h-8"
              >
                <span>{selectedLanguage?.name || "Language"}</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showLangDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showLangDropdown && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-md shadow-xl z-50 overflow-hidden">
                  {templates.map((t) => (
                    <button
                      key={t.languageId}
                      onClick={() => {
                        handleLanguageChange(t.languageId);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-700 transition-colors ${
                        selectedLanguageId === t.languageId
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "text-white"
                      }`}
                    >
                      <span>{t.languageName}</span>
                      {selectedLanguageId === t.languageId && (
                        <svg
                          className="w-4 h-4 ml-auto text-indigo-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font size controls */}
            <div className="flex items-center bg-gray-800 rounded-md border border-gray-700 h-8">
              <button
                onClick={() => setFontSize(Math.max(10, fontSize - 2))}
                className="px-2 text-gray-400 hover:text-white transition"
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
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-gray-300 text-sm w-6 text-center font-mono">
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="px-2 text-gray-400 hover:text-white transition"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right section - Tab size, Timer, Run, Submit (always visible) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Tab size */}
            <div className="flex rounded-md border border-gray-700 overflow-hidden h-8">
              <button
                onClick={() => setTabSize(2)}
                className={`px-2 text-sm font-mono transition ${
                  tabSize === 2
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                2
              </button>
              <button
                onClick={() => setTabSize(4)}
                className={`px-2 text-sm font-mono transition ${
                  tabSize === 4
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                4
              </button>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 px-2 bg-gray-800 rounded-md border border-gray-700 h-8">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                className={`text-sm font-mono ${problemSolved ? "text-emerald-400" : "text-white"}`}
              >
                {formatTime(timerSeconds)}
              </span>
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="text-gray-400 hover:text-white transition"
                title={timerRunning ? "Pause timer" : "Start timer"}
              >
                {timerRunning ? (
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
                      d="M10 9v6m4-6v6"
                    />
                  </svg>
                ) : (
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
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`px-4 py-1.5 rounded-md font-medium text-sm transition h-8 ${
                isRunning
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {isRunning ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="animate-spin w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Run
                </span>
              ) : (
                "Run"
              )}
            </button>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-5 py-1.5 rounded-md font-medium text-sm transition h-8 ${
                isSubmitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="animate-spin w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submit
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div
          className="min-h-0"
          style={{ height: hasResults ? `${editorHeight}%` : "100%" }}
        >
          <MonacoEditor
            height="100%"
            language={monacoLanguage}
            value={code}
            onChange={(value) => {
              setCode(value || "");
            }}
            theme={editorTheme}
            beforeMount={handleEditorWillMount}
            onMount={(editor, monaco) => {
              setEditorInstance(editor);
              monacoRef.current = monaco;
              setupJavaValidation(editor, monaco);
            }}
            options={{
              fontSize,
              tabSize,
              fontFamily: "JetBrains Mono, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              lineNumbers: "on",
              renderLineHighlight: "line",
              automaticLayout: true,
              wordWrap: wordWrap ? "on" : "off",
            }}
          />
        </div>

        {/* Inline AI (Cmd+K) */}
        {problem && (
          <InlineAI
            isOpen={inlineAI.isOpen}
            onClose={inlineAI.close}
            position={inlineAI.position}
            selectedCode={inlineAI.selectedCode}
            fullCode={code}
            language={currentLanguageName}
            problemSlug={slug}
            problemTitle={problem.title}
            onApply={inlineAI.applyCode}
          />
        )}

        {/* Vertical Resizer */}
        {hasResults && (
          <div
            onMouseDown={handleVerticalResize}
            className="h-1.5 bg-gray-800 hover:bg-indigo-500 cursor-row-resize transition-colors flex items-center justify-center"
          >
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>
        )}

        {/* Results Panel */}
        {hasResults && (
          <div
            className="flex flex-col bg-gray-900/50 overflow-hidden"
            style={{ height: `${100 - editorHeight}%` }}
          >
            {/* Result tabs */}
            <div className="flex items-center justify-between border-b border-gray-800 px-4">
              <div className="flex">
                <button
                  onClick={() => setResultTab("testcases")}
                  className={`px-4 py-2 text-sm font-medium transition flex items-center ${
                    resultTab === "testcases"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Test Cases
                  {(submission || runResults) && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                        submission?.status === "accepted" ||
                        runResults?.every((r) => r.status === "accepted")
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {submission
                        ? `${submission.testCasesPassed}/${submission.testCasesTotal}`
                        : `${runResults?.filter((r) => r.status === "accepted").length || 0}/${runResults?.length || 0}`}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setResultTab("console")}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    resultTab === "console"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Console
                </button>
              </div>

              {/* Custom input toggle */}
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={useCustomInput}
                  onChange={(e) => setUseCustomInput(e.target.checked)}
                  className="rounded-md bg-gray-800 border-gray-700"
                />
                Custom Input
              </label>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 min-h-0">
              {resultTab === "testcases" ? (
                <>
                  {/* Status summary */}
                  {submission && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-semibold ${statusColors[submission.status]}`}
                        >
                          {statusLabels[submission.status]}
                        </span>
                        {submission.status === "accepted" && (
                          <span className="text-gray-400 text-sm">
                            Runtime: {submission.runtimeMs}ms | Memory:{" "}
                            {Math.round((submission.memoryKb || 0) / 1024)}MB
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {submission.testCasesPassed}/{submission.testCasesTotal}{" "}
                        test cases passed
                      </span>
                    </div>
                  )}

                  {runResults && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-blue-400">
                        Run Results
                      </span>
                      <span className="text-gray-400 text-sm">
                        {
                          runResults.filter((r) => r.status === "accepted")
                            .length
                        }
                        /{runResults.length} passed
                      </span>
                    </div>
                  )}

                  {/* Custom input area */}
                  {useCustomInput && (
                    <div className="mb-4">
                      <label className="block text-sm text-gray-400 mb-2">
                        Custom Test Input:
                      </label>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter custom input..."
                        className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white font-mono text-sm resize-none focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Test case results */}
                  <div className="space-y-1.5">
                    {/* Show submission results */}
                    {submission?.results?.map(
                      (result: SubmissionResult, i: number) => {
                        const isExpanded = expandedTestCase === i;
                        const isPassed = result.status === "accepted";
                        return (
                          <div
                            key={result.id}
                            className={`rounded-md border transition-colors ${
                              isPassed
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-red-500/10 border-red-500/30"
                            }`}
                          >
                            <button
                              onClick={() =>
                                setExpandedTestCase(isExpanded ? null : i)
                              }
                              className="w-full flex items-center justify-between p-3 text-left"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <svg
                                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                                <span className="font-medium text-white text-sm">
                                  Case {i + 1} {result.isSample && "(Sample)"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {result.runtimeMs && (
                                  <span className="text-xs text-gray-400">
                                    {result.runtimeMs}ms
                                  </span>
                                )}
                                <span
                                  className={`text-xs font-medium ${statusColors[result.status]}`}
                                >
                                  {statusLabels[result.status]}
                                </span>
                              </div>
                            </button>
                            {isExpanded && (
                              <div className="px-3 pb-3 text-sm space-y-2 transition-all">
                                {!isPassed && (
                                  <>
                                    <div>
                                      <span className="text-gray-400">
                                        Input:{" "}
                                      </span>
                                      <code className="text-white font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">
                                        {result.input}
                                      </code>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <span className="text-gray-400">
                                          Expected:
                                        </span>
                                        <code className="text-emerald-400 font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">
                                          {result.expectedOutput}
                                        </code>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">
                                          Got:
                                        </span>
                                        <code className="text-red-400 font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">
                                          {result.actualOutput || "No output"}
                                        </code>
                                      </div>
                                    </div>
                                    {result.errorMessage && (
                                      <div>
                                        <span className="text-gray-400">
                                          Error:{" "}
                                        </span>
                                        <code className="text-red-400 font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md whitespace-pre-wrap">
                                          {result.errorMessage}
                                        </code>
                                      </div>
                                    )}
                                  </>
                                )}
                                {isPassed && (
                                  <div className="text-emerald-400 text-xs flex items-center gap-1">
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
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    All checks passed
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}

                    {/* Show run results */}
                    {runResults?.map((result: RunCodeResult, i: number) => {
                      const isExpanded =
                        expandedTestCase ===
                        i + (submission?.results?.length || 0);
                      const isPassed = result.status === "accepted";
                      return (
                        <div
                          key={i} // skipcq: JS-0437
                          className={`rounded-md border transition-colors ${
                            isPassed
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-red-500/10 border-red-500/30"
                          }`}
                        >
                          <button
                            onClick={() =>
                              setExpandedTestCase(
                                isExpanded
                                  ? null
                                  : i + (submission?.results?.length || 0)
                              )
                            }
                            className="w-full flex items-center justify-between p-3 text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <svg
                                className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                              <span className="font-medium text-white text-sm">
                                Case {i + 1} {result.isCustom && "(Custom)"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {result.runtimeMs && (
                                <span className="text-xs text-gray-400">
                                  {result.runtimeMs}ms
                                </span>
                              )}
                              <span
                                className={`text-xs font-medium ${statusColors[result.status]}`}
                              >
                                {statusLabels[result.status]}
                              </span>
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-3 pb-3 text-sm space-y-2 transition-all">
                              <div>
                                <span className="text-gray-400">Input: </span>
                                <code className="text-white font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">
                                  {result.input}
                                </code>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <span className="text-gray-400">
                                    Expected:
                                  </span>
                                  <code className="text-emerald-400 font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">
                                    {result.expectedOutput}
                                  </code>
                                </div>
                                <div>
                                  <span className="text-gray-400">Output:</span>
                                  <code
                                    className={`font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md ${isPassed ? "text-emerald-400" : "text-red-400"}`}
                                  >
                                    {result.actualOutput || "No output"}
                                  </code>
                                </div>
                              </div>
                              {result.errorMessage && (
                                <div>
                                  <span className="text-gray-400">Error: </span>
                                  <code className="text-red-400 font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md whitespace-pre-wrap">
                                    {result.errorMessage}
                                  </code>
                                </div>
                              )}
                              {isPassed && !result.errorMessage && (
                                <div className="text-emerald-400 text-xs flex items-center gap-1">
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
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  All checks passed
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Default: Show sample test cases when no results */}
                    {!submission &&
                      !runResults &&
                      testCases.map((tc, i) => (
                        <div
                          key={tc.id}
                          className="p-3 rounded-md border bg-gray-800/50 border-gray-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">
                              Case {i + 1}
                            </span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-400">Input: </span>
                              <code className="text-white font-mono">
                                {tc.input.replace(/\n/g, ", ")}
                              </code>
                            </div>
                            <div>
                              <span className="text-gray-400">Expected: </span>
                              <code className="text-emerald-400 font-mono">
                                {tc.expectedOutput}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="h-full">
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {consoleOutput || "No console output"}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Panel Resizer */}
      {isAIChatOpen && (
        <div
          ref={aiDividerRef}
          onMouseDown={handleRightResize}
          className="w-1 bg-gray-800 hover:bg-indigo-500 cursor-col-resize transition-colors flex-shrink-0"
        />
      )}

      {/* Right Panel - AI Assistant */}
      {isAIChatOpen && problem && (
        <div
          className="flex flex-col h-full overflow-hidden"
          style={{ width: `${rightPanelWidth}%` }}
        >
          <AIChatPanel
            problemSlug={slug}
            problemTitle={problem.title}
            problemDescription={problem.description}
            code={code}
            language={currentLanguageName}
            errorMessage={errorForAI}
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)}
          />
        </div>
      )}

      {/* AI Toggle Button */}
      {!isAIChatOpen && (
        <button
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-4 right-4 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-lg transition-colors z-40"
          title="Open Thor AI (Ctrl+Shift+A)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Keyboard shortcuts modal */}
      {/* skipcq: JS-0415 */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowShortcuts(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative bg-gray-900 border border-gray-700 rounded-md p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Ctrl/Cmd + Enter", "Submit code"],
                ["Ctrl/Cmd + Shift + Enter", "Run code"],
                ["Ctrl/Cmd + K", "Inline AI ask"],
                ["Ctrl/Cmd + S", "Auto-saved"],
                ["Esc", "Exit fullscreen"],
                ["?", "Toggle this menu"],
              ].map(([key, desc]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5"
                >
                  <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded-md text-xs text-gray-300 font-mono">
                    {key}
                  </kbd>
                  <span className="text-gray-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
