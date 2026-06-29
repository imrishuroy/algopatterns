# DeepSource Code Review Report

**Repository:** imrishuroy/algopatterns
**Branch:** `ft/ai-tutor`
**PR:** #64 · https://github.com/imrishuroy/algopatterns/pull/64
**Commit:** b63dd48...fa7b0fe
**Run:** [https://app.deepsource.com/gh/imrishuroy/algopatterns/run/7524acfd-7779-4b08-bb70-49f7e942f794/](https://app.deepsource.com/gh/imrishuroy/algopatterns/run/7524acfd-7779-4b08-bb70-49f7e942f794/)

---

## Summary
- **Go:** No issues detected- **Shell:** No issues detected- **JavaScript:** 443 issues- **Secrets:** No issues detected- **SQL:** No issues detected- **Docker:** No issues detected

---

## Code Review Findings
### Go
**Status:** Success
**Findings:** No new issues detected
### Shell
**Status:** Success
**Findings:** No new issues detected
### JavaScript
**Status:** Failure
**Findings:** 443 new issues

1. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
   **File:** `frontend/src/app/patterns/[slug]/PatternPageClient.tsx`
   **Line:** 37-399
   ```typescript
   "Medium-Hard": "bg-orange-500/20 text-orange-400",
   };
   
   export default function PatternPageClient({ pattern }: PatternPageClientProps) {
     const searchParams = useSearchParams();
     const tabParam = searchParams.get("tab");
     const [activeTab, setActiveTab] = useState<Tab>(
       tabParam === "problems" || tabParam === "cheatsheet" ? tabParam : "tutorial"
     );
     const [isAIChatOpen, setIsAIChatOpen] = useState(true);
     const [aiPanelWidth, setAiPanelWidth] = useState(28);
     const [activeSection, setActiveSection] = useState<string>("");
     const [sectionContent, setSectionContent] = useState<string>("");
     const [aiInitialMessage, setAiInitialMessage] = useState<string>();
     const [aiMessageKey, setAiMessageKey] = useState(0);
     const activeSectionRef = useRef(activeSection);
     const containerRef = useRef<HTMLDivElement>(null);
     useEffect(() => {
       activeSectionRef.current = activeSection;
     }, [activeSection]);
     useEffect(() => {
       if (tabParam === "problems" || tabParam === "cheatsheet" || tabParam === "tutorial") {
         startTransition(() => {
           setActiveTab(tabParam);
         });
       }
     }, [tabParam]);
     const { completed, toggleComplete } = useProgress();
     const { isPro, isLoading: subscriptionLoading } = useSubscription();
     const isLocked = !isPro && !FREE_PATTERN_IDS.has(pattern.id);
     const patternQuestions = useMemo(() => {
       return questions.filter((q) => {
         const patternId = categoryToPatternId[q.category];
         return patternId === pattern.id;
       });
     }, [pattern.id]);
     const stats = useMemo(() => {
       const total = patternQuestions.length;
       const done = patternQuestions.filter((q) => completed.has(q.id)).length;
       return {
         total,
         done,
         percent: total > 0 ? Math.round((done / total) * 100) : 0,
       };
     }, [patternQuestions, completed]);
     const tabs = [
       { id: "tutorial" as Tab, label: "Tutorial" },
       { id: "problems" as Tab, label: "Problems", count: stats.total },
       { id: "cheatsheet" as Tab, label: "Cheatsheet" },
     ];
     // Track active tutorial section via IntersectionObserver (200ms throttle)
     useEffect(() => {
       if (activeTab !== "tutorial" || !isAIChatOpen) return;
       let lastUpdate = 0;
       const THROTTLE_MS = 200;
       const observer = new IntersectionObserver(
         (entries) => {
           const now = Date.now();
           if (now - lastUpdate < THROTTLE_MS) return;
           for (const entry of entries) {
             if (entry.isIntersecting) {
               lastUpdate = now;
               const sectionId = entry.target.getAttribute("data-section-id") || "";
               if (sectionId && sectionId !== activeSectionRef.current) {
                 setActiveSection(sectionId);
                 setSectionContent(entry.target.textContent?.slice(0, 2000) || "");
               }
             }
           }
         },
         { threshold: 0.3 }
       );
       const timer = setTimeout(() => {
         document.querySelectorAll("[data-section-id]").forEach((el) => observer.observe(el));
       }, 100);
       return () => {
         clearTimeout(timer);
         observer.disconnect();
       };
     }, [activeTab, isAIChatOpen, pattern.id]);
     // Keyboard shortcut for AI panel
     useEffect(() => {
       const handleKeyDown = (e: KeyboardEvent) => {
         if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "a") {
           e.preventDefault();
           setIsAIChatOpen((prev) => !prev);
         }
       };
       window.addEventListener("keydown", handleKeyDown);
       return () => window.removeEventListener("keydown", handleKeyDown);
     }, []);
     // Resizable AI panel
     const handleResize = useCallback(
       (e: React.MouseEvent) => {
         e.preventDefault();
         const startX = e.clientX;
         const startWidth = aiPanelWidth;
         const handleMouseMove = (e: MouseEvent) => {
           const container = containerRef.current;
           if (!container) return;
           const containerWidth = container.offsetWidth;
           const delta = startX - e.clientX;
           const newWidth = startWidth + (delta / containerWidth) * 100;
           setAiPanelWidth(Math.min(Math.max(newWidth, 15), 45));
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
       [aiPanelWidth]
     );
     const handleAskAI = useCallback(
       (selectedText: string) => {
         const sectionLabel = activeSectionRef.current || pattern.category;
         const prompt = `Please explain the following text from the "${sectionLabel}" section of the ${pattern.category} pattern:\n\n"${selectedText}"`;
         setAiInitialMessage(prompt);
         setAiMessageKey((k) => k + 1);
         setIsAIChatOpen(true);
       },
       [pattern.category]
     );
     const handleCloseAI = useCallback(() => {
       setIsAIChatOpen(false);
   		setAiInitialMessage(undefined);
       setAiMessageKey(0);
     }, []);
     const header = (
       <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
         <div className="px-4 py-4">
           <div className="flex items-center gap-4 mb-4">
             <Link
               href="/"
               className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   strokeWidth={2}
                   d="M15 19l-7-7 7-7"
                 />
               </svg>
               <span>Back</span>
             </Link>
           </div>
           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-2xl md:text-3xl font-bold text-white">
                   {pattern.category}
                 </h1>
                 <span
                   className={`px-3 py-1 text-sm rounded-full ${difficultyColors[pattern.difficulty]}`}
                 >
                   {pattern.difficulty}
                 </span>
               </div>
               <div className="flex items-center gap-4 text-sm text-gray-400">
                 <span>
                   Time:{" "}
                   <span className="text-indigo-400 font-mono">{pattern.timeComplexity}</span>
                 </span>
                 <span>
                   Space:{" "}
                   <span className="text-purple-400 font-mono">{pattern.spaceComplexity}</span>
                 </span>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="text-right">
                 <div className="text-2xl font-bold text-white">
                   {stats.done}/{stats.total}
                 </div>
                 <div className="text-sm text-gray-500">problems solved</div>
               </div>
               <div className="w-16 h-16 relative">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                   <circle
                     cx="32" cy="32" r="28"
                     stroke="currentColor" strokeWidth="4" fill="none"
                     className="text-gray-800"
                   />
                   <circle
                     cx="32" cy="32" r="28"
                     stroke="url(#miniGradient)" strokeWidth="4" fill="none"
                     strokeLinecap="round"
                     strokeDasharray={`${stats.percent * 1.76} 176`}
                   />
                   <defs>
                     <linearGradient id="miniGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#6366f1" />
                       <stop offset="100%" stopColor="#a855f7" />
                     </linearGradient>
                   </defs>
                 </svg>
                 <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                   {stats.percent}%
                 </span>
               </div>
               <button
                 onClick={() => setIsAIChatOpen(!isAIChatOpen)}
                 className={`p-2 rounded-md transition-colors border ${
                   isAIChatOpen
                     ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400"
                     : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
                 }`}
                 title="Thor AI (Cmd+Shift+A)"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path
                     strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                     d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                   />
                 </svg>
               </button>
             </div>
           </div>
           <div className="flex gap-1 mt-4 md:mt-6 -mb-px overflow-x-auto">
             {tabs.map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap ${
                   activeTab === tab.id
                     ? "bg-gray-950 text-white border-t border-l border-r border-gray-800"
                     : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                 }`}
               >
                 <span>{tab.label}</span>
                 {tab.count !== undefined && (
                   <span className="px-2 py-0.5 text-xs bg-gray-800 rounded-full">{tab.count}</span>
                 )}
               </button>
             ))}
           </div>
         </div>
       </div>
     );
     return (
       <div ref={containerRef} className="h-[calc(100vh-64px)] flex bg-gray-950">
         {/* Main Content Column */}
         <div
           className="flex flex-col flex-1 min-w-0 overflow-hidden"
         >        {header}
           <div className="flex-1 overflow-y-auto">
             <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
               {subscriptionLoading ? (
                 <div className="flex items-center justify-center py-16">
                   <div className="text-gray-400">Loading...</div>
                 </div>
               ) : isLocked ? (
                 <UpgradePrompt
                   feature={`the ${pattern.category} pattern`}
                   title="Premium Pattern"
                   description={`The ${pattern.category} pattern is available exclusively for Pro members. Upgrade to unlock all patterns, visualizers, and premium features.`}
                 />
               ) : (
                 <>
                   {activeTab === "tutorial" && (
                     <Highlightable contentType="pattern_tutorial" contentId={pattern.id} onAskAI={handleAskAI}>
                       <TutorialTab pattern={pattern} />
                     </Highlightable>
                   )}
                   {activeTab === "problems" && (
                     <ProblemsTab
                       questions={patternQuestions}
                       completed={completed}
                       onToggleComplete={toggleComplete}
                       patternId={pattern.id}
                     />
                   )}
                   {activeTab === "cheatsheet" && (
                     <Highlightable contentType="pattern_cheatsheet" contentId={pattern.id} onAskAI={handleAskAI}>
                       <CheatsheetTab pattern={pattern} />
                     </Highlightable>
                   )}
                 </>
               )}
             </div>
           </div>
         </div>
         {/* Resize Handle + AI Panel (Desktop) */}
         {isAIChatOpen && (
           <>
             <div
               onMouseDown={handleResize}
               className="hidden md:block w-1 bg-gray-800 hover:bg-indigo-500 cursor-col-resize transition-colors flex-shrink-0"
             />
             <div
               className="hidden md:flex flex-col flex-shrink-0 overflow-hidden"
               style={{ width: `${aiPanelWidth}%`, height: "100%" }}
             >
               <AIChatPanel
                 patternId={pattern.id}
                 patternName={pattern.category}
                 patternDifficulty={pattern.difficulty}
                 timeComplexity={pattern.timeComplexity}
                 spaceComplexity={pattern.spaceComplexity}
                 activeSection={activeSection}
                 sectionContent={sectionContent}
                 contextType="pattern"
                 language="java"
                 initialMessage={aiInitialMessage}
                 initialMessageKey={aiMessageKey}
                 isOpen={isAIChatOpen}
                 onClose={handleCloseAI}
               />
             </div>
           </>
         )}
         {/* Mobile AI Overlay */}
         {isAIChatOpen && (
           <div className="md:hidden fixed inset-0 z-50 bg-gray-950">
             <AIChatPanel
               patternId={pattern.id}
               patternName={pattern.category}
               patternDifficulty={pattern.difficulty}
               timeComplexity={pattern.timeComplexity}
               spaceComplexity={pattern.spaceComplexity}
               activeSection={activeSection}
               sectionContent={sectionContent}
               contextType="pattern"
               language="java"
               initialMessage={aiInitialMessage}
               initialMessageKey={aiMessageKey}
               isOpen={isAIChatOpen}
               onClose={handleCloseAI}
             />
           </div>
         )}
       </div>
     );
   }
   ```
   **Category:** Anti-pattern
   **Severity:** minor

2. **JSX tree is too deeply nested. Found 8 levels of nesting** (`JS-0415`)
   **File:** `frontend/src/app/patterns/[slug]/PatternPageClient.tsx`
   **Line:** 188
   ```typescript
   }, []);
   
     const header = (
       <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
         <div className="px-4 py-4">
           <div className="flex items-center gap-4 mb-4">
             <Link
   ```
   **Category:** Anti-pattern
   **Severity:** minor

3. **Remove redundant `undefined` from function call** (`JS-W1042`)
   **File:** `frontend/src/app/patterns/[slug]/PatternPageClient.tsx`
   **Line:** 183
   ```typescript
   const handleCloseAI = useCallback(() => {
       setIsAIChatOpen(false);
   		setAiInitialMessage(undefined);
       setAiMessageKey(0);
     }, []);
   ```
   **Category:** Anti-pattern
   **Severity:** minor

4. **Function has a cyclomatic complexity of 8 with "medium" risk** (`JS-R1005`)
   **File:** `frontend/src/app/patterns/[slug]/PatternPageClient.tsx`
   **Line:** 99
   ```typescript
   const THROTTLE_MS = 200;
   
       const observer = new IntersectionObserver(
         (entries) => {
           const now = Date.now();
           if (now - lastUpdate < THROTTLE_MS) return;
   ```
   **Category:** Anti-pattern
   **Severity:** minor

5. **`PatternPageClient` has a cyclomatic complexity of 12 with "medium" risk** (`JS-R1005`)
   **File:** `frontend/src/app/patterns/[slug]/PatternPageClient.tsx`
   **Line:** 37
   ```typescript
   "Medium-Hard": "bg-orange-500/20 text-orange-400",
   };
   
   export default function PatternPageClient({ pattern }: PatternPageClientProps) {
     const searchParams = useSearchParams();
     const tabParam = searchParams.get("tab");
     const [activeTab, setActiveTab] = useState<Tab>(
   ```
   **Category:** Anti-pattern
   **Severity:** minor

6. **Arrow function expected no return value** (`JS-0045`)
   **File:** `frontend/src/app/patterns/[slug]/PatternPageClient.tsx`
   **Line:** 121-124
   ```typescript
   document.querySelectorAll("[data-section-id]").forEach((el) => observer.observe(el));
       }, 100);
   
       return () => {
         clearTimeout(timer);
         observer.disconnect();
       };
     }, [activeTab, isAIChatOpen, pattern.id]);
   
     // Keyboard shortcut for AI panel
   ```
   **Category:** Anti-pattern
   **Severity:** minor

7. **Function has a cyclomatic complexity of 16 with "high" risk** (`JS-R1005`)
   **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
   **Line:** 621
   ```typescript
   // Parse line numbers from compiler error messages
     const parseErrorLines = useCallback(
       (errorText: string): { line: number; message: string }[] => {
         const results: { line: number; message: string }[] = [];
         const offset = wrapperLineOffsetRef.current;
       const lines = errorText.split("\n");
   ```
   **Category:** Anti-pattern
   **Severity:** minor

8. **Remove redundant `undefined` from function call** (`JS-W1042`)
   **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
   **Line:** 838
   ```typescript
   if (response.data.status === "accepted") {
             setProblemSolved(true);
             setTimerRunning(false);
             setErrorForAI(undefined);
             clearEditorErrors();
           }
           // Reload submissions list
   ```
   **Category:** Anti-pattern
   **Severity:** minor

9. **Function has a cyclomatic complexity of 13 with "medium" risk** (`JS-R1005`)
   **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
   **Line:** 898
   ```typescript
   handleSubmitRef.current = handleSubmit;
     });
     const handleKeyDown = useCallback(
       (e: KeyboardEvent) => {
         if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
           e.preventDefault();
           if (e.shiftKey) {
   ```
   **Category:** Anti-pattern
   **Severity:** minor

10. **Unexpected string concatenation** (`JS-0246`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 864-868
    ```typescript
    const failedTests = response.data.results.filter(r => r.status !== "accepted");
              if (failedTests.length > 0 && response.data.status !== "accepted") {
                const errorContext = failedTests.slice(0, 3).map((t, i) =>
                  `Test ${i + 1}: ${t.status.replace(/_/g, " ")}\n` +
                  `  Input: ${t.input}\n` +
                  `  Expected: ${t.expectedOutput}\n` +
                  `  Got: ${t.actualOutput || "(no output)"}\n` +
                  (t.errorMessage ? `  Error: ${t.errorMessage}` : "")
                ).join("\n\n");
                setErrorForAI(stderr ? `${stderr}\n\nFailed Tests:\n${errorContext}` : `Failed Tests:\n${errorContext}`);
              }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

11. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 67-155
    ```typescript
    "Random", "Pattern", "Matcher", "Error", "Throwable",
    ]);
    
    function setupJavaValidation(
      editor: Monaco['editor']['IStandaloneCodeEditor'],
      monaco: Monaco,
    ) {
      const model = editor.getModel();
      if (!model || model.getLanguageId() !== "java") return;
      let timer: ReturnType<typeof setTimeout>;
      const validate = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const markers: Parameters<(typeof monaco.editor)['setModelMarkers']>[2] = [];
          const lines = model.getValue().split("\n");
          for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*") ||
                trimmed.startsWith("*") || trimmed.startsWith("import ") ||
                trimmed.startsWith("package ")) continue;
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
              const typeName = interfaceMatch[1] as keyof typeof ABSTRACT_JAVA_TYPES;
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
                if (parenStack.length === 0 || parenStack[parenStack.length - 1].char !== expected) {
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
    
    function handleEditorWillMount(monaco: Monaco) {
      // Define custom theme with better Java type highlighting
    ```
    **Category:** Anti-pattern
    **Severity:** minor

12. **Function has a cyclomatic complexity of 13 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 738
    ```typescript
    }, [editorInstance]);
    
      // Run code against sample test cases
      const handleRun = useCallback(async () => {
        if (!isAuthenticated) {
          router.push("/login");
          return;
    ```
    **Category:** Anti-pattern
    **Severity:** minor

13. **Remove redundant `undefined` from function call** (`JS-W1042`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 791
    ```typescript
    ).join("\n\n");
              setErrorForAI(stderr ? `${stderr}\n\nFailed Tests:\n${errorContext}` : `Failed Tests:\n${errorContext}`);
            } else {
              setErrorForAI(undefined);
            }
          } else {
            const errMsg = response.error?.message || "Run failed";
    ```
    **Category:** Anti-pattern
    **Severity:** minor

14. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 157-303
    ```typescript
    validate();
    }
    
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
          "abstract", "continue", "for", "new", "switch", "assert", "default",
          "goto", "package", "synchronized", "boolean", "do", "if", "private",
          "this", "break", "double", "implements", "protected", "throw", "byte",
          "else", "import", "public", "throws", "case", "enum", "instanceof",
          "return", "transient", "catch", "extends", "int", "short", "try",
          "char", "final", "interface", "static", "void", "class", "finally",
          "long", "strictfp", "volatile", "const", "float", "native", "super",
          "while", "true", "false", "null",
        ],
        typeKeywords: [
          "boolean", "byte", "char", "double", "float", "int", "long", "short", "void",
        ],
        // Common Java types that should be highlighted
        builtinTypes: [
          "String", "Integer", "Long", "Double", "Float", "Boolean", "Character",
          "Object", "Class", "System", "Math", "StringBuilder", "StringBuffer",
          "List", "ArrayList", "LinkedList", "Map", "HashMap", "TreeMap", "LinkedHashMap",
          "Set", "HashSet", "TreeSet", "LinkedHashSet", "Queue", "Deque", "Stack",
          "ArrayDeque", "PriorityQueue", "Vector", "Arrays", "Collections", "Optional",
          "Stream", "Collectors", "Iterator", "Comparable", "Comparator", "Exception",
          "RuntimeException", "Scanner", "Random", "Pattern", "Matcher",
        ],
        operators: [
          "=", ">", "<", "!", "~", "?", ":", "==", "<=", ">=", "!=", "&&", "||",
          "++", "--", "+", "-", "*", "/", "&", "|", "^", "%", "<<", ">>", ">>>",
          "+=", "-=", "*=", "/=", "&=", "|=", "^=", "%=", "<<=", ">>=", ">>>=",
        ],
        symbols: /[=><!~?:&|+\-*/^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        digits: /\d+(_+\d+)*/,
        tokenizer: {
          root: [
            // Type identifiers (capitalized words)
            [/[A-Z][\w$]*/, {
              cases: {
                "@builtinTypes": "type.identifier",
                "@default": "type.identifier",
              },
            }],
            // Identifiers and keywords
            [/[a-z_$][\w$]*/, {
              cases: {
                "@keywords": "keyword",
                "@default": "identifier",
              },
            }],
            // Whitespace
            { include: "@whitespace" },
            // Delimiters and operators
            [/[{}()\[\]]/, "@brackets"],
            [/[<>](?!@symbols)/, "@brackets"],
            [/@symbols/, {
              cases: {
                "@operators": "operator",
                "@default": "",
              },
            }],
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
    ```
    **Category:** Anti-pattern
    **Severity:** minor

15. **JSX tree is too deeply nested. Found 5 levels of nesting** (`JS-0415`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 2855
    ```typescript
    {/* Keyboard shortcuts modal */}
          {showShortcuts && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative bg-gray-900 border border-gray-700 rounded-md p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
    ```
    **Category:** Anti-pattern
    **Severity:** minor

16. **Expected a `for-of` loop instead of a `for` loop with this simple iteration** (`JS-0361`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 627-677
    ```typescript
    const lines = errorText.split("\n");
        const seen = new Set<number>();
    
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
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
            let message = fullTail.replace(/\s+\^.*?\d+\s+error(s?)\s*$/g, "").trim();
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
      }, []);
    ```
    **Category:** Anti-pattern
    **Severity:** minor

17. **Unexpected string concatenation** (`JS-0246`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 783-787
    ```typescript
    const failedTests = response.data.results.filter(r => r.status !== "accepted");
            if (failedTests.length > 0) {
              const errorContext = failedTests.map((t) =>
                `Test ${t.testCaseIndex + 1}: ${t.status.replace(/_/g, " ")}\n` +
                `  Input: ${t.input}\n` +
                `  Expected: ${t.expectedOutput}\n` +
                `  Got: ${t.actualOutput || "(no output)"}\n` +
                (t.errorMessage ? `  Error: ${t.errorMessage}` : "")
              ).join("\n\n");
              setErrorForAI(stderr ? `${stderr}\n\nFailed Tests:\n${errorContext}` : `Failed Tests:\n${errorContext}`);
            } else {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

18. **Function has a cyclomatic complexity of 12 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 2693
    ```typescript
    )}
    
                        {/* Show run results */}
                        {runResults?.map((result: RunCodeResult, i: number) => {
                          const isExpanded = expandedTestCase === i + (submission?.results?.length || 0);
                          const isPassed = result.status === "accepted";
                          return (
    ```
    **Category:** Anti-pattern
    **Severity:** minor

19. **Function has a cyclomatic complexity of 23 with "high" risk** (`JS-R1005`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 77
    ```typescript
    let timer: ReturnType<typeof setTimeout>;
      const validate = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const markers: Parameters<(typeof monaco.editor)['setModelMarkers']>[2] = [];
          const lines = model.getValue().split("\n");
          for (let i = 0; i < lines.length; i++) {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

20. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 350-2886
    ```typescript
    return `code_${slug}_${languageId}`;
    }
    
    export default function ProblemPageClient({ params }: PageProps) {
      const { slug } = use(params);
      const router = useRouter();
      const searchParams = useSearchParams();
      const fromPattern = searchParams.get("from");
      const { isAuthenticated, isLoading: authLoading } = useAuth();
      const { theme } = useTheme();
      const editorTheme = theme === "dark" ? "algopatterns-dark" : "algopatterns-light";
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
      // UI state - three panel widths as percentages
      const [leftPanelWidth, setLeftPanelWidth] = useState(35); // Description panel
      const [rightPanelWidth, setRightPanelWidth] = useState(20); // AI panel (0 when closed)
      const [editorHeight, setEditorHeight] = useState(60); // percentage of middle panel for editor
      const [fontSize, setFontSize] = useState(14);
      const [wordWrap, setWordWrap] = useState(false);
      const [isFullScreen, setIsFullScreen] = useState(false);
      const aiDividerRef = useRef<HTMLDivElement>(null);
      const [customInput, setCustomInput] = useState("");
      const [useCustomInput, setUseCustomInput] = useState(false);
      const [expandedTestCase, setExpandedTestCase] = useState<number | null>(null);
      const [showDescription, setShowDescription] = useState(true);
      const [showShortcuts, setShowShortcuts] = useState(false);
      const [submissions, setSubmissions] = useState<Submission[]>([]);
      const [loadingSubmissions, setLoadingSubmissions] = useState(false);
      const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
      const [consoleOutput, setConsoleOutput] = useState<string>("");
      const [showLangDropdown, setShowLangDropdown] = useState(false);
      const langDropdownRef = useRef<HTMLDivElement>(null);
      // Mobile state
      const isMobile = useIsMobile();
      const [mobileView, setMobileView] = useState<"problem" | "code" | "results">("problem");
      // Timer state
      const [timerSeconds, setTimerSeconds] = useState(0);
      const [timerRunning, setTimerRunning] = useState(false);
      const [problemSolved, setProblemSolved] = useState(false);
      const [showSolution, setShowSolution] = useState(false);
      const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved">("saved");
      const [tabSize, setTabSize] = useState(() => {
        if (typeof window === "undefined") return 4;
        return parseInt(localStorage.getItem("editor_tabSize") || "4", 10);
      });
      // AI Tutor state
      const [isAIChatOpen, setIsAIChatOpen] = useState(true);
      const [errorForAI, setErrorForAI] = useState<string>();
      // Editor instance for inline AI
      const [editorInstance, setEditorInstance] = useState<Parameters<OnMount>[0] | null>(null);
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
      // Format code using basic formatting
      const formatCode = useCallback(() => {
        if (editorInstance) {
          editorInstance.getAction("editor.action.formatDocument")?.run();
          return;
        }
        let formatted = code
          .split("\n")
          .map((line) => line.trimEnd())
          .join("\n");
        formatted = formatted.replace(/\n{3,}/g, "\n\n");
        setCode(formatted);
      }, [editorInstance, code]);
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
      // Load problem data
      useEffect(() => {
        const fetchProblem = async () => {
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
                // Prefer Java as default, fallback to first template
                const javaTemplate = response.data.templates.find(
                  (t) => t.languageSlug === "java"
                );
                const defaultTemplate = javaTemplate || response.data.templates[0];
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
      // Save code to localStorage on change
      useEffect(() => {
        if (selectedLanguageId && code) {
          localStorage.setItem(getStorageKey(slug, selectedLanguageId), code);
          startTransition(() => setSaveStatus("saved"));
        }
      }, [code, slug, selectedLanguageId]);
      useEffect(() => {
        localStorage.setItem("editor_tabSize", tabSize.toString());
      }, [tabSize]);
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
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
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
            let message = fullTail.replace(/\s+\^.*?\d+\s+error(s?)\s*$/g, "").trim();
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
      }, []);
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
      }, [editorInstance]);
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
            const failedTests = response.data.results.filter(r => r.status !== "accepted");
            if (failedTests.length > 0) {
              const errorContext = failedTests.map((t) =>
                `Test ${t.testCaseIndex + 1}: ${t.status.replace(/_/g, " ")}\n` +
                `  Input: ${t.input}\n` +
                `  Expected: ${t.expectedOutput}\n` +
                `  Got: ${t.actualOutput || "(no output)"}\n` +
                (t.errorMessage ? `  Error: ${t.errorMessage}` : "")
              ).join("\n\n");
              setErrorForAI(stderr ? `${stderr}\n\nFailed Tests:\n${errorContext}` : `Failed Tests:\n${errorContext}`);
            } else {
              setErrorForAI(undefined);
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
      }, [isAuthenticated, problem, selectedLanguageId, code, useCustomInput, customInput, applyEditorErrors, clearEditorErrors, parseErrorLines, router]);
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
              setErrorForAI(undefined);
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
              const failedTests = response.data.results.filter(r => r.status !== "accepted");
              if (failedTests.length > 0 && response.data.status !== "accepted") {
                const errorContext = failedTests.slice(0, 3).map((t, i) =>
                  `Test ${i + 1}: ${t.status.replace(/_/g, " ")}\n` +
                  `  Input: ${t.input}\n` +
                  `  Expected: ${t.expectedOutput}\n` +
                  `  Got: ${t.actualOutput || "(no output)"}\n` +
                  (t.errorMessage ? `  Error: ${t.errorMessage}` : "")
                ).join("\n\n");
                setErrorForAI(stderr ? `${stderr}\n\nFailed Tests:\n${errorContext}` : `Failed Tests:\n${errorContext}`);
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
      }, [isAuthenticated, problem, selectedLanguageId, code, loadSubmissions, applyEditorErrors, clearEditorErrors, parseErrorLines, router]);
      // Keyboard shortcuts
      const handleRunRef = useRef(handleRun);
      const handleSubmitRef = useRef(handleSubmit);
      useEffect(() => {
        handleRunRef.current = handleRun;
        handleSubmitRef.current = handleSubmit;
      });
      const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
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
        [leftPanelWidth, isAIChatOpen]
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
        [rightPanelWidth]
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
        [editorHeight]
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
    None
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
                    onClick={() => setFontSize((s) => Math.max(10, s - 2))}
                    className="p-1.5 text-gray-400 hover:text-white tooltip-wrap"
                    data-tooltip="Decrease font size"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-gray-400 text-sm w-6 text-center font-mono">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(24, s + 2))}
                    className="p-1.5 text-gray-400 hover:text-white tooltip-wrap"
                    data-tooltip="Increase font size"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                onChange={(value) => { setCode(value || ""); setSaveStatus("unsaved"); }}
                theme={editorTheme}
                beforeMount={handleEditorWillMount}
                onMount={(editor, monaco) => setupJavaValidation(editor, monaco)}
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
          <div className="flex flex-col h-[calc(100vh-64px)]">
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
                <div className="h-full overflow-y-auto">
                  {/* Problem Tabs */}
                  <div className="flex border-b border-gray-800 bg-gray-900/50 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                        activeTab === "description"
                          ? "text-white border-b-2 border-indigo-500"
                          : "text-gray-400"
                      }`}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab("submissions")}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                        activeTab === "submissions"
                          ? "text-white border-b-2 border-indigo-500"
                          : "text-gray-400"
                      }`}
                    >
                      Submissions
                    </button>
                    <button
                      onClick={() => setActiveTab("hints")}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                        activeTab === "hints"
                          ? "text-white border-b-2 border-indigo-500"
                          : "text-gray-400"
                      }`}
                    >
                      Hints
                    </button>
                    <button
                      onClick={() => setActiveTab("solution")}
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
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
                          <span className={`text-sm font-medium ${difficultyColors[problem.difficulty]}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <div className="text-gray-300 text-sm whitespace-pre-wrap">
                          {problem.description}
                        </div>
                        {testCases.length > 0 && (
                          <div>
                            <h3 className="text-base font-semibold text-white mb-2">Examples</h3>
                            <div className="space-y-3">
                              {testCases.map((tc, i) => (
                                <div key={tc.id} className="bg-gray-900 rounded-md p-3 border border-gray-800 text-sm">
                                  <div className="text-gray-400 mb-1">Example {i + 1}</div>
                                  <div className="space-y-1">
                                    <div>
                                      <span className="text-gray-400">Input: </span>
                                      <code className="text-white font-mono bg-gray-800 px-1.5 py-0.5 rounded-md text-xs">
                                        {tc.input.replace(/\n/g, ", ")}
                                      </code>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Output: </span>
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
                            <h3 className="text-base font-semibold text-white mb-2">Constraints</h3>
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
                          <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : submissions.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">No submissions yet</div>
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
                                <span className={`font-medium ${statusColors[sub.status]}`}>
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
                            <div key={i} className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
                              <button
                                onClick={() => toggleHint(i)}
                                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800/50 transition"
                              >
                                <span className="text-white font-medium text-sm">Hint {i + 1}</span>
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${revealedHints.has(i) ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                          <div className="text-center py-8 text-gray-400">Solution coming soon!</div>
                        ) : !problemSolved && !showSolution ? (
                          <div className="text-center py-8">
                            <div className="text-gray-400 mb-4 text-sm">Solve the problem to unlock the solution</div>
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
                              <h4 className="text-white font-medium text-sm mb-2">Approach</h4>
                              <p className="text-gray-300 text-sm">{solutions[slug].approach}</p>
                            </div>
                            <div className="bg-gray-900 rounded-md border border-gray-800 p-3">
                              <h4 className="text-white font-medium text-sm mb-2">Complexity</h4>
                              <p className="text-gray-400 text-xs">Time: {solutions[slug].timeComplexity}</p>
                              <p className="text-gray-400 text-xs">Space: {solutions[slug].spaceComplexity}</p>
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
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                                selectedLanguageId === t.languageId ? "text-indigo-400" : "text-white"
                              }`}
                            >
                              {t.languageName}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${problemSolved ? "text-emerald-400" : "text-white"}`}>
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
                      onChange={(value) => { setCode(value || ""); setSaveStatus("unsaved"); }}
                      theme={editorTheme}
                      beforeMount={handleEditorWillMount}
                      onMount={(editor, monaco) => setupJavaValidation(editor, monaco)}
                      options={{
                        fontSize: 12,
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
                <div className="h-full overflow-y-auto p-4">
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
                          <span className={`font-semibold text-sm ${statusColors[submission.status]}`}>
                            {statusLabels[submission.status]}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {submission.testCasesPassed}/{submission.testCasesTotal} passed
                          </span>
                        </div>
                      )}
                      {runResults && (
                        <div className="flex items-center justify-between mb-3 p-2 rounded-md bg-gray-900">
                          <span className="font-semibold text-sm text-blue-400">Run Results</span>
                          <span className="text-gray-400 text-xs">
                            {runResults.filter((r) => r.status === "accepted").length}/{runResults.length} passed
                          </span>
                        </div>
                      )}
                      {submission?.results?.map((result: SubmissionResult, i: number) => (
                        <div
                          key={result.id}
                          className={`p-2 rounded-md border text-sm ${
                            result.status === "accepted"
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-red-500/10 border-red-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white text-xs">Test {i + 1}</span>
                            <span className={`text-xs ${statusColors[result.status]}`}>
                              {statusLabels[result.status]}
                            </span>
                          </div>
                          {result.status !== "accepted" && (
                            <div className="text-xs space-y-0.5">
                              <div><span className="text-gray-400">Expected:</span> <code className="text-emerald-400">{result.expectedOutput}</code></div>
                              <div><span className="text-gray-400">Got:</span> <code className="text-red-400">{result.actualOutput || "No output"}</code></div>
                            </div>
                          )}
                        </div>
                      ))}
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
                            <span className="font-medium text-white text-xs">Test {i + 1}</span>
                            <span className={`text-xs ${statusColors[result.status]}`}>
                              {statusLabels[result.status]}
                            </span>
                          </div>
                          <div className="text-xs space-y-0.5">
                            <div><span className="text-gray-400">Expected:</span> <code className="text-emerald-400">{result.expectedOutput}</code></div>
                            <div><span className="text-gray-400">Output:</span> <code className={result.status === "accepted" ? "text-emerald-400" : "text-red-400"}>{result.actualOutput || "No output"}</code></div>
                          </div>
                        </div>
                      ))}
                      {!submission && !runResults && testCases.map((tc, i) => (
                        <div key={tc.id} className="p-2 rounded-md border bg-gray-800/50 border-gray-700 text-sm">
                          <div className="font-medium text-white text-xs mb-1">Case {i + 1}</div>
                          <div className="text-xs space-y-0.5">
                            <div><span className="text-gray-400">Input:</span> <code className="text-white">{tc.input.replace(/\n/g, ", ")}</code></div>
                            <div><span className="text-gray-400">Expected:</span> <code className="text-emerald-400">{tc.expectedOutput}</code></div>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                  language={languages.find((l) => l.id === selectedLanguageId)?.slug || "java"}
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
      const currentLanguageName = languages.find((l) => l.id === selectedLanguageId)?.slug || "java";
      // Calculate middle panel width
      const effectiveLeftWidth = showDescription ? leftPanelWidth : 0;
      const middlePanelWidth = isAIChatOpen
        ? 100 - effectiveLeftWidth - rightPanelWidth
        : 100 - effectiveLeftWidth;
      // Desktop Layout
      return (
        <div ref={panelRef} className="flex h-[calc(100vh-64px)]">
          {/* Left Panel - Problem Description */}
          {showDescription && (
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{ width: `${leftPanelWidth}%` }}
          >
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-800">
              <button
                onClick={handleBack}
                className="px-3 py-3 text-gray-500 hover:text-white transition"
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
                className={`px-6 py-3 font-medium transition ${
                  activeTab === "description"
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === "submissions"
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Submissions
              </button>
              <button
                onClick={() => setActiveTab("hints")}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === "hints"
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Hints
              </button>
              <button
                onClick={() => setActiveTab("solution")}
                className={`px-6 py-3 font-medium transition ${
                  activeTab === "solution"
                    ? "text-white border-b-2 border-indigo-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Solution
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
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
                        key={i}
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
                            {solutions[slug].steps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                      <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                          <h4 className="text-white font-medium">Solution Code</h4>
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
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="relative" ref={langDropdownRef}>
                  <button
                    onClick={() => setShowLangDropdown(!showLangDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-white text-sm font-medium hover:bg-gray-700 hover:border-gray-600 transition-colors h-8"
                  >
                    <span>{selectedLanguage?.name || "Select Language"}</span>
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
                <div className="flex items-center gap-1 bg-gray-800 rounded-md px-3 border border-gray-700 h-8">
                  <button
                    onClick={() => setFontSize((s) => Math.max(10, s - 2))}
                    className="p-1.5 text-gray-400 hover:text-white tooltip-wrap"
                    data-tooltip="Decrease font size"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-gray-400 text-sm w-6 text-center font-mono">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(24, s + 2))}
                    className="p-1.5 text-gray-400 hover:text-white tooltip-wrap"
                    data-tooltip="Increase font size"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                {/* Full screen button */}
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="p-1.5 text-gray-400 hover:text-white transition tooltip-wrap"
                  data-tooltip="Full screen (Esc to exit)"
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
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
                {/* Reset button */}
                <button
                  onClick={handleReset}
                  className="p-1.5 text-gray-400 hover:text-white transition tooltip-wrap"
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
                {/* Format button */}
                <button
                  onClick={formatCode}
                  className="p-1.5 text-gray-400 hover:text-white transition tooltip-wrap"
                  data-tooltip="Format code"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
                {/* Word wrap */}
                <button
                  onClick={() => setWordWrap(!wordWrap)}
                  className={`p-1.5 transition tooltip-wrap ${wordWrap ? "text-indigo-400" : "text-gray-400 hover:text-white"}`}
                  data-tooltip="Toggle word wrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                </button>
                {/* Toggle description */}
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className={`p-1.5 transition tooltip-wrap ${showDescription ? "text-gray-400 hover:text-white" : "text-indigo-400"}`}
                  data-tooltip={showDescription ? "Hide description" : "Show description"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                {/* Save indicator */}
                <span className={`text-xs ${saveStatus === "saved" ? "text-emerald-400" : "text-amber-400"}`}>
                  {saveStatus === "saved" ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved
                    </span>
                  ) : (
                    "Unsaved"
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Tab size */}
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
                {/* Timer */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md border border-gray-700 h-8">
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
                    className="text-gray-400 hover:text-white tooltip-wrap"
                    data-tooltip={timerRunning ? "Pause timer" : "Start timer"}
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
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className={`px-4 py-1.5 rounded-md font-medium text-sm transition tooltip-wrap h-8 ${
                    isRunning
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                  data-tooltip="Run (Ctrl/Cmd+Shift+Enter)"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                  className={`px-6 py-1.5 rounded-md font-medium text-sm transition tooltip-wrap h-8 ${
                    isSubmitting
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                  data-tooltip="Submit (Ctrl/Cmd+Enter)"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
                onChange={(value) => { setCode(value || ""); setSaveStatus("unsaved"); }}
                theme={editorTheme}
                beforeMount={handleEditorWillMount}
                onMount={(editor, monaco) => {
                  setEditorInstance(editor);
                  monacoRef.current = monaco;
                  setupJavaValidation(editor, monaco);
                }}
                options={{
                  fontSize,
                  fontFamily: "JetBrains Mono, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  automaticLayout: true,
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
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                          (submission?.status === "accepted" || runResults?.every(r => r.status === "accepted"))
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {submission
                            ? `${submission.testCasesPassed}/${submission.testCasesTotal}`
                            : `${runResults?.filter(r => r.status === "accepted").length || 0}/${runResults?.length || 0}`
                          }
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
                <div className="flex-1 overflow-y-auto p-4 min-h-0">
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
                                  onClick={() => setExpandedTestCase(isExpanded ? null : i)}
                                  className="w-full flex items-center justify-between p-3 text-left"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <svg
                                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <span className="font-medium text-white text-sm">
                                      Case {i + 1} {result.isSample && "(Sample)"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    {result.runtimeMs && (
                                      <span className="text-xs text-gray-400">{result.runtimeMs}ms</span>
                                    )}
                                    <span className={`text-xs font-medium ${statusColors[result.status]}`}>
                                      {statusLabels[result.status]}
                                    </span>
                                  </div>
                                </button>
                                {isExpanded && (
                                  <div className="px-3 pb-3 text-sm space-y-2 transition-all">
                                    {!isPassed && (
                                      <>
                                        <div>
                                          <span className="text-gray-400">Input: </span>
                                          <code className="text-white font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">
                                            {result.input}
                                          </code>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <span className="text-gray-400">Expected:</span>
                                            <code className="text-emerald-400 font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">{result.expectedOutput}</code>
                                          </div>
                                          <div>
                                            <span className="text-gray-400">Got:</span>
                                            <code className="text-red-400 font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">{result.actualOutput || "No output"}</code>
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
                                      </>
                                    )}
                                    {isPassed && (
                                      <div className="text-emerald-400 text-xs flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                          const isExpanded = expandedTestCase === i + (submission?.results?.length || 0);
                          const isPassed = result.status === "accepted";
                          return (
                            <div
                              key={i}
                              className={`rounded-md border transition-colors ${
                                isPassed
                                  ? "bg-emerald-500/10 border-emerald-500/30"
                                  : "bg-red-500/10 border-red-500/30"
                              }`}
                            >
                              <button
                                onClick={() => setExpandedTestCase(isExpanded ? null : i + (submission?.results?.length || 0))}
                                className="w-full flex items-center justify-between p-3 text-left"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <svg
                                    className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <span className="font-medium text-white text-sm">
                                    Case {i + 1} {result.isCustom && "(Custom)"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {result.runtimeMs && (
                                    <span className="text-xs text-gray-400">{result.runtimeMs}ms</span>
                                  )}
                                  <span className={`text-xs font-medium ${statusColors[result.status]}`}>
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
                                      <span className="text-gray-400">Expected:</span>
                                      <code className="text-emerald-400 font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md">{result.expectedOutput}</code>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Output:</span>
                                      <code className={`font-mono text-xs block mt-1 bg-gray-800/50 p-2 rounded-md ${isPassed ? "text-emerald-400" : "text-red-400"}`}>{result.actualOutput || "No output"}</code>
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
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}
          {/* Keyboard shortcuts modal */}
          {showShortcuts && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative bg-gray-900 border border-gray-700 rounded-md p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg">Keyboard Shortcuts</h3>
                  <button onClick={() => setShowShortcuts(false)} className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                    <div key={key} className="flex items-center justify-between py-1.5">
                      <kbd className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded-md text-xs text-gray-300 font-mono">{key}</kbd>
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
    ```
    **Category:** Anti-pattern
    **Severity:** minor

21. **Function has a cyclomatic complexity of 10 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 2611
    ```typescript
    <div className="space-y-1.5">
                        {/* Show submission results */}
                        {submission?.results?.map(
                          (result: SubmissionResult, i: number) => {
                            const isExpanded = expandedTestCase === i;
                            const isPassed = result.status === "accepted";
                            return (
    ```
    **Category:** Anti-pattern
    **Severity:** minor

22. **Function has a cyclomatic complexity of 15 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 810
    ```typescript
    }, [isAuthenticated, problem, selectedLanguageId, code, useCustomInput, customInput, applyEditorErrors, clearEditorErrors, parseErrorLines, router]);
    
      // Submit code
      const handleSubmit = useCallback(async () => {
        if (!isAuthenticated) {
          router.push("/login");
          return;
    ```
    **Category:** Anti-pattern
    **Severity:** minor

23. **`ProblemPageClient` has a cyclomatic complexity of 127 with "critical" risk** (`JS-R1005`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 350
    ```typescript
    return `code_${slug}_${languageId}`;
    }
    
    export default function ProblemPageClient({ params }: PageProps) {
      const { slug } = use(params);
      const router = useRouter();
      const searchParams = useSearchParams();
    ```
    **Category:** Anti-pattern
    **Severity:** minor

24. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/app/problems/[slug]/ProblemPageClient.tsx`
    **Line:** 2698
    ```typescript
    const isPassed = result.status === "accepted";
                          return (
                            <div
                              key={i}
                              className={`rounded-md border transition-colors ${
                                isPassed
                                  ? "bg-emerald-500/10 border-emerald-500/30"
    ```
    **Category:** Bug risk
    **Severity:** major

25. **Template string can be replaced with regular string literal** (`JS-R1004`)
    **File:** `frontend/src/components/ai/AIChatPanel.tsx`
    **Line:** 99
    ```typescript
    const handleQuickActionResult = useCallback(
        () => {
          sendMessage(`[Received AI response]`, false);
        },
        [sendMessage]
      );
    ```
    **Category:** Anti-pattern
    **Severity:** minor

26. **`AIChatPanel` has a cyclomatic complexity of 29 with "very-high" risk** (`JS-R1005`)
    **File:** `frontend/src/components/ai/AIChatPanel.tsx`
    **Line:** 34
    ```typescript
    onClose: () => void;
    }
    
    export function AIChatPanel({
      problemSlug,
      problemTitle,
      problemDescription,
    ```
    **Category:** Anti-pattern
    **Severity:** minor

27. **JSX tree is too deeply nested. Found 5 levels of nesting** (`JS-0415`)
    **File:** `frontend/src/components/ai/AIChatPanel.tsx`
    **Line:** 127
    ```typescript
    if (!isOpen) return null;
    
      return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-2">
    ```
    **Category:** Anti-pattern
    **Severity:** minor

28. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/AIChatPanel.tsx`
    **Line:** 34-330
    ```typescript
    onClose: () => void;
    }
    
    export function AIChatPanel({
      problemSlug,
      problemTitle,
      problemDescription,
      patternId,
      patternName,
      patternDifficulty,
      timeComplexity,
      spaceComplexity,
      activeSection,
      sectionContent,
      contextType,
      code,
      language,
      errorMessage,
      initialMessage,
      initialMessageKey,
      isOpen,
      onClose,
    }: AIChatPanelProps) {
      const { isAuthenticated } = useAuth();
      const messagesEndRef = useRef<HTMLDivElement>(null);
      const [hintLevel, setHintLevel] = useState(1);
      const [showHistory, setShowHistory] = useState(false);
      const {
        messages,
        isLoading,
        isLoadingHistory,
        error,
        archivedSessions,
        isViewingArchived,
        sendMessage,
        stopStreaming,
        clearMessages,
        startNewChat,
        loadArchivedSession,
      } = useAIChat({
        problemSlug,
        problemTitle,
        problemDescription,
        patternId,
        patternName,
        patternDifficulty,
        timeComplexity,
        spaceComplexity,
        sectionContent,
        activeSection,
        contextType,
        code,
        language,
        errorMessage,
        isAuthenticated,
      });
      const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, []);
      useEffect(() => {
        scrollToBottom();
      }, [messages, scrollToBottom]);
      const handleQuickActionResult = useCallback(
        () => {
          sendMessage(`[Received AI response]`, false);
        },
        [sendMessage]
      );
      const handlePatternQuickAction = useCallback(
        (_action: PatternQuickAction, message: string) => {
          sendMessage(message);
        },
        [sendMessage]
      );
      const handleHintUsed = useCallback(() => {
        setHintLevel((prev) => Math.min(prev + 1, 4));
      }, []);
      const initialMessageRef = useRef<number>(0);
      useEffect(() => {
        if (initialMessage && (initialMessageKey ?? 0) > initialMessageRef.current && isOpen) {
          initialMessageRef.current = initialMessageKey ?? 0;
          sendMessage(initialMessage);
        }
      }, [initialMessage, initialMessageKey, isOpen, sendMessage]);
      if (!isOpen) return null;
      return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                <Image src="/thor_ai_icon.png" alt="Thor AI" width={16} height={16} className="object-cover rounded-full" />
              </div>
              <span className="text-sm font-medium text-white">Thor AI</span>
            </div>
            <div className="flex items-center gap-1">
              {/* History toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-md transition-colors ${
                  showHistory ? "text-indigo-400 bg-indigo-900/30" : "text-gray-500 hover:text-white hover:bg-gray-800"
                }`}
                title="Chat history"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              {/* New chat button */}
              {messages.length > 0 && !isViewingArchived && (
                <button
                  onClick={startNewChat}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                  title="New chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
              {/* Back to active chat (when viewing archived) */}
              {isViewingArchived && (
                <button
                  onClick={startNewChat}
                  className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-gray-800 rounded-md transition-colors"
                  title="Back to active chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
              )}
              {messages.length > 0 && !isViewingArchived && (
                <button
                  onClick={clearMessages}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                  title="Clear"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* History Panel */}
          {showHistory && (
            <div className="border-b border-gray-800 bg-gray-900/50 max-h-32 overflow-y-auto">
              {archivedSessions.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wide">Previous Chats</div>
                  {archivedSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => {
                        loadArchivedSession(session.id);
                        setShowHistory(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-800 transition-colors border-t border-gray-800/50"
                    >
                      <div className="text-xs text-gray-300 truncate">
                        {session.title || "Untitled chat"}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(session.last_message_at).toLocaleDateString()} · {session.message_count} messages
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-3 text-center text-xs text-gray-500">
                  No saved chats yet. Click <span className="text-gray-400">+</span> to save the current one.
                </div>
              )}
            </div>
          )}
          {/* Quick Actions */}
          {isAuthenticated && contextType === "pattern" && patternId && patternName ? (
            <PatternQuickActions
              patternId={patternId}
              patternName={patternName}
              activeSection={activeSection || ""}
              onAction={handlePatternQuickAction}
            />
          ) : isAuthenticated && contextType !== "pattern" ? (
            <QuickActions
              problemSlug={problemSlug || ""}
              problemTitle={problemTitle || ""}
              problemDescription={problemDescription}
              code={code || ""}
              language={language || ""}
              errorMessage={errorMessage}
              hintLevel={hintLevel}
              onHintUsed={handleHintUsed}
              onResult={handleQuickActionResult}
            />
          ) : null}
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
              </div>
            ) : !isAuthenticated ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg
                  className="w-10 h-10 text-gray-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-sm text-gray-400 mb-3">Sign in to use Thor AI</p>
                <a
                  href="/login"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm transition-colors"
                >
                  Sign In
                </a>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-gray-400 mb-2">
                  {contextType === "pattern"
                    ? "Ask about the pattern or use quick actions above"
                    : "Ask about the problem or use quick actions above"}
                </p>
                <p className="text-xs text-gray-500">I guide with questions, not answers</p>
              </div>
            ) : (
              <>
                {isViewingArchived && (
                  <div className="mb-3 px-2 py-1.5 bg-indigo-900/20 border border-indigo-800/50 rounded-md text-xs text-indigo-300">
                    Viewing archived chat (read-only)
                  </div>
                )}
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
            {error && (
              <div className="p-2 bg-red-900/20 border border-red-800 rounded-md text-red-400 text-xs">
                {error}
              </div>
            )}
          </div>
          {/* Input */}
          {isAuthenticated && !isViewingArchived && (
            <ChatInput
              onSend={sendMessage}
              onStop={stopStreaming}
              isLoading={isLoading}
              disabled={!isAuthenticated}
            />
          )}
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

29. **Function has a cyclomatic complexity of 6 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/ai/AIChatPanel.tsx`
    **Line:** 117
    ```typescript
    const initialMessageRef = useRef<number>(0);
    
      useEffect(() => {
        if (initialMessage && (initialMessageKey ?? 0) > initialMessageRef.current && isOpen) {
          initialMessageRef.current = initialMessageKey ?? 0;
          sendMessage(initialMessage);
    ```
    **Category:** Anti-pattern
    **Severity:** minor

30. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/AIToggleButton.tsx`
    **Line:** 9-36
    ```typescript
    hasNewMessage?: boolean;
    }
    
    export function AIToggleButton({ isOpen, onClick, hasNewMessage }: AIToggleButtonProps) {
      if (isOpen) return null;
      return (
        <button
          onClick={onClick}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full shadow-lg shadow-purple-500/25 flex items-center justify-center transition-all hover:scale-105 z-40"
          title="Open Thor AI"
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

31. **Duplicate assignment statement found** (`JS-W1032`)
    **File:** `frontend/src/components/ai/ChatInput.tsx`
    **Line:** 46
    ```typescript
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
      };
    ```
    **Category:** Bug risk
    **Severity:** minor

32. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/ChatInput.tsx`
    **Line:** 13-99
    ```typescript
    disabled?: boolean;
    }
    
    export function ChatInput({
      onSend,
      onStop,
      isLoading,
      placeholder = "Ask a question...",
      disabled = false,
    }: ChatInputProps) {
      const [input, setInput] = useState("");
      const textareaRef = useRef<HTMLTextAreaElement>(null);
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
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
      };
      return (
        <div className="border-t border-gray-800 p-2">
          <div className="flex items-stretch gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-50"
              style={{ minHeight: "36px", maxHeight: "100px" }}
            />
            {isLoading ? (
              <button
                onClick={onStop}
                className="px-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center"
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
                className="px-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center"
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
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

33. **`formatInlineText` has a cyclomatic complexity of 8 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 160
    ```typescript
    return elements;
    }
    
    function formatInlineText(text: string): React.ReactNode {
      // Handle bold, italic, inline code
      const parts: React.ReactNode[] = [];
      let remaining = text;
    ```
    **Category:** Anti-pattern
    **Severity:** minor

34. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 205-225
    ```typescript
    return parts.length === 1 ? parts[0] : parts;
    }
    
    function processInlineCode(text: string, startKey: number): React.ReactNode[] {
      const parts: React.ReactNode[] = [];
      const segments = text.split(/(`[^`]+`)/g);
      segments.forEach((segment, i) => {
        if (segment.startsWith("`") && segment.endsWith("`")) {
          parts.push(
            <code
              key={`code-${startKey}-${i}`}
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
    ```
    **Category:** Anti-pattern
    **Severity:** minor

35. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 10-29
    ```typescript
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
    ```
    **Category:** Anti-pattern
    **Severity:** minor

36. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 31-69
    ```typescript
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
                    key={`code-${index}`}
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
            return <FormattedText key={`text-${index}`} text={part} />;
          })}
        </div>
      );
    }
    
    function FormattedText({ text }: { text: string }) {
      // Process line by line for headers and lists
    ```
    **Category:** Anti-pattern
    **Severity:** minor

37. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 160-203
    ```typescript
    return elements;
    }
    
    function formatInlineText(text: string): React.ReactNode {
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
    ```
    **Category:** Anti-pattern
    **Severity:** minor

38. **Function has a cyclomatic complexity of 12 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 89
    ```typescript
    }
      };
    
      lines.forEach((line, i) => {
        const trimmed = line.trim();
    
        // Headers
    ```
    **Category:** Anti-pattern
    **Severity:** minor

39. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 71-158
    ```typescript
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
            <h4 key={`h4-${i}`} className="font-semibold text-white mt-3 mb-1">
              {formatInlineText(trimmed.slice(4))}
            </h4>
          );
        } else if (trimmed.startsWith("## ")) {
          flushParagraph();
          elements.push(
            <h3 key={`h3-${i}`} className="font-semibold text-white mt-3 mb-1 text-base">
              {formatInlineText(trimmed.slice(3))}
            </h3>
          );
        } else if (trimmed.startsWith("# ")) {
          flushParagraph();
          elements.push(
            <h2 key={`h2-${i}`} className="font-bold text-white mt-3 mb-2 text-base">
              {formatInlineText(trimmed.slice(2))}
            </h2>
          );
        }
        // Bullet lists
        else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          flushParagraph();
          elements.push(
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
    
    function formatInlineText(text: string): React.ReactNode {
      // Handle bold, italic, inline code
    ```
    **Category:** Anti-pattern
    **Severity:** minor

40. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 103
    ```typescript
    } else if (trimmed.startsWith("## ")) {
          flushParagraph();
          elements.push(
            <h3 key={`h3-${i}`} className="font-semibold text-white mt-3 mb-1 text-base">
              {formatInlineText(trimmed.slice(3))}
            </h3>
          );
    ```
    **Category:** Bug risk
    **Severity:** major

41. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 131
    ```typescript
    const match = trimmed.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            elements.push(
              <div key={`ol-${i}`} className="flex gap-2 ml-2">
                <span className="text-gray-500 min-w-[1.2em]">{match[1]}.</span>
                <span>{formatInlineText(match[2])}</span>
              </div>
    ```
    **Category:** Bug risk
    **Severity:** major

42. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 96
    ```typescript
    if (trimmed.startsWith("### ")) {
          flushParagraph();
          elements.push(
            <h4 key={`h4-${i}`} className="font-semibold text-white mt-3 mb-1">
              {formatInlineText(trimmed.slice(4))}
            </h4>
          );
    ```
    **Category:** Bug risk
    **Severity:** major

43. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 119
    ```typescript
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          flushParagraph();
          elements.push(
            <div key={`li-${i}`} className="flex gap-2 ml-2">
              <span className="text-gray-500">•</span>
              <span>{formatInlineText(trimmed.slice(2))}</span>
            </div>
    ```
    **Category:** Bug risk
    **Severity:** major

44. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 142
    ```typescript
    else if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          flushParagraph();
          elements.push(
            <hr key={`hr-${i}`} className="border-gray-700 my-2" />
          );
        }
        // Empty line
    ```
    **Category:** Bug risk
    **Severity:** major

45. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 213
    ```typescript
    if (segment.startsWith("`") && segment.endsWith("`")) {
          parts.push(
            <code
              key={`code-${startKey}-${i}`}
              className="bg-gray-900 px-1 py-0.5 rounded-md text-xs font-mono text-indigo-300"
            >
              {segment.slice(1, -1)}
    ```
    **Category:** Bug risk
    **Severity:** major

46. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 110
    ```typescript
    } else if (trimmed.startsWith("# ")) {
          flushParagraph();
          elements.push(
            <h2 key={`h2-${i}`} className="font-bold text-white mt-3 mb-2 text-base">
              {formatInlineText(trimmed.slice(2))}
            </h2>
          );
    ```
    **Category:** Bug risk
    **Severity:** major

47. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 54
    ```typescript
    const [, lang, code] = match;
                return (
                  <pre
                    key={`code-${index}`}
                    className="bg-gray-900 rounded-md p-2 my-2 overflow-x-auto text-xs font-mono"
                  >
                    {lang && (
    ```
    **Category:** Bug risk
    **Severity:** major

48. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/ai/ChatMessage.tsx`
    **Line:** 65
    ```typescript
    );
              }
            }
            return <FormattedText key={`text-${index}`} text={part} />;
          })}
        </div>
      );
    ```
    **Category:** Bug risk
    **Severity:** major

49. **`InlineAI` has a cyclomatic complexity of 13 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/ai/InlineAI.tsx`
    **Line:** 21
    ```typescript
    type ActionType = "explain" | "improve" | "debug" | "complexity" | "custom";
    
    export function InlineAI({
      isOpen,
      onClose,
      position,
    ```
    **Category:** Anti-pattern
    **Severity:** minor

50. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/InlineAI.tsx`
    **Line:** 219-237
    ```typescript
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
    ```
    **Category:** Anti-pattern
    **Severity:** minor

51. **JSX tree is too deeply nested. Found 5 levels of nesting** (`JS-0415`)
    **File:** `frontend/src/components/ai/InlineAI.tsx`
    **Line:** 132-141
    ```typescript
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
    ```
    **Category:** Anti-pattern
    **Severity:** minor

52. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/InlineAI.tsx`
    **Line:** 21-217
    ```typescript
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
    ```
    **Category:** Anti-pattern
    **Severity:** minor

53. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/PatternQuickActions.tsx`
    **Line:** 80-142
    ```typescript
    onAction: (action: PatternQuickAction, message: string) => void;
    }
    
    export function PatternQuickActions({
      patternName,
      activeSection,
      onAction,
    }: PatternQuickActionsProps) {
      const triggers: Record<PatternQuickAction, () => void> = {
        explain: () => {
          const sectionLabel = activeSection || "this pattern";
          onAction(
            "explain",
            `Please explain the "${sectionLabel}" concept in simpler terms with a concrete example.`
          );
        },
        compare: () => {
          onAction(
            "compare",
            `Compare the ${patternName} pattern with sliding window. When should I use one over the other?`
          );
        },
        whenToUse: () => {
          onAction(
            "whenToUse",
            `Summarize when to use the ${patternName} pattern. What are the key signals in a problem description that indicate this pattern fits?`
          );
        },
        walkThrough: () => {
          const sectionLabel = activeSection || "the core technique";
          onAction(
            "walkThrough",
            `Walk me through "${sectionLabel}" step by step. Show me what happens at each step and why it works.`
          );
        },
        practiceNext: () => {
          onAction(
            "practiceNext",
            `Which problem should I start with to practice the ${patternName} pattern? Recommend problems in order from easiest to hardest from the curated list.`
          );
        },
      };
      const allActions: PatternQuickAction[] = [
        "explain",
        "compare",
        "whenToUse",
        "walkThrough",
        "practiceNext",
      ];
      return (
        <div className="flex flex-wrap gap-1.5 p-3 border-b border-gray-800">
          {allActions.map((action) => (
            <button
              key={action}
              onClick={triggers[action]}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition-colors border border-gray-700"
            >
              {actionIcons[action]}
              {actionLabels[action]}
            </button>
          ))}
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

54. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/QuickActions.tsx`
    **Line:** 163-181
    ```typescript
    );
    }
    
    function Spinner() {
      return (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

55. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ai/QuickActions.tsx`
    **Line:** 19-161
    ```typescript
    onResult: (result: string, type: "hint" | "review" | "explain") => void;
    }
    
    export function QuickActions({
      problemSlug,
      problemTitle,
      problemDescription,
      code,
      language,
      errorMessage,
      hintLevel,
      onHintUsed,
      onResult,
    }: QuickActionsProps) {
      const [loading, setLoading] = useState<"hint" | "review" | "explain" | null>(null);
      const getHint = async () => {
        if (!code.trim()) return;
        setLoading("hint");
        try {
          const response = await aiApiClient.getHint({
            problemSlug,
            problemTitle,
            problemDescription,
            code,
            language,
            hintLevel,
          });
          if (response.success) {
            const data = response.data as HintResponse;
            onResult(data.hint, "hint");
            onHintUsed();
          }
        } catch (err) {
          console.error("Failed to get hint:", err);
        }
        setLoading(null);
      };
      const getReview = async () => {
        if (!code.trim()) return;
        setLoading("review");
        try {
          const response = await aiApiClient.reviewCode({
            problemSlug,
            problemTitle,
            problemDescription,
            code,
            language,
          });
          if (response.success) {
            const data = response.data as ReviewResponse;
            onResult(data.review, "review");
          }
        } catch (err) {
          console.error("Failed to get review:", err);
        }
        setLoading(null);
      };
      const explainError = async () => {
        if (!errorMessage) return;
        setLoading("explain");
        try {
          const response = await aiApiClient.explainError({
            code,
            language,
            errorType: "runtime",
            errorMessage,
          });
          if (response.success) {
            const data = response.data as ExplainResponse;
            onResult(data.explanation, "explain");
          }
        } catch (err) {
          console.error("Failed to explain error:", err);
        }
        setLoading(null);
      };
      return (
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-800">
          <button
            onClick={getHint}
            disabled={loading !== null || !code.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
          >
            {loading === "hint" ? (
              <Spinner />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            )}
            Hint {hintLevel}/4
          </button>
          <button
            onClick={getReview}
            disabled={loading !== null || !code.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
          >
            {loading === "review" ? (
              <Spinner />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            )}
            Review
          </button>
          {errorMessage && (
            <button
              onClick={explainError}
              disabled={loading !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700"
            >
              {loading === "explain" ? (
                <Spinner />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              Explain Error
            </button>
          )}
        </div>
      );
    }
    
    function Spinner() {
      return (
    ```
    **Category:** Anti-pattern
    **Severity:** minor

56. **`QuickActions` has a cyclomatic complexity of 7 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/ai/QuickActions.tsx`
    **Line:** 19
    ```typescript
    onResult: (result: string, type: "hint" | "review" | "explain") => void;
    }
    
    export function QuickActions({
      problemSlug,
      problemTitle,
      problemDescription,
    ```
    **Category:** Anti-pattern
    **Severity:** minor

57. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/articles/ArticleLayout.tsx`
    **Line:** 13-179
    ```typescript
    currentSection?: string;
    }
    
    export default function ArticleLayout({
      article,
      children,
      currentSection,
    }: ArticleLayoutProps) {
      const [sidebarOpen, setSidebarOpen] = useState(true);
      return (
        <div className="min-h-screen bg-gray-950">
          <div className="flex">
            {/* Sidebar */}
            <aside
              className={`${
                sidebarOpen ? "w-72" : "w-0"
              } flex-shrink-0 transition-all duration-300 overflow-hidden`}
            >
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-800 bg-gray-900/50">
                <div className="p-4">
                  {/* Article Info */}
                  <Link href={`/articles/${article.slug}`} className="block mb-6">
                    <h2 className="text-lg font-bold text-white hover:text-indigo-400 transition">
                      {article.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          article.difficulty === "beginner"
                            ? "bg-green-500/20 text-green-400"
                            : article.difficulty === "intermediate"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {article.difficulty}
                      </span>
                      <span>{article.estimatedTime}</span>
                    </div>
                  </Link>
                  {/* Sections Navigation */}
                  <nav className="space-y-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Sections
                    </div>
                    {article.sections.map((section, index) => {
                      const isActive = currentSection === section.slug;
                      const sectionPath = `/articles/${article.slug}/${section.slug}`;
                      return (
                        <Link
                          key={section.slug}
                          href={sectionPath}
                          className={`flex items-start gap-3 px-3 py-2.5 rounded-md transition group ${
                            isActive
                              ? "bg-indigo-500/20 text-indigo-300"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <span
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              isActive
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-700 text-gray-400 group-hover:bg-gray-600"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-medium ${isActive ? "text-white" : ""}`}
                            >
                              {section.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {section.estimatedTime}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>
                  {/* Progress indicator */}
                  <div className="mt-6 pt-6 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Progress</span>
                      <span>0/{article.sections.length}</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: "0%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white p-1.5 rounded-r-md border border-l-0 border-gray-700 transition"
              style={{ left: sidebarOpen ? "18rem" : "0" }}
            >
              <svg
                className={`w-4 h-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
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
            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                  <Link
                    href="/articles"
                    className="hover:text-indigo-400 transition"
                  >
                    Articles
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="hover:text-indigo-400 transition"
                  >
                    {article.title}
                  </Link>
                  {currentSection && (
                    <>
                      <span>/</span>
                      <span className="text-gray-300">
                        {
                          article.sections.find((s) => s.slug === currentSection)
                            ?.title
                        }
                      </span>
                    </>
                  )}
                </nav>
                {/* Content */}
                {children}
                {/* Section Navigation */}
                {currentSection && (
                  <SectionNavigation
                    article={article}
                    currentSection={currentSection}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      );
    }
    
    function SectionNavigation({
      article,
    ```
    **Category:** Anti-pattern
    **Severity:** minor

58. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/layout/Footer.tsx`
    **Line:** 3-17
    ```typescript
    const APP_VERSION = "1.1.0";
    
    export default function Footer() {
      return (
        <footer
          className="mt-auto py-3 border-t"
          style={{ borderColor: "var(--border-1)" }}
        >
          <div className="max-w-7xl mx-auto px-4 text-center text-xs">
            <p style={{ color: "var(--text-3)" }}>
              AlgoPatterns - Interactive Algorithm Visualizations
            </p>
            <span style={{ color: "var(--text-3)" }}>v{APP_VERSION}</span>
          </div>
        </footer>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

59. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/patterns/UnifiedTracker.tsx`
    **Line:** 16-250
    ```typescript
    questions: Question[];
    }
    
    export default function UnifiedTracker({ questions }: UnifiedTrackerProps) {
      const patterns = patternsData as Pattern[];
      const {
        completed,
        toggleComplete,
        resetProgress,
        celebrationKey,
      } = useProgress();
      const [search, setSearch] = useState("");
      const [difficultyFilter, setDifficultyFilter] = useState("");
      const [companyFilter, setCompanyFilter] = useState("");
      const companies = useMemo(() => {
        const set = new Set<string>();
        questions.forEach((q) => q.companies.forEach((c) => set.add(c)));
        return [...set].sort();
      }, [questions]);
      const filteredQuestions = useMemo(() => {
        return questions.filter((q) => {
          if (search && !q.name.toLowerCase().includes(search.toLowerCase()))
            return false;
          if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
          if (companyFilter && !q.companies.includes(companyFilter)) return false;
          return true;
        });
      }, [questions, search, difficultyFilter, companyFilter]);
      const categories = useMemo(() => {
        return [...new Set(filteredQuestions.map((q) => q.category))];
      }, [filteredQuestions]);
      const patternsByCategory = useMemo(() => {
        const map = new Map<string, Pattern>();
        patterns.forEach((p) => {
          const matchingCategories = Object.entries(categoryToPatternId)
            .filter(([, patternId]) => patternId === p.id)
            .map(([category]) => category);
          matchingCategories.forEach((cat) => map.set(cat, p));
        });
        return map;
      }, [patterns]);
      return (
        <div>
          {celebrationKey > 0 && <Confetti key={celebrationKey} />}
          <div className="bg-gray-800/50 rounded-md p-4 mb-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Filters
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSearch("");
                    setDifficultyFilter("");
                    setCompanyFilter("");
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Clear Filters
                </button>
                <button
                  onClick={resetProgress}
                  className="text-xs text-gray-500 hover:text-red-400 transition flex items-center gap-1"
                >
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset Progress
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <QuoteSection />
          {categories.map((category) => {
            const pattern = patternsByCategory.get(category);
            const categoryQuestions = filteredQuestions.filter(
              (q) => q.category === category
            );
            if (categoryQuestions.length === 0) return null;
            if (!pattern) {
              return (
                <section key={category} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{category}</h2>
                      <span className="text-sm text-gray-500">
                        {categoryQuestions.length} problems
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {categoryQuestions.map((q) => (
                      <div
                        key={q.id}
                        className={`flex items-center gap-4 p-4 bg-gray-800/50 rounded-md border transition hover:translate-x-1 ${
                          completed.has(q.id)
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-gray-700"
                        }`}
                      >
                        <button
                          onClick={() => toggleComplete(q.id)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition flex-shrink-0 ${
                            completed.has(q.id)
                              ? "bg-green-500 border-green-500"
                              : "border-gray-600 hover:border-green-500"
                          }`}
                        >
                          {completed.has(q.id) && (
                            <svg
                              className="w-4 h-4 text-white"
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
                        <div className="flex-1 min-w-0">
                          <a
                            href={q.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-indigo-400 font-medium transition"
                          >
                            {q.name}
                          </a>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>{q.pattern}</span>
                            {q.companies.length > 0 && (
                              <>
                                <span className="text-gray-600">|</span>
                                <span>{q.companies.join(", ")}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span
                            className={
                              q.difficulty === "Easy"
                                ? "text-green-400"
                                : q.difficulty === "Medium"
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }
                          >
                            {q.difficulty}
                          </span>
                          <span>{q.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }
            return (
              <PatternSection
                key={category}
                pattern={pattern}
                questions={categoryQuestions}
                completed={completed}
                onToggleComplete={toggleComplete}
              />
            );
          })}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No questions match your filters
            </div>
          )}
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

60. **`formReducer` has a cyclomatic complexity of 6 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/pricing/CheckoutModal.tsx`
    **Line:** 74
    ```typescript
    error: null,
    };
    
    function formReducer(state: FormState, action: FormAction): FormState {
      switch (action.type) {
        case "RESET":
          return initialFormState;
    ```
    **Category:** Anti-pattern
    **Severity:** minor

61. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/pricing/CheckoutModal.tsx`
    **Line:** 91-333
    ```typescript
    }
    }
    
    export function CheckoutModal({
      plan,
      isOpen,
      onClose,
      onSuccess,
      userEmail,
      userName,
    }: CheckoutModalProps) {
      const { createOrder, verifyPayment, validateDiscount } = useSubscription();
      const [{ discountCode, discountValidation, orderData, error }, dispatch] =
        useReducer(formReducer, initialFormState);
      const [isValidating, setIsValidating] = useState(false);
      const [isProcessing, setIsProcessing] = useState(false);
      const loadRazorpayScript = useCallback(() => {
        return new Promise<boolean>((resolve) => {
          if (window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      }, []);
      useEffect(() => {
        if (isOpen) {
          loadRazorpayScript();
          dispatch({ type: "RESET" });
        }
      }, [isOpen, loadRazorpayScript]);
      const handleValidateDiscount = async () => {
        if (!discountCode.trim()) return;
        setIsValidating(true);
        dispatch({ type: "SET_ERROR", payload: null });
        const result = await validateDiscount(discountCode.trim(), plan.id);
        setIsValidating(false);
        if (result.success && result.data) {
          dispatch({ type: "SET_DISCOUNT_VALIDATION", payload: result.data });
        } else {
          dispatch({ type: "SET_ERROR", payload: result.error || "Invalid discount code" });
          dispatch({ type: "SET_DISCOUNT_VALIDATION", payload: null });
        }
      };
      const handleCheckout = async () => {
        setIsProcessing(true);
        dispatch({ type: "SET_ERROR", payload: null });
        try {
          const result = await createOrder(
            plan.id,
            discountValidation?.code || undefined
          );
          if (!result.success || !result.data) {
            dispatch({ type: "SET_ERROR", payload: result.error || "Failed to create order" });
            setIsProcessing(false);
            return;
          }
          dispatch({ type: "SET_ORDER_DATA", payload: result.data });
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            dispatch({ type: "SET_ERROR", payload: "Failed to load payment gateway" });
            setIsProcessing(false);
            return;
          }
          const options: RazorpayOptions = {
            key: result.data.razorpay_key_id,
            amount: result.data.pricing.total,
            currency: result.data.pricing.currency,
            name: "AlgoPatterns",
            description: `${result.data.plan.name} - ${result.data.plan.billing_period}`,
            order_id: result.data.razorpay_order_id,
            handler: async (response: RazorpayResponse) => {
              const verifyResult = await verifyPayment(
                response.razorpay_payment_id,
                response.razorpay_order_id,
                response.razorpay_signature
              );
              if (verifyResult.success) {
                onSuccess();
              } else {
                dispatch({ type: "SET_ERROR", payload: verifyResult.error || "Payment verification failed" });
              }
              setIsProcessing(false);
            },
            prefill: {
              email: userEmail,
              name: userName,
            },
            theme: {
              color: "#10b981",
            },
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
              },
            },
          };
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } catch {
          dispatch({ type: "SET_ERROR", payload: "An error occurred. Please try again." });
          setIsProcessing(false);
        }
      };
      const formatPrice = (amount: number, currency: string = "INR") => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount / 100);
      };
      if (!isOpen) return null;
      const pricing = orderData?.pricing || {
        subtotal: plan.price,
        discount_amount: discountValidation?.discount_amount || 0,
        gst_rate: 18,
        gst_amount: Math.round(
          ((plan.price - (discountValidation?.discount_amount || 0)) * 18) / 100
        ),
        total
    :      plan.price -
          (discountValidation?.discount_amount || 0) +
          Math.round(
            ((plan.price - (discountValidation?.discount_amount || 0)) * 18) / 100
          ),
        currency: plan.currency,
      };
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative bg-gray-900 rounded-md p-6 w-full max-w-md mx-4 border border-gray-700">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-white mb-6">
              Upgrade to {plan.name}
            </h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{formatPrice(pricing.subtotal, pricing.currency)}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => dispatch({ type: "SET_DISCOUNT_CODE", payload: e.target.value.toUpperCase() })}
                  placeholder="Discount code"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  disabled={!!discountValidation}
                />
                {discountValidation ? (
                  <button
                    onClick={() => {
                      dispatch({ type: "SET_DISCOUNT_CODE", payload: "" });
                      dispatch({ type: "SET_DISCOUNT_VALIDATION", payload: null });
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleValidateDiscount}
                    disabled={isValidating || !discountCode.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-md"
                  >
                    {isValidating ? "..." : "Apply"}
                  </button>
                )}
              </div>
              {discountValidation && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountValidation.code})</span>
                  <span>
                    -{formatPrice(discountValidation.discount_amount, pricing.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-gray-400 text-sm">
                <span>GST ({pricing.gst_rate}%)</span>
                <span>{formatPrice(pricing.gst_amount, pricing.currency)}</span>
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between text-white font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(pricing.total, pricing.currency)}</span>
              </div>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-md transition-colors"
            >
              {isProcessing ? "Processing..." : `Pay ${formatPrice(pricing.total, pricing.currency)}`}
            </button>
            <p className="mt-4 text-center text-gray-500 text-xs">
              Secured by Razorpay. By proceeding, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

62. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/pricing/CheckoutModal.tsx`
    **Line:** 74-89
    ```typescript
    error: null,
    };
    
    function formReducer(state: FormState, action: FormAction): FormState {
      switch (action.type) {
        case "RESET":
          return initialFormState;
        case "SET_DISCOUNT_CODE":
          return { ...state, discountCode: action.payload };
        case "SET_DISCOUNT_VALIDATION":
          return { ...state, discountValidation: action.payload };
        case "SET_ORDER_DATA":
          return { ...state, orderData: action.payload };
        case "SET_ERROR":
          return { ...state, error: action.payload };
        default:
          return state;
      }
    }
    
    export function CheckoutModal({
      plan,
    ```
    **Category:** Anti-pattern
    **Severity:** minor

63. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/quiz/QuizModal.tsx`
    **Line:** 18-338
    ```typescript
    sectionSlug?: string;
    }
    
    export default function QuizModal({
      isOpen,
      onClose,
      patternId,
      sectionSlug,
    }: QuizModalProps) {
      const [questions, setQuestions] = useState<QuizQuestion[]>([]);
      const [currentIndex, setCurrentIndex] = useState(0);
      const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
      const [attemptId, setAttemptId] = useState<string | null>(null);
      const [showExplanation, setShowExplanation] = useState(false);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);
      const [showResults, setShowResults] = useState(false);
      const [results, setResults] = useState<{
        totalQuestions: number;
        correctCount: number;
        scorePercentage: number;
      } | null>(null);
      const questionStartTime = useRef<number>(0);
      const quizStartTime = useRef<number>(0);
      const currentQuestion = questions[currentIndex];
      const progress =
        questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
      const hasAnswered = currentQuestion
        ? answers.has(currentQuestion.id)
        : false;
      const initQuiz = useCallback(async () => {
        if (!isOpen) return;
        setIsLoading(true);
        setError(null);
        setQuestions([]);
        setCurrentIndex(0);
        setAnswers(new Map());
        setAttemptId(null);
        setShowExplanation(false);
        setShowResults(false);
        setResults(null);
        try {
          const questionsRes = await quizService.getQuestions(
            patternId,
            sectionSlug
          );
          if (questionsRes.questions.length === 0) {
            setError("No questions available for this quiz.");
            setIsLoading(false);
            return;
          }
          const attemptRes = await quizService.startAttempt({
            patternId,
            sectionSlug,
            totalQuestions: questionsRes.questions.length,
          });
          setQuestions(questionsRes.questions);
          setAttemptId(attemptRes.attemptId);
          quizStartTime.current = Date.now();
          questionStartTime.current = Date.now();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load quiz");
        } finally {
          setIsLoading(false);
        }
      }, [isOpen, patternId, sectionSlug]);
      useEffect(() => {
        startTransition(() => {
          initQuiz();
        });
      }, [initQuiz]);
      const handleAnswer = async (answer: unknown) => {
        if (!attemptId || !currentQuestion || hasAnswered) return;
        const timeTakenMs = Date.now() - questionStartTime.current;
        try {
          const response = await quizService.submitResponse(attemptId, {
            questionId: currentQuestion.id,
            selectedAnswer: answer,
            timeTakenMs,
          });
          setAnswers(
            (prev) =>
              new Map(prev).set(currentQuestion.id, {
                selected: answer,
                isCorrect: response.isCorrect,
                correctAnswer: response.correctAnswer,
                explanation: response.explanation,
              })
          );
          setShowExplanation(true);
        } catch (err) {
          console.error("Failed to submit answer:", err);
        }
      };
      const handleNext = () => {
        setShowExplanation(false);
        startTransition(() => {
          questionStartTime.current = Date.now();
        });
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          completeQuiz();
        }
      };
      const handleBack = () => {
        if (currentIndex > 0) {
          setShowExplanation(false);
          setCurrentIndex((prev) => prev - 1);
        }
      };
      const completeQuiz = async () => {
        if (!attemptId) return;
        const timeTakenSeconds = Math.floor(
          (Date.now() - quizStartTime.current) / 1000
        );
        try {
          const result = await quizService.completeAttempt(attemptId, {
            timeTakenSeconds,
          });
          setResults({
            totalQuestions: result.totalQuestions,
            correctCount: result.correctCount,
            scorePercentage: result.scorePercentage,
          });
          setShowResults(true);
        } catch (err) {
          console.error("Failed to complete quiz:", err);
        }
      };
      const handleRetake = () => {
        initQuiz();
      };
      const handleClose = () => {
        onClose();
      };
      if (!isOpen) return null;
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative bg-gray-900 border border-gray-800 rounded-md w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <span className="text-teal-400 font-medium">
                  {showResults
                    ? "Quiz Complete"
                    : `Question ${currentIndex + 1} of ${questions.length}`}
                </span>
                {!showResults && questions.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-36 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
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
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {error && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <svg
                    className="w-12 h-12 text-red-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-400">{error}</p>
                  <button
                    onClick={handleClose}
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
              {!isLoading && !error && showResults && results && (
                <QuizResults
                  totalQuestions={results.totalQuestions}
                  correctCount={results.correctCount}
                  scorePercentage={results.scorePercentage}
                  questions={questions}
                  answers={answers}
                  onRetake={handleRetake}
                  onClose={handleClose}
                />
              )}
              {!isLoading && !error && !showResults && currentQuestion && (
                <>
                  <QuestionRenderer
                    question={currentQuestion}
                    answer={answers.get(currentQuestion.id)}
                    onAnswer={handleAnswer}
                    disabled={hasAnswered}
                  />
                  {showExplanation && answers.get(currentQuestion.id) && (
                    <ExplanationPanel answer={answers.get(currentQuestion.id)!} />
                  )}
                </>
              )}
            </div>
            {/* Footer navigation */}
            {!isLoading && !error && !showResults && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-900">
                <button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                  Back
                </button>
                {hasAnswered && (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-medium transition-colors"
                  >
                    {currentIndex < questions.length - 1
                      ? "Next Question"
                      : "See Results"}
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    function QuestionRenderer({
      question,
    ```
    **Category:** Anti-pattern
    **Severity:** minor

64. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/QuoteSection.tsx`
    **Line:** 6-31
    ```typescript
    import { useState, useEffect, startTransition } from "react";
    import { quotes } from "@/lib/quotes";
    
    export default function QuoteSection() {
      const [quote, setQuote] = useState(quotes[0]);
      useEffect(() => {
        startTransition(() => {
          const randomIndex = Math.floor(Math.random() * quotes.length);
          setQuote(quotes[randomIndex]);
        });
      }, []);
      return (
        <div className="mt-4 mb-4 text-center">
          <blockquote className="max-w-3xl mx-auto">
            <p
              className="text-xl italic leading-relaxed"
              style={{ color: "var(--text-2)", fontFamily: "var(--font-body)" }}
            >
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="mt-2" style={{ color: "var(--text-3)" }}>
              — {quote.author}
            </footer>
          </blockquote>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

65. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ui/Confetti.tsx`
    **Line:** 27-86
    ```typescript
    "#10b981",
    ];
    
    export default function Confetti() {
      const [particles, setParticles] = useState<Particle[]>([]);
      useEffect(() => {
        const newParticles: Particle[] = [];
        const particleCount = 200;
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 600 + 100;
          newParticles.push({
            id: i,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 8 + 4,
            endX: Math.cos(angle) * distance,
            endY: Math.sin(angle) * distance,
            delay: Math.random() * 0.15,
            rotation: Math.random() * 720 - 360,
          });
        }
        startTransition(() => {
          setParticles(newParticles);
        });
        const timeout = setTimeout(() => {
          startTransition(() => {
            setParticles([]);
          });
        }, 2000);
        return () => clearTimeout(timeout);
      }, []);
      if (particles.length === 0) return null;
      return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={
                {
                  width: particle.size,
                  height: particle.size * (particle.id % 3 === 0 ? 1 : 1.4),
                  backgroundColor: particle.color,
                  borderRadius: particle.id % 4 === 0 ? "50%" : "2px",
                  animation: `explode 1.6s ease-out ${particle.delay}s forwards`,
                  "--end-x": `${particle.endX}px`,
                  "--end-y": `${particle.endY}px`,
                  "--rotation": `${particle.rotation}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

66. **`Highlightable` has a cyclomatic complexity of 21 with "high" risk** (`JS-R1005`)
    **File:** `frontend/src/components/ui/Highlightable.tsx`
    **Line:** 43
    ```typescript
    type ToolbarMode = "colors" | "highlight-menu" | "edit-note";
    
    export function Highlightable({
      children,
      contentType,
      contentId,
    ```
    **Category:** Anti-pattern
    **Severity:** minor

67. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/ui/Highlightable.tsx`
    **Line:** 43-633
    ```typescript
    type ToolbarMode = "colors" | "highlight-menu" | "edit-note";
    
    export function Highlightable({
      children,
      contentType,
      contentId,
      className = "",
      onAskAI,
    }: HighlightableProps) {
      const containerRef = useRef<HTMLDivElement>(null);
      const contentRef = useRef<HTMLDivElement>(null);
      const noteInputRef = useRef<HTMLTextAreaElement>(null);
      const { isAuthenticated } = useAuth();
      const {
        createHighlight,
        updateHighlight,
        deleteHighlight,
        getHighlightsForContent,
        fetchHighlightsForContent,
      } = useHighlights();
      const [selection, setSelection] = useState<{
        text: string;
        startOffset: number;
        endOffset: number;
      } | null>(null);
      const [toolbar, setToolbar] = useState<{ top: number; left: number } | null>(null);
      const [toolbarMode, setToolbarMode] = useState<ToolbarMode>("colors");
      const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
      const [overlays, setOverlays] = useState<HighlightOverlay[]>([]);
      const [noteText, setNoteText] = useState("");
      const [isSaving, setIsSaving] = useState(false);
      const [contentHash, setContentHash] = useState<string>("");
      const highlights = getHighlightsForContent(contentType, contentId);
      // Calculate content hash when content changes
      useEffect(() => {
        const content = contentRef.current;
        if (!content) return;
        const calculateHash = async () => {
          const text = getContentText(content);
          const hash = await generateContentHash(text);
          setContentHash(hash);
        };
        // Use requestAnimationFrame to ensure content is rendered
        const frame = requestAnimationFrame(() => {
          calculateHash();
        });
        return () => cancelAnimationFrame(frame);
      }, [children]);
      // Fetch highlights on mount
      useEffect(() => {
        if (isAuthenticated) {
          fetchHighlightsForContent(contentType, contentId);
        }
      }, [isAuthenticated, contentType, contentId, fetchHighlightsForContent]);
      // Focus note input when mode changes to edit-note
      useEffect(() => {
        if (toolbarMode === "edit-note" && noteInputRef.current) {
          noteInputRef.current.focus();
        }
      }, [toolbarMode]);
      // Calculate overlay positions for highlights
      const calculateOverlays = useCallback(() => {
        const content = contentRef.current;
        if (!content || highlights.length === 0) {
          setOverlays([]);
          return;
        }
        const containerRect = content.getBoundingClientRect();
        const newOverlays: HighlightOverlay[] = [];
        const getTextNodesWithOffsets = (node: Node): { node: Text; start: number; end: number }[] => {
          const result: { node: Text; start: number; end: number }[] = [];
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
          let offset = 0;
          let current: Node | null;
          while ((current = walker.nextNode())) {
            const textNode = current as Text;
            const length = textNode.length;
            result.push({ node: textNode, start: offset, end: offset + length });
            offset += length;
          }
          return result;
        };
        const textNodesInfo = getTextNodesWithOffsets(content);
        if (textNodesInfo.length === 0) return;
        highlights.forEach((highlight) => {
          try {
            const overlappingNodes = textNodesInfo.filter(
              (info) => info.end > highlight.startOffset && info.start < highlight.endOffset
            );
            if (overlappingNodes.length === 0) return;
            const allRawRects: { top: number; left: number; width: number; height: number }[] = [];
            overlappingNodes.forEach((nodeInfo) => {
              const { node: textNode, start: nodeStart } = nodeInfo;
              const highlightStartInNode = Math.max(0, highlight.startOffset - nodeStart);
              const highlightEndInNode = Math.min(textNode.length, highlight.endOffset - nodeStart);
              if (highlightStartInNode >= highlightEndInNode) return;
              const range = document.createRange();
              range.setStart(textNode, highlightStartInNode);
              range.setEnd(textNode, highlightEndInNode);
              const clientRects = range.getClientRects();
              for (let i = 0; i < clientRects.length; i++) {
                const rect = clientRects[i];
                allRawRects.push({
                  top: rect.top - containerRect.top,
                  left: rect.left - containerRect.left,
                  width: rect.width,
                  height: rect.height,
                });
              }
            });
            const rects: { top: number; left: number; width: number; height: number }[] = [];
            allRawRects.forEach((rect) => {
              const existing = rects.find(
                (r) => Math.abs(r.top - rect.top) < 3 && Math.abs(r.height - rect.height) < 3
              );
              if (existing) {
                const newLeft = Math.min(existing.left, rect.left);
                const newRight = Math.max(existing.left + existing.width, rect.left + rect.width);
                existing.left = newLeft;
                existing.width = newRight - newLeft;
              } else {
                rects.push({ ...rect });
              }
            });
            if (rects.length > 0) {
              newOverlays.push({
                id: highlight.id,
                rects,
                color: HIGHLIGHT_COLORS[highlight.color as HighlightColor] || HIGHLIGHT_COLORS.yellow,
                highlight,
                isStale: isHighlightStale(highlight.contentHash, contentHash),
              });
            }
          } catch (error) {
            console.warn("Could not calculate overlay for highlight:", highlight.id, error);
          }
        });
        setOverlays(newOverlays);
      }, [highlights, contentHash]);
      useEffect(() => {
        // Use requestAnimationFrame for immediate but safe DOM calculation
        const frame = requestAnimationFrame(() => {
          calculateOverlays();
        });
        return () => cancelAnimationFrame(frame);
      }, [calculateOverlays]);
      useEffect(() => {
        const content = contentRef.current;
        if (!content) return;
        let resizeTimeout: NodeJS.Timeout;
        const debouncedCalculate = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(calculateOverlays, 50);
        };
        const resizeObserver = new ResizeObserver(debouncedCalculate);
        resizeObserver.observe(content);
        window.addEventListener("resize", debouncedCalculate);
        window.addEventListener("scroll", debouncedCalculate, true);
        return () => {
          clearTimeout(resizeTimeout);
          resizeObserver.disconnect();
          window.removeEventListener("resize", debouncedCalculate);
          window.removeEventListener("scroll", debouncedCalculate, true);
        };
      }, [calculateOverlays]);
      const closeToolbar = () => {
        setSelection(null);
        setToolbar(null);
        setToolbarMode("colors");
        setActiveHighlight(null);
        setNoteText("");
      };
      // Handle text selection
      useEffect(() => {
        const container = contentRef.current;
        if (!container) return;
        const handleMouseUp = () => {
          if (document.querySelector("[data-highlight-toolbar]:hover")) return;
          requestAnimationFrame(() => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            if (!container.contains(range.commonAncestorContainer)) return;
            const text = sel.toString().trim();
            if (text.length < 3 || text.length > 5000) return;
            const preRange = document.createRange();
            preRange.selectNodeContents(container);
            preRange.setEnd(range.startContainer, range.startOffset);
            const startOffset = preRange.toString().length;
            const endOffset = startOffset + sel.toString().length;
            const rect = range.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            setSelection({ text, startOffset, endOffset });
            setToolbar({
              top: rect.top - containerRect.top - 50,
              left: Math.max(10, rect.left - containerRect.left + rect.width / 2 - 100),
            });
            setToolbarMode("colors");
            setActiveHighlight(null);
            setNoteText("");
          });
        };
        const handleMouseDown = (e: MouseEvent) => {
          const target = e.target as Element;
          if (target.closest("[data-highlight-toolbar]")) return;
          if (target.closest("[data-highlight-overlay]")) return;
          closeToolbar();
        };
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            closeToolbar();
            window.getSelection()?.removeAllRanges();
          }
        };
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
          document.removeEventListener("mouseup", handleMouseUp);
          document.removeEventListener("mousedown", handleMouseDown);
          document.removeEventListener("keydown", handleKeyDown);
        };
      }, []);
      const handleOverlayClick = (overlay: HighlightOverlay, e: React.MouseEvent) => {
        e.stopPropagation();
        const container = containerRef.current;
        if (!container) return;
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        setActiveHighlight(overlay.highlight);
        setSelection(null);
        setToolbarMode("highlight-menu");
        setNoteText(overlay.highlight.note || "");
        setToolbar({
          top: rect.bottom - containerRect.top + 8,
          left: Math.max(10, rect.left - containerRect.left),
        });
      };
      const handleColorSelect = async (color: HighlightColor) => {
        if (!selection || !isAuthenticated) return;
        // Clear browser selection first so user sees the highlight overlay replace it
        window.getSelection()?.removeAllRanges();
        setIsSaving(true);
        await createHighlight({
          contentType,
          contentId,
          startOffset: selection.startOffset,
          endOffset: selection.endOffset,
          selectedText: selection.text,
          color,
          contentHash: contentHash || undefined,
        });
        setIsSaving(false);
        closeToolbar();
      };
      const handleEditNote = () => {
        setToolbarMode("edit-note");
      };
      const handleSaveNote = async () => {
        if (!activeHighlight) return;
        setIsSaving(true);
        await updateHighlight(activeHighlight.id, {
          note: noteText.trim() || undefined,
          version: activeHighlight.version,
        });
        setIsSaving(false);
        closeToolbar();
      };
      const handleDelete = async () => {
        if (!activeHighlight) return;
        await deleteHighlight(activeHighlight.id);
        closeToolbar();
      };
      const handleChangeColor = async (color: HighlightColor) => {
        if (!activeHighlight) return;
        await updateHighlight(activeHighlight.id, {
          color,
          version: activeHighlight.version,
        });
        closeToolbar();
      };
      const handleRelocate = async () => {
        if (!activeHighlight || !contentRef.current) return;
        const currentText = getContentText(contentRef.current);
        const searchText = activeHighlight.selectedText;
        const index = currentText.indexOf(searchText);
        if (index !== -1) {
          setIsSaving(true);
          const newHash = await generateContentHash(currentText);
          await updateHighlight(activeHighlight.id, {
            version: activeHighlight.version,
          });
          // Note: We can't update offsets via the current API, so we delete and recreate
          await deleteHighlight(activeHighlight.id);
          await createHighlight({
            contentType,
            contentId,
            startOffset: index,
            endOffset: index + searchText.length,
            selectedText: searchText,
            color: activeHighlight.color as HighlightColor,
            note: activeHighlight.note || undefined,
            contentHash: newHash,
          });
          setIsSaving(false);
          closeToolbar();
        }
      };
      const [canRelocate, setCanRelocate] = useState(false);
      useEffect(() => {
        if (activeHighlight && contentRef.current) {
          const currentText = getContentText(contentRef.current);
          setCanRelocate(currentText.includes(activeHighlight.selectedText));
        } else {
          setCanRelocate(false);
        }
      }, [activeHighlight, activeHighlight?.id, activeHighlight?.selectedText, contentHash]);
      return (
        <div ref={containerRef} className={`relative ${className}`}>
          {/* Content */}
          <div ref={contentRef} className="relative">
            {children}
          </div>
          {/* Highlight Overlays */}
          {overlays.map((overlay) => {
            // Use stable key based on position to avoid re-animation when temp ID → server ID
            const stableKey = `${overlay.highlight.startOffset}-${overlay.highlight.endOffset}`;
            return (
            <div key={stableKey} data-highlight-overlay={overlay.id}>
              {overlay.rects.map((rect, idx) => (
                <div
                  key={`${stableKey}-${idx}`}
                  onClick={(e) => handleOverlayClick(overlay, e)}
                  className={`absolute pointer-events-auto cursor-pointer transition-all hover:brightness-110 ${
                    overlay.isStale ? "border-2 border-dashed border-yellow-500/70" : ""
                  }`}
                  style={{
                    top: rect.top - 2,
                    left: rect.left - 3,
                    width: rect.width + 6,
                    height: rect.height + 4,
                    backgroundColor: overlay.isStale ? `${overlay.color.replace("0.4", "0.25")}` : overlay.color,
                    borderRadius: "6px",
                    animation: "highlightFadeIn 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  title={overlay.isStale
                    ? "⚠️ Content may have changed - click to review"
                    : (overlay.highlight.note || "Click to manage")}
                />
              ))}
            </div>
            );
          })}
          {/* Toolbar */}
          {toolbar && (
            <div
              data-highlight-toolbar
              className="absolute z-[9999]"
              style={{
                top: Math.max(0, toolbar.top),
                left: Math.max(0, toolbar.left),
              }}
            >
              {/* Arrow pointer */}
              {toolbarMode === "colors" && (
                <div className="absolute -bottom-[6px] left-8 w-3 h-3 bg-gray-800 border-r border-b border-gray-700 transform rotate-45" />
              )}
              {(toolbarMode === "highlight-menu" || toolbarMode === "edit-note") && (
                <div className="absolute -top-[6px] left-8 w-3 h-3 bg-gray-800 border-l border-t border-gray-700 transform rotate-45" />
              )}
              <div className="bg-gray-800 rounded-md shadow-xl border border-gray-700 overflow-hidden">
                {!isAuthenticated ? (
                  <div className="px-3 py-2">
                    <span className="text-sm text-gray-400">Sign in to highlight</span>
                  </div>
                ) : toolbarMode === "colors" && selection ? (
                  /* Color Selection - click to highlight instantly */
                  <div className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {COLOR_OPTIONS.map(({ color, bg }) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          disabled={isSaving}
                          className="w-7 h-7 rounded-full hover:scale-110 transition-all opacity-80 hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                          style={{ backgroundColor: bg }}
                          title={`Highlight ${color}`}
                        />
                      ))}
                      {onAskAI && (
                        <>
                          <div className="w-px h-6 bg-gray-700 mx-0.5" />
                          <button
                            onClick={() => {
                              onAskAI(selection.text);
                              closeToolbar();
                            }}
                            className="flex items-center gap-1 px-2 h-7 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-md transition-colors border border-indigo-500/30"
                            title="Ask Thor AI about this text"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Ask Thor AI
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : toolbarMode === "highlight-menu" && activeHighlight ? (
                  /* Existing Highlight Menu */
                  <div className="w-72">
                    {/* Stale warning with original text and relocate */}
                    {isHighlightStale(activeHighlight.contentHash, contentHash) && (
                      <div className="px-4 py-3 bg-yellow-900/30 border-b border-yellow-700/50">
                        <p className="text-xs text-yellow-400 flex items-center gap-1.5 mb-2">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Content may have changed
                        </p>
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">Original text</p>
                        <p className="text-xs text-gray-400 italic line-clamp-3 mb-2">
                          &ldquo;{activeHighlight.selectedText.slice(0, 150)}{activeHighlight.selectedText.length > 150 ? "..." : ""}&rdquo;
                        </p>
                        {canRelocate && (
                          <button
                            onClick={handleRelocate}
                            disabled={isSaving}
                            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-md transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {isSaving ? "Relocating..." : "Relocate highlight"}
                          </button>
                        )}
                      </div>
                    )}
                    {/* Note section */}
                    {activeHighlight.note && (
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Note</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{activeHighlight.note}</p>
                      </div>
                    )}
                    {/* Color picker section */}
                    <div className="px-4 py-3 border-b border-gray-700/50">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2.5">Color</p>
                      <div className="flex items-center gap-2">
                        {COLOR_OPTIONS.map(({ color, bg }) => (
                          <button
                            key={color}
                            onClick={() => handleChangeColor(color)}
                            className={`w-7 h-7 rounded-full transition-all ${
                              activeHighlight.color === color
                                ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110"
                                : "hover:scale-110 opacity-80 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: bg }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Actions section */}
                    <div className="p-2">
                      <button
                        onClick={handleEditNote}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {activeHighlight.note ? "Edit Note" : "Add Note"}
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ) : toolbarMode === "edit-note" && activeHighlight ? (
                  /* Edit Note for Existing Highlight */
                  <div className="w-72 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">
                      {activeHighlight.note ? "Edit Note" : "Add Note"}
                    </p>
                    <textarea
                      ref={noteInputRef}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write your note..."
                      className="w-full h-24 px-3 py-2 text-sm bg-gray-900 border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                      maxLength={1000}
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setToolbarMode("highlight-menu")}
                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        disabled={isSaving}
                        className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors disabled:opacity-50 font-medium"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    export default Highlightable;
    ```
    **Category:** Anti-pattern
    **Severity:** minor

68. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/BinarySearchVisualizer.tsx`
    **Line:** 14-321
    ```typescript
    message: string;
    }
    
    export default function BinarySearchVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
      const [speed, setSpeed] = useState(800);
      const [nums] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17]);
      const [target] = useState(11);
      const [left, setLeft] = useState(0);
      const [right, setRight] = useState(8);
      const [mid, setMid] = useState(-1);
      const [found, setFound] = useState<number | null>(null);
      const [phase, setPhase] = useState<"init" | "running" | "done">("init");
      const [message, setMessage] = useState(`Click Play to search for ${target}`);
      const [stepIndex, setStepIndex] = useState(-1);
      const [eliminated, setEliminated] = useState<Set<number>>(new Set());
      const generateSteps = useCallback(() => {
        const allSteps: Step[] = [];
        let l = 0,
          r = nums.length - 1;
        while (l <= r) {
          const m = l + Math.floor((r - l) / 2);
          if (nums[m] === target) {
            allSteps.push({
              left: l,
              right: r,
              mid: m,
              comparison: "equal",
              message: `mid=${m}, nums[${m}]=${nums[m]} === ${target}. Found!`,
            });
            break;
          } else if (nums[m] < target) {
            allSteps.push({
              left: l,
              right: r,
              mid: m,
              comparison: "less",
              message: `mid=${m}, nums[${m}]=${nums[m]} < ${target}. Search right half.`,
            });
            l = m + 1;
          } else {
            allSteps.push({
              left: l,
              right: r,
              mid: m,
              comparison: "greater",
              message: `mid=${m}, nums[${m}]=${nums[m]} > ${target}. Search left half.`,
            });
            r = m - 1;
          }
        }
        return allSteps;
      }, [nums, target]);
      const steps = useMemo(() => generateSteps(), [generateSteps]);
      const reset = useCallback(() => {
        setLeft(0);
        setRight(nums.length - 1);
        setMid(-1);
        setFound(null);
        setEliminated(new Set());
        setPhase("init");
        setMessage(`Click Play to search for ${target}`);
        setStepIndex(-1);
        setIsPlaying(false);
      }, [nums.length, target]);
      useEffect(() => {
        if (!isPlaying) return;
        const timer = setTimeout(() => {
          if (phase === "init") {
            setPhase("running");
            setStepIndex(0);
            const step = steps[0];
            setLeft(step.left);
            setRight(step.right);
            setMid(step.mid);
            setMessage(step.message);
            if (step.comparison === "equal") {
              setFound(step.mid);
              setPhase("done");
              setIsPlaying(false);
            }
            return;
          }
          const nextStepIdx = stepIndex + 1;
          if (nextStepIdx >= steps.length) {
            setPhase("done");
            if (found === null) {
              setMessage(`Target ${target} not found in the array`);
            }
            setIsPlaying(false);
            return;
          }
          // Mark eliminated indices
          const prevStep = steps[stepIndex];
          const newEliminated = new Set(eliminated);
          if (prevStep.comparison === "less") {
            for (let i = prevStep.left; i <= prevStep.mid; i++) {
              newEliminated.add(i);
            }
          } else if (prevStep.comparison === "greater") {
            for (let i = prevStep.mid; i <= prevStep.right; i++) {
              newEliminated.add(i);
            }
          }
          setEliminated(newEliminated);
          const step = steps[nextStepIdx];
          setStepIndex(nextStepIdx);
          setLeft(step.left);
          setRight(step.right);
          setMid(step.mid);
          setMessage(step.message);
          if (step.comparison === "equal") {
            setFound(step.mid);
            setPhase("done");
            setIsPlaying(false);
          }
        }, speed);
        return () => clearTimeout(timer);
      }, [isPlaying, phase, stepIndex, steps, target, found, eliminated, speed]);
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Binary Search</h3>
            <p className="text-gray-400 text-sm mt-1">
              O(log n) search by halving the search space
            </p>
          </div>
          <div className="p-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={phase === "done"}
                className={`px-3 md:px-4 py-2 rounded-md font-medium text-sm md:text-base transition ${
                  isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                } disabled:opacity-50`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={reset}
                className="px-3 md:px-4 py-2 bg-gray-700 text-white rounded-md font-medium text-sm md:text-base hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-auto md:ml-4">
                <span className="text-gray-400 text-xs md:text-sm">Speed:</span>
                <input
                  type="range"
                  min="400"
                  max="1200"
                  step="100"
                  value={1600 - speed}
                  onChange={(e) => setSpeed(1600 - Number(e.target.value))}
                  className="w-16 md:w-20 accent-blue-500"
                />
              </div>
            </div>
            {/* Target */}
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md text-center">
              <span className="text-gray-400">Target: </span>
              <span className="text-blue-400 font-bold text-xl">{target}</span>
            </div>
            {/* Array visualization */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Sorted Array:</div>
              <div className="flex gap-1 justify-center flex-wrap">
                {nums.map((num, idx) => {
                  const isLeft = idx === left && phase !== "init";
                  const isRight = idx === right && phase !== "init";
                  const isMid = idx === mid;
                  const isFound = idx === found;
                  const isEliminated = eliminated.has(idx);
                  return (
                    <div key={`${num}-${idx}`} className="flex flex-col items-center">
                      <motion.div
                        animate={{
                          backgroundColor: isFound
                            ? "#22c55e"
                            : isMid
                              ? "#eab308"
                              : isEliminated
                                ? "#1f2937"
                                : "#4b5563",
                          opacity: isEliminated ? 0.4 : 1,
                          scale: isMid ? 1.15 : 1,
                        }}
                        className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm"
                      >
                        <span
                          className={isFound || isMid ? "text-black" : "text-white"}
                        >
                          {num}
                        </span>
                      </motion.div>
                      <div className="text-xs text-gray-500 mt-1">{idx}</div>
                      <div className="h-5 flex gap-0.5 mt-1">
                        {isLeft && (
                          <span className="text-blue-400 text-xs font-bold">L</span>
                        )}
                        {isMid && (
                          <span className="text-yellow-400 text-xs font-bold">
                            M
                          </span>
                        )}
                        {isRight && (
                          <span className="text-purple-400 text-xs font-bold">
                            R
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Pointers info */}
            {phase !== "init" && (
              <div className="mb-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 bg-blue-500/20 rounded-md">
                  <span className="text-blue-400">Left: {left}</span>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-md">
                  <span className="text-yellow-400">Mid: {mid}</span>
                </div>
                <div className="p-2 bg-purple-500/20 rounded-md">
                  <span className="text-purple-400">Right: {right}</span>
                </div>
              </div>
            )}
            {/* Result */}
            {found !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-md text-center"
              >
                <span className="text-green-400 font-bold text-lg">
                  Found {target} at index {found}!
                </span>
                <div className="text-gray-400 text-sm mt-1">
                  Completed in {stepIndex + 1} step{stepIndex > 0 ? "s" : ""} (log₂
                  {nums.length} ≈ {Math.ceil(Math.log2(nums.length))})
                </div>
              </motion.div>
            )}
            {/* Message */}
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-md text-sm ${
                phase === "done"
                  ? found !== null
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {message}
            </motion.div>
            {/* Legend */}
            <div className="mt-4 flex gap-4 text-xs justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-md bg-yellow-500" />
                <span className="text-gray-400">Mid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-md bg-green-500" />
                <span className="text-gray-400">Found</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-md bg-gray-700 opacity-40" />
                <span className="text-gray-400">Eliminated</span>
              </div>
            </div>
            {/* Key insight */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
              <p>
                <strong className="text-blue-400">Key Insight:</strong> Each
                comparison eliminates half the remaining elements. For n elements,
                we need at most log₂(n) comparisons.
              </p>
            </div>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

69. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/BSTValidationVisualizer.tsx`
    **Line:** 35-351
    ```typescript
    message: string;
    }
    
    export default function BSTValidationVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
      const [speed, setSpeed] = useState(900);
      const [stepIndex, setStepIndex] = useState(-1);
      const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
      const [invalidNode, setInvalidNode] = useState<number | null>(null);
      const [phase, setPhase] = useState<"init" | "running" | "done">("init");
      const [message, setMessage] = useState(
        "Click Play to validate BST with bounds checking"
      );
      const generateSteps = useCallback((): Step[] => {
        const result: Step[] = [];
        const validate = (
          node: TreeNode | null,
          min: number,
          max: number
        ): boolean => {
          if (!node) return true;
          const isValid = node.val > min && node.val < max;
          result.push({
            node: node.val,
            min,
            max,
            valid: isValid,
            message: isValid
              ? `Node ${node.val}: ${min} < ${node.val} < ${max} ✓`
              : `Node ${node.val}: NOT in range (${min}, ${max}) ✗`,
          });
          if (!isValid) return false;
          return (
            validate(node.left, min, node.val) &&
            validate(node.right, node.val, max)
          );
        };
        validate(invalidTree, -Infinity, Infinity);
        return result;
      }, []);
      const steps = useMemo(() => generateSteps(), [generateSteps]);
      const reset = useCallback(() => {
        setStepIndex(-1);
        setVisitedNodes([]);
        setInvalidNode(null);
        setPhase("init");
        setMessage("Click Play to validate BST with bounds checking");
        setIsPlaying(false);
      }, []);
      useEffect(() => {
        if (!isPlaying) return;
        const timer = setTimeout(() => {
          if (phase === "init") {
            setPhase("running");
            setStepIndex(0);
            setMessage("Starting validation with range (-∞, +∞)");
          } else if (phase === "running") {
            if (stepIndex >= steps.length) {
              setPhase("done");
              const isValid = !invalidNode;
              setMessage(
                isValid
                  ? "Valid BST!"
                  : `Invalid BST! Node ${invalidNode} violates BST property.`
              );
              setIsPlaying(false);
              return;
            }
            const step = steps[stepIndex];
            setVisitedNodes((prev) => [...prev, step.node]);
            setMessage(step.message);
            if (!step.valid) {
              setInvalidNode(step.node);
              setPhase("done");
              setMessage(
                `Invalid! Node ${step.node} is NOT in valid range (${step.min === -Infinity ? "-∞" : step.min}, ${step.max === Infinity ? "+∞" : step.max})`
              );
              setIsPlaying(false);
              return;
            }
            setStepIndex(stepIndex + 1);
          }
        }, speed);
        return () => clearTimeout(timer);
      }, [isPlaying, phase, stepIndex, steps, invalidNode, speed]);
      const currentStep =
        stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;
      const getNodePosition = (val: number): { x: number; y: number } => {
        const positions: Record<number, { x: number; y: number }> = {
          5: { x: 150, y: 30 },
          4: { x: 75, y: 100 },
          7: { x: 225, y: 100 },
          6: { x: 112, y: 170 },
        };
        return positions[val] || { x: 0, y: 0 };
      };
      const renderNode = (val: number) => {
        const pos = getNodePosition(val);
        const isVisited = visitedNodes.includes(val);
        const isInvalid = invalidNode === val;
        const isCurrent = currentStep?.node === val;
        return (
          <motion.g key={val}>
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={22}
              animate={{
                fill: isInvalid
                  ? "#ef4444"
                  : isCurrent
                    ? "#eab308"
                    : isVisited
                      ? "#22c55e"
                      : "#374151",
                scale: isCurrent ? 1.2 : 1,
              }}
              className="stroke-gray-600 stroke-2"
            />
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              className={`text-sm font-bold ${isCurrent || isInvalid ? "fill-black" : "fill-white"}`}
            >
              {val}
            </text>
          </motion.g>
        );
      };
      const renderEdge = (from: number, to: number) => {
        const fromPos = getNodePosition(from);
        const toPos = getNodePosition(to);
        return (
          <line
            key={`${from}-${to}`}
            x1={fromPos.x}
            y1={fromPos.y + 22}
            x2={toPos.x}
            y2={toPos.y - 22}
            className="stroke-gray-600 stroke-2"
          />
        );
      };
      const formatBound = (val: number) => {
        if (val === -Infinity) return "-∞";
        if (val === Infinity) return "+∞";
        return val.toString();
      };
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">BST Validation</h3>
            <p className="text-gray-400 text-sm mt-1">
              Validate BST by passing min/max bounds down the tree
            </p>
          </div>
          <div className="p-4">
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={phase === "done"}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                } disabled:opacity-50`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="400"
                  max="1500"
                  step="100"
                  value={1900 - speed}
                  onChange={(e) => setSpeed(1900 - Number(e.target.value))}
                  className="w-20 accent-orange-500"
                />
              </div>
            </div>
            {/* Tree visualization */}
            <div className="mb-4 flex justify-center">
              <svg width="300" height="220" className="bg-gray-800/30 rounded-md">
                {/* Edges */}
                {renderEdge(5, 4)}
                {renderEdge(5, 7)}
                {renderEdge(4, 6)}
                {/* Nodes */}
                {[5, 4, 7, 6].map(renderNode)}
                {/* Labels showing bounds */}
                <text
                  x="150"
                  y="70"
                  textAnchor="middle"
                  className="fill-gray-500 text-xs"
                >
                  root
                </text>
              </svg>
            </div>
            {/* Current bounds */}
            {currentStep && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-md"
              >
                <div className="text-sm text-gray-400 mb-1">Current Check:</div>
                <div className="font-mono text-lg">
                  <span className="text-gray-400">
                    {formatBound(currentStep.min)}
                  </span>
                  <span className="text-orange-400"> &lt; </span>
                  <span
                    className={
                      currentStep.valid ? "text-green-400" : "text-red-400"
                    }
                  >
                    {currentStep.node}
                  </span>
                  <span className="text-orange-400"> &lt; </span>
                  <span className="text-gray-400">
                    {formatBound(currentStep.max)}
                  </span>
                  <span
                    className={`ml-2 ${currentStep.valid ? "text-green-400" : "text-red-400"}`}
                  >
                    {currentStep.valid ? "✓" : "✗"}
                  </span>
                </div>
              </motion.div>
            )}
            {/* Explanation of the invalid node */}
            <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
              <div className="text-sm text-gray-400">
                <strong className="text-orange-400">Tree Structure:</strong> Node 6
                is in the RIGHT subtree of node 4, but 4 is in the LEFT subtree of
                root 5. So 6 must be less than 5, but it&apos;s not!
              </div>
            </div>
            {/* Validation history */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Validation Steps:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {steps.slice(0, stepIndex + 1).map((step, idx) => (
                  <div
                    key={`step-${step.node}-${step.min}-${step.max}-${idx}`}
                    className={`text-sm font-mono px-2 py-1 rounded-md ${
                      step.valid ? "text-green-400" : "text-red-400 bg-red-500/10"
                    }`}
                  >
                    {formatBound(step.min)} &lt; {step.node} &lt;{" "}
                    {formatBound(step.max)} {step.valid ? "✓" : "✗"}
                  </div>
                ))}
              </div>
            </div>
            {/* Message */}
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-md text-sm ${
                phase === "done"
                  ? invalidNode
                    ? "bg-red-500/10 border border-red-500/30 text-red-400"
                    : "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {message}
            </motion.div>
            {/* Algorithm explanation */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
              <p>
                <strong className="text-orange-400">Key Insight:</strong> Pass valid
                range (min, max) DOWN the tree. Left child inherits (min, node.val),
                right child inherits (node.val, max).
              </p>
            </div>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

70. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/CallStackVisualizer.tsx`
    **Line:** 19-418
    ```typescript
    inputValue?: number;
    }
    
    export default function CallStackVisualizer({
      example = "factorial",
      inputValue = 5,
    }: CallStackVisualizerProps) {
      type PlaybackState = {
        step: number;
        stack: StackFrame[];
        result: number | null;
        isPlaying: boolean;
      };
      const initialPlayback: PlaybackState = {
        step: 0,
        stack: [],
        result: null,
        isPlaying: false,
      };
      function playbackReducer(
        state: PlaybackState,
        action:
          | { type: "RESET" }
          | { type: "STEP_FORWARD"; allSteps: StackFrame[][] }
          | { type: "SET_RESULT"; payload: number | null }
          | { type: "SET_PLAYING"; payload: boolean }
          | { type: "FINISHED"; result: number }
      ): PlaybackState {
        switch (action.type) {
          case "RESET":
            return initialPlayback;
          case "STEP_FORWARD": {
            const nextStep = state.step + 1;
            return {
              ...state,
              stack: action.allSteps[state.step] || [],
              step: nextStep,
            };
          }
          case "SET_RESULT":
            return { ...state, result: action.payload };
          case "SET_PLAYING":
            return { ...state, isPlaying: action.payload };
          case "FINISHED":
            return { ...state, isPlaying: false, result: action.result };
          default:
            return state;
        }
      }
      const [playback, dispatch] = useReducer(playbackReducer, initialPlayback);
      const { step, stack, result, isPlaying } = playback;
      const [speed, setSpeed] = useState(1000);
      const generateFactorialSteps = useCallback((n: number): StackFrame[][] => {
        const steps: StackFrame[][] = [];
        const buildStack: StackFrame[] = [];
        let frameId = 0;
        for (let i = n; i >= 0; i--) {
          buildStack.push({
            id: frameId++,
            functionName: "factorial",
            args: `n = ${i}`,
          });
          steps.push([...buildStack]);
        }
        let returnVal = 1;
        for (let i = buildStack.length - 1; i >= 0; i--) {
          buildStack[i] = {
            ...buildStack[i],
            returnValue: `${returnVal}`,
            isReturning: true,
          };
          steps.push([...buildStack]);
          buildStack.pop();
          steps.push([...buildStack]);
          if (i > 0) returnVal *= n - i + 1;
        }
        return steps;
      }, []);
      const generateFibonacciSteps = useCallback((n: number): StackFrame[][] => {
        const steps: StackFrame[][] = [];
        const currentStack: StackFrame[] = [];
        let frameId = 0;
        function simulate(num: number, depth: number): number {
          const frame: StackFrame = {
            id: frameId++,
            functionName: "fib",
            args: `n = ${num}`,
          };
          currentStack.push(frame);
          steps.push([...currentStack]);
          if (num <= 1) {
            currentStack[currentStack.length - 1] = {
              ...frame,
              returnValue: `${num}`,
              isReturning: true,
            };
            steps.push([...currentStack]);
            currentStack.pop();
            steps.push([...currentStack]);
            return num;
          }
          const left = simulate(num - 1, depth + 1);
          const right = simulate(num - 2, depth + 1);
          const result = left + right;
          if (currentStack.length > 0) {
            const idx = currentStack.findIndex((f) => f.id === frame.id);
            if (idx !== -1) {
              currentStack[idx] = {
                ...frame,
                returnValue: `${result}`,
                isReturning: true,
              };
              steps.push([...currentStack]);
              currentStack.splice(idx, 1);
              steps.push([...currentStack]);
            }
          }
          return result;
        }
        if (n <= 5) simulate(n, 0);
        return steps;
      }, []);
      const generateSumSteps = useCallback((n: number): StackFrame[][] => {
        const steps: StackFrame[][] = [];
        const buildStack: StackFrame[] = [];
        let frameId = 0;
        for (let i = n; i >= 1; i--) {
          buildStack.push({
            id: frameId++,
            functionName: "sum",
            args: `n = ${i}`,
          });
          steps.push([...buildStack]);
        }
        buildStack.push({
          id: frameId++,
          functionName: "sum",
          args: `n = 0`,
        });
        steps.push([...buildStack]);
        let returnVal = 0;
        for (let i = buildStack.length - 1; i >= 0; i--) {
          const currentN = i === buildStack.length - 1 ? 0 : n - i;
          buildStack[i] = {
            ...buildStack[i],
            returnValue: `${returnVal}`,
            isReturning: true,
          };
          steps.push([...buildStack]);
          buildStack.pop();
          steps.push([...buildStack]);
          returnVal += currentN + 1;
        }
        return steps;
      }, []);
      const allSteps = useMemo(() => {
        let steps: StackFrame[][];
        switch (example) {
          case "fibonacci":
            steps = generateFibonacciSteps(Math.min(inputValue, 5));
            break;
          case "sum":
            steps = generateSumSteps(inputValue);
            break;
          default:
            steps = generateFactorialSteps(inputValue);
        }
        return steps;
      }, [
        example,
        inputValue,
        generateFactorialSteps,
        generateFibonacciSteps,
        generateSumSteps,
      ]);
      useEffect(() => {
        dispatch({ type: "RESET" });
      }, [
        example,
        inputValue,
        generateFactorialSteps,
        generateFibonacciSteps,
        generateSumSteps,
      ]);
      useEffect(() => {
        if (!isPlaying || step >= allSteps.length) {
          if (step >= allSteps.length && allSteps.length > 0) {
            if (example === "factorial") {
              let r = 1;
              for (let i = 2; i <= inputValue; i++) r *= i;
              dispatch({ type: "FINISHED", result: r });
            } else if (example === "sum") {
              dispatch({ type: "FINISHED", result: (inputValue * (inputValue + 1)) / 2 });
            } else {
              const fib = (n: number): number =>
                n <= 1 ? n : fib(n - 1) + fib(n - 2);
              dispatch({ type: "FINISHED", result: fib(inputValue) });
            }
          }
          return;
        }
        const timer = setTimeout(() => {
          dispatch({ type: "STEP_FORWARD", allSteps });
        }, speed);
        return () => clearTimeout(timer);
      }, [isPlaying, step, allSteps, speed, example, inputValue]);
      const reset = () => {
        dispatch({ type: "RESET" });
      };
      const stepForward = () => {
        if (step < allSteps.length) {
          dispatch({ type: "STEP_FORWARD", allSteps });
        }
      };
      const exampleCode = {
        factorial: `public int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }`,
        fibonacci: `public int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }`,
        sum: `public int sum(int n) {
        if (n == 0) return 0;
        return n + sum(n - 1);
    }`,
      };
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gray-800/50 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Call Stack Visualizer
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Watch how recursive calls build up on the stack
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4 p-4">
            <div>
              <div className="mb-4">
                <CodeBlock
                  code={exampleCode[example]}
                  language="java"
                  showCopy={false}
                />
              </div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => dispatch({ type: "SET_PLAYING", payload: !isPlaying })}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    isPlaying
                      ? "bg-yellow-500 text-black hover:bg-yellow-400"
                      : "bg-green-500 text-white hover:bg-green-400"
                  }`}
                >
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>
                <button
                  onClick={stepForward}
                  disabled={isPlaying || step >= allSteps.length}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md font-medium hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Step →
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={2200 - speed}
                  onChange={(e) => setSpeed(2200 - Number(e.target.value))}
                  className="w-32 accent-indigo-500"
                />
                <span className="text-gray-500 text-xs">{speed}ms</span>
              </div>
              {result !== null && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md">
                  <span className="text-green-400 font-medium">
                    Result: {result}
                  </span>
                </div>
              )}
            </div>
            <div className="bg-gray-800/50 rounded-md p-4 min-h-[300px]">
              <div className="text-sm text-gray-400 mb-3 flex justify-between">
                <span>
                  Call Stack (Step {step}/{allSteps.length})
                </span>
                <span className="text-indigo-400">{stack.length} frames</span>
              </div>
              <div className="space-y-2">
                {stack.length === 0 ? (
                  <div className="text-gray-600 text-center py-8">
                    Stack is empty. Click Play to start.
                  </div>
                ) : (
                  [...stack].reverse().map((frame, idx) => (
                    <div
                      key={frame.id}
                      className={`p-3 rounded-md border transition-all duration-300 ${
                        frame.isReturning
                          ? "bg-green-500/20 border-green-500/50 animate-pulse"
                          : idx === 0
                            ? "bg-indigo-500/20 border-indigo-500/50"
                            : "bg-gray-700/50 border-gray-700"
                      }`}
                      style={{
                        animation: !frame.isReturning
                          ? "slideIn 0.3s ease-out"
                          : undefined,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm">
                          <span
                            className={
                              frame.isReturning
                                ? "text-green-400"
                                : "text-indigo-400"
                            }
                          >
                            {frame.functionName}
                          </span>
                          <span className="text-gray-400">({frame.args})</span>
                        </span>
                        {frame.returnValue && (
                          <span className="text-green-400 text-sm font-mono">
                            → {frame.returnValue}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500">
                  ↑ Top of stack (most recent call)
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`None
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

71. **`playbackReducer` has a cyclomatic complexity of 7 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/CallStackVisualizer.tsx`
    **Line:** 37
    ```typescript
    isPlaying: false,
      };
    
      function playbackReducer(
        state: PlaybackState,
        action:
          | { type: "RESET" }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

72. **Unexpected redeclaration of read-only global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/ConnectedComponentsVisualizer.tsx`
    **Line:** 11-16
    ```typescript
    to: number;
    }
    
    function find(p: number[], x: number): number {
      if (p[x] !== x) {
        return find(p, p[x]);
      }
      return x;
    }
    
    export default function ConnectedComponentsVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
    ```
    **Category:** Anti-pattern
    **Severity:** minor

73. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/ConnectedComponentsVisualizer.tsx`
    **Line:** 18-313
    ```typescript
    return x;
    }
    
    export default function ConnectedComponentsVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
      const [speed, setSpeed] = useState(1000);
      const [parent, setParent] = useState([0, 1, 2, 3, 4, 5]);
      const [rank, setRank] = useState([0, 0, 0, 0, 0, 0]);
      const [componentCount, setComponentCount] = useState(6);
      const [edges] = useState<Edge[]>([
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
        { from: 2, to: 5 },
      ]);
      const [edgeIndex, setEdgeIndex] = useState(-1);
      const [processedEdges, setProcessedEdges] = useState<number[]>([]);
      const [phase, setPhase] = useState<"init" | "running" | "done">("init");
      const [message, setMessage] = useState("Click Play to merge components");
      const nodePositions = [
        { x: 60, y: 50 }, // 0
        { x: 160, y: 50 }, // 1
        { x: 260, y: 50 }, // 2
        { x: 60, y: 150 }, // 3
        { x: 160, y: 150 }, // 4
        { x: 260, y: 150 }, // 5
      ];
      const reset = useCallback(() => {
        setParent([0, 1, 2, 3, 4, 5]);
        setRank([0, 0, 0, 0, 0, 0]);
        setComponentCount(6);
        setEdgeIndex(-1);
        setProcessedEdges([]);
        setPhase("init");
        setMessage("Click Play to merge components");
        setIsPlaying(false);
      }, []);
      const getComponentColor = useCallback(
        (node: number, p: number[]): string => {
          const root = find(p, node);
          const colors = [
            "#ef4444", // red
            "#22c55e", // green
            "#3b82f6", // blue
            "#eab308", // yellow
            "#a855f7", // purple
            "#f97316", // orange
          ];
          return colors[root % colors.length];
        },
        []
      );
      useEffect(() => {
        if (!isPlaying) return;
        const timer = setTimeout(() => {
          if (phase === "init") {
            setPhase("running");
            setEdgeIndex(0);
            setMessage("Processing edges to find connected components...");
            return;
          }
          if (edgeIndex >= edges.length) {
            setPhase("done");
            setMessage(
              `Done! Found ${componentCount} connected component${componentCount !== 1 ? "s" : ""}`
            );
            setIsPlaying(false);
            return;
          }
          const edge = edges[edgeIndex];
          const rootFrom = find(parent, edge.from);
          const rootTo = find(parent, edge.to);
          if (rootFrom === rootTo) {
            setMessage(
              `Edge (${edge.from}, ${edge.to}): Already connected (same root = ${rootFrom})`
            );
          } else {
            // Perform union
            const newParent = [...parent];
            const newRank = [...rank];
            if (newRank[rootFrom] < newRank[rootTo]) {
              newParent[rootFrom] = rootTo;
            } else if (newRank[rootFrom] > newRank[rootTo]) {
              newParent[rootTo] = rootFrom;
            } else {
              newParent[rootTo] = rootFrom;
              newRank[rootFrom]++;
            }
            setParent(newParent);
            setRank(newRank);
            setComponentCount((prev) => prev - 1);
            setMessage(
              `Edge (${edge.from}, ${edge.to}): Merging components! Count: ${componentCount} → ${componentCount - 1}`
            );
          }
          setProcessedEdges((prev) => [...prev, edgeIndex]);
          setEdgeIndex(edgeIndex + 1);
        }, speed);
        return () => clearTimeout(timer);
      }, [
        isPlaying,
        phase,
        edgeIndex,
        edges,
        parent,
        rank,
        componentCount,
        speed,
      ]);
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              Connected Components
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Watch components merge as edges are processed
            </p>
          </div>
          <div className="p-4">
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={phase === "done"}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                } disabled:opacity-50`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="500"
                  max="1500"
                  step="100"
                  value={2000 - speed}
                  onChange={(e) => setSpeed(2000 - Number(e.target.value))}
                  className="w-20 accent-purple-500"
                />
              </div>
            </div>
            {/* Component count */}
            <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-md text-center">
              <span className="text-gray-400">Components: </span>
              <motion.span
                key={componentCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="text-purple-400 font-bold text-2xl"
              >
                {componentCount}
              </motion.span>
            </div>
            {/* Graph visualization */}
            <div className="mb-4 flex justify-center">
              <svg width="320" height="200" className="bg-gray-800/30 rounded-md">
                {/* Draw edges */}
                {edges.map((edge, idx) => {
                  const from = nodePositions[edge.from];
                  const to = nodePositions[edge.to];
                  const isProcessed = processedEdges.includes(idx);
                  const isCurrent = idx === edgeIndex;
                  return (
                    <motion.line
                      key={`edge-${idx}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      animate={{
                        stroke: isCurrent
                          ? "#eab308"
                          : isProcessed
                            ? "#22c55e"
                            : "#4b5563",
                        strokeWidth: isCurrent ? 4 : 2,
                      }}
                      strokeDasharray={isProcessed ? "0" : "5,5"}
                    />
                  );
                })}
                {/* Draw nodes */}
                {nodePositions.map((pos, idx) => (
                  <g key={`node-${idx}`}>
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={24}
                      animate={{
                        fill: getComponentColor(idx, parent),
                      }}
                      className="stroke-white stroke-2"
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 5}
                      textAnchor="middle"
                      className="fill-white text-sm font-bold"
                    >
                      {idx}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            {/* Edges list */}
            <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
              <div className="text-sm text-gray-400 mb-2">Edges to process:</div>
              <div className="flex gap-2 flex-wrap">
                {edges.map((edge, idx) => (
                  <div
                    key={`edge-${edge.from}-${edge.to}-${idx}`}
                    className={`px-2 py-1 rounded-md text-xs font-mono ${
                      processedEdges.includes(idx)
                        ? "bg-green-500/30 text-green-300"
                        : idx === edgeIndex
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    ({edge.from}, {edge.to})
                  </div>
                ))}
              </div>
            </div>
            {/* Parent array */}
            <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
              <div className="text-sm text-gray-400 mb-2">parent[] array:</div>
              <div className="flex gap-2 justify-center">
                {parent.map((p, i) => (
                  <div key={`parent-${i}-${p}`} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">{i}</div>
                    <motion.div
                      animate={{ backgroundColor: getComponentColor(i, parent) }}
                      className="w-8 h-8 rounded-md flex items-center justify-center font-mono text-sm text-white"
                    >
                      {p}
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
            {/* Message */}
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-md text-sm ${
                phase === "done"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {message}
            </motion.div>
            {/* Key insight */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
              <p>
                <strong className="text-purple-400">Key Insight:</strong> Start with
                n components. Each successful union decreases count by 1. Nodes with
                same color belong to same component.
              </p>
            </div>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

74. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/ConsecutiveSequenceVisualizer.tsx`
    **Line:** 33-372
    ```typescript
    sequenceId: null,
    }));
    
    export default function ConsecutiveSequenceVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
      const [speed, setSpeed] = useState(600);
      const [numbers, setNumbers] = useState<NumberState[]>(INITIAL_NUMBERS);
      const [numSet, setNumSet] = useState<Set<number>>(new Set());
      const [currentNum, setCurrentNum] = useState<number | null>(null);
      const [currentSequence, setCurrentSequence] = useState<number[]>([]);
      const [longestSequence, setLongestSequence] = useState<number[]>([]);
      const [phase, setPhase] = useState<
        "init" | "building-set" | "scanning" | "extending" | "done"
      >("init");
      const [scanIndex, setScanIndex] = useState(0);
      const [sequenceCount, setSequenceCount] = useState(0);
      const [message, setMessage] = useState(
        "Click Play to find longest consecutive sequence"
      );
      const reset = useCallback(() => {
        const nums = INITIAL_NUMS.map((n) => ({
          value: n,
          state: "unseen" as const,
          sequenceId: null,
        }));
        setNumbers(nums);
        setNumSet(new Set());
        setCurrentNum(null);
        setCurrentSequence([]);
        setLongestSequence([]);
        setPhase("init");
        setScanIndex(0);
        setSequenceCount(0);
        setMessage("Click Play to find longest consecutive sequence");
        setIsPlaying(false);
      }, []);
      useEffect(() => {
        if (!isPlaying) return;
        const timer = setTimeout(() => {
          if (phase === "init") {
            setPhase("building-set");
            setMessage("Step 1: Building HashSet from array for O(1) lookups");
          } else if (phase === "building-set") {
            const newSet = new Set(INITIAL_NUMS);
            setNumSet(newSet);
            const newNumbers = numbers.map((n) => ({
              ...n,
              state: "inSet" as const,
            }));
            setNumbers(newNumbers);
            setPhase("scanning");
            setMessage(
              "Step 2: Scan each number, only start counting from sequence beginnings"
            );
          } else if (phase === "scanning") {
            if (scanIndex >= numbers.length) {
              setPhase("done");
              setMessage(
                `Done! Longest consecutive sequence: [${longestSequence.join(", ")}] with length ${longestSequence.length}`
              );
              setIsPlaying(false);
              return;
            }
            const num = numbers[scanIndex].value;
            setCurrentNum(num);
            const newNumbers = [...numbers];
            const idx = newNumbers.findIndex((n) => n.value === num);
            newNumbers[idx] = { ...newNumbers[idx], state: "checking" };
            setNumbers(newNumbers);
            if (numSet.has(num - 1)) {
              setMessage(
                `${num}: Has predecessor (${num - 1} exists), skip - not a sequence start`
              );
              setTimeout(() => {
                const updated = [...newNumbers];
                updated[idx] = { ...updated[idx], state: "notStart" };
                setNumbers(updated);
                setScanIndex(scanIndex + 1);
              }, speed / 2);
            } else {
              setMessage(
                `${num}: No predecessor (${num - 1} not in set) - this is a sequence START!`
              );
              setPhase("extending");
              setCurrentSequence([num]);
              setSequenceCount(sequenceCount + 1);
              const updated = [...newNumbers];
              updated[idx] = {
                ...updated[idx],
                state: "sequenceStart",
                sequenceId: sequenceCount,
              };
              setNumbers(updated);
            }
          } else if (phase === "extending") {
            const lastNum = currentSequence[currentSequence.length - 1];
            const nextNum = lastNum + 1;
            if (numSet.has(nextNum)) {
              const newSequence = [...currentSequence, nextNum];
              setCurrentSequence(newSequence);
              setMessage(
                `Extending: ${lastNum} + 1 = ${nextNum} exists in set! Sequence: [${newSequence.join(", ")}]`
              );
              const newNumbers = [...numbers];
              const idx = newNumbers.findIndex((n) => n.value === nextNum);
              if (idx !== -1) {
                newNumbers[idx] = {
                  ...newNumbers[idx],
                  state: "inSequence",
                  sequenceId: sequenceCount,
                };
                setNumbers(newNumbers);
              }
            } else {
              setMessage(
                `${nextNum} not in set. Sequence complete: [${currentSequence.join(", ")}] length = ${currentSequence.length}`
              );
              if (currentSequence.length > longestSequence.length) {
                setLongestSequence([...currentSequence]);
              }
              setCurrentSequence([]);
              setPhase("scanning");
              setScanIndex(scanIndex + 1);
            }
          }
        }, speed);
        return () => clearTimeout(timer);
      }, [
        isPlaying,
        phase,
        scanIndex,
        numbers,
        numSet,
        currentSequence,
        longestSequence,
        sequenceCount,
        speed,
      ]);
      const getNumberStyle = (num: NumberState) => {
        switch (num.state) {
          case "checking":
            return "bg-yellow-500 text-black ring-2 ring-yellow-300";
          case "sequenceStart":
          case "inSequence":
            return `${SEQUENCE_COLORS[num.sequenceId! % SEQUENCE_COLORS.length]} text-white`;
          case "notStart":
            return "bg-gray-600 text-gray-400";
          case "inSet":
            return "bg-gray-700 text-gray-300";
          default:
            return "bg-gray-800 text-gray-500";
        }
      };
      const sortedDisplay = [...numbers].sort((a, b) => a.value - b.value);
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              Longest Consecutive Sequence
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Use HashSet to find consecutive sequences in O(n)
            </p>
          </div>
          <div className="p-4">
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={phase === "done"}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                } disabled:opacity-50`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="300"
                  max="1200"
                  step="100"
                  value={1500 - speed}
                  onChange={(e) => setSpeed(1500 - Number(e.target.value))}
                  className="w-20 accent-teal-500"
                />
              </div>
            </div>
            {/* Original Array */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Original array (unsorted):
              </div>
              <div className="flex flex-wrap gap-2">
                {numbers.map((num, idx) => (
                  <motion.div
                    key={`num-${num.value}-${idx}`}
                    animate={{
                      scale: num.value === currentNum ? 1.1 : 1,
                    }}
                    className={`w-14 h-14 rounded-md flex items-center justify-center font-mono text-lg font-bold transition-colors ${getNumberStyle(num)}`}
                  >
                    {num.value}
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Sorted View (conceptual) */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">
                Sorted view (for visualization only):
              </div>
              <div className="flex gap-1 items-end">
                {sortedDisplay.map((num) => (
                  <motion.div
                    key={num.value}
                    layout
                    className={`w-10 rounded-t-md flex items-center justify-center font-mono text-sm font-bold transition-colors ${getNumberStyle(num)}`}
                    style={{
                      height: `${Math.max(30, Math.min(80, num.value / 2))}px`,
                    }}
                  >
                    {num.value}
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Current Sequence */}
            {currentSequence.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-md"
              >
                <div className="text-xs text-gray-500 mb-1">Current Sequence:</div>
                <div className="flex gap-2 items-center">
                  {currentSequence.map((num, i) => (
                    <React.Fragment key={num}>
                      <span className="px-3 py-1 bg-teal-500 text-white rounded-md font-mono font-bold">
                        {num}
                      </span>
                      {i < currentSequence.length - 1 && (
                        <span className="text-teal-400">→</span>
                      )}
                    </React.Fragment>
                  ))}
                  <span className="ml-2 text-teal-400 font-bold">
                    Length: {currentSequence.length}
                  </span>
                </div>
              </motion.div>
            )}
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {longestSequence.length}
                </div>
                <div className="text-xs text-gray-500">Longest Found</div>
                {longestSequence.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    [{longestSequence.join(", ")}]
                  </div>
                )}
              </div>
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {sequenceCount}
                </div>
                <div className="text-xs text-gray-500">Sequences Found</div>
              </div>
            </div>
            {/* Message */}
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-md text-sm ${
                phase === "done"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {message}
            </motion.div>
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-yellow-500" />
                <span className="text-gray-400">Checking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-green-500" />
                <span className="text-gray-400">In Sequence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-gray-600" />
                <span className="text-gray-400">Not Start</span>
              </div>
            </div>
            {/* Algorithm explanation */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
              <p>
                <strong className="text-teal-400">Key Insight:</strong> Only start
                counting from sequence beginnings (numbers where n-1 doesn&apos;t
                exist). Each number is visited at most twice: once in scan, once
                when extending a sequence. O(n) total.
              </p>
            </div>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

75. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/CycleDetectionVisualizer.tsx`
    **Line:** 10-15
    ```typescript
    const nodes = [1, 2, 3, 4, 5];
    const cycleStartIdx = 2; // Node 3 is the cycle start
    
    function getNextIdx(idx: number): number {
      if (idx === nodes.length - 1) {
        return cycleStartIdx; // Last node points back to cycle start
      }
      return idx + 1;
    }
    
    export default function CycleDetectionVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
    ```
    **Category:** Anti-pattern
    **Severity:** minor

76. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/CycleDetectionVisualizer.tsx`
    **Line:** 17-348
    ```typescript
    return idx + 1;
    }
    
    export default function CycleDetectionVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
      const [speed, setSpeed] = useState(800);
      const [slowIdx, setSlowIdx] = useState(0);
      const [fastIdx, setFastIdx] = useState(0);
      const [step, setStep] = useState(0);
      const [phase, setPhase] = useState<
        "init" | "detecting" | "found" | "finding-start" | "done"
      >("init");
      const [message, setMessage] = useState(
        "Click Play to detect cycle using Floyd's algorithm"
      );
      const [visitedSlow, setVisitedSlow] = useState<Set<number>>(new Set());
      const [visitedFast, setVisitedFast] = useState<Set<number>>(new Set());
      // Linked list with cycle: 1 -> 2 -> 3 -> 4 -> 5 -> 3 (cycle back to index 2)
    None
      const reset = useCallback(() => {
        setSlowIdx(0);
        setFastIdx(0);
        setStep(0);
        setPhase("init");
        setVisitedSlow(new Set());
        setVisitedFast(new Set());
        setMessage("Click Play to detect cycle using Floyd's algorithm");
        setIsPlaying(false);
      }, []);
      useEffect(() => {
        if (!isPlaying) return;
        const timer = setTimeout(() => {
          if (phase === "init") {
            setPhase("detecting");
            setMessage("Start: Both pointers at head. Slow moves 1, Fast moves 2.");
            setVisitedSlow(new Set([0]));
            setVisitedFast(new Set([0]));
          } else if (phase === "detecting") {
            const newSlowIdx = getNextIdx(slowIdx);
            const newFastIdx = getNextIdx(getNextIdx(fastIdx));
            setStep(step + 1);
            setSlowIdx(newSlowIdx);
            setFastIdx(newFastIdx);
            setVisitedSlow(new Set([...visitedSlow, newSlowIdx]));
            setVisitedFast(new Set([...visitedFast, newFastIdx]));
            if (newSlowIdx === newFastIdx) {
              setPhase("found");
              setMessage(
                `Step ${step + 1}: CYCLE DETECTED! Slow and Fast meet at node ${nodes[newSlowIdx]}`
              );
            } else {
              setMessage(
                `Step ${step + 1}: Slow at ${nodes[newSlowIdx]}, Fast at ${nodes[newFastIdx]}`
              );
            }
          } else if (phase === "found") {
            setSlowIdx(0);
            setPhase("finding-start");
            setMessage(
              "Now find cycle start: Move slow to head, both move 1 step at a time"
            );
          } else if (phase === "finding-start") {
            if (slowIdx === 0 && fastIdx !== 0) {
              // First step after reset
              setSlowIdx(0);
              setMessage(
                `Slow at head (${nodes[0]}), Fast at ${nodes[fastIdx]}. Both move 1 step.`
              );
            }
            const nextSlow =
              slowIdx === 0 ? getNextIdx(slowIdx) : getNextIdx(slowIdx);
            const nextFast = getNextIdx(fastIdx);
            setSlowIdx(nextSlow);
            setFastIdx(nextFast);
            if (nextSlow === nextFast) {
              setPhase("done");
              setMessage(
                `Cycle starts at node ${nodes[nextSlow]}! Both pointers meet at the cycle entry.`
              );
              setIsPlaying(false);
            } else {
              setMessage(
                `Moving: Slow to ${nodes[nextSlow]}, Fast to ${nodes[nextFast]}`
              );
            }
          }
        }, speed);
        return () => clearTimeout(timer);
      }, [
        isPlaying,
        phase,
        slowIdx,
        fastIdx,
        step,
        visitedSlow,
        visitedFast,
        speed,
      ]);
      // Calculate positions for circular layout of cycle
      const getNodePosition = (idx: number) => {
        if (idx < cycleStartIdx) {
          // Linear part before cycle
          return { x: 60 + idx * 80, y: 60 };
        }
        // Cycle part - arrange in a circle
        const cycleLength = nodes.length - cycleStartIdx;
        const cycleIdx = idx - cycleStartIdx;
        const angle = (cycleIdx / cycleLength) * Math.PI * 1.5 - Math.PI / 2;
        const radius = 70;
        const centerX = 60 + cycleStartIdx * 80 + radius;
        const centerY = 60 + radius + 20;
        return {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      };
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              Cycle Detection (Floyd&apos;s Algorithm)
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Fast/Slow pointers: if they meet, there&apos;s a cycle
            </p>
          </div>
          <div className="p-4">
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={phase === "done"}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                } disabled:opacity-50`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="400"
                  max="1500"
                  step="100"
                  value={1900 - speed}
                  onChange={(e) => setSpeed(1900 - Number(e.target.value))}
                  className="w-20 accent-green-500"
                />
              </div>
            </div>
            {/* List info */}
            <div className="mb-4 p-3 bg-gray-800/50 rounded-md">
              <div className="text-sm text-gray-400">
                List: 1 → 2 → 3 → 4 → 5 →{" "}
                <span className="text-red-400">(back to 3)</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Cycle starts at node 3
              </div>
            </div>
            {/* Visual representation */}
            <div className="mb-6 relative h-48 bg-gray-800/30 rounded-md overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 450 180">
                {/* Draw arrows */}
                {nodes.map((_, idx) => {
                  const start = getNodePosition(idx);
                  const end = getNodePosition(getNextIdx(idx));
                  const isCycleBack = idx === nodes.length - 1;
                  return (
                    <g key={`arrow-${idx}`}>
                      <line
                        x1={start.x + 15}
                        y1={start.y}
                        x2={end.x - 15}
                        y2={end.y}
                        stroke={isCycleBack ? "#ef4444" : "#6b7280"}
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
                {/* Arrow marker */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                  </marker>
                </defs>
                {/* Draw nodes */}
                {nodes.map((val, idx) => {
                  const pos = getNodePosition(idx);
                  const isSlow = idx === slowIdx;
                  const isFast = idx === fastIdx;
                  const isBoth = isSlow && isFast;
                  const isCycleStart = idx === cycleStartIdx;
                  return (
                    <g key={`node-${idx}`}>
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r="20"
                        fill={
                          isBoth
                            ? "#eab308"
                            : isSlow
                              ? "#3b82f6"
                              : isFast
                                ? "#10b981"
                                : isCycleStart
                                  ? "#ef4444"
                                  : "#374151"
                        }
                        animate={{
                          scale: isBoth ? 1.2 : isSlow || isFast ? 1.1 : 1,
                        }}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        {val}
                      </text>
                      {/* Labels */}
                      {(isSlow || isFast) && (
                        <text
                          x={pos.x}
                          y={pos.y - 28}
                          textAnchor="middle"
                          fill={isBoth ? "#eab308" : isSlow ? "#3b82f6" : "#10b981"}
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {isBoth ? "S+F" : isSlow ? "Slow" : "Fast"}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Pointer Status */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-400">Slow Pointer</span>
                </div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {nodes[slowIdx]}
                </div>
                <div className="text-xs text-gray-500">Moves 1 step</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-400">Fast Pointer</span>
                </div>
                <div className="text-2xl font-bold text-green-400 mt-1">
                  {nodes[fastIdx]}
                </div>
                <div className="text-xs text-gray-500">Moves 2 steps</div>
              </div>
            </div>
            {/* Step counter */}
            <div className="mb-4 text-center">
              <span className="text-gray-500">Step: </span>
              <span className="text-xl font-bold text-purple-400">{step}</span>
            </div>
            {/* Message */}
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-md text-sm ${
                phase === "done"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : phase === "found"
                    ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                    : "bg-gray-800 text-gray-300"
              }`}
            >
              {message}
            </motion.div>
            {/* Algorithm explanation */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
              <p>
                <strong className="text-green-400">Key Insight:</strong> If
                there&apos;s a cycle, fast will lap slow. After meeting, reset slow
                to head - they&apos;ll meet at cycle start.
              </p>
            </div>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

77. **Function has a cyclomatic complexity of 10 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/CycleDetectionVisualizer.tsx`
    **Line:** 48
    ```typescript
    useEffect(() => {
        if (!isPlaying) return;
    
        const timer = setTimeout(() => {
          if (phase === "init") {
            setPhase("detecting");
            setMessage("Start: Both pointers at head. Slow moves 1, Fast moves 2.");
    ```
    **Category:** Anti-pattern
    **Severity:** minor

78. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DijkstraVisualizer.tsx`
    **Line:** 46-53
    ```typescript
    const DEFAULT_SOURCE = 0;
    const DEFAULT_TARGET = 5;
    
    function createInitialNodes(): Node[] {
      return NODE_POSITIONS.map((pos) => ({
        ...pos,
        dist: pos.id === DEFAULT_SOURCE ? 0 : Infinity,
        state: pos.id === DEFAULT_SOURCE ? "inQueue" : "unvisited",
        prev: null,
      }));
    }
    
    function createInitialEdges(): Edge[] {
      return GRAPH_EDGES.map(([from, to, weight]) => ({
    ```
    **Category:** Anti-pattern
    **Severity:** minor

79. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DijkstraVisualizer.tsx`
    **Line:** 55-62
    ```typescript
    }));
    }
    
    function createInitialEdges(): Edge[] {
      return GRAPH_EDGES.map(([from, to, weight]) => ({
        from,
        to,
        weight,
        used: false,
      }));
    }
    
    const INITIAL_NODES = createInitialNodes();
    const INITIAL_EDGES = createInitialEdges();
    ```
    **Category:** Anti-pattern
    **Severity:** minor

80. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DijkstraVisualizer.tsx`
    **Line:** 67-450
    ```typescript
    const INITIAL_NODES = createInitialNodes();
    const INITIAL_EDGES = createInitialEdges();
    
    export default function DijkstraVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
      const [speed, setSpeed] = useState(800);
      const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
      const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
      const [priorityQueue, setPriorityQueue] =
        useState<[number, number][]>([[0, DEFAULT_SOURCE]]);
      const [source] = useState(DEFAULT_SOURCE);
      const [target] = useState(DEFAULT_TARGET);
      const [message, setMessage] = useState(
        "Click Play to find shortest path from A to F"
      );
      const [phase, setPhase] = useState<"init" | "processing" | "done">("init");
      const initGraph = useCallback(() => {
        const newNodes: Node[] = NODE_POSITIONS.map((pos) => ({
          ...pos,
          dist: pos.id === source ? 0 : Infinity,
          state: pos.id === source ? "inQueue" : "unvisited",
          prev: null,
        }));
        const newEdges: Edge[] = GRAPH_EDGES.map(([from, to, weight]) => ({
          from,
          to,
          weight,
          used: false,
        }));
        setNodes(newNodes);
        setEdges(newEdges);
        setPriorityQueue([[0, source]]);
        setPhase("init");
        setMessage(
          `Click Play to find shortest path from ${NODE_POSITIONS[source].label} to ${NODE_POSITIONS[target].label}`
        );
        setIsPlaying(false);
      }, [source, target]);
      const getNeighbors = useCallback(
        (nodeId: number): [number, number][] => {
          const neighbors: [number, number][] = [];
          for (const edge of edges) {
            if (edge.from === nodeId) {
              neighbors.push([edge.to, edge.weight]);
            } else if (edge.to === nodeId) {
              neighbors.push([edge.from, edge.weight]);
            }
          }
          return neighbors;
        },
        [edges]
      );
      useEffect(() => {
        if (!isPlaying || nodes.length === 0) return;
        const timer = setTimeout(() => {
          if (priorityQueue.length === 0) {
            setPhase("done");
            const targetNode = nodes[target];
            if (targetNode.dist === Infinity) {
              setMessage("No path found!");
            } else {
              const path: string[] = [];
              let curr: number | null = target;
              while (curr !== null) {
                path.unshift(nodes[curr].label);
                curr = nodes[curr].prev;
              }
              setMessage(
                `Shortest path: ${path.join(" -> ")} (distance: ${targetNode.dist})`
              );
            }
            setIsPlaying(false);
            return;
          }
          const sortedQueue = [...priorityQueue].sort((a, b) => a[0] - b[0]);
          const [dist, u] = sortedQueue[0];
          const newQueue = sortedQueue.slice(1);
          if (dist > nodes[u].dist) {
            setPriorityQueue(newQueue);
            return;
          }
          const newNodes = [...nodes];
          newNodes[u] = { ...newNodes[u], state: "processing" };
          setNodes(newNodes);
          setMessage(`Processing node ${nodes[u].label} (distance: ${dist})`);
          setTimeout(() => {
            const updatedNodes = [...newNodes];
            updatedNodes[u] = { ...updatedNodes[u], state: "visited" };
            const neighbors = getNeighbors(u);
            const toAdd: [number, number][] = [];
            const newEdges = [...edges];
            for (const [v, w] of neighbors) {
              const newDist = updatedNodes[u].dist + w;
              if (newDist < updatedNodes[v].dist) {
                updatedNodes[v] = {
                  ...updatedNodes[v],
                  dist: newDist,
                  prev: u,
                  state
    :                updatedNodes[v].state === "visited" ? "visited" : "inQueue",
                };
                toAdd.push([newDist, v]);
                for (let i = 0; i < newEdges.length; i++) {
                  if (
                    (newEdges[i].from === u && newEdges[i].to === v) ||
                    (newEdges[i].to === u && newEdges[i].from === v)
                  ) {
                    newEdges[i] = { ...newEdges[i], used: true };
                  }
                }
              }
            }
            setNodes(updatedNodes);
            setEdges(newEdges);
            setPriorityQueue([...newQueue, ...toAdd]);
            if (u === target) {
              setPhase("done");
              const path: string[] = [];
              let curr: number | null = target;
              while (curr !== null) {
                path.unshift(updatedNodes[curr].label);
                curr = updatedNodes[curr].prev;
              }
              setMessage(
                `Found shortest path: ${path.join(" -> ")} (distance: ${updatedNodes[target].dist})`
              );
              setIsPlaying(false);
            }
          }, speed / 2);
        }, speed);
        return () => clearTimeout(timer);
      }, [isPlaying, priorityQueue, nodes, edges, speed, target, getNeighbors]);
      const getNodeColor = (node: Node) => {
        if (node.id === source) return "bg-green-500";
        if (node.id === target)
          return node.state === "visited" ? "bg-green-500" : "bg-red-500";
        switch (node.state) {
          case "visited":
            return "bg-blue-500";
          case "processing":
            return "bg-yellow-500 animate-pulse";
          case "inQueue":
            return "bg-cyan-500";
          default:
            return "bg-gray-600";
        }
      };
      const getEdgeColor = (edge: Edge) => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        if (
          edge.used &&
          (fromNode?.state === "visited" || toNode?.state === "visited")
        ) {
          return "#22c55e";
        }
        return "#4b5563";
      };
      const formatDist = (d: number) => (d === Infinity ? "∞" : d);
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              Dijkstra&apos;s Algorithm
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Find shortest path in weighted graph using priority queue
            </p>
          </div>
          <div className="p-4">
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={phase === "done"}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                } disabled:opacity-50`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={initGraph}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="400"
                  max="1500"
                  step="100"
                  value={1900 - speed}
                  onChange={(e) => setSpeed(1900 - Number(e.target.value))}
                  className="w-20 accent-orange-500"
                />
              </div>
            </div>
            {/* Graph Visualization */}
            <div className="relative h-56 bg-gray-800/50 rounded-md mb-4 overflow-hidden">
              {/* Edges */}
              <svg className="absolute inset-0 w-full h-full">
                {edges.map((edge, i) => {
                  const from = nodes[edge.from];
                  const to = nodes[edge.to];
                  if (!from || !to) return null;
                  const midX = (from.x + to.x) / 2 + 20;
                  const midY = (from.y + to.y) / 2 + 20;
                  return (
                    <g key={`edge-${edge.from}-${edge.to}-${i}`}>
                      <line
                        x1={from.x + 20}
                        y1={from.y + 20}
                        x2={to.x + 20}
                        y2={to.y + 20}
                        stroke={getEdgeColor(edge)}
                        strokeWidth={edge.used ? 3 : 2}
                      />
                      <circle cx={midX} cy={midY} r="12" fill="#1f2937" />
                      <text
                        x={midX}
                        y={midY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#9ca3af"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {/* Nodes */}
              {nodes.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute w-10 h-10 rounded-full flex items-center justify-center ${getNodeColor(node)} transition-colors`}
                  style={{ left: node.x, top: node.y }}
                >
                  <span className="text-white font-bold">{node.label}</span>
                </motion.div>
              ))}
              {/* Distance labels */}
              {nodes.map((node) => (
                <div
                  key={`dist-${node.id}`}
                  className="absolute text-xs font-mono text-cyan-400 bg-gray-900/80 px-1 rounded-md"
                  style={{ left: node.x + 30, top: node.y - 5 }}
                >
                  d={formatDist(node.dist)}
                </div>
              ))}
            </div>
            {/* Priority Queue */}
            <div className="bg-gray-800/50 rounded-md p-3 mb-4">
              <div className="text-xs text-gray-500 mb-2">
                Priority Queue (min-heap by distance)
              </div>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {[...priorityQueue]
                  .sort((a, b) => a[0] - b[0])
                  .map(([dist, nodeId], i) => (
                    <span
                      key={`pq-${nodeId}-${dist}-${i}`}
                      className={`px-3 py-1 rounded-md text-sm font-mono ${
                        i === 0
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      ({nodes[nodeId]?.label}, {dist})
                    </span>
                  ))}
                {priorityQueue.length === 0 && (
                  <span className="text-gray-500 text-xs">Empty</span>
                )}
              </div>
            </div>
            {/* Distance Table */}
            <div className="bg-gray-800/50 rounded-md p-3 mb-4 overflow-x-auto">
              <div className="text-xs text-gray-500 mb-2">Distance Table</div>
              <div className="flex gap-2">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`flex flex-col items-center p-2 rounded-md min-w-[50px] ${
                      node.state === "visited"
                        ? "bg-blue-500/20"
                        : node.state === "processing"
                          ? "bg-yellow-500/20"
                          : "bg-gray-700/50"
                    }`}
                  >
                    <span className="text-white font-bold">{node.label}</span>
                    <span
                      className={`text-sm font-mono ${
                        node.dist === Infinity ? "text-gray-500" : "text-cyan-400"
                      }`}
                    >
                      {formatDist(node.dist)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Message */}
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-md text-sm ${
                phase === "done"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {message}
            </motion.div>
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-gray-400">Source/Target</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cyan-500" />
                <span className="text-gray-400">In Queue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-gray-400">Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span className="text-gray-400">Visited</span>
              </div>
            </div>
            {/* Algorithm explanation */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-md text-sm text-gray-400">
              <p>
                <strong className="text-orange-400">Dijkstra:</strong> Always
                process the node with smallest known distance. Update neighbors if
                going through current node is shorter. Time: O((V+E) log V) with
                min-heap.
              </p>
            </div>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

81. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DPComparisonVisualizer.tsx`
    **Line:** 8-483
    ```typescript
    type Approach = "recursion" | "memoization" | "tabulation" | "optimized";
    
    export default function DPComparisonVisualizer() {
      const [isPlaying, setIsPlaying] = useState(false);
      const [speed, setSpeed] = useState(300);
      const [n] = useState(6);
      const [recursionCalls, setRecursionCalls] = useState(0);
      const [recursionStack, setRecursionStack] = useState<string[]>([]);
      const [, setRecursionCompleted] = useState<Map<number, number>>(new Map());
      const [memoCalls, setMemoCalls] = useState(0);
      const [memoCache, setMemoCache] = useState<Map<number, number>>(new Map());
      const [memoCacheHits, setMemoCacheHits] = useState(0);
      const [tabIndex, setTabIndex] = useState(0);
      const [tabArray, setTabArray] = useState<(number | null)[]>(
        Array(n + 1).fill(null)
      );
      const [optIndex, setOptIndex] = useState(0);
      const [optPrev2, setOptPrev2] = useState(0);
      const [optPrev1, setOptPrev1] = useState(1);
      const [isComplete, setIsComplete] = useState(false);
      const [, setStep] = useState(0);
      const totalRecursionCalls = Math.pow(2, n + 1) - 1;
      useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
          setStep((s) => {
            if (s >= 100) {
              setIsPlaying(false);
              setIsComplete(true);
              return s;
            }
            // Recursion - exponential growth
            if (recursionCalls < Math.min(totalRecursionCalls, 50)) {
              setRecursionCalls((c) => c + 1);
              if (recursionStack.length < 8) {
                setRecursionStack((prev) => [
                  ...prev,
                  `fib(${Math.max(0, n - prev.length)})`,
                ]);
              } else {
                setRecursionStack((prev) => {
                  const newStack = [...prev];
                  newStack.shift();
                  newStack.push(`fib(${Math.floor(Math.random() * n)})`);
                  return newStack;
                });
              }
            }
            // Memoization - linear with cache
            if (s % 3 === 0 && memoCache.size <= n) {
              const nextKey = memoCache.size;
              if (!memoCache.has(nextKey)) {
                setMemoCalls((c) => c + 1);
                if (nextKey <= 1) {
                  setMemoCache((prev) => new Map(prev).set(nextKey, nextKey));
                } else {
                  const val =
                    (memoCache.get(nextKey - 1) || 0) +
                    (memoCache.get(nextKey - 2) || 0);
                  setMemoCache((prev) => new Map(prev).set(nextKey, val));
                }
              } else {
                setMemoCacheHits((h) => h + 1);
              }
            }
            // Tabulation - steady iteration
            if (s % 4 === 0 && tabIndex <= n) {
              setTabArray((prev) => {
                const newArr = [...prev];
                if (tabIndex <= 1) {
                  newArr[tabIndex] = tabIndex;
                } else {
                  newArr[tabIndex] =
                    (newArr[tabIndex - 1] || 0) + (newArr[tabIndex - 2] || 0);
                }
                return newArr;
              });
              setTabIndex((i) => i + 1);
            }
            // Optimized - fastest
            if (s % 5 === 0 && optIndex <= n) {
              if (optIndex >= 2) {
                const curr = optPrev1 + optPrev2;
                setOptPrev2(optPrev1);
                setOptPrev1(curr);
              }
              setOptIndex((i) => i + 1);
            }
            return s + 1;
          });
        }, speed);
        return () => clearInterval(interval);
      }, [
        isPlaying,
        speed,
        n,
        recursionCalls,
        memoCache,
        tabIndex,
        optIndex,
        optPrev1,
        optPrev2,
        totalRecursionCalls,
        recursionStack.length,
      ]);
      const reset = () => {
        setStep(0);
        setIsPlaying(false);
        setIsComplete(false);
        setRecursionCalls(0);
        setRecursionStack([]);
        setRecursionCompleted(new Map());
        setMemoCalls(0);
        setMemoCache(new Map());
        setMemoCacheHits(0);
        setTabIndex(0);
        setTabArray(Array(n + 1).fill(null));
        setOptIndex(0);
        setOptPrev2(0);
        setOptPrev1(1);
      };
      const getProgressPercent = (approach: Approach) => {
        switch (approach) {
          case "recursion":
            return Math.min((recursionCalls / 20) * 100, 100);
          case "memoization":
            return (memoCache.size / (n + 1)) * 100;
          case "tabulation":
            return (tabIndex / (n + 1)) * 100;
          case "optimized":
            return (optIndex / (n + 1)) * 100;
        }
      };
      const fib = (num: number): number => {
        if (num <= 1) return num;
        let a = 0,
          b = 1;
        for (let i = 2; i <= num; i++) {
          const c = a + b;
          a = b;
          b = c;
        }
        return b;
      };
      const finalAnswer = fib(n);
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              DP Approaches: Side-by-Side Race
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Computing fib({n}) = {finalAnswer} — Watch all 4 approaches compete!
            </p>
          </div>
          <div className="p-4">
            {/* Controls */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                }`}
              >
                {isPlaying ? "Pause" : "Start Race"}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="50"
                  value={600 - speed}
                  onChange={(e) => setSpeed(600 - Number(e.target.value))}
                  className="w-20 accent-purple-500"
                />
              </div>
            </div>
            {/* Four Approaches Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Recursion */}
              <motion.div
                animate={{
                  borderColor
    :                getProgressPercent("recursion") >= 100 ? "#ef4444" : "#374151",
                }}
                className="bg-gray-800/50 rounded-md border-2 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-red-400 font-semibold">Pure Recursion</h4>
                  <span className="text-xs text-gray-500 font-mono">O(2ⁿ)</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Function Calls</span>
                    <span className="text-red-400 font-mono">{recursionCalls}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      animate={{
                        width: `${Math.min((recursionCalls / 50) * 100, 100)}%`,
                      }}
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                    />
                  </div>
                </div>
                {/* Call Stack Visualization */}
                <div className="bg-gray-900/50 rounded-md p-2 h-24 overflow-hidden">
                  <div className="text-xs text-gray-500 mb-1">Call Stack:</div>
                  <div className="space-y-0.5">
                    {recursionStack.slice(-5).map((call, i) => (
                      <motion.div
                        key={`call-${call}-${i}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md"
                      >
                        {"  ".repeat(i)}
                        {call}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs text-red-300">
                  ⚠️ Exponentially slow! Many duplicate calls...
                </div>
              </motion.div>
              {/* Memoization */}
              <motion.div
                animate={{
                  borderColor
    :                getProgressPercent("memoization") >= 100
                      ? "#eab308"
                      : "#374151",
                }}
                className="bg-gray-800/50 rounded-md border-2 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-yellow-400 font-semibold">Memoization</h4>
                  <span className="text-xs text-gray-500 font-mono">O(n)</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Calls</span>
                    <span className="text-yellow-400 font-mono">{memoCalls}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${getProgressPercent("memoization")}%` }}
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                    />
                  </div>
                </div>
                {/* Cache Visualization */}
                <div className="bg-gray-900/50 rounded-md p-2 h-24">
                  <div className="text-xs text-gray-500 mb-1">
                    Cache: (hits: {memoCacheHits})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: n + 1 }).map((_, i) => (
                      <motion.div
                        key={`memo-${i}-${memoCache.get(i) ?? 'empty'}`}
                        animate={{
                          scale: memoCache.has(i) ? 1 : 0.8,
                          opacity: memoCache.has(i) ? 1 : 0.3,
                        }}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-mono ${
                          memoCache.has(i)
                            ? "bg-yellow-500/30 border border-yellow-500 text-yellow-400"
                            : "bg-gray-700/50 text-gray-600"
                        }`}
                      >
                        {memoCache.get(i) ?? "?"}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs text-yellow-300">
                  ✓ Cache prevents duplicate work!
                </div>
              </motion.div>
              {/* Tabulation */}
              <motion.div
                animate={{
                  borderColor
    :                getProgressPercent("tabulation") >= 100 ? "#3b82f6" : "#374151",
                }}
                className="bg-gray-800/50 rounded-md border-2 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-blue-400 font-semibold">Tabulation</h4>
                  <span className="text-xs text-gray-500 font-mono">O(n)</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Index</span>
                    <span className="text-blue-400 font-mono">
                      {tabIndex}/{n}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${getProgressPercent("tabulation")}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    />
                  </div>
                </div>
                {/* Array Visualization */}
                <div className="bg-gray-900/50 rounded-md p-2 h-24">
                  <div className="text-xs text-gray-500 mb-1">DP Array:</div>
                  <div className="flex gap-1">
                    {tabArray.map((val, i) => (
                      <motion.div
                        key={`tab-${i}-${val ?? 'null'}`}
                        animate={{
                          scale: i === tabIndex - 1 ? 1.2 : 1,
                          backgroundColor
    :                        val !== null
                              ? "rgba(59, 130, 246, 0.3)"
                              : "rgba(55, 65, 81, 0.5)",
                        }}
                        className={`flex-1 h-12 rounded-md flex flex-col items-center justify-center border ${
                          val !== null ? "border-blue-500" : "border-gray-700"
                        }`}
                      >
                        <span className="text-xs text-gray-500">[{i}]</span>
                        <span
                          className={`text-sm font-mono ${val !== null ? "text-blue-400" : "text-gray-600"}`}
                        >
                          {val ?? "-"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-300">
                  ✓ No recursion overhead, just iteration
                </div>
              </motion.div>
              {/* Space Optimized */}
              <motion.div
                animate={{
                  borderColor
    :                getProgressPercent("optimized") >= 100 ? "#22c55e" : "#374151",
                }}
                className="bg-gray-800/50 rounded-md border-2 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-green-400 font-semibold">Space Optimized</h4>
                  <span className="text-xs text-gray-500 font-mono">
                    O(1) space
                  </span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Index</span>
                    <span className="text-green-400 font-mono">
                      {optIndex}/{n}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${getProgressPercent("optimized")}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                    />
                  </div>
                </div>
                {/* Two Variables Visualization */}
                <div className="bg-gray-900/50 rounded-md p-2 h-24">
                  <div className="text-xs text-gray-500 mb-2">
                    Just 2 variables:
                  </div>
                  <div className="flex justify-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="bg-green-500/30 border-2 border-green-500 rounded-md px-4 py-2 text-center"
                    >
                      <div className="text-xs text-green-400">prev2</div>
                      <div className="text-xl font-mono font-bold text-green-400">
                        {optPrev2}
                      </div>
                    </motion.div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.5 }}
                      className="bg-emerald-500/30 border-2 border-emerald-500 rounded-md px-4 py-2 text-center"
                    >
                      <div className="text-xs text-emerald-400">prev1</div>
                      <div className="text-xl font-mono font-bold text-emerald-400">
                        {optPrev1}
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-green-300">
                  ✓ Minimal memory, maximum efficiency!
                </div>
              </motion.div>
            </div>
            {/* Summary */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-md"
              >
                <h4 className="text-green-400 font-semibold mb-3">
                  Race Complete! fib({n}) = {finalAnswer}
                </h4>
                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                  <div>
                    <div className="text-red-400 font-bold">{recursionCalls}+</div>
                    <div className="text-gray-500">Recursion Calls</div>
                  </div>
                  <div>
                    <div className="text-yellow-400 font-bold">{memoCalls}</div>
                    <div className="text-gray-500">Memo Calls</div>
                  </div>
                  <div>
                    <div className="text-blue-400 font-bold">{n + 1}</div>
                    <div className="text-gray-500">Tab Iterations</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-bold">2 vars</div>
                    <div className="text-gray-500">Space Used</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

82. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DPTableVisualizer.tsx`
    **Line:** 36-525
    ```typescript
    const initialPlayState: PlayState = { step: 0, isPlaying: false };
    
    export default function DPTableVisualizer({
      problem: initialProblem = "lcs",
    }: DPTableVisualizerProps) {
      const [problem, setProblem] = useState<Problem>(initialProblem);
      const [{ step, isPlaying }, dispatch] = useReducer(
        playReducer,
        initialPlayState
      );
      const [speed, setSpeed] = useState(400);
      const [, setHighlightedCells] = useState<Set<string>>(new Set());
      const [currentCell, setCurrentCell] = useState<string | null>(null);
      const [, setArrows] = useState<{ from: string; to: string }[]>([]);
      const problems = {
        lcs: {
          title: "Longest Common Subsequence",
          s1: "ABCD",
          s2: "AEBD",
          description: "Find longest subsequence present in both strings",
        },
        "edit-distance": {
          title: "Edit Distance",
          s1: "CAT",
          s2: "CUT",
          description: "Minimum operations to transform s1 → s2",
        },
        "grid-paths": {
          title: "Unique Paths",
          rows: 4,
          cols: 4,
          description: "Count paths from top-left to bottom-right",
        },
      };
      const generateLCSSteps = () => {
        const s1 = problems["lcs"].s1;
        const s2 = problems["lcs"].s2;
        const m = s1.length;
        const n = s2.length;
        const steps: {
          i: number;
          j: number;
          value: number;
          formula: string;
          match?: boolean;
        }[] = [];
        for (let i = 0; i <= m; i++) {
          for (let j = 0; j <= n; j++) {
            if (i === 0 || j === 0) {
              steps.push({ i, j, value: 0, formula: "Base case: 0" });
            } else if (s1[i - 1] === s2[j - 1]) {
              const prev = steps.find((s) => s.i === i - 1 && s.j === j - 1);
              steps.push({
                i,
                j,
                value: (prev?.value || 0) + 1,
                formula: `'${s1[i - 1]}' = '${s2[j - 1]}' → dp[${i - 1}][${j - 1}] + 1 = ${(prev?.value || 0) + 1}`,
                match: true,
              });
            } else {
              const up = steps.find((s) => s.i === i - 1 && s.j === j);
              const left = steps.find((s) => s.i === i && s.j === j - 1);
              const maxVal = Math.max(up?.value || 0, left?.value || 0);
              steps.push({
                i,
                j,
                value: maxVal,
                formula: `'${s1[i - 1]}' ≠ '${s2[j - 1]}' → max(${up?.value || 0}, ${left?.value || 0}) = ${maxVal}`,
              });
            }
          }
        }
        return steps;
      };
      const generateEditDistanceSteps = () => {
        const s1 = problems["edit-distance"].s1;
        const s2 = problems["edit-distance"].s2;
        const m = s1.length;
        const n = s2.length;
        const steps: {
          i: number;
          j: number;
          value: number;
          formula: string;
          operation?: string;
        }[] = [];
        for (let i = 0; i <= m; i++) {
          for (let j = 0; j <= n; j++) {
            if (i === 0) {
              steps.push({
                i,
                j,
                value: j,
                formula: `Insert ${j} chars`,
                operation: j > 0 ? "insert" : "",
              });
            } else if (j === 0) {
              steps.push({
                i,
                j,
                value: i,
                formula: `Delete ${i} chars`,
                operation: i > 0 ? "delete" : "",
              });
            } else if (s1[i - 1] === s2[j - 1]) {
              const diag = steps.find((s) => s.i === i - 1 && s.j === j - 1);
              steps.push({
                i,
                j,
                value: diag?.value || 0,
                formula: `'${s1[i - 1]}' = '${s2[j - 1]}' → no operation`,
                operation: "match",
              });
            } else {
              const diag = steps.find((s) => s.i === i - 1 && s.j === j - 1);
              const up = steps.find((s) => s.i === i - 1 && s.j === j);
              const left = steps.find((s) => s.i === i && s.j === j - 1);
              const minVal =
                Math.min(diag?.value || 0, up?.value || 0, left?.value || 0) + 1;
              let op = "replace";
              if ((up?.value || 0) + 1 === minVal) op = "delete";
              if ((left?.value || 0) + 1 === minVal) op = "insert";
              steps.push({
                i,
                j,
                value: minVal,
                formula: `min(replace, delete, insert) + 1 = ${minVal}`,
                operation: op,
              });
            }
          }
        }
        return steps;
      };
      const generateGridSteps = () => {
        const { rows, cols } = problems["grid-paths"];
        const steps: { i: number; j: number; value: number; formula: string }[] =
          [];
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            if (i === 0 || j === 0) {
              steps.push({ i, j, value: 1, formula: "Edge: only 1 path" });
            } else {
              const up = steps.find((s) => s.i === i - 1 && s.j === j);
              const left = steps.find((s) => s.i === i && s.j === j - 1);
              steps.push({
                i,
                j,
                value: (up?.value || 0) + (left?.value || 0),
                formula: `↑${up?.value || 0} + ←${left?.value || 0} = ${(up?.value || 0) + (left?.value || 0)}`,
              });
            }
          }
        }
        return steps;
      };
      const getSteps = () => {
        switch (problem) {
          case "lcs":
            return generateLCSSteps();
          case "edit-distance":
            return generateEditDistanceSteps();
          case "grid-paths":
            return generateGridSteps();
        }
      };
      const steps = getSteps();
      const currentStepData = steps[step];
      useEffect(() => {
        if (!isPlaying || step >= steps.length) {
          if (step >= steps.length) dispatch({ type: "STOP" });
          return;
        }
        const timer = setTimeout(() => {
          const s = steps[step];
          setCurrentCell(`${s.i}-${s.j}`);
          setHighlightedCells((prev) => new Set([...prev, `${s.i}-${s.j}`]));
          dispatch({ type: "ADVANCE" });
        }, speed);
        return () => clearTimeout(timer);
      }, [isPlaying, step, steps, speed]);
      const reset = () => {
        dispatch({ type: "RESET" });
        setHighlightedCells(new Set());
        setCurrentCell(null);
        setArrows([]);
      };
      const getTableDimensions = () => {
        switch (problem) {
          case "lcs":
            return {
              rows: problems.lcs.s1.length + 1,
              cols: problems.lcs.s2.length + 1,
            };
          case "edit-distance":
            return {
              rows: problems["edit-distance"].s1.length + 1,
              cols: problems["edit-distance"].s2.length + 1,
            };
          case "grid-paths":
            return {
              rows: problems["grid-paths"].rows,
              cols: problems["grid-paths"].cols,
            };
        }
      };
      const { rows, cols } = getTableDimensions();
      const getCellValue = (i: number, j: number) => {
        const cellStep = steps.find((s) => s.i === i && s.j === j);
        const cellIndex = steps.findIndex((s) => s.i === i && s.j === j);
        if (cellIndex < step) return cellStep?.value;
        return null;
      };
      const getCellColor = (i: number, j: number) => {
        const key = `${i}-${j}`;
        if (currentCell === key) return "bg-yellow-500 text-black";
        const cellStep = steps.find((s) => s.i === i && s.j === j) as
          | {
              i: number;
              j: number;
              value: number;
              match?: boolean;
              operation?: string;
            }
          | undefined;
        const cellIndex = steps.findIndex((s) => s.i === i && s.j === j);
        if (cellIndex < step) {
          if (problem === "lcs" && cellStep?.match)
            return "bg-green-500/30 border-green-500 text-green-400";
          if (problem === "edit-distance") {
            if (cellStep?.operation === "match")
              return "bg-green-500/30 border-green-500 text-green-400";
            if (cellStep?.operation === "replace")
              return "bg-orange-500/30 border-orange-500 text-orange-400";
            if (cellStep?.operation === "delete")
              return "bg-red-500/30 border-red-500 text-red-400";
            if (cellStep?.operation === "insert")
              return "bg-blue-500/30 border-blue-500 text-blue-400";
          }
          return "bg-indigo-500/20 border-indigo-500/50 text-indigo-400";
        }
        return "bg-gray-800/50 border-gray-700 text-gray-600";
      };
      const s1 = problem === "grid-paths" ? "" : problems[problem].s1;
      const s2 = problem === "grid-paths" ? "" : problems[problem].s2;
      return (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              2D DP Table Visualizer
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Watch the table fill cell by cell
            </p>
          </div>
          <div className="p-4">
            {/* Problem Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.keys(problems) as Problem[]).map((p) => (
                <button
                  key={`problem-${p}`}
                  onClick={() => {
                    setProblem(p);
                    reset();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    problem === p
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {problems[p].title}
                </button>
              ))}
            </div>
            {/* Description */}
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-gray-300 text-sm">
                {problems[problem].description}
              </p>
              {problem !== "grid-paths" && (
                <div className="mt-2 flex gap-4 font-mono text-sm">
                  <span className="text-indigo-400">s1 = &quot;{s1}&quot;</span>
                  <span className="text-purple-400">s2 = &quot;{s2}&quot;</span>
                </div>
              )}
            </div>
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => dispatch({ type: "TOGGLE" })}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                }`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => {
                  if (step < steps.length) {
                    const st = steps[step];
                    setCurrentCell(`${st.i}-${st.j}`);
                    setHighlightedCells(
                      (prev) => new Set([...prev, `${st.i}-${st.j}`])
                    );
                    dispatch({ type: "ADVANCE" });
                  }
                }}
                disabled={step >= steps.length}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
              >
                Step
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="50"
                  value={900 - speed}
                  onChange={(e) => setSpeed(900 - Number(e.target.value))}
                  className="w-20 accent-blue-500"
                />
              </div>
              <div className="ml-auto text-sm text-gray-500">
                Step {step}/{steps.length}
              </div>
            </div>
            {/* DP Table */}
            <div className="overflow-x-auto">
              <div className="inline-block">
                {/* Column headers */}
                {problem !== "grid-paths" && (
                  <div className="flex">
                    <div className="w-12 h-8" /> {/* Corner */}
                    <div className="w-12 h-8 flex items-center justify-center text-gray-500 text-sm">
                      &ldquo;&rdquo;
                    </div>
                    {s2.split("").map((char, j) => (
                      <div
                        key={`col-${char}-${j}`}
                        className="w-12 h-8 flex items-center justify-center text-purple-400 font-mono font-bold"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                )}
                {/* Table rows */}
                {Array.from({ length: rows }).map((_, i) => (
                  <div key={`row-${i}`} className="flex">
                    {/* Row header */}
                    {problem !== "grid-paths" && (
                      <div className="w-12 h-12 flex items-center justify-center text-indigo-400 font-mono font-bold">
                        {i === 0 ? '""' : s1[i - 1]}
                      </div>
                    )}
                    {/* Cells */}
                    {Array.from({ length: cols }).map((_, j) => {
                      const value = getCellValue(i, j);
                      const colorClass = getCellColor(i, j);
                      return (
                        <motion.div
                          key={`${i}-${j}`}
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{
                            scale: currentCell === `${i}-${j}` ? 1.1 : 1,
                            opacity: 1,
                          }}
                          className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center font-mono font-bold text-lg m-0.5 transition-all ${colorClass}`}
                        >
                          <AnimatePresence mode="wait">
                            {value !== null && (
                              <motion.span
                                key={value}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                              >
                                {value}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            {/* Current Step Info */}
            {currentStepData && step > 0 && (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 font-mono">
                    dp[{steps[step - 1]?.i}][{steps[step - 1]?.j}]
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-white">{steps[step - 1]?.formula}</span>
                </div>
              </motion.div>
            )}
            {/* Legend for Edit Distance */}
            {problem === "edit-distance" && (
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500" />
                  <span className="text-gray-400">Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500/30 border border-orange-500" />
                  <span className="text-gray-400">Replace</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500" />
                  <span className="text-gray-400">Delete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500" />
                  <span className="text-gray-400">Insert</span>
                </div>
              </div>
            )}
            {/* Final Result */}
            {step >= steps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
              >
                <span className="text-green-400 font-bold text-lg">
                  {problem === "lcs" &&
                    `LCS Length: ${steps[steps.length - 1]?.value}`}
                  {problem === "edit-distance" &&
                    `Min Operations: ${steps[steps.length - 1]?.value}`}
                  {problem === "grid-paths" &&
                    `Total Paths: ${steps[steps.length - 1]?.value}`}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

83. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DPTableVisualizer.tsx`
    **Line:** 19-32
    ```typescript
    | { type: "ADVANCE" }
      | { type: "RESET" };
    
    function playReducer(state: PlayState, action: PlayAction): PlayState {
      switch (action.type) {
        case "TOGGLE":
          return { ...state, isPlaying: !state.isPlaying };
        case "STOP":
          return { ...state, isPlaying: false };
        case "ADVANCE":
          return { ...state, step: state.step + 1 };
        case "RESET":
          return { step: 0, isPlaying: false };
        default:
          return state;
      }
    }
    
    const initialPlayState: PlayState = { step: 0, isPlaying: false };
    ```
    **Category:** Anti-pattern
    **Severity:** minor

84. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 70-83
    ```typescript
    | { type: "ADVANCE" }
      | { type: "RESET" };
    
    function playReducer(state: PlayState, action: PlayAction): PlayState {
      switch (action.type) {
        case "TOGGLE":
          return { ...state, isPlaying: !state.isPlaying };
        case "STOP":
          return { ...state, isPlaying: false };
        case "ADVANCE":
          return { ...state, step: state.step + 1 };
        case "RESET":
          return { step: 0, isPlaying: false };
        default:
          return state;
      }
    }
    
    const initialPlayState: PlayState = { step: 0, isPlaying: false };
    ```
    **Category:** Anti-pattern
    **Severity:** minor

85. **`renderRecursion` has a cyclomatic complexity of 7 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 214
    ```typescript
    const stageInfo = stages[currentStage];
    
      const renderRecursion = () => {
        const currentTrace = trace.slice(0, step) as RecursionTraceItem[];
        const callStack: string[] = [];
        const completed: { call: string; result: number; stepIdx: number }[] = [];
    ```
    **Category:** Anti-pattern
    **Severity:** minor

86. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 87-711
    ```typescript
    const initialPlayState: PlayState = { step: 0, isPlaying: false };
    
    export default function DPTransformationVisualizer() {
      const [currentStage, setCurrentStage] = useState<Stage>("recursion");
      const [{ step, isPlaying }, dispatch] = useReducer(
        playReducer,
        initialPlayState
      );
      const [speed, setSpeed] = useState(500);
      const nums = [2, 7, 9, 3, 1];
      const recursionTrace = [
        { call: "rob(0)", action: "enter", depth: 0 },
        { call: "rob(2)", action: "enter", depth: 1, choice: "ROB $2" },
        { call: "rob(4)", action: "enter", depth: 2, choice: "ROB $9" },
        { call: "rob(4)", action: "exit", result: 1, depth: 2 },
        { call: "rob(3)", action: "enter", depth: 2, choice: "SKIP" },
        { call: "rob(3)", action: "exit", result: 3, depth: 2 },
        { call: "rob(2)", action: "exit", result: 10, depth: 1 },
        { call: "rob(1)", action: "enter", depth: 1, choice: "SKIP" },
        {
          call: "rob(3)",
          action: "enter",
          depth: 2,
          choice: "ROB $7",
          duplicate: true,
        },
        { call: "rob(3)", action: "exit", result: 3, depth: 2, duplicate: true },
        {
          call: "rob(2)",
          action: "enter",
          depth: 2,
          choice: "SKIP",
          duplicate: true,
        },
        { call: "rob(2)", action: "exit", result: 10, depth: 2, duplicate: true },
        { call: "rob(1)", action: "exit", result: 10, depth: 1 },
        { call: "rob(0)", action: "exit", result: 12, depth: 0 },
      ];
      const memoTrace: {
        call: string;
        action: string;
        memo: Record<number, number>;
        result?: number;
      }[] = [
        { call: "rob(0)", action: "compute", memo: {} },
        { call: "rob(2)", action: "compute", memo: {} },
        { call: "rob(4)", action: "compute", memo: {}, result: 1 },
        { call: "rob(3)", action: "compute", memo: { 4: 1 }, result: 3 },
        { call: "rob(2)", action: "store", memo: { 4: 1, 3: 3 }, result: 10 },
        { call: "rob(1)", action: "compute", memo: { 4: 1, 3: 3, 2: 10 } },
        {
          call: "rob(3)",
          action: "cache-hit",
          memo: { 4: 1, 3: 3, 2: 10 },
          result: 3,
        },
        {
          call: "rob(2)",
          action: "cache-hit",
          memo: { 4: 1, 3: 3, 2: 10 },
          result: 10,
        },
        {
          call: "rob(1)",
          action: "store",
          memo: { 4: 1, 3: 3, 2: 10, 1: 10 },
          result: 10,
        },
        {
          call: "rob(0)",
          action: "store",
          memo: { 4: 1, 3: 3, 2: 10, 1: 10, 0: 12 },
          result: 12,
        },
      ];
      const tabulationTrace = [
        { i: 4, dp: [null, null, null, null, 1], formula: "dp[4] = nums[4] = 1" },
        { i: 3, dp: [null, null, null, 3, 1], formula: "dp[3] = max(3+0, 1) = 3" },
        { i: 2, dp: [null, null, 10, 3, 1], formula: "dp[2] = max(9+1, 3) = 10" },
        { i: 1, dp: [null, 10, 10, 3, 1], formula: "dp[1] = max(7+3, 10) = 10" },
        { i: 0, dp: [12, 10, 10, 3, 1], formula: "dp[0] = max(2+10, 10) = 12" },
      ];
      const optimizedTrace = [
        { i: 4, next1: 1, next2: 0, formula: "curr = max(1+0, 0) = 1" },
        { i: 3, next1: 3, next2: 1, formula: "curr = max(3+0, 1) = 3" },
        { i: 2, next1: 10, next2: 3, formula: "curr = max(9+1, 3) = 10" },
        { i: 1, next1: 10, next2: 10, formula: "curr = max(7+3, 10) = 10" },
        { i: 0, next1: 12, next2: 10, formula: "curr = max(2+10, 10) = 12" },
      ];
      const getTrace = () => {
        switch (currentStage) {
          case "recursion":
            return recursionTrace;
          case "memoization":
            return memoTrace;
          case "tabulation":
            return tabulationTrace;
          case "optimized":
            return optimizedTrace;
        }
      };
      const trace = getTrace();
      useEffect(() => {
        if (!isPlaying || step >= trace.length) {
          if (step >= trace.length) dispatch({ type: "STOP" });
          return;
        }
        const timer = setTimeout(() => {
          dispatch({ type: "ADVANCE" });
        }, speed);
        return () => clearTimeout(timer);
      }, [isPlaying, step, trace.length, speed]);
      const reset = () => {
        dispatch({ type: "RESET" });
      };
      const stageInfo = stages[currentStage];
      const renderRecursion = () => {
        const currentTrace = trace.slice(0, step) as RecursionTraceItem[];
        const callStack: string[] = [];
        const completed: { call: string; result: number; stepIdx: number }[] = [];
        for (let idx = 0; idx < currentTrace.length; idx++) {
          const traceItem = currentTrace[idx];
          if (traceItem.action === "enter") {
            callStack.push(traceItem.call);
          } else if (traceItem.action === "exit") {
            callStack.pop();
            completed.push({ call: traceItem.call, result: traceItem.result!, stepIdx: idx });
          }
        }
        const currentStep: RecursionTraceItem | null =
          step < trace.length ? (trace[step] as RecursionTraceItem) : null;
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-2">Call Stack</h4>
              <div className="bg-gray-800/50 rounded-md p-4 min-h-[200px]">
                <AnimatePresence>
                  {callStack.map((call, depth) => (
                    <motion.div
                      key={`stack-${call}-depth${depth}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-2 mb-2 rounded-md font-mono text-sm ${
                        depth === callStack.length - 1
                          ? "bg-yellow-500/20 border border-yellow-500 text-yellow-400"
                          : "bg-gray-700/50 text-gray-400"
                      }`}
                    >
                      {"  ".repeat(depth)}
                      {call}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {callStack.length === 0 && (
                  <div className="text-gray-600 text-sm">Stack empty</div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Computed Results</h4>
              <div className="bg-gray-800/50 rounded-md p-4 min-h-[200px]">
                <AnimatePresence>
                  {completed.slice(-5).map((c) => (
                    <motion.div
                      key={`result-${c.call}-${c.stepIdx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 mb-2 rounded-md font-mono text-sm ${
                        (currentTrace[step - 1] as { duplicate?: boolean })?.duplicate
                          ? "bg-red-500/20 border border-red-500 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {c.call} = {c.result}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            {currentStep?.duplicate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md"
              >
                <span className="text-red-400 font-medium">Duplicate work!</span>
                <span className="text-red-300 ml-2">
                  {currentStep!.call} is being computed again
                </span>
              </motion.div>
            )}
          </div>
        );
      };
      const renderMemoization = () => {
        const currentTrace = trace.slice(0, step) as typeof memoTrace;
        const lastStep = currentTrace[currentTrace.length - 1];
        const memo = lastStep?.memo || {};
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-2">Execution</h4>
              <div className="bg-gray-800/50 rounded-md p-4 min-h-[200px] space-y-2">
                <AnimatePresence>
                  {currentTrace.slice(-6).map((t) => (
                    <motion.div
                      key={`trace-${t.call}-${t.action}-${t.result ?? 'pending'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded-md font-mono text-sm ${
                        t.action === "cache-hit"
                          ? "bg-purple-500/20 border border-purple-500 text-purple-400"
                          : t.action === "store"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-700/50 text-gray-400"
                      }`}
                    >
                      {t.call}
                      {t.action === "cache-hit" && (
                        <span className="ml-2 text-purple-300">CACHE HIT!</span>
                      )}
                      {t.result !== undefined && (
                        <span className="ml-2">= {t.result}</span>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Memo Cache</h4>
              <div className="bg-gray-800/50 rounded-md p-4 min-h-[200px]">
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={`memo-${i}`}
                      animate={{
                        scale: memo[i] !== undefined ? 1 : 0.9,
                        opacity: memo[i] !== undefined ? 1 : 0.4,
                      }}
                      className={`p-3 rounded-md text-center ${
                        memo[i] !== undefined
                          ? "bg-purple-500/20 border border-purple-500"
                          : "bg-gray-700/30 border border-gray-700"
                      }`}
                    >
                      <div className="text-xs text-gray-500 mb-1">memo[{i}]</div>
                      <div
                        className={`font-mono font-bold ${
                          memo[i] !== undefined
                            ? "text-purple-400"
                            : "text-gray-600"
                        }`}
                      >
                        {memo[i] ?? "—"}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 p-2 bg-purple-500/10 rounded-md text-sm text-purple-300">
                  Cache size: {Object.keys(memo).length} / 5
                </div>
              </div>
            </div>
          </div>
        );
      };
      const renderTabulation = () => {
        const currentTrace = trace.slice(0, step) as typeof tabulationTrace;
        const lastStep = currentTrace[currentTrace.length - 1];
        const dp = lastStep?.dp || [null, null, null, null, null];
        const currentI = lastStep?.i;
        return (
          <div>
            <h4 className="text-white font-medium mb-2">
              DP Table (filling right to left)
            </h4>
            <div className="bg-gray-800/50 rounded-md p-4">
              {/* Index row */}
              <div className="grid grid-cols-5 gap-2 mb-2">
                {nums.map((num, position) => (
                  <div
                    key={`tab-idx-pos${position}-val${num}`}
                    className="text-center text-xs text-gray-500"
                  >
                    i = {position}
                  </div>
                ))}
              </div>
              {/* Values row */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {nums.map((num, position) => (
                  <div
                    key={`tab-val-pos${position}-$${num}`}
                    className="p-2 bg-gray-700/30 rounded-md text-center"
                  >
                    <span className="text-gray-400 text-sm">${num}</span>
                  </div>
                ))}
              </div>
              {/* DP row */}
              <div className="grid grid-cols-5 gap-2">
                {dp.map((val, position) => (
                  <motion.div
                    key={`tab-dp-pos${position}-${val ?? 'null'}`}
                    animate={{
                      scale: currentI === position ? 1.1 : 1,
                      borderColor
    :                    currentI === position
                          ? "#3b82f6"
                          : val !== null
                            ? "#22c55e"
                            : "#374151",
                    }}
                    className={`p-3 rounded-md text-center border-2 ${
                      val !== null ? "bg-green-500/20" : "bg-gray-700/30"
                    }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">dp[{position}]</div>
                    <motion.div
                      key={val}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`font-mono font-bold text-lg ${
                        val !== null ? "text-green-400" : "text-gray-600"
                      }`}
                    >
                      {val ?? "—"}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
              {lastStep && (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-md"
                >
                  <code className="text-blue-400 font-mono text-sm">
                    {lastStep.formula}
                  </code>
                </motion.div>
              )}
            </div>
          </div>
        );
      };
      const renderOptimized = () => {
        const currentTrace = trace.slice(0, step) as typeof optimizedTrace;
        const lastStep = currentTrace[currentTrace.length - 1];
        return (
          <div>
            <h4 className="text-white font-medium mb-2">Two Variables Only!</h4>
            <div className="bg-gray-800/50 rounded-md p-4">
              {/* Array reference */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {nums.map((num, position) => (
                  <motion.div
                    key={`opt-pos${position}-$${num}`}
                    animate={{
                      scale: lastStep?.i === position ? 1.1 : 1,
                      borderColor: lastStep?.i === position ? "#22c55e" : "#374151",
                    }}
                    className="p-2 bg-gray-700/30 rounded-md text-center border-2"
                  >
                    <div className="text-xs text-gray-500">nums[{position}]</div>
                    <span className="text-gray-400 font-mono">${num}</span>
                  </motion.div>
                ))}
              </div>
              {/* Variables */}
              <div className="flex justify-center gap-8 my-6">
                <motion.div
                  animate={{ scale: lastStep ? 1.1 : 1 }}
                  className="p-4 bg-green-500/20 border-2 border-green-500 rounded-md text-center min-w-[120px]"
                >
                  <div className="text-xs text-green-400 mb-1">next1</div>
                  <div className="text-3xl font-mono font-bold text-green-400">
                    {lastStep?.next1 ?? 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">dp[i+1]</div>
                </motion.div>
                <motion.div
                  animate={{ scale: lastStep ? 1.1 : 1 }}
                  className="p-4 bg-blue-500/20 border-2 border-blue-500 rounded-md text-center min-w-[120px]"
                >
                  <div className="text-xs text-blue-400 mb-1">next2</div>
                  <div className="text-3xl font-mono font-bold text-blue-400">
                    {lastStep?.next2 ?? 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">dp[i+2]</div>
                </motion.div>
              </div>
              {lastStep && (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-500/10 border border-green-500/30 rounded-md text-center"
                >
                  <code className="text-green-400 font-mono text-sm">
                    {lastStep.formula}
                  </code>
                </motion.div>
              )}
              <div className="mt-4 p-3 bg-gray-700/30 rounded-md text-center">
                <span className="text-gray-400">Space used: </span>
                <span className="text-green-400 font-bold">2 variables</span>
                <span className="text-gray-500"> (constant space!)</span>
              </div>
            </div>
          </div>
        );
      };
      const renderVisualization = () => {
        switch (currentStage) {
          case "recursion":
            return renderRecursion();
          case "memoization":
            return renderMemoization();
          case "tabulation":
            return renderTabulation();
          case "optimized":
            return renderOptimized();
        }
      };
      const getColorClasses = (color: string) => {
        switch (color) {
          case "red":
            return "from-red-500/20 to-red-500/5 border-red-500/30";
          case "yellow":
            return "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30";
          case "blue":
            return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
          case "green":
            return "from-green-500/20 to-green-500/5 border-green-500/30";
          default:
            return "from-gray-500/20 to-gray-500/5 border-gray-500/30";
        }
      };
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div
            className={`p-4 bg-gradient-to-r ${getColorClasses(stageInfo.color)} border-b border-gray-800`}
          >
            <h3 className="text-lg font-semibold text-white">
              DP Transformation: Recursion → O(1) Space
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              House Robber: [{nums.join(", ")}] → Maximum: $12
            </p>
          </div>
          <div className="p-4">
            {/* Stage Selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {stageOrder.map((stage, idx) => (
                <button
                  key={stage}
                  onClick={() => {
                    setCurrentStage(stage);
                    reset();
                  }}
                  className={`flex-shrink-0 px-4 py-2 rounded-md font-medium transition flex items-center gap-2 ${
                    currentStage === stage
                      ? `bg-${stages[stage].color}-500/20 border border-${stages[stage].color}-500 text-white`
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                  style={{
                    backgroundColor
    :                  currentStage === stage
                        ? `var(--color-${stages[stage].color})`
                        : undefined,
                  }}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      currentStage === stage ? "bg-white/20" : "bg-gray-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {stages[stage].title}
                </button>
              ))}
            </div>
            {/* Stage Info */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div
                  className={`font-mono font-bold ${
                    stageInfo.time === "O(2ⁿ)" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {stageInfo.time}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Space</div>
                <div
                  className={`font-mono font-bold ${
                    stageInfo.space === "O(1)"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {stageInfo.space}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Progress</div>
                <div className="font-mono font-bold text-white">
                  {step} / {trace.length}
                </div>
              </div>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => dispatch({ type: "TOGGLE" })}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  isPlaying
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "bg-green-500 text-white hover:bg-green-400"
                }`}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => { if (step < trace.length) dispatch({ type: "ADVANCE" }); }}
                disabled={step >= trace.length}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition disabled:opacity-50"
              >
                Step
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="100"
                  value={1200 - speed}
                  onChange={(e) => setSpeed(1200 - Number(e.target.value))}
                  className="w-20 accent-indigo-500"
                />
              </div>
            </div>
            {/* Visualization */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderVisualization()}
              </motion.div>
            </AnimatePresence>
            {/* Description */}
            <motion.div
              key={currentStage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 p-3 rounded-md border ${getColorClasses(stageInfo.color)}`}
            >
              <p className="text-gray-300 text-sm">
                <strong className="text-white">{stageInfo.title}:</strong>{" "}
                {stageInfo.description}
              </p>
            </motion.div>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

87. **Forbidden non-null assertion** (`JS-0339`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 291
    ```typescript
    >
                <span className="text-red-400 font-medium">Duplicate work!</span>
                <span className="text-red-300 ml-2">
                  {currentStep!.call} is being computed again
                </span>
              </motion.div>
            )}
    ```
    **Category:** Anti-pattern
    **Severity:** major

88. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 476
    ```typescript
    <div className="grid grid-cols-5 gap-2 mb-4">
                {nums.map((num, position) => (
                  <motion.div
                    key={`opt-pos${position}-$${num}`}
                    animate={{
                      scale: lastStep?.i === position ? 1.1 : 1,
                      borderColor: lastStep?.i === position ? "#22c55e" : "#374151",
    ```
    **Category:** Bug risk
    **Severity:** major

89. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 393
    ```typescript
    <div className="grid grid-cols-5 gap-2 mb-2">
                {nums.map((num, position) => (
                  <div
                    key={`tab-idx-pos${position}-val${num}`}
                    className="text-center text-xs text-gray-500"
                  >
                    i = {position}
    ```
    **Category:** Bug risk
    **Severity:** major

90. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 405
    ```typescript
    <div className="grid grid-cols-5 gap-2 mb-4">
                {nums.map((num, position) => (
                  <div
                    key={`tab-val-pos${position}-$${num}`}
                    className="p-2 bg-gray-700/30 rounded-md text-center"
                  >
                    <span className="text-gray-400 text-sm">${num}</span>
    ```
    **Category:** Bug risk
    **Severity:** major

91. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 240
    ```typescript
    <AnimatePresence>
                  {callStack.map((call, depth) => (
                    <motion.div
                      key={`stack-${call}-depth${depth}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
    ```
    **Category:** Bug risk
    **Severity:** major

92. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/DPTransformationVisualizer.tsx`
    **Line:** 417
    ```typescript
    <div className="grid grid-cols-5 gap-2">
                {dp.map((val, position) => (
                  <motion.div
                    key={`tab-dp-pos${position}-${val ?? 'null'}`}
                    animate={{
                      scale: currentI === position ? 1.1 : 1,
                      borderColor:
    ```
    **Category:** Bug risk
    **Severity:** major

93. **`buildRobberTree` has a cyclomatic complexity of 7 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 179
    ```typescript
    );
    
      const buildRobberTree = useCallback(
        function buildRobberTree(
        nums: number[],
        i: number = 0,
        depth: number = 0,
    ```
    **Category:** Anti-pattern
    **Severity:** minor

94. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 32-41
    ```typescript
    | { type: "RESET" };
    
    function playReducer(state: PlayState, action: PlayAction): PlayState {
      switch (action.type) {
        case "TOGGLE":
          return { ...state, isPlaying: !state.isPlaying };
        case "STOP":
          return { ...state, isPlaying: false };
        case "ADVANCE":
          return { ...state, step: state.step + 1 };
        case "RESET":
          return { step: 0, isPlaying: false };
      }
    }
    
    const initialPlayState: PlayState = { step: 0, isPlaying: false };
    ```
    **Category:** Anti-pattern
    **Severity:** minor

95. **`buildFibTree` has a cyclomatic complexity of 8 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 85
    ```typescript
    const [cacheHitCount, setCacheHitCount] = useState(0);
    
      const buildFibTree = useCallback(
        function buildFibTree(
          n: number,
          depth: number = 0,
          id: string = "0",
    ```
    **Category:** Anti-pattern
    **Severity:** minor

96. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 31-42
    ```typescript
    | { type: "ADVANCE" }
      | { type: "RESET" };
    
    function playReducer(state: PlayState, action: PlayAction): PlayState {
      switch (action.type) {
        case "TOGGLE":
          return { ...state, isPlaying: !state.isPlaying };
        case "STOP":
          return { ...state, isPlaying: false };
        case "ADVANCE":
          return { ...state, step: state.step + 1 };
        case "RESET":
          return { step: 0, isPlaying: false };
      }
    }
    
    const initialPlayState: PlayState = { step: 0, isPlaying: false };
    ```
    **Category:** Anti-pattern
    **Severity:** minor

97. **`buildClimbingTree` has a cyclomatic complexity of 8 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 129
    ```typescript
    );
    
      const buildClimbingTree = useCallback(
        function buildClimbingTree(
          n: number,
          depth: number = 0,
          id: string = "0",
    ```
    **Category:** Anti-pattern
    **Severity:** minor

98. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 31
    ```typescript
    | { type: "ADVANCE" }
      | { type: "RESET" };
    
    function playReducer(state: PlayState, action: PlayAction): PlayState {
      switch (action.type) {
        case "TOGGLE":
          return { ...state, isPlaying: !state.isPlaying };
    ```
    **Category:** Anti-pattern
    **Severity:** minor

99. **Unexpected function declaration in the global scope, wrap in an IIFE for a local variable, assign as global property for a global variable** (`JS-0067`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 67-643
    ```typescript
    },
    };
    
    export default function DPTreeVisualizer({
      problem: initialProblem = "fibonacci",
      showMemo: initialShowMemo = false,
    }: DPTreeVisualizerProps) {
      const [problem, setProblem] = useState<Problem>(initialProblem);
      const [showMemo, setShowMemo] = useState(initialShowMemo);
      const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
      const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
      const [cacheHits, setCacheHits] = useState<Set<string>>(new Set());
      const [{ step, isPlaying }, dispatch] = useReducer(
        playReducer,
        initialPlayState
      );
      const [speed, setSpeed] = useState(600);
      const [callCount, setCallCount] = useState(0);
      const [cacheHitCount, setCacheHitCount] = useState(0);
      const buildFibTree = useCallback(
        function buildFibTree(
          n: number,
          depth: number = 0,
          id: string = "0",
          memo: Set<number> = new Set()
        ): TreeNode | null {
          if (n < 0) return null;
          const isCacheHit = showMemo && memo.has(n);
          const node: TreeNode = {
            id,
            label: `fib(${n})`,
            value: n,
            depth,
            children: [],
            isCacheHit,
          };
          if (n <= 1) {
            node.result = n;
            return node;
          }
          if (isCacheHit) {
            return node;
          }
          if (showMemo) {
            memo.add(n);
          }
          const left = buildFibTree(n - 1, depth + 1, `${id}L`, memo);
          const right = buildFibTree(n - 2, depth + 1, `${id}R`, memo);
          if (left) node.children.push(left);
          if (right) node.children.push(right);
          return node;
        },
        [showMemo]
      );
      const buildClimbingTree = useCallback(
        function buildClimbingTree(
          n: number,
          depth: number = 0,
          id: string = "0",
          memo: Set<number> = new Set()
        ): TreeNode | null {
          if (n < 0) return null;
          const isCacheHit = showMemo && memo.has(n);
          const node: TreeNode = {
            id,
            label: `ways(${n})`,
            value: n,
            depth,
            children: [],
            isCacheHit,
          };
          if (n <= 1) {
            node.result = 1;
            return node;
          }
          if (isCacheHit) {
            return node;
          }
          if (showMemo) {
            memo.add(n);
          }
          const left = buildClimbingTree(n - 1, depth + 1, `${id}L`, memo);
          const right = buildClimbingTree(n - 2, depth + 1, `${id}R`, memo);
          if (left) {
            left.choice = "+1 step";
            node.children.push(left);
          }
          if (right) {
            right.choice = "+2 steps";
            node.children.push(right);
          }
          return node;
        },
        [showMemo]
      );
      const buildRobberTree = useCallback(
        function buildRobberTree(
        nums: number[],
        i: number = 0,
        depth: number = 0,
        id: string = "0",
        memo: Set<number> = new Set()
      ): TreeNode | null {
        if (i >= nums.length) {
          return {
            id,
            label: `rob(${i})`,
            value: i,
            result: 0,
            depth,
            children: [],
          };
        }
        const isCacheHit = showMemo && memo.has(i);
        const node: TreeNode = {
          id,
          label: `rob(${i})`,
          value: i,
          depth,
          children: [],
          isCacheHit,
        };
        if (isCacheHit) {
          return node;
        }
        if (showMemo) {
          memo.add(i);
        }
        const robChild = buildRobberTree(nums, i + 2, depth + 1, `${id}R`, memo);
        const skipChild = buildRobberTree(nums, i + 1, depth + 1, `${id}S`, memo);
        if (robChild) {
          robChild.choice = `ROB $${nums[i]}`;
          node.children.push(robChild);
        }
        if (skipChild) {
          skipChild.choice = "SKIP";
          node.children.push(skipChild);
        }
        return node;
      },
      [showMemo]
    );
      const tree = useMemo(() => {
        const config = problemConfigs[problem];
        switch (problem) {
          case "fibonacci":
            return buildFibTree(config.input as number);
          case "climbing-stairs":
            return buildClimbingTree(config.input as number);
          case "house-robber":
            return buildRobberTree(config.input as number[], 0);
          default:
            return null;
        }
      }, [problem, buildFibTree, buildClimbingTree, buildRobberTree]);
      const generateExecutionOrder = useCallback(
        (node: TreeNode | null): string[] => {
          if (!node) return [];
          const order: string[] = [];
          function traverse(n: TreeNode) {
            order.push(`enter:${n.id}:${n.isCacheHit ? "hit" : "miss"}`);
            if (!n.isCacheHit) {
              for (const child of n.children) {
                traverse(child);
              }
            }
            order.push(`exit:${n.id}:${n.isCacheHit ? "hit" : "miss"}`);
          }
          traverse(node);
          return order;
        },
        []
      );
      const executionOrder = useMemo(() => {
        return tree ? generateExecutionOrder(tree) : [];
      }, [tree, generateExecutionOrder]);
      useEffect(() => {
        if (!isPlaying || step >= executionOrder.length) {
          if (step >= executionOrder.length && step > 0) {
            dispatch({ type: "STOP" });
          }
          return;
        }
        const timer = setTimeout(() => {
          const action = executionOrder[step];
          const [type, nodeId, hitStatus] = action.split(":");
          const isHit = hitStatus === "hit";
          if (type === "enter") {
            setActiveNodes((prev) => new Set([...prev, nodeId]));
            setCallCount((c) => c + 1);
            if (isHit) {
              setCacheHits((prev) => new Set([...prev, nodeId]));
              setCacheHitCount((c) => c + 1);
            }
          } else if (type === "exit") {
            setActiveNodes((prev) => {
              const next = new Set(prev);
              next.delete(nodeId);
              return next;
            });
            setCompletedNodes((prev) => new Set([...prev, nodeId]));
          }
          dispatch({ type: "ADVANCE" });
        }, speed);
        return () => clearTimeout(timer);
      }, [isPlaying, step, executionOrder, speed]);
      const reset = () => {
        dispatch({ type: "RESET" });
        setActiveNodes(new Set());
        setCompletedNodes(new Set());
        setCacheHits(new Set());
        setCallCount(0);
        setCacheHitCount(0);
      };
      const countNodes = (node: TreeNode | null): number => {
        if (!node) return 0;
        return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
      };
      const totalNodes = tree ? countNodes(tree) : 0;
      const renderNode = (
        node: TreeNode | null,
        isRoot: boolean = true
      ): React.ReactNode => {
        if (!node) return null;
        const isActive = activeNodes.has(node.id);
        const isCompleted = completedNodes.has(node.id);
        const isCacheHit = cacheHits.has(node.id);
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: node.depth * 0.05 }}
            className="flex flex-col items-center"
          >
            {node.choice && !isRoot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs mb-1 px-2 py-0.5 rounded-full ${
                  node.choice.includes("ROB")
                    ? "bg-green-500/20 text-green-400"
                    : node.choice === "SKIP"
                      ? "bg-gray-500/20 text-gray-400"
                      : "bg-indigo-500/20 text-indigo-400"
                }`}
              >
                {node.choice}
              </motion.div>
            )}
            <motion.div
              animate={{
                scale: isActive ? 1.15 : 1,
                boxShadow: isActive ? "0 0 20px rgba(234, 179, 8, 0.5)" : "none",
              }}
              transition={{ duration: 0.2 }}
              className={`None
                relative px-3 py-2 rounded-md font-mono text-sm font-medium
                border-2 transition-colors duration-300 min-w-[70px] text-center
                ${isActive ? "bg-yellow-500 border-yellow-400 text-black" : ""}None
                ${isCacheHit && isCompleted ? "bg-purple-500/30 border-purple-500 text-purple-300" : ""}None
                ${isCompleted && !isActive && !isCacheHit ? "bg-green-500/20 border-green-500 text-green-400" : ""}None
                ${!isActive && !isCompleted ? "bg-gray-800 border-gray-700 text-gray-400" : ""}None
              `}
            >
              <span>{node.label}</span>
              {isCacheHit && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded-full"
                >
                  CACHE
                </motion.span>
              )}
              {node.result !== undefined && isCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-green-400 whitespace-nowrap"
                >
                  = {node.result}
                </motion.div>
              )}
            </motion.div>
            {node.children.length > 0 && (
              <div className="relative mt-8">
                <svg
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full"
                  width={node.children.length * 100}
                  height="32"
                  style={{
                    marginLeft
    :                  node.children.length === 1
                        ? 0
                        : -(node.children.length - 1) * 50,
                  }}
                >
                  {node.children.map((child, idx) => {
                    const startX = (node.children.length * 100) / 2;
                    const endX = idx * 100 + 50;
                    const childCompleted = completedNodes.has(child.id);
                    const childCacheHit = cacheHits.has(child.id);
                    return (
                      <motion.line
                        key={child.id}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                        x1={startX}
                        y1="0"
                        x2={endX}
                        y2="32"
                        stroke={
                          childCacheHit
                            ? "#a855f7"
                            : childCompleted
                              ? "#22c55e"
                              : "#374151"
                        }
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
                <div className="flex gap-6 justify-center">
                  {node.children.map((child) => renderNode(child, false))}
                </div>
              </div>
            )}
          </motion.div>
        );
      };
      return (
        <div className="bg-gray-900 rounded-md border border-gray-800 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              DP Decision Tree Visualizer
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Watch how recursive calls branch out and see memoization in action
            </p>
          </div>
          <div className="p-4">
            {/* Problem Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.keys(problemConfigs) as Problem[]).map((p) => (
                <button
                  key={`p-${p}`}
                  onClick={() => {
                    setProblem(p);
                    reset();
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    problem === p
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {problemConfigs[p].title}
                </button>
              ))}
            </div>
            {/* Memo Toggle */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-800/50 rounded-md">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMemo}
                  onChange={(e) => {
                    setShowMemo(e.target.checked);
                    reset();
                  }}
                  className="w-4 h-4 rounded-md accent-purple-500"
                />
                <span className="text-white font-medium">Enable Memoization</span>
              </label>
              <span className="text-gray-500 text-sm">
                {showMemo
                  ? "Cache enabled - watch for purple CACHE hits!"
                  : "Pure recursion - notice repeated work"}
              </span>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => dispatch({ type: "TOGGLE" })}
                className={`px-4 py-2 rounded-md font-medium transition flex items-center gap-2 ${
                  isPlaying
                    ? "bg-yellow-500 text-black hover:bg-yellow-400"
                    : "bg-green-500 text-white hover:bg-green-400"
                }`}
              >
                {isPlaying ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play
                  </>
                )}
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-600 transition"
              >
                Reset
              </button>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-gray-400 text-sm">Speed:</span>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={1100 - speed}
                  onChange={(e) => setSpeed(1100 - Number(e.target.value))}
                  className="w-24 accent-indigo-500"
                />
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-xl font-bold text-white">{totalNodes}</div>
                <div className="text-xs text-gray-500">Total Nodes</div>
              </div>
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-xl font-bold text-yellow-400">{callCount}</div>
                <div className="text-xs text-gray-500">Function Calls</div>
              </div>
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-xl font-bold text-green-400">
                  {completedNodes.size}
                </div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="bg-gray-800/50 rounded-md p-3 text-center">
                <div className="text-xl font-bold text-purple-400">
                  {cacheHitCount}
                </div>
                <div className="text-xs text-gray-500">Cache Hits</div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-yellow-500"></div>
                <span className="text-gray-400">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-green-500/20 border-2 border-green-500"></div>
                <span className="text-gray-400">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-purple-500/30 border-2 border-purple-500"></div>
                <span className="text-gray-400">Cache Hit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-gray-800 border-2 border-gray-700"></div>
                <span className="text-gray-400">Pending</span>
              </div>
            </div>
            {/* Tree Visualization */}
            <div className="bg-gray-800/30 rounded-md p-6 overflow-x-auto">
              <div className="flex justify-center min-w-max py-8">
                <AnimatePresence mode="wait">
                  {tree && renderNode(tree)}
                </AnimatePresence>
              </div>
            </div>
            {/* Formula Display */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-md">
              <code className="text-indigo-400 text-sm font-mono">
                {problemConfigs[problem].description}
              </code>
            </div>
            {/* Insight Box */}
            <motion.div
              key={showMemo ? "memo" : "no-memo"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-md border ${
                showMemo
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-yellow-500/10 border-yellow-500/30"
              }`}
            >
              {showMemo ? (
                <p className="text-purple-300 text-sm">
                  <strong>With Memoization:</strong> Notice the purple CACHE hits!
                  Once we compute a value, we never compute it again. This reduces
                  time complexity from O(2<sup>n</sup>) to O(n).
                </p>
              ) : (
                <p className="text-yellow-300 text-sm">
                  <strong>Without Memoization:</strong> Watch how the same
                  subproblems are solved multiple times. This is{" "}
                  <strong>overlapping subproblems</strong> — the key indicator that
                  DP will help!
                </p>
              )}
            </motion.div>
          </div>
        </div>
      );
    }
    ```
    **Category:** Anti-pattern
    **Severity:** minor

100. **Type number trivially inferred from a number literal, remove type annotation** (`JS-0331`)
     **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
     **Line:** 181
     ```typescript
     const buildRobberTree = useCallback(
         function buildRobberTree(
         nums: number[],
         i: number = 0,
         depth: number = 0,
         id: string = "0",
         memo: Set<number> = new Set()
     ```
     **Category:** Anti-pattern
     **Severity:** major

*...and 343 more occurrences. [See full list on DeepSource](https://app.deepsource.com/gh/imrishuroy/algopatterns/run/7524acfd-7779-4b08-bb70-49f7e942f794/).*### Secrets
**Status:** Success
**Findings:** No new issues detected
### SQL
**Status:** Success
**Findings:** No new issues detected
### Docker
**Status:** Success
**Findings:** No new issues detected

