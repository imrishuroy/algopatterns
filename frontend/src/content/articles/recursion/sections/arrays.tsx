"use client";

import CodeBlock from "@/components/ui/CodeBlock";

export default function ArraysSection() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-6">
        Recursion with Arrays
      </h1>

      <p className="text-lg text-gray-300 leading-relaxed mb-8">
        Arrays can be processed recursively by treating them as a first element
        plus the rest of the array. This pattern is common in functional
        programming and divide-and-conquer algorithms.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4">
        Find First Occurrence
      </h2>
      <CodeBlock
        code={`public int findFirst(int[] arr, int target, int index) {
    if (index >= arr.length) return -1;
    if (arr[index] == target) return index;
    return findFirst(arr, target, index + 1);
}

// Usage: findFirst(arr, 5, 0)`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Count Occurrences
      </h2>
      <CodeBlock
        code={`public int countOccurrences(int[] arr, int target, int index) {
    if (index >= arr.length) return 0;
    int count = arr[index] == target ? 1 : 0;
    return count + countOccurrences(arr, target, index + 1);
}

// countOccurrences([1,2,2,3,2], 2, 0) = 3`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Check if Array is Sorted
      </h2>
      <CodeBlock
        code={`public boolean isSorted(int[] arr, int index) {
    if (index >= arr.length - 1) return true;
    if (arr[index] > arr[index + 1]) return false;
    return isSorted(arr, index + 1);
}

// isSorted([1, 2, 3, 4], 0) = true
// isSorted([1, 3, 2, 4], 0) = false`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Array Palindrome Check
      </h2>
      <CodeBlock
        code={`public boolean isPalindrome(int[] arr, int left, int right) {
    if (left >= right) return true;
    if (arr[left] != arr[right]) return false;
    return isPalindrome(arr, left + 1, right - 1);
}

// Usage: isPalindrome(arr, 0, arr.length - 1)`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">
        Binary Search
      </h2>
      <p className="text-gray-300 mb-4">
        Classic divide-and-conquer algorithm with O(log n) time complexity:
      </p>
      <CodeBlock
        code={`public int binarySearch(int[] arr, int target, int left, int right) {
    if (left > right) return -1;

    int mid = left + (right - left) / 2;

    if (arr[mid] == target) return mid;
    if (arr[mid] > target) {
        return binarySearch(arr, target, left, mid - 1);
    }
    return binarySearch(arr, target, mid + 1, right);
}

// Time: O(log n), Space: O(log n) for call stack`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">Merge Sort</h2>
      <p className="text-gray-300 mb-4">
        A classic divide-and-conquer sorting algorithm:
      </p>
      <CodeBlock
        code={`public int[] mergeSort(int[] arr) {
    if (arr.length <= 1) return arr;

    int mid = arr.length / 2;
    int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
    int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));

    return merge(left, right);
}

private int[] merge(int[] left, int[] right) {
    int[] result = new int[left.length + right.length];
    int i = 0, j = 0, k = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result[k++] = left[i++];
        } else {
            result[k++] = right[j++];
        }
    }

    while (i < left.length) result[k++] = left[i++];
    while (j < right.length) result[k++] = right[j++];

    return result;
}

// Time: O(n log n), Space: O(n)`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">Sum of Array</h2>
      <CodeBlock
        code={`public int sum(int[] arr, int index) {
    if (index >= arr.length) return 0;
    return arr[index] + sum(arr, index + 1);
}

// sum([1, 2, 3, 4, 5], 0) = 15`}
        language="java"
      />

      <h2 className="text-2xl font-bold text-white mb-4 mt-10">Find Maximum</h2>
      <CodeBlock
        code={`public int findMax(int[] arr, int index) {
    if (index == arr.length - 1) return arr[index];
    int maxRest = findMax(arr, index + 1);
    return Math.max(arr[index], maxRest);
}

// findMax([3, 1, 4, 1, 5], 0) = 5`}
        language="java"
      />

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-6 mt-8">
        <h4 className="text-lg font-semibold text-indigo-300 mb-3">
          Practice Problems
        </h4>
        <ul className="text-gray-300 space-y-2">
          <li>1. Reverse an array in place using recursion</li>
          <li>2. Find the second largest element</li>
          <li>3. Rotate array by k positions</li>
          <li>4. Implement Quick Sort recursively</li>
        </ul>
      </div>
    </div>
  );
}
