"use client";

import CodeBlock from "@/components/ui/CodeBlock";
import StepByStepExecutor from "@/components/visualizers/StepByStepExecutor";

export default function StringsSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Recursion with Strings
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        Strings are naturally recursive structures - a string is either empty or
        a character followed by another string. This makes them perfect for
        recursive solutions.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4">Reverse a String</h2>
      <p className="text-gray-300 mb-4">
        One of the most classic recursive string problems. Watch the
        step-by-step execution:
      </p>

      <div className="mb-6">
        <StepByStepExecutor example="reverse-string" />
      </div>

      <CodeBlock
        code={`public String reverse(String str) {
    if (str.isEmpty()) return "";
    return reverse(str.substring(1)) + str.charAt(0);
}

// reverse("hello")
// = reverse("ello") + "h"
// = reverse("llo") + "e" + "h"
// = reverse("lo") + "l" + "e" + "h"
// = reverse("o") + "l" + "l" + "e" + "h"
// = reverse("") + "o" + "l" + "l" + "e" + "h"
// = "olleh"`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Check Palindrome
      </h2>
      <CodeBlock
        code={`public boolean isPalindrome(String str) {
    if (str.length() <= 1) return true;
    if (str.charAt(0) != str.charAt(str.length() - 1)) {
        return false;
    }
    return isPalindrome(str.substring(1, str.length() - 1));
}

// isPalindrome("racecar")
// 'r' == 'r' -> isPalindrome("aceca")
// 'a' == 'a' -> isPalindrome("cec")
// 'c' == 'c' -> isPalindrome("e")
// length <= 1 -> true`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">Count Vowels</h2>
      <CodeBlock
        code={`public int countVowels(String str) {
    if (str.isEmpty()) return 0;

    int count = "aeiouAEIOU".indexOf(str.charAt(0)) >= 0 ? 1 : 0;
    return count + countVowels(str.substring(1));
}

// countVowels("hello") = 2 (e, o)`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Remove Duplicates
      </h2>
      <CodeBlock
        code={`public String removeDuplicates(String str) {
    if (str.length() <= 1) return str;

    if (str.charAt(0) == str.charAt(1)) {
        return removeDuplicates(str.substring(1));
    }
    return str.charAt(0) + removeDuplicates(str.substring(1));
}

// removeDuplicates("aabbbcc") = "abc"`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        String Permutations
      </h2>
      <p className="text-gray-300 mb-4">
        Generate all permutations of a string - a common interview problem:
      </p>

      <CodeBlock
        code={`public void permutations(String str, String prefix) {
    if (str.isEmpty()) {
        System.out.println(prefix);
        return;
    }

    for (int i = 0; i < str.length(); i++) {
        String rem = str.substring(0, i) + str.substring(i + 1);
        permutations(rem, prefix + str.charAt(i));
    }
}

// Usage: permutations("abc", "")
// Output: abc, acb, bac, bca, cab, cba
// Total: n! permutations`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Check if Subsequence
      </h2>
      <CodeBlock
        code={`public boolean isSubsequence(String s, String t) {
    if (s.isEmpty()) return true;
    if (t.isEmpty()) return false;

    if (s.charAt(0) == t.charAt(0)) {
        return isSubsequence(s.substring(1), t.substring(1));
    }
    return isSubsequence(s, t.substring(1));
}

// isSubsequence("ace", "abcde") = true
// isSubsequence("aec", "abcde") = false`}
        language="java"
      />

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6 mt-8">
        <h4 className="text-lg font-semibold text-indigo-300 mb-3">
          Practice Problems
        </h4>
        <ul className="text-gray-300 space-y-2">
          <li>1. Count occurrences of a character in a string</li>
          <li>2. Replace all occurrences of a character</li>
          <li>3. Generate all substrings of a string</li>
          <li>4. Check if two strings are anagrams</li>
        </ul>
      </div>
    </div>
  );
}
