"use client";

export default function QuickComparisonSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Quick Comparison Table
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        Before diving deep, here&apos;s a quick reference to understand how
        these four paradigms differ. Bookmark this for quick revision!
      </p>

      {/* Main Comparison Table */}
      <div className="bg-gray-900 rounded-md border border-gray-800 p-6 mb-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400">Aspect</th>
              <th className="text-left py-3 px-4 text-red-400">Recursion</th>
              <th className="text-left py-3 px-4 text-orange-400">
                Backtracking
              </th>
              <th className="text-left py-3 px-4 text-blue-400">DP</th>
              <th className="text-left py-3 px-4 text-green-400">Greedy</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 font-medium text-white">Core Idea</td>
              <td className="py-3 px-4">Try everything</td>
              <td className="py-3 px-4">Try valid paths only</td>
              <td className="py-3 px-4">Cache & reuse</td>
              <td className="py-3 px-4">Best choice now</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 font-medium text-white">
                Explores All Paths?
              </td>
              <td className="py-3 px-4 text-green-400">Yes</td>
              <td className="py-3 px-4 text-yellow-400">Valid only</td>
              <td className="py-3 px-4 text-red-400">No</td>
              <td className="py-3 px-4 text-red-400">No</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 font-medium text-white">
                Stores Results?
              </td>
              <td className="py-3 px-4 text-red-400">No</td>
              <td className="py-3 px-4 text-red-400">No</td>
              <td className="py-3 px-4 text-green-400">Yes</td>
              <td className="py-3 px-4 text-red-400">No</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 font-medium text-white">
                Undoes Choices?
              </td>
              <td className="py-3 px-4 text-yellow-400">Sometimes</td>
              <td className="py-3 px-4 text-green-400">Always</td>
              <td className="py-3 px-4 text-red-400">No</td>
              <td className="py-3 px-4 text-red-400">No</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 font-medium text-white">
                Guarantees Optimal?
              </td>
              <td className="py-3 px-4 text-green-400">Yes*</td>
              <td className="py-3 px-4 text-green-400">Yes*</td>
              <td className="py-3 px-4 text-green-400">Yes</td>
              <td className="py-3 px-4 text-yellow-400">Sometimes</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-3 px-4 font-medium text-white">
                Time Complexity
              </td>
              <td className="py-3 px-4">O(2^N), O(N!)</td>
              <td className="py-3 px-4">O(2^N) pruned</td>
              <td className="py-3 px-4">O(N), O(N²)</td>
              <td className="py-3 px-4">O(N), O(N log N)</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-white">
                Max Input Size
              </td>
              <td className="py-3 px-4">&le; 15</td>
              <td className="py-3 px-4">&le; 20</td>
              <td className="py-3 px-4">&le; 10⁴</td>
              <td className="py-3 px-4">&le; 10⁶+</td>
            </tr>
          </tbody>
        </table>
        <p className="text-gray-500 text-xs mt-3">
          *If all paths are explored; finds all solutions, not necessarily
          &quot;optimal&quot;
        </p>
      </div>

      {/* One-liner definitions */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        One-Liner Definitions
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-md">
          <span className="text-2xl">🔴</span>
          <div>
            <p className="text-white font-semibold">Recursion</p>
            <p className="text-gray-400">
              Divide problem into smaller subproblems, solve each the same way
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-md">
          <span className="text-2xl">🟠</span>
          <div>
            <p className="text-white font-semibold">Backtracking</p>
            <p className="text-gray-400">
              Recursion + undo invalid choices (Choose → Explore → Undo)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-md">
          <span className="text-2xl">🔵</span>
          <div>
            <p className="text-white font-semibold">Dynamic Programming</p>
            <p className="text-gray-400">
              Recursion + cache results to avoid recomputation
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-md">
          <span className="text-2xl">🟢</span>
          <div>
            <p className="text-white font-semibold">Greedy</p>
            <p className="text-gray-400">
              Make the locally optimal choice at each step, never look back
            </p>
          </div>
        </div>
      </div>

      {/* Relationship diagram */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        How They Relate
      </h2>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-6 mb-8 font-mono text-sm">
        <pre className="text-gray-300 whitespace-pre overflow-x-auto text-center">
          {`                    RECURSION
                   (base technique)
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
    BACKTRACKING       DP          GREEDY
    (+ pruning)    (+ caching)   (no exploration)
    (+ undo)

    "All valid      "Optimal      "One path,
     solutions"      answer"       fast"
`}
        </pre>
      </div>

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6">
        <h4 className="text-lg font-semibold text-indigo-300 mb-3">
          Key Insight
        </h4>
        <p className="text-gray-300">
          <strong className="text-white">
            Backtracking and DP are both extensions of recursion.
          </strong>
          Backtracking adds pruning and undoing. DP adds memoization. Greedy
          abandons exploration entirely and just picks the best local choice.
        </p>
      </div>
    </div>
  );
}
