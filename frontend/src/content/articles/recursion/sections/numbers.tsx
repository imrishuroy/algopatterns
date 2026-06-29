"use client";

import CodeBlock from "@/components/ui/CodeBlock";
import RecursionTreeVisualizer from "@/components/visualizers/RecursionTreeVisualizer";

export default function NumbersSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Recursion with Numbers
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        Numbers are often the first domain where we practice recursion.
        Let&apos;s explore classic number-based recursive problems that
        frequently appear in coding interviews.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4">Fibonacci Sequence</h2>
      <p className="text-gray-300 mb-4">
        The Fibonacci sequence demonstrates{" "}
        <strong className="text-white">tree recursion</strong> where each call
        spawns multiple recursive calls.
      </p>

      <div className="mb-6">
        <RecursionTreeVisualizer example="fibonacci" inputValue={5} />
      </div>

      <CodeBlock
        code={`public int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// Optimized with memoization - O(n) time
public int fibMemo(int n, int[] memo) {
    if (n <= 1) return n;
    if (memo[n] != 0) return memo[n];
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}`}
        language="java"
      />

      <div className="bg-red-500/10 border border-red-500/30 rounded-md p-6 my-8">
        <h4 className="text-lg font-semibold text-red-400 mb-3">
          Performance Warning
        </h4>
        <p className="text-gray-300 text-sm">
          The naive recursive Fibonacci has{" "}
          <strong className="text-white">O(2^n)</strong> time complexity. Use
          memoization or dynamic programming to optimize to O(n).
        </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Power Calculation
      </h2>
      <p className="text-gray-300 mb-4">
        Calculate x^n efficiently using recursion with the optimization x^n =
        (x^(n/2))^2.
      </p>

      <CodeBlock
        code={`public double power(double base, int exp) {
    if (exp == 0) return 1;
    if (exp < 0) return 1 / power(base, -exp);

    // Optimization: x^n = (x^(n/2))^2
    if (exp % 2 == 0) {
        double half = power(base, exp / 2);
        return half * half;
    }
    return base * power(base, exp - 1);
}

// Time: O(log n) instead of O(n)`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Sum of Digits
      </h2>
      <CodeBlock
        code={`public int sumDigits(int n) {
    if (n == 0) return 0;
    return (n % 10) + sumDigits(n / 10);
}

// sumDigits(1234)
// = 4 + sumDigits(123)
// = 4 + 3 + sumDigits(12)
// = 4 + 3 + 2 + sumDigits(1)
// = 4 + 3 + 2 + 1 = 10`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        GCD (Euclidean Algorithm)
      </h2>
      <CodeBlock
        code={`public int gcd(int a, int b) {
    if (b == 0) return a;
    return gcd(b, a % b);
}

// gcd(48, 18)
// = gcd(18, 48 % 18) = gcd(18, 12)
// = gcd(12, 18 % 12) = gcd(12, 6)
// = gcd(6, 12 % 6) = gcd(6, 0)
// = 6`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">Count Digits</h2>
      <CodeBlock
        code={`public int countDigits(int n) {
    if (n == 0) return 0;
    return 1 + countDigits(n / 10);
}

// countDigits(12345) = 5`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Check Prime (with Helper)
      </h2>
      <CodeBlock
        code={`public boolean isPrime(int n) {
    if (n <= 1) return false;
    return isPrimeHelper(n, 2);
}

private boolean isPrimeHelper(int n, int divisor) {
    if (divisor * divisor > n) return true;
    if (n % divisor == 0) return false;
    return isPrimeHelper(n, divisor + 1);
}`}
        language="java"
      />

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6 mt-8">
        <h4 className="text-lg font-semibold text-indigo-300 mb-3">
          Practice Problems
        </h4>
        <ul className="text-gray-300 space-y-2">
          <li>1. Calculate n-th triangular number: 1 + 2 + 3 + ... + n</li>
          <li>2. Convert decimal to binary recursively</li>
          <li>
            3. Find number of ways to climb n stairs (1 or 2 steps at a time)
          </li>
          <li>4. Calculate modular exponentiation (a^b mod m)</li>
        </ul>
      </div>
    </div>
  );
}
