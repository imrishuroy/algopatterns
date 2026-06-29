"use client";

export default function HowToIdentifySection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        How to Identify the Right Approach
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        This is the most important section. Learn to recognize{" "}
        <strong className="text-white">problem patterns</strong> and
        <strong className="text-white"> keywords</strong> that instantly reveal
        which paradigm to use.
      </p>

      {/* Decision Flowchart */}
      <h2 className="text-2xl font-bold text-white mb-4">Decision Flowchart</h2>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-6 mb-8 font-mono text-sm overflow-x-auto">
        <pre className="text-gray-300 whitespace-pre">
          {`START: Read the problem
          │
          ▼
┌─────────────────────────────┐
│ Does it ask for ALL         │
│ combinations/permutations/  │──YES──▶ BACKTRACKING
│ subsets/paths?              │
└─────────────────────────────┘
          │ NO
          ▼
┌─────────────────────────────┐
│ Does it ask for COUNT or    │
│ OPTIMAL (min/max) value?    │──YES──┐
└─────────────────────────────┘       │
          │ NO                        ▼
          │              ┌─────────────────────────┐
          │              │ Are there OVERLAPPING   │
          │              │ subproblems?            │
          │              └─────────────────────────┘
          │                    │ YES        │ NO
          │                    ▼            ▼
          │                   DP      Plain Recursion
          ▼
┌─────────────────────────────┐
│ Can you prove local optimal │
│ = global optimal?           │──YES──▶ GREEDY
└─────────────────────────────┘
          │ NO
          ▼
    Consider DP or
    Brute Force`}
        </pre>
      </div>

      {/* Keyword Recognition */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Keyword Recognition Guide
      </h2>

      <div className="space-y-4 mb-8">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-orange-400 mb-3">
            🟠 Backtracking Keywords
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              "all combinations",
              "all permutations",
              "all subsets",
              "all paths",
              "generate all",
              "find all",
              "list all",
              "print all",
              "N-Queens",
              "Sudoku solver",
            ].map((keyword) => (
              <span
                key={keyword}
                className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-md text-sm font-mono"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Look for: &quot;all&quot;, &quot;every&quot;, &quot;generate&quot;,
            &quot;enumerate&quot;, constraint satisfaction
          </p>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-blue-400 mb-3">
            🔵 DP Keywords
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              "minimum cost",
              "maximum profit",
              "number of ways",
              "longest/shortest",
              "can you reach",
              "is it possible",
              "count paths",
              "optimal",
              "best",
            ].map((keyword) => (
              <span
                key={keyword}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm font-mono"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Look for: optimization, counting, yes/no questions with overlapping
            choices
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-green-400 mb-3">
            🟢 Greedy Keywords
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              "maximum meetings",
              "minimum platforms",
              "activity selection",
              "interval scheduling",
              "fractional",
              "always pick largest/smallest",
              "sort and process",
            ].map((keyword) => (
              <span
                key={keyword}
                className="px-2 py-1 bg-green-500/20 text-green-300 rounded-md text-sm font-mono"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm">
            Look for: intervals, scheduling, &quot;obvious&quot; local choice,
            large constraints (10⁵+)
          </p>
        </div>
      </div>

      {/* Problem Type Recognition */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Problem Type → Approach
      </h2>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-6 mb-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400">
                Problem Type
              </th>
              <th className="text-left py-3 px-4 text-gray-400">Approach</th>
              <th className="text-left py-3 px-4 text-gray-400">
                Example Problems
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4">Generate all X</td>
              <td className="py-3 px-4 text-orange-400">Backtracking</td>
              <td className="py-3 px-4 text-gray-500">
                Subsets, Permutations, Combinations
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4">Constraint satisfaction</td>
              <td className="py-3 px-4 text-orange-400">Backtracking</td>
              <td className="py-3 px-4 text-gray-500">
                N-Queens, Sudoku, Word Search
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4">Count number of ways</td>
              <td className="py-3 px-4 text-blue-400">DP</td>
              <td className="py-3 px-4 text-gray-500">
                Climbing Stairs, Unique Paths, Coin Change II
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4">Min/Max optimization</td>
              <td className="py-3 px-4 text-blue-400">DP</td>
              <td className="py-3 px-4 text-gray-500">
                Knapsack, LCS, Edit Distance
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4">Yes/No reachability</td>
              <td className="py-3 px-4 text-blue-400">DP</td>
              <td className="py-3 px-4 text-gray-500">
                Word Break, Partition Equal Subset
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4">Interval scheduling</td>
              <td className="py-3 px-4 text-green-400">Greedy</td>
              <td className="py-3 px-4 text-gray-500">
                Meeting Rooms, Activity Selection
              </td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4">Fractional selection</td>
              <td className="py-3 px-4 text-green-400">Greedy</td>
              <td className="py-3 px-4 text-gray-500">
                Fractional Knapsack, Gas Station
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4">Graph shortest path</td>
              <td className="py-3 px-4 text-green-400">Greedy (Dijkstra)</td>
              <td className="py-3 px-4 text-gray-500">
                Network Delay, Cheapest Flights
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick Tests */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Quick Mental Tests
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-orange-400 mb-3">
            Is it Backtracking?
          </h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-400">✓</span>
              <span>Need to generate/list ALL solutions?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">✓</span>
              <span>Constraints are small (N ≤ 15-20)?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400">✓</span>
              <span>Choices have validity rules?</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-blue-400 mb-3">
            Is it DP?
          </h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">✓</span>
              <span>Solving same subproblem multiple times?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">✓</span>
              <span>Optimal answer = f(optimal sub-answers)?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">✓</span>
              <span>Asking for count or min/max?</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-green-400 mb-3">
            Is it Greedy?
          </h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Local best choice leads to global best?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>No need to reconsider past decisions?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Problem involves intervals or sorting?</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">
            DP vs Greedy?
          </h4>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">→</span>
              <span>Greedy: choices don&apos;t affect future options</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">→</span>
              <span>DP: current choice affects future choices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">→</span>
              <span>When in doubt, try DP (always correct)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Golden Rules */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Interview Golden Rules
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-md">
          <span className="text-3xl font-bold text-yellow-400">1</span>
          <p className="text-gray-300">
            <strong className="text-white">
              &quot;ALL&quot; in problem statement → Backtracking
            </strong>
            <br />
            <span className="text-gray-500 text-sm">
              Find all, generate all, list all, print all
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-md">
          <span className="text-3xl font-bold text-blue-400">2</span>
          <p className="text-gray-300">
            <strong className="text-white">
              &quot;COUNT&quot; or &quot;OPTIMAL&quot; + overlapping → DP
            </strong>
            <br />
            <span className="text-gray-500 text-sm">
              Number of ways, minimum cost, maximum profit, longest/shortest
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-md">
          <span className="text-3xl font-bold text-green-400">3</span>
          <p className="text-gray-300">
            <strong className="text-white">
              Large constraints (N ≥ 10⁵) → Greedy or O(N) approach
            </strong>
            <br />
            <span className="text-gray-500 text-sm">
              DP won&apos;t work, must find greedy property or linear solution
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-md">
          <span className="text-3xl font-bold text-red-400">4</span>
          <p className="text-gray-300">
            <strong className="text-white">
              Greedy feels &quot;too easy&quot; → Verify or use DP
            </strong>
            <br />
            <span className="text-gray-500 text-sm">
              Test with counter-examples before committing
            </span>
          </p>
        </div>
      </div>

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6">
        <h4 className="text-lg font-semibold text-indigo-300 mb-3">
          Pro Tip: Start with Brute Force
        </h4>
        <p className="text-gray-300">
          In interviews, always start by explaining the{" "}
          <strong className="text-white">brute force recursive solution</strong>{" "}
          first. Then optimize: add pruning (backtracking) or memoization (DP)
          based on the problem pattern. This shows your problem-solving process.
        </p>
      </div>
    </div>
  );
}
