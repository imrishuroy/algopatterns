"use client";

import { useState } from "react";
import Link from "next/link";
import CodeBlock from "@/components/ui/CodeBlock";
import LanguageToggle from "@/components/ui/LanguageToggle";

type Language = "java" | "javascript";

const javaCode = `// Expand Around Center - Core Template
// Time: O(n²) | Space: O(1)

// Count all palindromic substrings
public int countSubstrings(String s) {
    int count = 0;
    for (int i = 0; i < s.length(); i++) {
        count += expand(s, i, i);      // Odd length
        count += expand(s, i, i + 1);  // Even length
    }
    return count;
}

private int expand(String s, int left, int right) {
    int count = 0;
    while (left >= 0 && right < s.length()
           && s.charAt(left) == s.charAt(right)) {
        count++;
        left--;
        right++;
    }
    return count;
}

// Longest Palindromic Substring
public String longestPalindrome(String s) {
    int start = 0, end = 0;
    for (int i = 0; i < s.length(); i++) {
        int len1 = expandLen(s, i, i);
        int len2 = expandLen(s, i, i + 1);
        int len = Math.max(len1, len2);
        if (len > end - start) {
            start = i - (len - 1) / 2;
            end = i + len / 2;
        }
    }
    return s.substring(start, end + 1);
}

private int expandLen(String s, int l, int r) {
    while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
        l--;
        r++;
    }
    return r - l - 1;  // Length after expansion
}

// Valid Palindrome II - can remove one char
public boolean validPalindrome(String s) {
    int l = 0, r = s.length() - 1;
    while (l < r) {
        if (s.charAt(l) != s.charAt(r)) {
            // Try skipping left OR right
            return isPalin(s, l + 1, r) || isPalin(s, l, r - 1);
        }
        l++;
        r--;
    }
    return true;
}

private boolean isPalin(String s, int l, int r) {
    while (l < r) {
        if (s.charAt(l++) != s.charAt(r--)) return false;
    }
    return true;
}`;

const jsCode = `// Expand Around Center - Core Template
// Time: O(n²) | Space: O(1)

// Count all palindromic substrings
function countSubstrings(s) {
    let count = 0;
    for (let i = 0; i < s.length; i++) {
        count += expand(s, i, i);      // Odd length
        count += expand(s, i, i + 1);  // Even length
    }
    return count;
}

function expand(s, left, right) {
    let count = 0;
    while (left >= 0 && right < s.length && s[left] === s[right]) {
        count++;
        left--;
        right++;
    }
    return count;
}

// Longest Palindromic Substring
function longestPalindrome(s) {
    let start = 0, end = 0;
    for (let i = 0; i < s.length; i++) {
        const len1 = expandLen(s, i, i);
        const len2 = expandLen(s, i, i + 1);
        const len = Math.max(len1, len2);
        if (len > end - start) {
            start = i - Math.floor((len - 1) / 2);
            end = i + Math.floor(len / 2);
        }
    }
    return s.substring(start, end + 1);
}

function expandLen(s, l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
        l--;
        r++;
    }
    return r - l - 1;  // Length after expansion
}

// Valid Palindrome II - can remove one char
function validPalindrome(s) {
    let l = 0, r = s.length - 1;
    while (l < r) {
        if (s[l] !== s[r]) {
            // Try skipping left OR right
            return isPalin(s, l + 1, r) || isPalin(s, l, r - 1);
        }
        l++;
        r--;
    }
    return true;
}

function isPalin(s, l, r) {
    while (l < r) {
        if (s[l++] !== s[r--]) return false;
    }
    return true;
}`;

const problems = [
  {
    name: "Palindromic Substrings",
    url: "https://leetcode.com/problems/palindromic-substrings/",
    difficulty: "Medium",
    hint: "Count palindromes using expand from each center",
  },
  {
    name: "Longest Palindromic Substring",
    url: "https://leetcode.com/problems/longest-palindromic-substring/",
    difficulty: "Medium",
    hint: "Track the longest palindrome found during expansion",
  },
  {
    name: "Valid Palindrome",
    url: "https://leetcode.com/problems/valid-palindrome/",
    difficulty: "Easy",
    hint: "Two pointers from both ends, skip non-alphanumeric",
  },
  {
    name: "Valid Palindrome II",
    url: "https://leetcode.com/problems/valid-palindrome-ii/",
    difficulty: "Easy",
    hint: "On mismatch, try skipping left OR right character",
  },
  {
    name: "Palindrome Partitioning",
    url: "https://leetcode.com/problems/palindrome-partitioning/",
    difficulty: "Medium",
    hint: "Backtracking + use expand for isPalindrome check",
  },
];

// skipcq: JS-0067
export default function ExpandAroundCenterClient() {
  const [lang, setLang] = useState<Language>("java");

  // skipcq: JS-0415
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-indigo-400 hover:text-indigo-300 text-sm"
        >
          ← Back to Problems
        </Link>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
            Medium
          </span>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium">
            String Pattern
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Expand Around Center Pattern
        </h1>
        <p className="text-xl text-gray-400">
          The optimal approach for palindrome substring problems with O(1) space
        </p>
      </header>

      {/* Table of Contents */}
      <nav className="mb-10 p-4 bg-gray-900/50 rounded-md border border-gray-800">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          In This Guide
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="#core-idea"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Core Idea
            </a>
          </li>
          <li>
            <a
              href="#key-insight"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Key Insight: Types of Centers
            </a>
          </li>
          <li>
            <a
              href="#algorithm"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Algorithm
            </a>
          </li>
          <li>
            <a
              href="#complexity"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Complexity Analysis
            </a>
          </li>
          <li>
            <a
              href="#template"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Code Template
            </a>
          </li>
          <li>
            <a
              href="#problems"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Problems to Practice
            </a>
          </li>
          <li>
            <a
              href="#when-to-use"
              className="text-indigo-400 hover:text-indigo-300"
            >
              When to Use / Not Use
            </a>
          </li>
          <li>
            <a
              href="#common-mistakes"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Common Mistakes
            </a>
          </li>
        </ul>
      </nav>

      {/* Content */}
      <article className="space-y-12">
        {/* Core Idea */}
        <section id="core-idea">
          <h2 className="text-2xl font-bold text-white mb-4">Core Idea</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed">
              A palindrome reads the same forwards and backwards because it{" "}
              <strong className="text-white">mirrors around its center</strong>.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Instead of checking all O(n²) possible substrings (brute force),
              we can be smarter: for each position that could be a center,
              expand outward as long as characters match.
            </p>
            <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-md">
              <p className="text-indigo-300 font-medium">
                Think of it like dropping a pebble in water — the palindrome
                &quot;ripples&quot; outward from the center, and we stop when
                the ripples no longer match.
              </p>
            </div>
          </div>
        </section>

        {/* Key Insight */}
        <section id="key-insight">
          <h2 className="text-2xl font-bold text-white mb-4">
            Key Insight: Types of Centers
          </h2>
          <p className="text-gray-300 mb-6">
            For a string of length <code className="text-indigo-400">n</code>,
            there are <strong className="text-white">2n - 1</strong> possible
            centers:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Odd Length */}
            <div className="p-5 bg-gray-900 rounded-md border border-gray-800">
              <h3 className="text-lg font-semibold text-green-400 mb-3">
                Odd Length Palindromes
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Center IS a character (n centers)
              </p>
              <div className="font-mono text-center mb-4">
                <div className="text-2xl text-white tracking-widest">
                  a b <span className="text-green-400 underline">a</span> b a
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  ↑ center at index 2
                </div>
              </div>
              <div className="text-sm text-gray-300">
                Call: <code className="text-green-400">expand(i, i)</code>
              </div>
            </div>

            {/* Even Length */}
            <div className="p-5 bg-gray-900 rounded-md border border-gray-800">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">
                Even Length Palindromes
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Center is BETWEEN characters (n-1 centers)
              </p>
              <div className="font-mono text-center mb-4">
                <div className="text-2xl text-white tracking-widest">
                  a b<span className="text-purple-400">|</span>b a
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  ↑ center between index 1 and 2
                </div>
              </div>
              <div className="text-sm text-gray-300">
                Call: <code className="text-purple-400">expand(i, i + 1)</code>
              </div>
            </div>
          </div>

          {/* Visual Example */}
          <div className="p-5 bg-gray-900 rounded-md border border-gray-800">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">
              Example: String &quot;abba&quot; has 7 possible centers
            </h4>
            <div className="font-mono text-center overflow-x-auto">
              <div className="inline-block">
                <div className="flex items-center justify-center gap-4 text-xl mb-2">
                  <span className="text-white">a</span>
                  <span className="text-white">b</span>
                  <span className="text-white">b</span>
                  <span className="text-white">a</span>
                </div>
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <span className="w-8">0</span>
                  <span className="w-4">↔</span>
                  <span className="w-8">1</span>
                  <span className="w-4">↔</span>
                  <span className="w-8">2</span>
                  <span className="w-4">↔</span>
                  <span className="w-8">3</span>
                </div>
                <div className="flex items-center justify-center text-xs mt-1">
                  <span className="w-8 text-green-400">odd</span>
                  <span className="w-4 text-purple-400">even</span>
                  <span className="w-8 text-green-400">odd</span>
                  <span className="w-4 text-purple-400">even</span>
                  <span className="w-8 text-green-400">odd</span>
                  <span className="w-4 text-purple-400">even</span>
                  <span className="w-8 text-green-400">odd</span>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm text-center mt-3">
              4 odd centers (at each character) + 3 even centers (between
              characters) = 7 total
            </p>
          </div>
        </section>

        {/* Algorithm */}
        <section id="algorithm">
          <h2 className="text-2xl font-bold text-white mb-4">Algorithm</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h4 className="text-white font-medium">
                  For each index i from 0 to n-1:
                </h4>
                <p className="text-gray-400 mt-1">
                  This position could be the center of a palindrome
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h4 className="text-white font-medium">
                  Call expand(i, i) for odd-length palindromes
                </h4>
                <p className="text-gray-400 mt-1">Center is at character i</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h4 className="text-white font-medium">
                  Call expand(i, i+1) for even-length palindromes
                </h4>
                <p className="text-gray-400 mt-1">
                  Center is between characters i and i+1
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div>
                <h4 className="text-white font-medium">
                  In expand(): while characters match, expand outward
                </h4>
                <p className="text-gray-400 mt-1">
                  Decrement left, increment right until mismatch or boundary
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-900 rounded-md font-mono text-sm">
            <pre className="text-gray-300">{`expand(left, right):
    while left >= 0 AND right < n AND s[left] == s[right]:
        // Found a palindrome from left to right
        left--
        right++`}</pre>
          </div>
        </section>

        {/* Complexity */}
        <section id="complexity">
          <h2 className="text-2xl font-bold text-white mb-4">
            Complexity Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-gray-900 rounded-md border border-gray-800">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                Time: O(n²)
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Outer loop: O(n) centers</li>
                <li>• Inner expansion: O(n) worst case per center</li>
                <li>• Usually faster in practice due to early termination</li>
                <li>
                  • Worst case: &quot;aaaa...a&quot; (all same characters)
                </li>
              </ul>
            </div>
            <div className="p-5 bg-gray-900 rounded-md border border-gray-800">
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Space: O(1)
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Just a few pointer variables</li>
                <li>• No DP table needed!</li>
                <li>• Compare to DP: O(n²) space</li>
                <li>• This is the main advantage over DP</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Code Template */}
        <section id="template">
          <h2 className="text-2xl font-bold text-white mb-4">Code Template</h2>
          <div className="flex justify-end mb-3">
            <LanguageToggle
              currentLang={lang}
              onChange={(l) => setLang(l as Language)}
              languages={["java", "javascript"]}
              size="sm"
            />
          </div>
          <CodeBlock
            code={lang === "java" ? javaCode : jsCode}
            language={lang}
          />
        </section>

        {/* Problems to Practice */}
        <section id="problems">
          <h2 className="text-2xl font-bold text-white mb-4">
            Problems to Practice
          </h2>
          <div className="space-y-3">
            {problems.map((problem) => (
              <a
                key={problem.name}
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-900 rounded-md border border-gray-800 hover:border-indigo-500/50 transition group"
              >
                <div>
                  <span className="text-white font-medium group-hover:text-indigo-400 transition">
                    {problem.name}
                  </span>
                  <p className="text-gray-500 text-sm mt-1">{problem.hint}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    problem.difficulty === "Easy"
                      ? "bg-green-500/20 text-green-400"
                      : problem.difficulty === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {problem.difficulty}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* When to Use */}
        <section id="when-to-use">
          <h2 className="text-2xl font-bold text-white mb-4">
            When to Use / Not Use
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-green-500/10 rounded-md border border-green-500/30">
              <h3 className="text-lg font-semibold text-green-400 mb-3">
                Use This Pattern
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>
                  ✓ Palindrome <strong>substring</strong> problems (contiguous)
                </li>
                <li>✓ Count palindromic substrings</li>
                <li>✓ Find longest palindromic substring</li>
                <li>✓ Valid palindrome with modifications</li>
                <li>✓ When O(1) space is required</li>
              </ul>
            </div>
            <div className="p-5 bg-red-500/10 rounded-md border border-red-500/30">
              <h3 className="text-lg font-semibold text-red-400 mb-3">
                Don&apos;t Use (Use DP Instead)
              </h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>
                  ✗ Palindrome <strong>subsequence</strong> problems (not
                  contiguous)
                </li>
                <li>✗ Longest Palindromic Subsequence</li>
                <li>✗ Count Palindromic Subsequences</li>
                <li>✗ Problems requiring character skipping</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-md">
            <p className="text-indigo-300 text-sm">
              <strong>Key distinction:</strong> Substring = contiguous
              characters. Subsequence = can skip characters. This pattern only
              works for substrings!
            </p>
          </div>
        </section>

        {/* Common Mistakes */}
        <section id="common-mistakes">
          <h2 className="text-2xl font-bold text-white mb-4">
            Common Mistakes
          </h2>
          <div className="space-y-3">
            {[
              {
                mistake: "Forgetting the even-length case",
                fix: "Always call both expand(i, i) AND expand(i, i+1)",
              },
              {
                mistake: "Wrong boundary checks in expand()",
                fix: "Check left >= 0 AND right < n before accessing characters",
              },
              {
                mistake: "Confusing substring vs subsequence",
                fix: "This pattern only works for contiguous substrings",
              },
              {
                mistake: "Off-by-one in calculating start/end indices",
                fix: "After expand, length = right - left - 1 (pointers are outside palindrome)",
              },
            ].map((item) => (
              <div
                key={item.mistake}
                className="p-4 bg-gray-900 rounded-md border border-gray-800"
              >
                <p className="text-red-400 font-medium">{item.mistake}</p>
                <p className="text-gray-400 text-sm mt-1">Fix: {item.fix}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Note */}
        <section className="p-5 bg-gray-900/50 rounded-md border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            Advanced: Manacher&apos;s Algorithm
          </h3>
          <p className="text-gray-400 text-sm">
            For O(n) time complexity, look into Manacher&apos;s Algorithm. It
            reuses previously computed palindrome information to avoid redundant
            expansions. However, it&apos;s rarely needed in interviews — the
            O(n²) expand around center approach is almost always sufficient and
            easier to implement correctly.
          </p>
        </section>
      </article>
    </div>
  );
}
