"use client";

import CodeBlock from "@/components/ui/CodeBlock";

export default function CommonPitfallsSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Common Pitfalls & Traps
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        Even experienced developers fall into these traps. Learn to recognize
        them before they cost you an interview or hours of debugging.
      </p>

      {/* Pitfall 1: Greedy Trap */}
      <h2 className="text-2xl font-bold text-white mb-4">
        Pitfall 1: The Greedy Trap
      </h2>

      <div className="bg-red-500/10 border border-red-500/30 rounded-md p-6 mb-6">
        <h4 className="text-lg font-semibold text-red-400 mb-3">
          When Greedy Looks Right But Isn&apos;t
        </h4>
        <p className="text-gray-300 mb-4">
          <strong className="text-white">Coin Change Problem:</strong> Given
          coins [1, 3, 4], make amount 6.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-md p-4">
            <p className="text-red-400 font-semibold mb-2">Greedy (WRONG)</p>
            <p className="text-gray-400 text-sm">
              Pick largest first: 4 + 1 + 1 ={" "}
              <strong className="text-white">3 coins</strong>
            </p>
          </div>
          <div className="bg-gray-900 rounded-md p-4">
            <p className="text-green-400 font-semibold mb-2">DP (CORRECT)</p>
            <p className="text-gray-400 text-sm">
              Optimal: 3 + 3 = <strong className="text-white">2 coins</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-5 mb-8">
        <h4 className="text-lg font-semibold text-white mb-3">
          When Greedy Works vs Fails
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">Problem</th>
                <th className="text-left py-2 px-3 text-gray-400">Greedy?</th>
                <th className="text-left py-2 px-3 text-gray-400">Why</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">Coin Change (arbitrary coins)</td>
                <td className="py-2 px-3 text-red-400">No</td>
                <td className="py-2 px-3 text-gray-500">
                  Larger coin might not fit optimally
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">Coin Change (1, 5, 10, 25)</td>
                <td className="py-2 px-3 text-green-400">Yes</td>
                <td className="py-2 px-3 text-gray-500">
                  Canonical coin system
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">0/1 Knapsack</td>
                <td className="py-2 px-3 text-red-400">No</td>
                <td className="py-2 px-3 text-gray-500">
                  Can&apos;t take fractions
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">Fractional Knapsack</td>
                <td className="py-2 px-3 text-green-400">Yes</td>
                <td className="py-2 px-3 text-gray-500">
                  Can take best value/weight ratio
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3">Activity Selection</td>
                <td className="py-2 px-3 text-green-400">Yes</td>
                <td className="py-2 px-3 text-gray-500">
                  Earliest end time works provably
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pitfall 2: DP vs Backtracking Confusion */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Pitfall 2: DP vs Backtracking Confusion
      </h2>

      <div className="bg-orange-500/10 border border-orange-500/30 rounded-md p-6 mb-6">
        <h4 className="text-lg font-semibold text-orange-400 mb-3">
          Choosing the Wrong One
        </h4>

        <div className="space-y-4">
          <div>
            <p className="text-white font-semibold mb-2">
              Problem: &quot;Find all subsets that sum to K&quot;
            </p>
            <p className="text-gray-400 text-sm">
              <span className="text-red-400">Wrong:</span> Using DP (it only
              gives count, not actual subsets)
              <br />
              <span className="text-green-400">Right:</span> Backtracking (need
              to enumerate all solutions)
            </p>
          </div>

          <div>
            <p className="text-white font-semibold mb-2">
              Problem: &quot;Count subsets that sum to K&quot;
            </p>
            <p className="text-gray-400 text-sm">
              <span className="text-red-400">Wrong:</span> Backtracking (too
              slow for large N)
              <br />
              <span className="text-green-400">Right:</span> DP (just need the
              count)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-5 mb-8">
        <h4 className="text-lg font-semibold text-white mb-3">
          Quick Decision Rule
        </h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-orange-400 font-semibold">Need ALL solutions?</p>
            <p className="text-gray-400 text-sm">→ Backtracking</p>
          </div>
          <div className="text-gray-600 text-2xl">vs</div>
          <div className="flex-1">
            <p className="text-blue-400 font-semibold">
              Need COUNT or OPTIMAL?
            </p>
            <p className="text-gray-400 text-sm">→ DP</p>
          </div>
        </div>
      </div>

      {/* Pitfall 3: Forgetting to Undo */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Pitfall 3: Forgetting to Undo in Backtracking
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-red-400 mb-3">
            Wrong (No Undo)
          </h4>
          <CodeBlock
            code={`void backtrack(List<Integer> path) {
    if (valid(path)) result.add(path);

    for (int choice : choices) {
        path.add(choice);
        backtrack(path);
        // Missing: path.remove(last)!
    }
}
// Bug: path keeps growing forever`}
            language="java"
          />
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-md p-5">
          <h4 className="text-lg font-semibold text-green-400 mb-3">
            Correct (With Undo)
          </h4>
          <CodeBlock
            code={`void backtrack(List<Integer> path) {
    if (valid(path)) {
        result.add(new ArrayList<>(path));
    }
    for (int choice : choices) {
        path.add(choice);      // Choose
        backtrack(path);       // Explore
        path.removeLast();     // Undo!
    }
}`}
            language="java"
          />
        </div>
      </div>

      {/* Pitfall 4: Wrong Memoization */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Pitfall 4: Incomplete Memoization Key
      </h2>

      <div className="bg-red-500/10 border border-red-500/30 rounded-md p-6 mb-6">
        <h4 className="text-lg font-semibold text-red-400 mb-3">
          Common Bug: Missing State in Key
        </h4>
        <CodeBlock
          code={`// WRONG: Only memoizing on index
int solve(int index, int remaining) {
    if (memo[index] != -1) return memo[index];
    // Bug: Different 'remaining' values get same cached result!
    ...
}

// CORRECT: Include all changing state
int solve(int index, int remaining) {
    if (memo[index][remaining] != -1) {
        return memo[index][remaining];
    }
    ...
}`}
          language="java"
        />
      </div>

      {/* Pitfall 5: Not Recognizing Overlapping Subproblems */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Pitfall 5: Missing Overlapping Subproblems
      </h2>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-5 mb-8">
        <h4 className="text-lg font-semibold text-white mb-3">
          How to Check for Overlap
        </h4>
        <ol className="text-gray-300 space-y-2 list-decimal list-inside">
          <li>Draw the recursion tree for a small input</li>
          <li>
            Look for{" "}
            <strong className="text-white">
              repeated function calls with same arguments
            </strong>
          </li>
          <li>If you see them → DP will help</li>
          <li>
            If every call is unique → DP won&apos;t help (use backtracking or
            greedy)
          </li>
        </ol>
      </div>

      {/* Summary */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Quick Reference: Avoid These Mistakes
      </h2>

      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-md">
          <span className="text-red-400 text-lg">1</span>
          <p className="text-gray-300">
            <strong className="text-white">
              Don&apos;t assume greedy works
            </strong>{" "}
            — test with counter-examples first
          </p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-md">
          <span className="text-red-400 text-lg">2</span>
          <p className="text-gray-300">
            <strong className="text-white">
              Use DP for count/optimal, Backtracking for enumerate all
            </strong>
          </p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-md">
          <span className="text-red-400 text-lg">3</span>
          <p className="text-gray-300">
            <strong className="text-white">Always undo choices</strong> in
            backtracking (Choose → Explore → Undo)
          </p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-md">
          <span className="text-red-400 text-lg">4</span>
          <p className="text-gray-300">
            <strong className="text-white">
              Include ALL changing state in memo key
            </strong>
            , not just the index
          </p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-gray-900 rounded-md">
          <span className="text-red-400 text-lg">5</span>
          <p className="text-gray-300">
            <strong className="text-white">Check constraints first</strong> —
            they reveal the required complexity
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-md p-6">
        <h4 className="text-xl font-bold text-indigo-300 mb-3">
          Final Summary
        </h4>
        <p className="text-gray-300 text-lg">
          <strong className="text-orange-400">Backtracking</strong> explores
          valid paths, <strong className="text-blue-400">DP</strong> caches
          overlapping work, <strong className="text-green-400">Greedy</strong>{" "}
          trusts local choices, and{" "}
          <strong className="text-white">
            constraints decide what&apos;s feasible
          </strong>
          .
        </p>
        <p className="text-gray-400 text-sm mt-3">
          When in doubt, start with brute force recursion, then optimize based
          on the problem pattern.
        </p>
      </div>
    </div>
  );
}
