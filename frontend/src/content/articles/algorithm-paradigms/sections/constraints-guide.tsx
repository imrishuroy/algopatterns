"use client";

export default function ConstraintsGuideSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Constraints-Based Selection
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        The input size constraint is often the{" "}
        <strong className="text-white">biggest hint</strong> about which
        approach will work. Learn to read constraints like a roadmap to the
        solution.
      </p>

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6 mb-8">
        <h3 className="text-xl font-bold text-indigo-300 mb-3">
          The Golden Rule
        </h3>
        <p className="text-gray-300 text-lg">
          <strong className="text-white">
            Constraints decide feasibility.
          </strong>{" "}
          If N = 10⁵, you can&apos;t use O(2^N). Time limit (usually 1-2 sec)
          means ~10⁸ operations max.
        </p>
      </div>

      {/* Constraint to Approach Table */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Constraint → Approach Mapping
      </h2>

      <div className="bg-gray-900 rounded-md border border-gray-800 p-6 mb-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400">
                N (Input Size)
              </th>
              <th className="text-left py-3 px-4 text-gray-400">
                Max Complexity
              </th>
              <th className="text-left py-3 px-4 text-gray-400">
                Likely Approach
              </th>
              <th className="text-left py-3 px-4 text-gray-400">Why</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-gray-800 bg-red-500/5">
              <td className="py-3 px-4 font-mono font-bold">≤ 10</td>
              <td className="py-3 px-4">O(N!)</td>
              <td className="py-3 px-4 text-orange-400">Backtracking</td>
              <td className="py-3 px-4 text-gray-500">10! = 3.6M operations</td>
            </tr>
            <tr className="border-b border-gray-800 bg-red-500/5">
              <td className="py-3 px-4 font-mono font-bold">≤ 20</td>
              <td className="py-3 px-4">O(2^N)</td>
              <td className="py-3 px-4 text-orange-400">
                Backtracking / Bitmask
              </td>
              <td className="py-3 px-4 text-gray-500">2^20 = 1M operations</td>
            </tr>
            <tr className="border-b border-gray-800 bg-orange-500/5">
              <td className="py-3 px-4 font-mono font-bold">≤ 100</td>
              <td className="py-3 px-4">O(N³)</td>
              <td className="py-3 px-4 text-blue-400">DP</td>
              <td className="py-3 px-4 text-gray-500">100³ = 1M operations</td>
            </tr>
            <tr className="border-b border-gray-800 bg-yellow-500/5">
              <td className="py-3 px-4 font-mono font-bold">≤ 1,000</td>
              <td className="py-3 px-4">O(N²)</td>
              <td className="py-3 px-4 text-blue-400">DP</td>
              <td className="py-3 px-4 text-gray-500">1000² = 1M operations</td>
            </tr>
            <tr className="border-b border-gray-800 bg-green-500/5">
              <td className="py-3 px-4 font-mono font-bold">≤ 10,000</td>
              <td className="py-3 px-4">O(N²) careful</td>
              <td className="py-3 px-4 text-blue-400">DP / Two Pointers</td>
              <td className="py-3 px-4 text-gray-500">
                10⁴² = 100M (borderline)
              </td>
            </tr>
            <tr className="border-b border-gray-800 bg-green-500/5">
              <td className="py-3 px-4 font-mono font-bold">≤ 10⁵</td>
              <td className="py-3 px-4">O(N log N)</td>
              <td className="py-3 px-4 text-green-400">
                Greedy / Binary Search
              </td>
              <td className="py-3 px-4 text-gray-500">O(N²) will TLE</td>
            </tr>
            <tr className="border-b border-gray-800 bg-green-500/5">
              <td className="py-3 px-4 font-mono font-bold">≤ 10⁶</td>
              <td className="py-3 px-4">O(N)</td>
              <td className="py-3 px-4 text-green-400">
                Greedy / Sliding Window
              </td>
              <td className="py-3 px-4 text-gray-500">Only linear works</td>
            </tr>
            <tr className="bg-green-500/5">
              <td className="py-3 px-4 font-mono font-bold">≤ 10⁹</td>
              <td className="py-3 px-4">O(log N)</td>
              <td className="py-3 px-4 text-green-400">Math / Binary Search</td>
              <td className="py-3 px-4 text-gray-500">
                Can&apos;t even iterate all
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Time Complexity Reference */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Time Complexity Reference
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-white mb-4">
            Operations per Complexity
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">O(1)</span>
              <span className="text-green-400">1 operation</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(log N) for N=10⁹</span>
              <span className="text-green-400">~30 operations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N) for N=10⁶</span>
              <span className="text-green-400">1M operations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N log N) for N=10⁵</span>
              <span className="text-yellow-400">~1.6M operations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N²) for N=10³</span>
              <span className="text-yellow-400">1M operations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N³) for N=100</span>
              <span className="text-orange-400">1M operations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(2^N) for N=20</span>
              <span className="text-red-400">~1M operations</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N!) for N=10</span>
              <span className="text-red-400">~3.6M operations</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-white mb-4">
            Safe Limits (1 sec)
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">O(N!)</span>
              <span className="text-white font-mono">N ≤ 10-11</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(2^N)</span>
              <span className="text-white font-mono">N ≤ 20-25</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N³)</span>
              <span className="text-white font-mono">N ≤ 400-500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N²)</span>
              <span className="text-white font-mono">N ≤ 5,000-10,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N log N)</span>
              <span className="text-white font-mono">N ≤ 10⁶</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(N)</span>
              <span className="text-white font-mono">N ≤ 10⁷-10⁸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">O(log N)</span>
              <span className="text-white font-mono">N ≤ 10¹⁸</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Examples */}
      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Real Problem Examples
      </h2>

      <div className="space-y-4 mb-8">
        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-md text-sm font-mono">
              N ≤ 10
            </span>
            <span className="text-white font-semibold">
              Permutations (LeetCode 46)
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Generate all permutations of N distinct integers. N! grows fast, but
            10! = 3.6M is fine.
            <span className="text-orange-400 ml-2">→ Backtracking</span>
          </p>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md text-sm font-mono">
              N ≤ 1000
            </span>
            <span className="text-white font-semibold">
              Longest Common Subsequence (LeetCode 1143)
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Two strings, each up to 1000 chars. O(N²) = 1M operations works
            perfectly.
            <span className="text-blue-400 ml-2">→ DP</span>
          </p>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-sm font-mono">
              N ≤ 10⁵
            </span>
            <span className="text-white font-semibold">
              Meeting Rooms II (LeetCode 253)
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Find minimum meeting rooms for N intervals. O(N²) would TLE. Sort +
            sweep works.
            <span className="text-green-400 ml-2">→ Greedy (O(N log N))</span>
          </p>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-sm font-mono">
              N ≤ 10⁶
            </span>
            <span className="text-white font-semibold">
              Maximum Subarray (LeetCode 53)
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Find max sum contiguous subarray. Must be O(N) - Kadane&apos;s
            algorithm.
            <span className="text-green-400 ml-2">→ Greedy/DP (linear)</span>
          </p>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-6">
        <h4 className="text-lg font-semibold text-yellow-400 mb-3">
          Interview Tip
        </h4>
        <p className="text-gray-300">
          <strong className="text-white">Always check constraints first</strong>{" "}
          before coding. If N ≤ 20, don&apos;t waste time optimizing beyond
          O(2^N). If N ≥ 10⁵, don&apos;t even try O(N²) approaches.
        </p>
      </div>
    </div>
  );
}
