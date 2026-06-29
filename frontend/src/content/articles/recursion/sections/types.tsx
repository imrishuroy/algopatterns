"use client";

import RecursionTypesVisualizer from "@/components/visualizers/RecursionTypesVisualizer";

export default function TypesSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">Types of Recursion</h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        Recursion comes in different forms, each with its own characteristics
        and use cases. Understanding these types helps you choose the right
        approach for your problem.
      </p>

      <div className="mb-10">
        <RecursionTypesVisualizer />
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Summary of Recursion Types
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-indigo-400 mb-2">
            Direct Recursion
          </h4>
          <p className="text-gray-400 text-sm mb-3">
            A function calls itself directly. The most common form and easiest
            to understand.
          </p>
          <div className="text-xs text-gray-500">
            Use case: Factorial, Fibonacci, Tree traversal
          </div>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-purple-400 mb-2">
            Indirect Recursion
          </h4>
          <p className="text-gray-400 text-sm mb-3">
            Two or more functions call each other in a cycle until a base case
            is reached.
          </p>
          <div className="text-xs text-gray-500">
            Use case: Even/odd checks, state machines
          </div>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-green-400 mb-2">
            Tail Recursion
          </h4>
          <p className="text-gray-400 text-sm mb-3">
            The recursive call is the last operation. Can be optimized by
            compilers to O(1) space.
          </p>
          <div className="text-xs text-gray-500">
            Use case: When stack space optimization is needed
          </div>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-orange-400 mb-2">
            Head Recursion
          </h4>
          <p className="text-gray-400 text-sm mb-3">
            The recursive call is the first operation. Processing happens during
            unwinding.
          </p>
          <div className="text-xs text-gray-500">
            Use case: Reverse order processing
          </div>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-red-400 mb-2">
            Tree Recursion
          </h4>
          <p className="text-gray-400 text-sm mb-3">
            Function makes multiple recursive calls, creating a tree of calls.
            Often exponential.
          </p>
          <div className="text-xs text-gray-500">
            Use case: Fibonacci (naive), binary tree operations
          </div>
        </div>

        <div className="bg-gray-900 rounded-md border border-gray-800 p-5">
          <h4 className="text-lg font-semibold text-cyan-400 mb-2">
            Mutual Recursion
          </h4>
          <p className="text-gray-400 text-sm mb-3">
            Functions defined in terms of each other. Common in parsers and
            compilers.
          </p>
          <div className="text-xs text-gray-500">
            Use case: Expression parsing, grammar rules
          </div>
        </div>
      </div>

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6">
        <h4 className="text-lg font-semibold text-indigo-300 mb-3">
          Choosing the Right Type
        </h4>
        <ul className="text-gray-300 space-y-2">
          <li>
            <strong className="text-white">Direct:</strong> Default choice for
            most recursive problems
          </li>
          <li>
            <strong className="text-white">Tail:</strong> When you need to
            optimize stack usage
          </li>
          <li>
            <strong className="text-white">Tree:</strong> For divide-and-conquer
            (but consider memoization)
          </li>
          <li>
            <strong className="text-white">Mutual:</strong> When problem has
            interdependent parts
          </li>
        </ul>
      </div>
    </div>
  );
}
