"use client";

import CodeBlock from "@/components/ui/CodeBlock";

export default function KeyDifferencesSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Key Differences Explained
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        Let&apos;s understand the fundamental differences through the lens of
        the same problem:
        <strong className="text-white">
          {" "}
          finding paths in a decision tree
        </strong>
        .
      </p>

      {/* Visual: Decision Tree */}
      <h2 className="text-2xl font-bold text-white mb-4">
        The Decision Tree Mental Model
      </h2>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-6 mb-8 font-mono text-sm">
        <pre className="text-gray-300 whitespace-pre overflow-x-auto">
          {`Problem: Generate subsets of [1, 2]

                    []
                   /  \\
            Include 1   Exclude 1
                /           \\
              [1]            []
             /   \\          /   \\
       Inc 2   Exc 2   Inc 2   Exc 2
         /       \\       /       \\
      [1,2]     [1]    [2]       []

All leaf nodes = All subsets: [], [1], [2], [1,2]`}
        </pre>
      </div>

      {/* Difference 1: What they explore */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Difference 1: What Gets Explored
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-red-400 mb-2">Recursion</h4>
          <p className="text-gray-400 text-sm mb-3">
            Explores <strong className="text-white">every single path</strong>{" "}
            in the tree, even invalid ones.
          </p>
          <div className="font-mono text-xs text-gray-500">
            Visits: ALL 4 leaf nodes
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-orange-400 mb-2">
            Backtracking
          </h4>
          <p className="text-gray-400 text-sm mb-3">
            Explores only <strong className="text-white">valid paths</strong>,
            prunes invalid branches early.
          </p>
          <div className="font-mono text-xs text-gray-500">
            Visits: Only valid nodes (pruned)
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-blue-400 mb-2">DP</h4>
          <p className="text-gray-400 text-sm mb-3">
            Explores <strong className="text-white">unique states only</strong>,
            caches repeated subproblems.
          </p>
          <div className="font-mono text-xs text-gray-500">
            Visits: Each unique state once
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-green-400 mb-2">Greedy</h4>
          <p className="text-gray-400 text-sm mb-3">
            Explores <strong className="text-white">exactly one path</strong>,
            makes irrevocable choices.
          </p>
          <div className="font-mono text-xs text-gray-500">
            Visits: Single path (no tree)
          </div>
        </div>
      </div>

      {/* Difference 2: Where answer is found */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Difference 2: Where the Answer Appears
      </h2>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-6 mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400">Paradigm</th>
              <th className="text-left py-3 px-4 text-gray-400">
                Answer Location
              </th>
              <th className="text-left py-3 px-4 text-gray-400">Example</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 text-red-400">Recursion</td>
              <td className="py-3 px-4">
                At <strong className="text-white">leaf nodes</strong>
              </td>
              <td className="py-3 px-4 text-gray-500">
                Base case returns value
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 text-orange-400">Backtracking</td>
              <td className="py-3 px-4">
                <strong className="text-white">Anywhere on path</strong>
              </td>
              <td className="py-3 px-4 text-gray-500">
                Collect valid combinations mid-way
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 text-blue-400">DP</td>
              <td className="py-3 px-4">
                At the <strong className="text-white">root</strong>
              </td>
              <td className="py-3 px-4 text-gray-500">
                Final answer bubbles up
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-green-400">Greedy</td>
              <td className="py-3 px-4">
                <strong className="text-white">Accumulated</strong> along path
              </td>
              <td className="py-3 px-4 text-gray-500">
                Build answer step by step
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Difference 3: Code Pattern */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Difference 3: Code Pattern
      </h2>

      <div className="space-y-6 mb-8">
        <div>
          <h4 className="text-lg font-semibold text-red-400 mb-3">
            Recursion Pattern
          </h4>
          <CodeBlock
            code={`void recurse(state) {
    if (base_case) {
        process_answer();  // Answer at leaf
        return;
    }
    for (choice : choices) {
        recurse(next_state);  // No undo
    }
}`}
            language="java"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold text-orange-400 mb-3">
            Backtracking Pattern
          </h4>
          <CodeBlock
            code={`void backtrack(state, path) {
    if (is_valid_solution(path)) {
        collect_answer(path);  // Answer anywhere
    }
    for (choice : choices) {
        if (is_valid(choice)) {   // Pruning
            path.add(choice);     // Choose
            backtrack(next_state, path);
            path.remove(last);    // Undo ← KEY DIFFERENCE
        }
    }
}`}
            language="java"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-3">
            DP Pattern (Top-Down)
          </h4>
          <CodeBlock
            code={`int dp(state) {
    if (base_case) return base_value;
    if (memo[state] != -1) return memo[state];  // Cache hit

    int result = combine(dp(subproblem1), dp(subproblem2));
    memo[state] = result;  // Store ← KEY DIFFERENCE
    return result;  // Answer bubbles to root
}`}
            language="java"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold text-green-400 mb-3">
            Greedy Pattern
          </h4>
          <CodeBlock
            code={`int greedy(input) {
    sort_if_needed(input);
    int answer = 0;

    for (item : input) {
        if (should_take(item)) {  // Local optimal
            answer += item;       // Accumulate
        }                         // No recursion, no undo
    }
    return answer;
}`}
            language="java"
          />
        </div>
      </div>

      {/* Difference 4: Same Problem, Different Approach */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Difference 4: Same Problem, Different Questions
      </h2>

      <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-md p-6 mb-8">
        <h4 className="text-lg font-semibold text-purple-300 mb-4">
          Problem: Climbing Stairs (1 or 2 steps at a time)
        </h4>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-red-400 font-mono text-sm w-28 flex-shrink-0">
              Recursion:
            </span>
            <span className="text-gray-300">
              &quot;Try all possible ways&quot; → O(2^N), TLE for N &gt; 30
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-orange-400 font-mono text-sm w-28 flex-shrink-0">
              Backtracking:
            </span>
            <span className="text-gray-300">
              &quot;List all paths&quot; → Useful if you need actual paths, not
              count
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-400 font-mono text-sm w-28 flex-shrink-0">
              DP:
            </span>
            <span className="text-gray-300">
              &quot;How many ways?&quot; → O(N), the right approach
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-400 font-mono text-sm w-28 flex-shrink-0">
              Greedy:
            </span>
            <span className="text-gray-300">
              Doesn&apos;t apply - no local optimal property
            </span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-6">
        <h4 className="text-lg font-semibold text-yellow-400 mb-3">
          The Core Insight
        </h4>
        <p className="text-gray-300">
          The <strong className="text-white">type of question</strong>{" "}
          determines the approach:
        </p>
        <ul className="text-gray-300 mt-3 space-y-1">
          <li>
            &quot;Find <strong className="text-white">all</strong>{" "}
            solutions&quot; → Backtracking
          </li>
          <li>
            &quot;Find the <strong className="text-white">count/optimal</strong>
            &quot; + overlapping subproblems → DP
          </li>
          <li>
            &quot;Find <strong className="text-white">one</strong> solution
            fast&quot; + greedy property → Greedy
          </li>
        </ul>
      </div>
    </div>
  );
}
