# DeepSource Code Review Report

**Repository:** imrishuroy/algopatterns
**Branch:** `ft/ai-tutor`
**PR:** #64 · https://github.com/imrishuroy/algopatterns/pull/64
**Commit:** b63dd48...fa7b0fe
**Run:** [https://app.deepsource.com/gh/imrishuroy/algopatterns/run/7524acfd-7779-4b08-bb70-49f7e942f794/](https://app.deepsource.com/gh/imrishuroy/algopatterns/run/7524acfd-7779-4b08-bb70-49f7e942f794/)

---

## Summary
- **Go:** No issues detected- **Shell:** No issues detected- **JavaScript:** 331 issues- **Secrets:** No issues detected- **SQL:** No issues detected- **Docker:** No issues detected

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
**Findings:** 331 new issues

1. **Function has a cyclomatic complexity of 8 with "medium" risk** (`JS-R1005`)
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

3. **`PatternPageClient` has a cyclomatic complexity of 12 with "medium" risk** (`JS-R1005`)
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

4. **Remove redundant `undefined` from function call** (`JS-W1042`)
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

5. **Arrow function expected no return value** (`JS-0045`)
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

6. **Expected a `for-of` loop instead of a `for` loop with this simple iteration** (`JS-0361`)
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

7. **`ProblemPageClient` has a cyclomatic complexity of 127 with "critical" risk** (`JS-R1005`)
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

8. **Remove redundant `undefined` from function call** (`JS-W1042`)
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

9. **Function has a cyclomatic complexity of 15 with "medium" risk** (`JS-R1005`)
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

10. **Unexpected string concatenation** (`JS-0246`)
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

11. **Function has a cyclomatic complexity of 16 with "high" risk** (`JS-R1005`)
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

12. **Function has a cyclomatic complexity of 23 with "high" risk** (`JS-R1005`)
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

13. **Function has a cyclomatic complexity of 13 with "medium" risk** (`JS-R1005`)
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

14. **Unexpected string concatenation** (`JS-0246`)
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

16. **Remove redundant `undefined` from function call** (`JS-W1042`)
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

17. **Function has a cyclomatic complexity of 12 with "medium" risk** (`JS-R1005`)
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

18. **Function has a cyclomatic complexity of 13 with "medium" risk** (`JS-R1005`)
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

19. **Function has a cyclomatic complexity of 10 with "medium" risk** (`JS-R1005`)
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

20. **Do not use Array index in keys** (`JS-0437`)
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

21. **JSX tree is too deeply nested. Found 5 levels of nesting** (`JS-0415`)
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

22. **Template string can be replaced with regular string literal** (`JS-R1004`)
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

23. **`AIChatPanel` has a cyclomatic complexity of 29 with "very-high" risk** (`JS-R1005`)
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

24. **Function has a cyclomatic complexity of 6 with "medium" risk** (`JS-R1005`)
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

25. **Duplicate assignment statement found** (`JS-W1032`)
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

26. **`formatInlineText` has a cyclomatic complexity of 8 with "medium" risk** (`JS-R1005`)
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

27. **Function has a cyclomatic complexity of 12 with "medium" risk** (`JS-R1005`)
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

28. **Do not use Array index in keys** (`JS-0437`)
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

29. **Do not use Array index in keys** (`JS-0437`)
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

30. **Do not use Array index in keys** (`JS-0437`)
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

31. **Do not use Array index in keys** (`JS-0437`)
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

32. **Do not use Array index in keys** (`JS-0437`)
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

33. **Do not use Array index in keys** (`JS-0437`)
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

34. **Do not use Array index in keys** (`JS-0437`)
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

35. **Do not use Array index in keys** (`JS-0437`)
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

36. **Do not use Array index in keys** (`JS-0437`)
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

37. **JSX tree is too deeply nested. Found 5 levels of nesting** (`JS-0415`)
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

38. **`InlineAI` has a cyclomatic complexity of 13 with "medium" risk** (`JS-R1005`)
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

39. **`QuickActions` has a cyclomatic complexity of 7 with "medium" risk** (`JS-R1005`)
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

40. **`formReducer` has a cyclomatic complexity of 6 with "medium" risk** (`JS-R1005`)
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

41. **`Highlightable` has a cyclomatic complexity of 21 with "high" risk** (`JS-R1005`)
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

42. **`playbackReducer` has a cyclomatic complexity of 7 with "medium" risk** (`JS-R1005`)
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

43. **Function has a cyclomatic complexity of 10 with "medium" risk** (`JS-R1005`)
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

44. **`renderRecursion` has a cyclomatic complexity of 7 with "medium" risk** (`JS-R1005`)
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

45. **Forbidden non-null assertion** (`JS-0339`)
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

46. **Do not use Array index in keys** (`JS-0437`)
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

47. **Do not use Array index in keys** (`JS-0437`)
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

48. **Do not use Array index in keys** (`JS-0437`)
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

49. **Do not use Array index in keys** (`JS-0437`)
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

50. **Do not use Array index in keys** (`JS-0437`)
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

51. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
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

52. **`buildFibTree` has a cyclomatic complexity of 8 with "medium" risk** (`JS-R1005`)
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

53. **`buildRobberTree` has a cyclomatic complexity of 7 with "medium" risk** (`JS-R1005`)
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

54. **Expected a default case** (`JS-0047`)
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

55. **`buildClimbingTree` has a cyclomatic complexity of 8 with "medium" risk** (`JS-R1005`)
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

56. **Type number trivially inferred from a number literal, remove type annotation** (`JS-0331`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 182
    ```typescript
    function buildRobberTree(
        nums: number[],
        i: number = 0,
        depth: number = 0,
        id: string = "0",
        memo: Set<number> = new Set()
      ): TreeNode | null {
    ```
    **Category:** Anti-pattern
    **Severity:** major

57. **Type number trivially inferred from a number literal, remove type annotation** (`JS-0331`)
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

58. **Type string trivially inferred from a string literal, remove type annotation** (`JS-0331`)
    **File:** `frontend/src/components/visualizers/DPTreeVisualizer.tsx`
    **Line:** 183
    ```typescript
    nums: number[],
        i: number = 0,
        depth: number = 0,
        id: string = "0",
        memo: Set<number> = new Set()
      ): TreeNode | null {
        if (i >= nums.length) {
    ```
    **Category:** Anti-pattern
    **Severity:** major

59. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/FindAnagramsVisualizer.tsx`
    **Line:** 205
    ```typescript
    return (
                    <motion.div
                      key={`s-pos${position}-${char}`}
                      animate={{
                        scale: position === currentIdx ? 1.1 : 1,
                        y: position === currentIdx ? -5 : 0,
    ```
    **Category:** Bug risk
    **Severity:** major

60. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/FixedWindowVisualizer.tsx`
    **Line:** 171
    ```typescript
    return (
                    <motion.div
                      key={`arr-pos${position}-val${val}`}
                      animate={{
                        scale: inWindow ? 1.05 : 1,
                        y: inWindow ? -5 : 0,
    ```
    **Category:** Bug risk
    **Severity:** major

61. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/FixedWindowVisualizer.tsx`
    **Line:** 202
    ```typescript
    <div className="flex gap-2 mt-1">
                  {arr.map((val, position) => (
                    <div
                      key={`bracket-pos${position}-val${val}`}
                      className={`w-14 h-1 rounded-md ${
                        position >= winLeft && position <= winRight
                          ? "bg-blue-500"
    ```
    **Category:** Bug risk
    **Severity:** major

62. **Function has a cyclomatic complexity of 6 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/GridBFSVisualizer.tsx`
    **Line:** 93
    ```typescript
    });
      }, [initGrid]);
    
      const getNeighbors = useCallback((r: number, c: number): [number, number][] => {
        const dirs = [
          [0, 1],
          [0, -1],
    ```
    **Category:** Anti-pattern
    **Severity:** minor

63. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/GridBFSVisualizer.tsx`
    **Line:** 40-49
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
    
    export default function GridBFSVisualizer() {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

64. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/GridBFSVisualizer.tsx`
    **Line:** 39
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

65. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/GridBFSVisualizer.tsx`
    **Line:** 356
    ```typescript
    <div className="flex flex-wrap gap-1 min-h-[32px]">
                  {(mode === "bfs" ? queue : stack).map(([r, c], position) => (
                    <span
                      key={`frontier-r${r}-c${c}-pos${position}`}
                      className={`px-2 py-1 rounded-md text-xs font-mono ${
                        position === 0 && mode === "bfs"
                          ? "bg-yellow-500 text-black"
    ```
    **Category:** Bug risk
    **Severity:** major

66. **Do not use Array index in keys** (`JS-0437`)
    **File:** `frontend/src/components/visualizers/GridBFSVisualizer.tsx`
    **Line:** 314
    ```typescript
    <div className="inline-block p-4 bg-gray-800/50 rounded-md">
                {grid.map((row, rowIndex) => (
                  <div
                    key={`row${rowIndex}-${row.map(c => c.state).join('')}`}
                    className="flex gap-1 mb-1"
                  >
                    {row.map((cell) => (
    ```
    **Category:** Bug risk
    **Severity:** major

67. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/IntervalIntersectionVisualizer.tsx`
    **Line:** 19-28
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
    
    const listA: Interval[] = [
    ```
    **Category:** Anti-pattern
    **Severity:** minor

68. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/IntervalIntersectionVisualizer.tsx`
    **Line:** 18
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

69. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/KadaneVisualizer.tsx`
    **Line:** 24-33
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
    
    export default function KadaneVisualizer() {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

70. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/KadaneVisualizer.tsx`
    **Line:** 23
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

71. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/KnapsackVisualizer.tsx`
    **Line:** 20
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

72. **`KnapsackVisualizer` has a cyclomatic complexity of 11 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/KnapsackVisualizer.tsx`
    **Line:** 96
    ```typescript
    return { steps, dp };
      }
    
    export default function KnapsackVisualizer() {
      const [{ step, isPlaying }, dispatch] = useReducer(playReducer, { step: 0, isPlaying: false });
      const [speed, setSpeed] = useState(600);
      const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    ```
    **Category:** Anti-pattern
    **Severity:** minor

73. **Variable name is too small** (`JS-C1002`)
    **File:** `frontend/src/components/visualizers/KnapsackVisualizer.tsx`
    **Line:** 114
    ```typescript
    const backtrackSolution = useCallback(
        function backtrackSolution() {
          const selected = new Set<number>();
          let w = capacity;
    
          for (let i = items.length; i > 0 && w > 0; i--) {
            const stepIdx = (i - 1) * (capacity + 1) + w;
    ```
    **Category:** Anti-pattern
    **Severity:** minor

74. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/KnapsackVisualizer.tsx`
    **Line:** 21-30
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
    
    const capacity = 7;
    ```
    **Category:** Anti-pattern
    **Severity:** minor

75. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/KokoEatingVisualizer.tsx`
    **Line:** 22
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

76. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/KokoEatingVisualizer.tsx`
    **Line:** 23-32
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
    
    export default function KokoEatingVisualizer() {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

77. **Forbidden non-null assertion** (`JS-0339`)
    **File:** `frontend/src/components/visualizers/LevelOrderVisualizer.tsx`
    **Line:** 45
    ```typescript
    3: sampleTree,
          9: sampleTree.left!,
          20: sampleTree.right!,
          15: sampleTree.right!.left!,
          7: sampleTree.right!.right!,
        }),
        []
    ```
    **Category:** Anti-pattern
    **Severity:** major

78. **Forbidden non-null assertion** (`JS-0339`)
    **File:** `frontend/src/components/visualizers/LevelOrderVisualizer.tsx`
    **Line:** 43
    ```typescript
    const nodeMap: Record<number, TreeNode> = useMemo(
        () => ({
          3: sampleTree,
          9: sampleTree.left!,
          20: sampleTree.right!,
          15: sampleTree.right!.left!,
          7: sampleTree.right!.right!,
    ```
    **Category:** Anti-pattern
    **Severity:** major

79. **Forbidden non-null assertion** (`JS-0339`)
    **File:** `frontend/src/components/visualizers/LevelOrderVisualizer.tsx`
    **Line:** 46
    ```typescript
    9: sampleTree.left!,
          20: sampleTree.right!,
          15: sampleTree.right!.left!,
          7: sampleTree.right!.right!,
        }),
        []
      );
    ```
    **Category:** Anti-pattern
    **Severity:** major

80. **Forbidden non-null assertion** (`JS-0339`)
    **File:** `frontend/src/components/visualizers/LevelOrderVisualizer.tsx`
    **Line:** 44
    ```typescript
    () => ({
          3: sampleTree,
          9: sampleTree.left!,
          20: sampleTree.right!,
          15: sampleTree.right!.left!,
          7: sampleTree.right!.right!,
        }),
    ```
    **Category:** Anti-pattern
    **Severity:** major

81. **Forbidden non-null assertion** (`JS-0339`)
    **File:** `frontend/src/components/visualizers/LevelOrderVisualizer.tsx`
    **Line:** 46
    ```typescript
    9: sampleTree.left!,
          20: sampleTree.right!,
          15: sampleTree.right!.left!,
          7: sampleTree.right!.right!,
        }),
        []
      );
    ```
    **Category:** Anti-pattern
    **Severity:** major

82. **Forbidden non-null assertion** (`JS-0339`)
    **File:** `frontend/src/components/visualizers/LevelOrderVisualizer.tsx`
    **Line:** 45
    ```typescript
    3: sampleTree,
          9: sampleTree.left!,
          20: sampleTree.right!,
          15: sampleTree.right!.left!,
          7: sampleTree.right!.right!,
        }),
        []
    ```
    **Category:** Anti-pattern
    **Severity:** major

83. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/MeetingRoomsVisualizer.tsx`
    **Line:** 40
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

84. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/MeetingRoomsVisualizer.tsx`
    **Line:** 41-50
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
    
    export default function MeetingRoomsVisualizer() {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

85. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/MemoryVisualizer.tsx`
    **Line:** 27-36
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
    
    const allSteps: {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

86. **`MemoryVisualizer` has a cyclomatic complexity of 16 with "high" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/MemoryVisualizer.tsx`
    **Line:** 208
    ```typescript
    },
      ];
    
    export default function MemoryVisualizer() {
      const [frames, setFrames] = useState<MemoryFrame[]>([]);
      const [{ step, isPlaying }, dispatch] = useReducer(playReducer, { step: 0, isPlaying: false });
      const [speed, setSpeed] = useState(1200);
    ```
    **Category:** Anti-pattern
    **Severity:** minor

87. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/MemoryVisualizer.tsx`
    **Line:** 26
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

88. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/MergeIntervalsVisualizer.tsx`
    **Line:** 20
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

89. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/MergeIntervalsVisualizer.tsx`
    **Line:** 21-30
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
    
    const initialIntervals = [
    ```
    **Category:** Anti-pattern
    **Severity:** minor

90. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/MergeKListsVisualizer.tsx`
    **Line:** 22-31
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
    
    const INITIAL_LISTS = [
    ```
    **Category:** Anti-pattern
    **Severity:** minor

91. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/MergeKListsVisualizer.tsx`
    **Line:** 21
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

92. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/NQueensVisualizer.tsx`
    **Line:** 23
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

93. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/NQueensVisualizer.tsx`
    **Line:** 24-33
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
    
    export default function NQueensVisualizer() {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

94. **Function has a cyclomatic complexity of 9 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/NQueensVisualizer.tsx`
    **Line:** 59
    ```typescript
    return b.map((row) => [...row]);
      };
    
      const isSafe = useCallback((b: BoardState, row: number, col: number): boolean => {
        // Check column above
        for (let i = 0; i < row; i++) {
          if (b[i][col] === "Q") return false;
    ```
    **Category:** Anti-pattern
    **Severity:** minor

95. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/PermutationsVisualizer.tsx`
    **Line:** 14-23
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
    
    export default function PermutationsVisualizer() {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

96. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/PermutationsVisualizer.tsx`
    **Line:** 13
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

97. **`calculateResult` has a cyclomatic complexity of 6 with "medium" risk** (`JS-R1005`)
    **File:** `frontend/src/components/visualizers/RecursionTreeVisualizer.tsx`
    **Line:** 98
    ```typescript
    }, [tree, generateExecutionOrder]);
    
      const calculateResult = useCallback(
        function calculateResult(node: TreeNode): number {
          if (node.value <= 1) return node.value;
    
          const leftResult = node.left
    ```
    **Category:** Anti-pattern
    **Severity:** minor

98. **Expected a default case** (`JS-0047`)
    **File:** `frontend/src/components/visualizers/RecursionVsIterationVisualizer.tsx`
    **Line:** 39-48
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
    
    export default function RecursionVsIterationVisualizer() {
    ```
    **Category:** Anti-pattern
    **Severity:** minor

99. **Expected to return a value at the end of function 'playReducer'** (`JS-0045`)
    **File:** `frontend/src/components/visualizers/RecursionVsIterationVisualizer.tsx`
    **Line:** 38
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

100. **Function has a cyclomatic complexity of 16 with "high" risk** (`JS-R1005`)
     **File:** `frontend/src/components/visualizers/ReorderListVisualizer.tsx`
     **Line:** 212
     ```typescript
     Original List (finding middle):
                 </div>
                 <div className="flex items-center gap-2">
                   {ORIGINAL_LIST.map((val, idx) => (
                     <React.Fragment key={`node-${val}-${idx}`}>
                       <motion.div
                         animate={{
     ```
     **Category:** Anti-pattern
     **Severity:** minor

*...and 231 more occurrences. [See full list on DeepSource](https://app.deepsource.com/gh/imrishuroy/algopatterns/run/7524acfd-7779-4b08-bb70-49f7e942f794/).*### Secrets
**Status:** Success
**Findings:** No new issues detected
### SQL
**Status:** Success
**Findings:** No new issues detected
### Docker
**Status:** Success
**Findings:** No new issues detected

