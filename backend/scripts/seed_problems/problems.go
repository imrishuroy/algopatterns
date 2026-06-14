package main

// Problem definitions for seeding

type ProblemDef struct {
	Title       string
	Slug        string
	Difficulty  string
	Description string
	Constraints string
	Examples    string
	Hints       string
	TestCases   []TestCaseDef
	Templates   []TemplateDef
}

type TestCaseDef struct {
	Input    string
	Output   string
	IsSample bool
}

type TemplateDef struct {
	LangID   int
	Template string
	Wrapper  string
}

var Problems = []ProblemDef{
	// Contains Duplicate
	{
		Title:      "Contains Duplicate",
		Slug:       "contains-duplicate",
		Difficulty: "Easy",
		Description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
		Constraints: `- 1 <= nums.length <= 10^5
- -10^9 <= nums[i] <= 10^9`,
		Examples: `Example 1:
Input: nums = [1,2,3,1]
Output: true
Explanation: The element 1 occurs at indices 0 and 3.

Example 2:
Input: nums = [1,2,3,4]
Output: false
Explanation: All elements are distinct.

Example 3:
Input: nums = [1,1,1,3,3,4,3,2,4,2]
Output: true`,
		Hints: `Hint 1: Use a hash set to track seen numbers.
Hint 2: If you see a number that's already in the set, return true.`,
		TestCases: []TestCaseDef{
			{"[1,2,3,1]", "true", true},
			{"[1,2,3,4]", "false", true},
			{"[1,1,1,3,3,4,3,2,4,2]", "true", true},
			{"[1]", "false", false},
			{"[1,2,3,4,5,6,7,8,9,10,1]", "true", false},
			{"[-1,-2,-3,-4,-5]", "false", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71, // Python
				Template: `def containsDuplicate(nums):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
result = containsDuplicate(nums)
print("true" if result else "false")`,
			},
			{
				LangID: 63, // JavaScript
				Template: `function containsDuplicate(nums) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const nums = JSON.parse(line);
    const result = containsDuplicate(nums);
    console.log(result ? "true" : "false");
    rl.close();
});`,
			},
			{
				LangID: 62, // Java
				Template: `import java.util.*;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Write your solution here
        return false;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = line.isEmpty() ? new int[0] :
            Arrays.stream(line.split(","))
                  .mapToInt(s -> Integer.parseInt(s.trim()))
                  .toArray();
        Solution sol = new Solution();
        System.out.println(sol.containsDuplicate(nums) ? "true" : "false");
    }
}`,
			},
			{
				LangID: 60, // Go
				Template: `func containsDuplicate(nums []int) bool {
    // Write your solution here
    return false
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    if containsDuplicate(nums) {
        fmt.Println("true")
    } else {
        fmt.Println("false")
    }
}`,
			},
		},
	},

	// Valid Anagram
	{
		Title:      "Valid Anagram",
		Slug:       "valid-anagram",
		Difficulty: "Easy",
		Description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
		Constraints: `- 1 <= s.length, t.length <= 5 * 10^4
- s and t consist of lowercase English letters.`,
		Examples: `Example 1:
Input: s = "anagram", t = "nagaram"
Output: true

Example 2:
Input: s = "rat", t = "car"
Output: false`,
		Hints: `Hint 1: Count the frequency of each character in both strings.
Hint 2: If the frequency counts match, they are anagrams.`,
		TestCases: []TestCaseDef{
			{"anagram\nnagaram", "true", true},
			{"rat\ncar", "false", true},
			{"a\na", "true", true},
			{"ab\nba", "true", false},
			{"aacc\nccac", "false", false},
			{"listen\nsilent", "true", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def isAnagram(s, t):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

s = input().strip()
t = input().strip()
result = isAnagram(s, t)
print("true" if result else "false")`,
			},
			{
				LangID: 63,
				Template: `function isAnagram(s, t) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const result = isAnagram(lines[0], lines[1]);
    console.log(result ? "true" : "false");
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public boolean isAnagram(String s, String t) {
        // Write your solution here
        return false;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        String t = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.isAnagram(s, t) ? "true" : "false");
    }
}`,
			},
			{
				LangID: 60,
				Template: `func isAnagram(s string, t string) bool {
    // Write your solution here
    return false
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\n')
    t, _ := reader.ReadString('\n')
    s = strings.TrimSpace(s)
    t = strings.TrimSpace(t)
    if isAnagram(s, t) {
        fmt.Println("true")
    } else {
        fmt.Println("false")
    }
}`,
			},
		},
	},

	// Maximum Subarray
	{
		Title:      "Maximum Subarray",
		Slug:       "maximum-subarray",
		Difficulty: "Medium",
		Description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
		Constraints: `- 1 <= nums.length <= 10^5
- -10^4 <= nums[i] <= 10^4`,
		Examples: `Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Example 2:
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.

Example 3:
Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.`,
		Hints: `Hint 1: Use Kadane's algorithm.
Hint 2: Track the current sum and the maximum sum seen so far.
Hint 3: If current sum becomes negative, reset it to 0.`,
		TestCases: []TestCaseDef{
			{"[-2,1,-3,4,-1,2,1,-5,4]", "6", true},
			{"[1]", "1", true},
			{"[5,4,-1,7,8]", "23", true},
			{"[-1]", "-1", false},
			{"[-2,-1]", "-1", false},
			{"[1,2,3,4,5]", "15", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def maxSubArray(nums):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
result = maxSubArray(nums)
print(result)`,
			},
			{
				LangID: 63,
				Template: `function maxSubArray(nums) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const nums = JSON.parse(line);
    console.log(maxSubArray(nums));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = Arrays.stream(line.split(","))
                          .mapToInt(s -> Integer.parseInt(s.trim()))
                          .toArray();
        Solution sol = new Solution();
        System.out.println(sol.maxSubArray(nums));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func maxSubArray(nums []int) int {
    // Write your solution here
    return 0
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    fmt.Println(maxSubArray(nums))
}`,
			},
		},
	},

	// Product of Array Except Self
	{
		Title:      "Product of Array Except Self",
		Slug:       "product-of-array-except-self",
		Difficulty: "Medium",
		Description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.`,
		Constraints: `- 2 <= nums.length <= 10^5
- -30 <= nums[i] <= 30
- The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.`,
		Examples: `Example 1:
Input: nums = [1,2,3,4]
Output: [24,12,8,6]

Example 2:
Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]`,
		Hints: `Hint 1: Use prefix and suffix products.
Hint 2: First pass: compute prefix products.
Hint 3: Second pass: compute suffix products and multiply.`,
		TestCases: []TestCaseDef{
			{"[1,2,3,4]", "[24,12,8,6]", true},
			{"[-1,1,0,-3,3]", "[0,0,9,0,0]", true},
			{"[1,1]", "[1,1]", true},
			{"[2,3,4,5]", "[60,40,30,24]", false},
			{"[0,0]", "[0,0]", false},
			{"[1,2,3,4,5]", "[120,60,40,30,24]", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def productExceptSelf(nums):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
result = productExceptSelf(nums)
print(json.dumps(result, separators=(',', ':')))`,
			},
			{
				LangID: 63,
				Template: `function productExceptSelf(nums) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const nums = JSON.parse(line);
    const result = productExceptSelf(nums);
    console.log(JSON.stringify(result));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public int[] productExceptSelf(int[] nums) {
        // Write your solution here
        return new int[]{};
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = Arrays.stream(line.split(","))
                          .mapToInt(s -> Integer.parseInt(s.trim()))
                          .toArray();
        Solution sol = new Solution();
        int[] result = sol.productExceptSelf(nums);
        System.out.println(Arrays.toString(result).replace(" ", ""));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func productExceptSelf(nums []int) []int {
    // Write your solution here
    return nil
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    result := productExceptSelf(nums)
    output, _ := json.Marshal(result)
    fmt.Println(string(output))
}`,
			},
		},
	},

	// Group Anagrams
	{
		Title:      "Group Anagrams",
		Slug:       "group-anagrams",
		Difficulty: "Medium",
		Description: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
		Constraints: `- 1 <= strs.length <= 10^4
- 0 <= strs[i].length <= 100
- strs[i] consists of lowercase English letters.`,
		Examples: `Example 1:
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Example 2:
Input: strs = [""]
Output: [[""]]

Example 3:
Input: strs = ["a"]
Output: [["a"]]`,
		Hints: `Hint 1: Two strings are anagrams if their sorted versions are equal.
Hint 2: Use a hash map with sorted string as key.
Hint 3: Alternatively, use character count as key.`,
		TestCases: []TestCaseDef{
			{`["eat","tea","tan","ate","nat","bat"]`, `[["ate","eat","tea"],["bat"],["nat","tan"]]`, true},
			{`[""]`, `[[""]]`, true},
			{`["a"]`, `[["a"]]`, true},
			{`["abc","bca","cab","xyz","zyx"]`, `[["abc","bca","cab"],["xyz","zyx"]]`, false},
			{`["",""]`, `[["",""]]`, false},
			{`["ab","ba","abc","cba"]`, `[["ab","ba"],["abc","cba"]]`, false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def groupAnagrams(strs):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

strs = json.loads(input())
result = groupAnagrams(strs)
# Sort each group and sort groups for consistent output
result = [sorted(group) for group in result]
result.sort(key=lambda x: (len(x), x[0] if x else ""))
print(json.dumps(result, separators=(',', ':')))`,
			},
			{
				LangID: 63,
				Template: `function groupAnagrams(strs) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const strs = JSON.parse(line);
    let result = groupAnagrams(strs);
    // Sort each group and sort groups for consistent output
    result = result.map(g => g.sort());
    result.sort((a, b) => {
        if (a.length !== b.length) return a.length - b.length;
        return (a[0] || "").localeCompare(b[0] || "");
    });
    console.log(JSON.stringify(result));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // Write your solution here
        return new ArrayList<>();
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        // Parse JSON array of strings
        line = line.substring(1, line.length() - 1);
        String[] strs;
        if (line.isEmpty()) {
            strs = new String[0];
        } else {
            List<String> list = new ArrayList<>();
            StringBuilder sb = new StringBuilder();
            boolean inQuote = false;
            for (char c : line.toCharArray()) {
                if (c == '"') {
                    inQuote = !inQuote;
                } else if (c == ',' && !inQuote) {
                    list.add(sb.toString());
                    sb = new StringBuilder();
                } else {
                    sb.append(c);
                }
            }
            list.add(sb.toString());
            strs = list.toArray(new String[0]);
        }

        Solution sol = new Solution();
        List<List<String>> result = sol.groupAnagrams(strs);

        // Sort for consistent output
        for (List<String> group : result) {
            Collections.sort(group);
        }
        result.sort((a, b) -> {
            if (a.size() != b.size()) return a.size() - b.size();
            return a.get(0).compareTo(b.get(0));
        });

        StringBuilder out = new StringBuilder("[");
        for (int i = 0; i < result.size(); i++) {
            out.append("[");
            for (int j = 0; j < result.get(i).size(); j++) {
                out.append("\"").append(result.get(i).get(j)).append("\"");
                if (j < result.get(i).size() - 1) out.append(",");
            }
            out.append("]");
            if (i < result.size() - 1) out.append(",");
        }
        out.append("]");
        System.out.println(out);
    }
}`,
			},
			{
				LangID: 60,
				Template: `func groupAnagrams(strs []string) [][]string {
    // Write your solution here
    return nil
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
    "sort"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var strs []string
    json.Unmarshal([]byte(line), &strs)
    result := groupAnagrams(strs)

    // Sort for consistent output
    for i := range result {
        sort.Strings(result[i])
    }
    sort.Slice(result, func(i, j int) bool {
        if len(result[i]) != len(result[j]) {
            return len(result[i]) < len(result[j])
        }
        if len(result[i]) == 0 {
            return true
        }
        return result[i][0] < result[j][0]
    })

    output, _ := json.Marshal(result)
    fmt.Println(string(output))
}`,
			},
		},
	},

	// Longest Common Prefix
	{
		Title:      "Longest Common Prefix",
		Slug:       "longest-common-prefix",
		Difficulty: "Easy",
		Description: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".`,
		Constraints: `- 1 <= strs.length <= 200
- 0 <= strs[i].length <= 200
- strs[i] consists of only lowercase English letters.`,
		Examples: `Example 1:
Input: strs = ["flower","flow","flight"]
Output: "fl"

Example 2:
Input: strs = ["dog","racecar","car"]
Output: ""
Explanation: There is no common prefix among the input strings.`,
		Hints: `Hint 1: Compare characters at each position across all strings.
Hint 2: Stop when you find a mismatch or reach the end of any string.`,
		TestCases: []TestCaseDef{
			{`["flower","flow","flight"]`, "fl", true},
			{`["dog","racecar","car"]`, "", true},
			{`["a"]`, "a", true},
			{`["","b"]`, "", false},
			{`["ab","abc","abcd"]`, "ab", false},
			{`["prefix","preflight","prehistoric"]`, "pre", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def longestCommonPrefix(strs):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

strs = json.loads(input())
result = longestCommonPrefix(strs)
print(result if result else "")`,
			},
			{
				LangID: 63,
				Template: `function longestCommonPrefix(strs) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const strs = JSON.parse(line);
    const result = longestCommonPrefix(strs);
    console.log(result || "");
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public String longestCommonPrefix(String[] strs) {
        // Write your solution here
        return "";
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        String[] strs;
        if (line.isEmpty()) {
            strs = new String[0];
        } else {
            List<String> list = new ArrayList<>();
            StringBuilder sb = new StringBuilder();
            boolean inQuote = false;
            for (char c : line.toCharArray()) {
                if (c == '"') inQuote = !inQuote;
                else if (c == ',' && !inQuote) {
                    list.add(sb.toString());
                    sb = new StringBuilder();
                } else sb.append(c);
            }
            list.add(sb.toString());
            strs = list.toArray(new String[0]);
        }
        Solution sol = new Solution();
        System.out.println(sol.longestCommonPrefix(strs));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func longestCommonPrefix(strs []string) string {
    // Write your solution here
    return ""
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var strs []string
    json.Unmarshal([]byte(line), &strs)
    fmt.Println(longestCommonPrefix(strs))
}`,
			},
		},
	},

	// Add Strings
	{
		Title:      "Add Strings",
		Slug:       "add-strings",
		Difficulty: "Easy",
		Description: `Given two non-negative integers, num1 and num2 represented as string, return the sum of num1 and num2 as a string.

You must solve the problem without using any built-in library for handling large integers (such as BigInteger). You must also not convert the inputs to integers directly.`,
		Constraints: `- 1 <= num1.length, num2.length <= 10^4
- num1 and num2 consist of only digits.
- num1 and num2 don't have any leading zeros except for the zero itself.`,
		Examples: `Example 1:
Input: num1 = "11", num2 = "123"
Output: "134"

Example 2:
Input: num1 = "456", num2 = "77"
Output: "533"

Example 3:
Input: num1 = "0", num2 = "0"
Output: "0"`,
		Hints: `Hint 1: Process digits from right to left.
Hint 2: Keep track of the carry.
Hint 3: Build the result string in reverse, then reverse it at the end.`,
		TestCases: []TestCaseDef{
			{"11\n123", "134", true},
			{"456\n77", "533", true},
			{"0\n0", "0", true},
			{"999\n1", "1000", false},
			{"1\n9999", "10000", false},
			{"123456789\n987654321", "1111111110", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def addStrings(num1, num2):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

num1 = input().strip()
num2 = input().strip()
print(addStrings(num1, num2))`,
			},
			{
				LangID: 63,
				Template: `function addStrings(num1, num2) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    console.log(addStrings(lines[0], lines[1]));
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public String addStrings(String num1, String num2) {
        // Write your solution here
        return "";
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String num1 = sc.nextLine();
        String num2 = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.addStrings(num1, num2));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func addStrings(num1 string, num2 string) string {
    // Write your solution here
    return ""
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    num1, _ := reader.ReadString('\n')
    num2, _ := reader.ReadString('\n')
    fmt.Println(addStrings(strings.TrimSpace(num1), strings.TrimSpace(num2)))
}`,
			},
		},
	},

	// Sort Colors
	{
		Title:      "Sort Colors",
		Slug:       "sort-colors",
		Difficulty: "Medium",
		Description: `Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function.`,
		Constraints: `- n == nums.length
- 1 <= n <= 300
- nums[i] is either 0, 1, or 2.`,
		Examples: `Example 1:
Input: nums = [2,0,2,1,1,0]
Output: [0,0,1,1,2,2]

Example 2:
Input: nums = [2,0,1]
Output: [0,1,2]`,
		Hints: `Hint 1: Use the Dutch National Flag algorithm.
Hint 2: Maintain three pointers: low, mid, and high.
Hint 3: Move 0s to the front and 2s to the back.`,
		TestCases: []TestCaseDef{
			{"[2,0,2,1,1,0]", "[0,0,1,1,2,2]", true},
			{"[2,0,1]", "[0,1,2]", true},
			{"[0]", "[0]", true},
			{"[1,2,0]", "[0,1,2]", false},
			{"[2,2,2,1,1,0,0,0]", "[0,0,0,1,1,2,2,2]", false},
			{"[1,1,1]", "[1,1,1]", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def sortColors(nums):
    # Write your solution here (modify nums in-place)
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
sortColors(nums)
print(json.dumps(nums, separators=(',', ':')))`,
			},
			{
				LangID: 63,
				Template: `function sortColors(nums) {
    // Write your solution here (modify nums in-place)
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const nums = JSON.parse(line);
    sortColors(nums);
    console.log(JSON.stringify(nums));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public void sortColors(int[] nums) {
        // Write your solution here (modify nums in-place)
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = line.isEmpty() ? new int[0] :
            Arrays.stream(line.split(","))
                  .mapToInt(s -> Integer.parseInt(s.trim()))
                  .toArray();
        Solution sol = new Solution();
        sol.sortColors(nums);
        System.out.println(Arrays.toString(nums).replace(" ", ""));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func sortColors(nums []int) {
    // Write your solution here (modify nums in-place)
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    sortColors(nums)
    output, _ := json.Marshal(nums)
    fmt.Println(string(output))
}`,
			},
		},
	},

	// Rotate Image
	{
		Title:      "Rotate Image",
		Slug:       "rotate-image",
		Difficulty: "Medium",
		Description: `You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).

You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.`,
		Constraints: `- n == matrix.length == matrix[i].length
- 1 <= n <= 20
- -1000 <= matrix[i][j] <= 1000`,
		Examples: `Example 1:
Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
Output: [[7,4,1],[8,5,2],[9,6,3]]

Example 2:
Input: matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
Output: [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]`,
		Hints: `Hint 1: First transpose the matrix (swap rows and columns).
Hint 2: Then reverse each row.`,
		TestCases: []TestCaseDef{
			{"[[1,2,3],[4,5,6],[7,8,9]]", "[[7,4,1],[8,5,2],[9,6,3]]", true},
			{"[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]", true},
			{"[[1]]", "[[1]]", true},
			{"[[1,2],[3,4]]", "[[3,1],[4,2]]", false},
			{"[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]", "[[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def rotate(matrix):
    # Write your solution here (modify matrix in-place)
    pass`,
				Wrapper: `import json

{{USER_CODE}}

matrix = json.loads(input())
rotate(matrix)
print(json.dumps(matrix, separators=(',', ':')))`,
			},
			{
				LangID: 63,
				Template: `function rotate(matrix) {
    // Write your solution here (modify matrix in-place)
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const matrix = JSON.parse(line);
    rotate(matrix);
    console.log(JSON.stringify(matrix));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public void rotate(int[][] matrix) {
        // Write your solution here (modify matrix in-place)
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        // Parse 2D array
        line = line.substring(1, line.length() - 1);
        List<int[]> rows = new ArrayList<>();
        int depth = 0;
        StringBuilder current = new StringBuilder();
        for (char c : line.toCharArray()) {
            if (c == '[') {
                depth++;
                if (depth == 1) current = new StringBuilder();
            } else if (c == ']') {
                depth--;
                if (depth == 0 && current.length() > 0) {
                    rows.add(Arrays.stream(current.toString().split(","))
                        .mapToInt(s -> Integer.parseInt(s.trim())).toArray());
                }
            } else if (depth == 1) {
                current.append(c);
            }
        }
        int[][] matrix = rows.toArray(new int[0][]);
        Solution sol = new Solution();
        sol.rotate(matrix);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < matrix.length; i++) {
            sb.append(Arrays.toString(matrix[i]).replace(" ", ""));
            if (i < matrix.length - 1) sb.append(",");
        }
        sb.append("]");
        System.out.println(sb);
    }
}`,
			},
			{
				LangID: 60,
				Template: `func rotate(matrix [][]int) {
    // Write your solution here (modify matrix in-place)
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var matrix [][]int
    json.Unmarshal([]byte(line), &matrix)
    rotate(matrix)
    output, _ := json.Marshal(matrix)
    fmt.Println(string(output))
}`,
			},
		},
	},

	// Increasing Triplet Subsequence
	{
		Title:      "Increasing Triplet Subsequence",
		Slug:       "increasing-triplet-subsequence",
		Difficulty: "Medium",
		Description: `Given an integer array nums, return true if there exists a triple of indices (i, j, k) such that i < j < k and nums[i] < nums[j] < nums[k]. If no such indices exists, return false.`,
		Constraints: `- 1 <= nums.length <= 5 * 10^5
- -2^31 <= nums[i] <= 2^31 - 1`,
		Examples: `Example 1:
Input: nums = [1,2,3,4,5]
Output: true
Explanation: Any triplet where i < j < k is valid.

Example 2:
Input: nums = [5,4,3,2,1]
Output: false
Explanation: No triplet exists.

Example 3:
Input: nums = [2,1,5,0,4,6]
Output: true
Explanation: The triplet (3, 4, 5) is valid because nums[3] == 0 < nums[4] == 4 < nums[5] == 6.`,
		Hints: `Hint 1: Track the smallest and second smallest values seen so far.
Hint 2: If you find a value greater than the second smallest, return true.`,
		TestCases: []TestCaseDef{
			{"[1,2,3,4,5]", "true", true},
			{"[5,4,3,2,1]", "false", true},
			{"[2,1,5,0,4,6]", "true", true},
			{"[1,1,1,1]", "false", false},
			{"[1,2]", "false", false},
			{"[20,100,10,12,5,13]", "true", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def increasingTriplet(nums):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
result = increasingTriplet(nums)
print("true" if result else "false")`,
			},
			{
				LangID: 63,
				Template: `function increasingTriplet(nums) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const nums = JSON.parse(line);
    console.log(increasingTriplet(nums) ? "true" : "false");
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public boolean increasingTriplet(int[] nums) {
        // Write your solution here
        return false;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = line.isEmpty() ? new int[0] :
            Arrays.stream(line.split(","))
                  .mapToInt(s -> Integer.parseInt(s.trim()))
                  .toArray();
        Solution sol = new Solution();
        System.out.println(sol.increasingTriplet(nums) ? "true" : "false");
    }
}`,
			},
			{
				LangID: 60,
				Template: `func increasingTriplet(nums []int) bool {
    // Write your solution here
    return false
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    if increasingTriplet(nums) {
        fmt.Println("true")
    } else {
        fmt.Println("false")
    }
}`,
			},
		},
	},

	// Find the Difference
	{
		Title:      "Find the Difference",
		Slug:       "find-the-difference",
		Difficulty: "Easy",
		Description: `You are given two strings s and t.

String t is generated by random shuffling string s and then add one more letter at a random position.

Return the letter that was added to t.`,
		Constraints: `- 0 <= s.length <= 1000
- t.length == s.length + 1
- s and t consist of lowercase English letters.`,
		Examples: `Example 1:
Input: s = "abcd", t = "abcde"
Output: "e"
Explanation: 'e' is the letter that was added.

Example 2:
Input: s = "", t = "y"
Output: "y"`,
		Hints: `Hint 1: You can use XOR - XOR all characters in both strings.
Hint 2: Or use character counting.`,
		TestCases: []TestCaseDef{
			{"abcd\nabcde", "e", true},
			{"\ny", "y", true},
			{"a\naa", "a", true},
			{"abc\ncbad", "d", false},
			{"aaa\naaaa", "a", false},
			{"xyz\nxyzz", "z", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def findTheDifference(s, t):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

s = input()
t = input()
print(findTheDifference(s, t))`,
			},
			{
				LangID: 63,
				Template: `function findTheDifference(s, t) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    console.log(findTheDifference(lines[0], lines[1]));
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public char findTheDifference(String s, String t) {
        // Write your solution here
        return ' ';
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        String t = sc.hasNextLine() ? sc.nextLine() : "";
        Solution sol = new Solution();
        System.out.println(sol.findTheDifference(s, t));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func findTheDifference(s string, t string) byte {
    // Write your solution here
    return 0
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\n')
    t, _ := reader.ReadString('\n')
    s = strings.TrimSuffix(s, "\n")
    t = strings.TrimSuffix(t, "\n")
    fmt.Printf("%c\n", findTheDifference(s, t))
}`,
			},
		},
	},

	// Can Place Flowers
	{
		Title:      "Can Place Flowers",
		Slug:       "can-place-flowers",
		Difficulty: "Easy",
		Description: `You have a long flowerbed in which some of the plots are planted, and some are not. However, flowers cannot be planted in adjacent plots.

Given an integer array flowerbed containing 0's and 1's, where 0 means empty and 1 means not empty, and an integer n, return true if n new flowers can be planted in the flowerbed without violating the no-adjacent-flowers rule and false otherwise.`,
		Constraints: `- 1 <= flowerbed.length <= 2 * 10^4
- flowerbed[i] is 0 or 1.
- There are no two adjacent flowers in flowerbed.
- 0 <= n <= flowerbed.length`,
		Examples: `Example 1:
Input: flowerbed = [1,0,0,0,1], n = 1
Output: true

Example 2:
Input: flowerbed = [1,0,0,0,1], n = 2
Output: false`,
		Hints: `Hint 1: Greedily place flowers whenever possible.
Hint 2: A position is valid if it's empty and both neighbors are empty (or out of bounds).`,
		TestCases: []TestCaseDef{
			{"[1,0,0,0,1]\n1", "true", true},
			{"[1,0,0,0,1]\n2", "false", true},
			{"[0,0,1,0,0]\n2", "true", true},
			{"[0]\n1", "true", false},
			{"[1,0,0,0,0,1]\n2", "false", false},
			{"[0,0,0,0,0]\n3", "true", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def canPlaceFlowers(flowerbed, n):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

flowerbed = json.loads(input())
n = int(input())
result = canPlaceFlowers(flowerbed, n)
print("true" if result else "false")`,
			},
			{
				LangID: 63,
				Template: `function canPlaceFlowers(flowerbed, n) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const flowerbed = JSON.parse(lines[0]);
    const n = parseInt(lines[1]);
    console.log(canPlaceFlowers(flowerbed, n) ? "true" : "false");
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public boolean canPlaceFlowers(int[] flowerbed, int n) {
        // Write your solution here
        return false;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] flowerbed = line.isEmpty() ? new int[0] :
            Arrays.stream(line.split(","))
                  .mapToInt(s -> Integer.parseInt(s.trim()))
                  .toArray();
        int n = Integer.parseInt(sc.nextLine());
        Solution sol = new Solution();
        System.out.println(sol.canPlaceFlowers(flowerbed, n) ? "true" : "false");
    }
}`,
			},
			{
				LangID: 60,
				Template: `func canPlaceFlowers(flowerbed []int, n int) bool {
    // Write your solution here
    return false
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var flowerbed []int
    json.Unmarshal([]byte(line), &flowerbed)
    var n int
    fmt.Fscan(reader, &n)
    if canPlaceFlowers(flowerbed, n) {
        fmt.Println("true")
    } else {
        fmt.Println("false")
    }
}`,
			},
		},
	},

	// Add Binary
	{
		Title:      "Add Binary",
		Slug:       "add-binary",
		Difficulty: "Easy",
		Description: `Given two binary strings a and b, return their sum as a binary string.`,
		Constraints: `- 1 <= a.length, b.length <= 10^4
- a and b consist only of '0' or '1' characters.
- Each string does not contain leading zeros except for the zero itself.`,
		Examples: `Example 1:
Input: a = "11", b = "1"
Output: "100"

Example 2:
Input: a = "1010", b = "1011"
Output: "10101"`,
		Hints: `Hint 1: Process from right to left, similar to adding decimal numbers.
Hint 2: Keep track of the carry (0 or 1).`,
		TestCases: []TestCaseDef{
			{"11\n1", "100", true},
			{"1010\n1011", "10101", true},
			{"0\n0", "0", true},
			{"1\n1", "10", false},
			{"1111\n1111", "11110", false},
			{"100\n110010", "110110", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def addBinary(a, b):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

a = input().strip()
b = input().strip()
print(addBinary(a, b))`,
			},
			{
				LangID: 63,
				Template: `function addBinary(a, b) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    console.log(addBinary(lines[0], lines[1]));
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public String addBinary(String a, String b) {
        // Write your solution here
        return "";
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String a = sc.nextLine();
        String b = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.addBinary(a, b));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func addBinary(a string, b string) string {
    // Write your solution here
    return ""
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    a, _ := reader.ReadString('\n')
    b, _ := reader.ReadString('\n')
    fmt.Println(addBinary(strings.TrimSpace(a), strings.TrimSpace(b)))
}`,
			},
		},
	},

	// Greatest Common Divisor of Strings
	{
		Title:      "Greatest Common Divisor of Strings",
		Slug:       "greatest-common-divisor-of-strings",
		Difficulty: "Easy",
		Description: `For two strings s and t, we say "t divides s" if and only if s = t + t + t + ... + t (i.e., t is concatenated with itself one or more times).

Given two strings str1 and str2, return the largest string x such that x divides both str1 and str2.`,
		Constraints: `- 1 <= str1.length, str2.length <= 1000
- str1 and str2 consist of English uppercase letters.`,
		Examples: `Example 1:
Input: str1 = "ABCABC", str2 = "ABC"
Output: "ABC"

Example 2:
Input: str1 = "ABABAB", str2 = "ABAB"
Output: "AB"

Example 3:
Input: str1 = "LEET", str2 = "CODE"
Output: ""`,
		Hints: `Hint 1: If str1 + str2 != str2 + str1, there's no common divisor.
Hint 2: The GCD length is gcd(len(str1), len(str2)).`,
		TestCases: []TestCaseDef{
			{"ABCABC\nABC", "ABC", true},
			{"ABABAB\nABAB", "AB", true},
			{"LEET\nCODE", "", true},
			{"AA\nA", "A", false},
			{"ABAB\nAB", "AB", false},
			{"AAAAAA\nAAA", "AAA", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def gcdOfStrings(str1, str2):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

str1 = input().strip()
str2 = input().strip()
result = gcdOfStrings(str1, str2)
print(result if result else "")`,
			},
			{
				LangID: 63,
				Template: `function gcdOfStrings(str1, str2) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const result = gcdOfStrings(lines[0], lines[1]);
    console.log(result || "");
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public String gcdOfStrings(String str1, String str2) {
        // Write your solution here
        return "";
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String str1 = sc.nextLine();
        String str2 = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.gcdOfStrings(str1, str2));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func gcdOfStrings(str1 string, str2 string) string {
    // Write your solution here
    return ""
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    str1, _ := reader.ReadString('\n')
    str2, _ := reader.ReadString('\n')
    fmt.Println(gcdOfStrings(strings.TrimSpace(str1), strings.TrimSpace(str2)))
}`,
			},
		},
	},

	// Kids With the Greatest Number of Candies
	{
		Title:      "Kids With the Greatest Number of Candies",
		Slug:       "kids-with-the-greatest-number-of-candies",
		Difficulty: "Easy",
		Description: `There are n kids with candies. You are given an integer array candies, where each candies[i] represents the number of candies the ith kid has, and an integer extraCandies, denoting the number of extra candies that you have.

Return a boolean array result of length n, where result[i] is true if, after giving the ith kid all the extraCandies, they will have the greatest number of candies among all the kids, or false otherwise.

Note that multiple kids can have the greatest number of candies.`,
		Constraints: `- n == candies.length
- 2 <= n <= 100
- 1 <= candies[i] <= 100
- 1 <= extraCandies <= 50`,
		Examples: `Example 1:
Input: candies = [2,3,5,1,3], extraCandies = 3
Output: [true,true,true,false,true]

Example 2:
Input: candies = [4,2,1,1,2], extraCandies = 1
Output: [true,false,false,false,false]`,
		Hints: `Hint 1: Find the maximum number of candies among all kids.
Hint 2: For each kid, check if candies[i] + extraCandies >= max.`,
		TestCases: []TestCaseDef{
			{"[2,3,5,1,3]\n3", "[true,true,true,false,true]", true},
			{"[4,2,1,1,2]\n1", "[true,false,false,false,false]", true},
			{"[12,1,12]\n10", "[true,false,true]", true},
			{"[1,1,1]\n1", "[true,true,true]", false},
			{"[5,5,5,5]\n0", "[true,true,true,true]", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def kidsWithCandies(candies, extraCandies):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

candies = json.loads(input())
extraCandies = int(input())
result = kidsWithCandies(candies, extraCandies)
print("[" + ",".join("true" if x else "false" for x in result) + "]")`,
			},
			{
				LangID: 63,
				Template: `function kidsWithCandies(candies, extraCandies) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const candies = JSON.parse(lines[0]);
    const extraCandies = parseInt(lines[1]);
    const result = kidsWithCandies(candies, extraCandies);
    console.log("[" + result.map(x => x ? "true" : "false").join(",") + "]");
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public List<Boolean> kidsWithCandies(int[] candies, int extraCandies) {
        // Write your solution here
        return new ArrayList<>();
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] candies = Arrays.stream(line.split(","))
                              .mapToInt(s -> Integer.parseInt(s.trim()))
                              .toArray();
        int extraCandies = Integer.parseInt(sc.nextLine());
        Solution sol = new Solution();
        List<Boolean> result = sol.kidsWithCandies(candies, extraCandies);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < result.size(); i++) {
            sb.append(result.get(i) ? "true" : "false");
            if (i < result.size() - 1) sb.append(",");
        }
        sb.append("]");
        System.out.println(sb);
    }
}`,
			},
			{
				LangID: 60,
				Template: `func kidsWithCandies(candies []int, extraCandies int) []bool {
    // Write your solution here
    return nil
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var candies []int
    json.Unmarshal([]byte(line), &candies)
    var extraCandies int
    fmt.Fscan(reader, &extraCandies)
    result := kidsWithCandies(candies, extraCandies)
    parts := make([]string, len(result))
    for i, v := range result {
        if v { parts[i] = "true" } else { parts[i] = "false" }
    }
    fmt.Println("[" + strings.Join(parts, ",") + "]")
}`,
			},
		},
	},

	// Find All Numbers Disappeared in an Array
	{
		Title:      "Find All Numbers Disappeared in an Array",
		Slug:       "find-all-numbers-disappeared-in-an-array",
		Difficulty: "Easy",
		Description: `Given an array nums of n integers where nums[i] is in the range [1, n], return an array of all the integers in the range [1, n] that do not appear in nums.`,
		Constraints: `- n == nums.length
- 1 <= n <= 10^5
- 1 <= nums[i] <= n`,
		Examples: `Example 1:
Input: nums = [4,3,2,7,8,2,3,1]
Output: [5,6]

Example 2:
Input: nums = [1,1]
Output: [2]`,
		Hints: `Hint 1: Use the array itself as a hash map by marking visited indices.
Hint 2: Mark nums[abs(nums[i])-1] as negative to indicate presence.`,
		TestCases: []TestCaseDef{
			{"[4,3,2,7,8,2,3,1]", "[5,6]", true},
			{"[1,1]", "[2]", true},
			{"[1]", "[]", true},
			{"[2,2]", "[1]", false},
			{"[1,2,3,4,5]", "[]", false},
			{"[5,4,3,2,1,1]", "[6]", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def findDisappearedNumbers(nums):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
result = findDisappearedNumbers(nums)
print(json.dumps(result, separators=(',', ':')))`,
			},
			{
				LangID: 63,
				Template: `function findDisappearedNumbers(nums) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const nums = JSON.parse(line);
    console.log(JSON.stringify(findDisappearedNumbers(nums)));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public List<Integer> findDisappearedNumbers(int[] nums) {
        // Write your solution here
        return new ArrayList<>();
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = line.isEmpty() ? new int[0] :
            Arrays.stream(line.split(","))
                  .mapToInt(s -> Integer.parseInt(s.trim()))
                  .toArray();
        Solution sol = new Solution();
        List<Integer> result = sol.findDisappearedNumbers(nums);
        System.out.println(result.toString().replace(" ", ""));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func findDisappearedNumbers(nums []int) []int {
    // Write your solution here
    return nil
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    result := findDisappearedNumbers(nums)
    if result == nil { result = []int{} }
    output, _ := json.Marshal(result)
    fmt.Println(string(output))
}`,
			},
		},
	},

	// Ransom Note
	{
		Title:      "Ransom Note",
		Slug:       "ransom-note",
		Difficulty: "Easy",
		Description: `Given two strings ransomNote and magazine, return true if ransomNote can be constructed by using the letters from magazine and false otherwise.

Each letter in magazine can only be used once in ransomNote.`,
		Constraints: `- 1 <= ransomNote.length, magazine.length <= 10^5
- ransomNote and magazine consist of lowercase English letters.`,
		Examples: `Example 1:
Input: ransomNote = "a", magazine = "b"
Output: false

Example 2:
Input: ransomNote = "aa", magazine = "ab"
Output: false

Example 3:
Input: ransomNote = "aa", magazine = "aab"
Output: true`,
		Hints: `Hint 1: Count the frequency of each character in magazine.
Hint 2: Check if magazine has enough of each character needed for ransomNote.`,
		TestCases: []TestCaseDef{
			{"a\nb", "false", true},
			{"aa\nab", "false", true},
			{"aa\naab", "true", true},
			{"abc\nabc", "true", false},
			{"aabb\nab", "false", false},
			{"z\nzzzz", "true", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def canConstruct(ransomNote, magazine):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

ransomNote = input().strip()
magazine = input().strip()
print("true" if canConstruct(ransomNote, magazine) else "false")`,
			},
			{
				LangID: 63,
				Template: `function canConstruct(ransomNote, magazine) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    console.log(canConstruct(lines[0], lines[1]) ? "true" : "false");
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public boolean canConstruct(String ransomNote, String magazine) {
        // Write your solution here
        return false;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String ransomNote = sc.nextLine();
        String magazine = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.canConstruct(ransomNote, magazine) ? "true" : "false");
    }
}`,
			},
			{
				LangID: 60,
				Template: `func canConstruct(ransomNote string, magazine string) bool {
    // Write your solution here
    return false
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    ransomNote, _ := reader.ReadString('\n')
    magazine, _ := reader.ReadString('\n')
    if canConstruct(strings.TrimSpace(ransomNote), strings.TrimSpace(magazine)) {
        fmt.Println("true")
    } else {
        fmt.Println("false")
    }
}`,
			},
		},
	},

	// First Unique Character in a String
	{
		Title:      "First Unique Character in a String",
		Slug:       "first-unique-character-in-a-string",
		Difficulty: "Easy",
		Description: `Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.`,
		Constraints: `- 1 <= s.length <= 10^5
- s consists of only lowercase English letters.`,
		Examples: `Example 1:
Input: s = "leetcode"
Output: 0
Explanation: The character 'l' at index 0 is the first non-repeating character.

Example 2:
Input: s = "loveleetcode"
Output: 2

Example 3:
Input: s = "aabb"
Output: -1`,
		Hints: `Hint 1: Count the frequency of each character.
Hint 2: Iterate through the string and find the first character with count 1.`,
		TestCases: []TestCaseDef{
			{"leetcode", "0", true},
			{"loveleetcode", "2", true},
			{"aabb", "-1", true},
			{"a", "0", false},
			{"aadadaad", "-1", false},
			{"abcdef", "0", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def firstUniqChar(s):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

s = input().strip()
print(firstUniqChar(s))`,
			},
			{
				LangID: 63,
				Template: `function firstUniqChar(s) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    console.log(firstUniqChar(line));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public int firstUniqChar(String s) {
        // Write your solution here
        return -1;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.firstUniqChar(s));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func firstUniqChar(s string) int {
    // Write your solution here
    return -1
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\n')
    fmt.Println(firstUniqChar(strings.TrimSpace(s)))
}`,
			},
		},
	},

	// Repeated Substring Pattern
	{
		Title:      "Repeated Substring Pattern",
		Slug:       "repeated-substring-pattern",
		Difficulty: "Easy",
		Description: `Given a string s, check if it can be constructed by taking a substring of it and appending multiple copies of the substring together.`,
		Constraints: `- 1 <= s.length <= 10^4
- s consists of lowercase English letters.`,
		Examples: `Example 1:
Input: s = "abab"
Output: true
Explanation: It is the substring "ab" twice.

Example 2:
Input: s = "aba"
Output: false

Example 3:
Input: s = "abcabcabcabc"
Output: true`,
		Hints: `Hint 1: If s can be formed by repeating a substring, then s+s contains s at a position other than 0 and len(s).
Hint 2: Check if s exists in (s+s)[1:-1].`,
		TestCases: []TestCaseDef{
			{"abab", "true", true},
			{"aba", "false", true},
			{"abcabcabcabc", "true", true},
			{"a", "false", false},
			{"aa", "true", false},
			{"abcabc", "true", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def repeatedSubstringPattern(s):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

s = input().strip()
print("true" if repeatedSubstringPattern(s) else "false")`,
			},
			{
				LangID: 63,
				Template: `function repeatedSubstringPattern(s) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    console.log(repeatedSubstringPattern(line) ? "true" : "false");
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public boolean repeatedSubstringPattern(String s) {
        // Write your solution here
        return false;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.repeatedSubstringPattern(s) ? "true" : "false");
    }
}`,
			},
			{
				LangID: 60,
				Template: `func repeatedSubstringPattern(s string) bool {
    // Write your solution here
    return false
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\n')
    if repeatedSubstringPattern(strings.TrimSpace(s)) {
        fmt.Println("true")
    } else {
        fmt.Println("false")
    }
}`,
			},
		},
	},

	// Reverse Words in a String
	{
		Title:      "Reverse Words in a String",
		Slug:       "reverse-words-in-a-string",
		Difficulty: "Medium",
		Description: `Given an input string s, reverse the order of the words.

A word is defined as a sequence of non-space characters. The words in s will be separated by at least one space.

Return a string of the words in reverse order concatenated by a single space.

Note that s may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.`,
		Constraints: `- 1 <= s.length <= 10^4
- s contains English letters (upper-case and lower-case), digits, and spaces ' '.
- There is at least one word in s.`,
		Examples: `Example 1:
Input: s = "the sky is blue"
Output: "blue is sky the"

Example 2:
Input: s = "  hello world  "
Output: "world hello"

Example 3:
Input: s = "a good   example"
Output: "example good a"`,
		Hints: `Hint 1: Split the string by spaces, filter empty strings, reverse the list.
Hint 2: Join with single space.`,
		TestCases: []TestCaseDef{
			{"the sky is blue", "blue is sky the", true},
			{"  hello world  ", "world hello", true},
			{"a good   example", "example good a", true},
			{"  Bob    Loves  Alice   ", "Alice Loves Bob", false},
			{"word", "word", false},
			{"a b c", "c b a", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def reverseWords(s):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

s = input()
print(reverseWords(s))`,
			},
			{
				LangID: 63,
				Template: `function reverseWords(s) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    console.log(reverseWords(line));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public String reverseWords(String s) {
        // Write your solution here
        return "";
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.reverseWords(s));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func reverseWords(s string) string {
    // Write your solution here
    return ""
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\n')
    fmt.Println(reverseWords(strings.TrimSuffix(s, "\n")))
}`,
			},
		},
	},

	// Custom Sort String
	{
		Title:      "Custom Sort String",
		Slug:       "custom-sort-string",
		Difficulty: "Medium",
		Description: `You are given two strings order and s. All the characters of order are unique and were sorted in some custom order previously.

Permute the characters of s so that they match the order that order was sorted. More specifically, if a character x occurs before a character y in order, then x should occur before y in the permuted string.

Return any permutation of s that satisfies this property.`,
		Constraints: `- 1 <= order.length <= 26
- 1 <= s.length <= 200
- order and s consist of lowercase English letters.
- All the characters of order are unique.`,
		Examples: `Example 1:
Input: order = "cba", s = "abcd"
Output: "cbad"
Explanation: "a", "b", "c" appear in order, so the order of "a", "b", "c" should be "c", "b", "a". "d" does not appear in order, so it can be at any position.

Example 2:
Input: order = "bcafg", s = "abcd"
Output: "bcad"`,
		Hints: `Hint 1: Count the frequency of each character in s.
Hint 2: Build the result by iterating through order first, then adding remaining characters.`,
		TestCases: []TestCaseDef{
			{"cba\nabcd", "cbad", true},
			{"bcafg\nabcd", "bcad", true},
			{"abc\nabc", "abc", true},
			{"xyz\nabc", "abc", false},
			{"a\naaaaa", "aaaaa", false},
			{"kqep\npekeq", "kqeep", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def customSortString(order, s):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

order = input().strip()
s = input().strip()
print(customSortString(order, s))`,
			},
			{
				LangID: 63,
				Template: `function customSortString(order, s) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    console.log(customSortString(lines[0], lines[1]));
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public String customSortString(String order, String s) {
        // Write your solution here
        return "";
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String order = sc.nextLine();
        String s = sc.nextLine();
        Solution sol = new Solution();
        System.out.println(sol.customSortString(order, s));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func customSortString(order string, s string) string {
    // Write your solution here
    return ""
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    order, _ := reader.ReadString('\n')
    s, _ := reader.ReadString('\n')
    fmt.Println(customSortString(strings.TrimSpace(order), strings.TrimSpace(s)))
}`,
			},
		},
	},

	// Maximum Swap
	{
		Title:      "Maximum Swap",
		Slug:       "maximum-swap",
		Difficulty: "Medium",
		Description: `You are given an integer num. You can swap two digits at most once to get the maximum valued number.

Return the maximum valued number you can get.`,
		Constraints: `- 0 <= num <= 10^8`,
		Examples: `Example 1:
Input: num = 2736
Output: 7236
Explanation: Swap the number 2 and the number 7.

Example 2:
Input: num = 9973
Output: 9973
Explanation: No swap needed.`,
		Hints: `Hint 1: For each position, find the largest digit to its right.
Hint 2: Swap with the rightmost occurrence of that largest digit.`,
		TestCases: []TestCaseDef{
			{"2736", "7236", true},
			{"9973", "9973", true},
			{"1993", "9913", true},
			{"98368", "98863", false},
			{"1234", "4231", false},
			{"10", "10", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def maximumSwap(num):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

num = int(input())
print(maximumSwap(num))`,
			},
			{
				LangID: 63,
				Template: `function maximumSwap(num) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    console.log(maximumSwap(parseInt(line)));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public int maximumSwap(int num) {
        // Write your solution here
        return 0;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int num = Integer.parseInt(sc.nextLine());
        Solution sol = new Solution();
        System.out.println(sol.maximumSwap(num));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func maximumSwap(num int) int {
    // Write your solution here
    return 0
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    var num int
    fmt.Fscan(reader, &num)
    fmt.Println(maximumSwap(num))
}`,
			},
		},
	},

	// Reverse Integer
	{
		Title:      "Reverse Integer",
		Slug:       "reverse-integer",
		Difficulty: "Medium",
		Description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).`,
		Constraints: `- -2^31 <= x <= 2^31 - 1`,
		Examples: `Example 1:
Input: x = 123
Output: 321

Example 2:
Input: x = -123
Output: -321

Example 3:
Input: x = 120
Output: 21`,
		Hints: `Hint 1: Pop digits from the end using modulo and division.
Hint 2: Check for overflow before multiplying by 10.`,
		TestCases: []TestCaseDef{
			{"123", "321", true},
			{"-123", "-321", true},
			{"120", "21", true},
			{"0", "0", false},
			{"1534236469", "0", false},
			{"-2147483648", "0", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def reverse(x):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

x = int(input())
print(reverse(x))`,
			},
			{
				LangID: 63,
				Template: `function reverse(x) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    console.log(reverse(parseInt(line)));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public int reverse(int x) {
        // Write your solution here
        return 0;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = Integer.parseInt(sc.nextLine());
        Solution sol = new Solution();
        System.out.println(sol.reverse(x));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func reverse(x int) int {
    // Write your solution here
    return 0
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    var x int
    fmt.Fscan(reader, &x)
    fmt.Println(reverse(x))
}`,
			},
		},
	},

	// Rotate Array
	{
		Title:      "Rotate Array",
		Slug:       "rotate-array",
		Difficulty: "Medium",
		Description: `Given an integer array nums, rotate the array to the right by k steps, where k is non-negative.`,
		Constraints: `- 1 <= nums.length <= 10^5
- -2^31 <= nums[i] <= 2^31 - 1
- 0 <= k <= 10^5`,
		Examples: `Example 1:
Input: nums = [1,2,3,4,5,6,7], k = 3
Output: [5,6,7,1,2,3,4]
Explanation: rotate 1 step: [7,1,2,3,4,5,6], rotate 2 steps: [6,7,1,2,3,4,5], rotate 3 steps: [5,6,7,1,2,3,4]

Example 2:
Input: nums = [-1,-100,3,99], k = 2
Output: [3,99,-1,-100]`,
		Hints: `Hint 1: Use the reverse approach: reverse all, reverse first k, reverse rest.
Hint 2: Remember to handle k > n by using k % n.`,
		TestCases: []TestCaseDef{
			{"[1,2,3,4,5,6,7]\n3", "[5,6,7,1,2,3,4]", true},
			{"[-1,-100,3,99]\n2", "[3,99,-1,-100]", true},
			{"[1,2]\n3", "[2,1]", true},
			{"[1]\n0", "[1]", false},
			{"[1,2,3]\n1", "[3,1,2]", false},
			{"[1,2,3,4,5]\n5", "[1,2,3,4,5]", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def rotate(nums, k):
    # Write your solution here (modify nums in-place)
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
k = int(input())
rotate(nums, k)
print(json.dumps(nums, separators=(',', ':')))`,
			},
			{
				LangID: 63,
				Template: `function rotate(nums, k) {
    // Write your solution here (modify nums in-place)
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const nums = JSON.parse(lines[0]);
    const k = parseInt(lines[1]);
    rotate(nums, k);
    console.log(JSON.stringify(nums));
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public void rotate(int[] nums, int k) {
        // Write your solution here (modify nums in-place)
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = Arrays.stream(line.split(","))
                          .mapToInt(s -> Integer.parseInt(s.trim()))
                          .toArray();
        int k = Integer.parseInt(sc.nextLine());
        Solution sol = new Solution();
        sol.rotate(nums, k);
        System.out.println(Arrays.toString(nums).replace(" ", ""));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func rotate(nums []int, k int) {
    // Write your solution here (modify nums in-place)
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    var k int
    fmt.Fscan(reader, &k)
    rotate(nums, k)
    output, _ := json.Marshal(nums)
    fmt.Println(string(output))
}`,
			},
		},
	},

	// Zigzag Conversion
	{
		Title:      "Zigzag Conversion",
		Slug:       "zigzag-conversion",
		Difficulty: "Medium",
		Description: `The string "PAYPALISHIRING" is written in a zigzag pattern on a given number of rows like this:

P   A   H   N
A P L S I I G
Y   I   R

And then read line by line: "PAHNAPLSIIGYIR"

Write the code that will take a string and make this conversion given a number of rows.`,
		Constraints: `- 1 <= s.length <= 1000
- s consists of English letters (lower-case and upper-case), ',' and '.'.
- 1 <= numRows <= 1000`,
		Examples: `Example 1:
Input: s = "PAYPALISHIRING", numRows = 3
Output: "PAHNAPLSIIGYIR"

Example 2:
Input: s = "PAYPALISHIRING", numRows = 4
Output: "PINALSIGYAHRPI"

Example 3:
Input: s = "A", numRows = 1
Output: "A"`,
		Hints: `Hint 1: Create an array of strings for each row.
Hint 2: Iterate through the string, alternating direction when hitting top or bottom row.`,
		TestCases: []TestCaseDef{
			{"PAYPALISHIRING\n3", "PAHNAPLSIIGYIR", true},
			{"PAYPALISHIRING\n4", "PINALSIGYAHRPI", true},
			{"A\n1", "A", true},
			{"AB\n1", "AB", false},
			{"ABCD\n2", "ACBD", false},
			{"ABCDEFG\n3", "AEBDFCG", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def convert(s, numRows):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

s = input().strip()
numRows = int(input())
print(convert(s, numRows))`,
			},
			{
				LangID: 63,
				Template: `function convert(s, numRows) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    console.log(convert(lines[0], parseInt(lines[1])));
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public String convert(String s, int numRows) {
        // Write your solution here
        return "";
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int numRows = Integer.parseInt(sc.nextLine());
        Solution sol = new Solution();
        System.out.println(sol.convert(s, numRows));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func convert(s string, numRows int) string {
    // Write your solution here
    return ""
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    s, _ := reader.ReadString('\n')
    var numRows int
    fmt.Fscan(reader, &numRows)
    fmt.Println(convert(strings.TrimSpace(s), numRows))
}`,
			},
		},
	},

	// Maximum Sum Circular Subarray
	{
		Title:      "Maximum Sum Circular Subarray",
		Slug:       "maximum-sum-circular-subarray",
		Difficulty: "Medium",
		Description: `Given a circular integer array nums of length n, return the maximum possible sum of a non-empty subarray of nums.

A circular array means the end of the array connects to the beginning of the array. Formally, the next element of nums[i] is nums[(i + 1) % n] and the previous element of nums[i] is nums[(i - 1 + n) % n].

A subarray may only include each element of the fixed buffer nums at most once.`,
		Constraints: `- n == nums.length
- 1 <= n <= 3 * 10^4
- -3 * 10^4 <= nums[i] <= 3 * 10^4`,
		Examples: `Example 1:
Input: nums = [1,-2,3,-2]
Output: 3
Explanation: Subarray [3] has maximum sum 3.

Example 2:
Input: nums = [5,-3,5]
Output: 10
Explanation: Subarray [5,5] has maximum sum 10 (wrapping around).

Example 3:
Input: nums = [-3,-2,-3]
Output: -2
Explanation: Subarray [-2] has maximum sum -2.`,
		Hints: `Hint 1: The answer is either max subarray (Kadane's) or total sum - min subarray.
Hint 2: Handle the edge case when all elements are negative.`,
		TestCases: []TestCaseDef{
			{"[1,-2,3,-2]", "3", true},
			{"[5,-3,5]", "10", true},
			{"[-3,-2,-3]", "-2", true},
			{"[3,-1,2,-1]", "4", false},
			{"[3,-2,2,-3]", "3", false},
			{"[-2,-3,-1]", "-1", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def maxSubarraySumCircular(nums):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
print(maxSubarraySumCircular(nums))`,
			},
			{
				LangID: 63,
				Template: `function maxSubarraySumCircular(nums) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    console.log(maxSubarraySumCircular(JSON.parse(line)));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public int maxSubarraySumCircular(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = Arrays.stream(line.split(","))
                          .mapToInt(s -> Integer.parseInt(s.trim()))
                          .toArray();
        Solution sol = new Solution();
        System.out.println(sol.maxSubarraySumCircular(nums));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func maxSubarraySumCircular(nums []int) int {
    // Write your solution here
    return 0
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    fmt.Println(maxSubarraySumCircular(nums))
}`,
			},
		},
	},

	// Encode and Decode Strings
	{
		Title:      "Encode and Decode Strings",
		Slug:       "encode-and-decode-strings",
		Difficulty: "Medium",
		Description: `Design an algorithm to encode a list of strings to a single string. The encoded string is then decoded back to the original list of strings.

Implement the encode and decode methods.`,
		Constraints: `- 1 <= strs.length <= 200
- 0 <= strs[i].length <= 200
- strs[i] contains any possible characters out of 256 valid ASCII characters.`,
		Examples: `Example 1:
Input: strs = ["Hello","World"]
Output: ["Hello","World"]

Example 2:
Input: strs = [""]
Output: [""]`,
		Hints: `Hint 1: Use a delimiter that can handle any character.
Hint 2: Prefix each string with its length and a separator like "#".`,
		TestCases: []TestCaseDef{
			{`["Hello","World"]`, `["Hello","World"]`, true},
			{`[""]`, `[""]`, true},
			{`["a","b","c"]`, `["a","b","c"]`, true},
			{`["we","say",":","yes"]`, `["we","say",":","yes"]`, false},
			{`[""]`, `[""]`, false},
			{`["abc","def","ghi"]`, `["abc","def","ghi"]`, false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def encode(strs):
    # Write your solution here
    pass

def decode(s):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

strs = json.loads(input())
encoded = encode(strs)
decoded = decode(encoded)
print(json.dumps(decoded, separators=(',', ':')))`,
			},
			{
				LangID: 63,
				Template: `function encode(strs) {
    // Write your solution here
}

function decode(s) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    const strs = JSON.parse(line);
    const encoded = encode(strs);
    const decoded = decode(encoded);
    console.log(JSON.stringify(decoded));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `import java.util.*;

class Solution {
    public String encode(List<String> strs) {
        // Write your solution here
        return "";
    }

    public List<String> decode(String s) {
        // Write your solution here
        return new ArrayList<>();
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        List<String> strs = new ArrayList<>();
        if (!line.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            boolean inQuote = false;
            for (char c : line.toCharArray()) {
                if (c == '"') inQuote = !inQuote;
                else if (c == ',' && !inQuote) {
                    strs.add(sb.toString());
                    sb = new StringBuilder();
                } else sb.append(c);
            }
            strs.add(sb.toString());
        }
        Solution sol = new Solution();
        String encoded = sol.encode(strs);
        List<String> decoded = sol.decode(encoded);
        StringBuilder out = new StringBuilder("[");
        for (int i = 0; i < decoded.size(); i++) {
            out.append("\"").append(decoded.get(i)).append("\"");
            if (i < decoded.size() - 1) out.append(",");
        }
        out.append("]");
        System.out.println(out);
    }
}`,
			},
			{
				LangID: 60,
				Template: `func encode(strs []string) string {
    // Write your solution here
    return ""
}

func decode(s string) []string {
    // Write your solution here
    return nil
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var strs []string
    json.Unmarshal([]byte(line), &strs)
    encoded := encode(strs)
    decoded := decode(encoded)
    output, _ := json.Marshal(decoded)
    fmt.Println(string(output))
}`,
			},
		},
	},

	// First Missing Positive (Hard)
	{
		Title:      "First Missing Positive",
		Slug:       "first-missing-positive",
		Difficulty: "Hard",
		Description: `Given an unsorted integer array nums, return the smallest missing positive integer.

You must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.`,
		Constraints: `- 1 <= nums.length <= 10^5
- -2^31 <= nums[i] <= 2^31 - 1`,
		Examples: `Example 1:
Input: nums = [1,2,0]
Output: 3
Explanation: The numbers 1 and 2 are present, so the first missing positive is 3.

Example 2:
Input: nums = [3,4,-1,1]
Output: 2
Explanation: 1 is present, but 2 is missing.

Example 3:
Input: nums = [7,8,9,11,12]
Output: 1
Explanation: The smallest positive integer 1 is missing.`,
		Hints: `Hint 1: Use cyclic sort - place each number at its correct index.
Hint 2: nums[i] should be at index nums[i]-1 if 1 <= nums[i] <= n.`,
		TestCases: []TestCaseDef{
			{"[1,2,0]", "3", true},
			{"[3,4,-1,1]", "2", true},
			{"[7,8,9,11,12]", "1", true},
			{"[1]", "2", false},
			{"[1,2,3,4,5]", "6", false},
			{"[2,1]", "3", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def firstMissingPositive(nums):
    # Write your solution here
    pass`,
				Wrapper: `import json

{{USER_CODE}}

nums = json.loads(input())
print(firstMissingPositive(nums))`,
			},
			{
				LangID: 63,
				Template: `function firstMissingPositive(nums) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    console.log(firstMissingPositive(JSON.parse(line)));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public int firstMissingPositive(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine();
        line = line.substring(1, line.length() - 1);
        int[] nums = line.isEmpty() ? new int[0] :
            Arrays.stream(line.split(","))
                  .mapToInt(s -> Integer.parseInt(s.trim()))
                  .toArray();
        Solution sol = new Solution();
        System.out.println(sol.firstMissingPositive(nums));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func firstMissingPositive(nums []int) int {
    // Write your solution here
    return 0
}`,
				Wrapper: `package main

import (
    "bufio"
    "encoding/json"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    line, _ := reader.ReadString('\n')
    var nums []int
    json.Unmarshal([]byte(line), &nums)
    fmt.Println(firstMissingPositive(nums))
}`,
			},
		},
	},

	// Integer to English Words (Hard)
	{
		Title:      "Integer to English Words",
		Slug:       "integer-to-english-words",
		Difficulty: "Hard",
		Description: `Convert a non-negative integer num to its English words representation.`,
		Constraints: `- 0 <= num <= 2^31 - 1`,
		Examples: `Example 1:
Input: num = 123
Output: "One Hundred Twenty Three"

Example 2:
Input: num = 12345
Output: "Twelve Thousand Three Hundred Forty Five"

Example 3:
Input: num = 1234567
Output: "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven"`,
		Hints: `Hint 1: Process three digits at a time (hundreds, tens, ones).
Hint 2: Use Billion, Million, Thousand as markers.`,
		TestCases: []TestCaseDef{
			{"123", "One Hundred Twenty Three", true},
			{"12345", "Twelve Thousand Three Hundred Forty Five", true},
			{"1234567", "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven", true},
			{"0", "Zero", false},
			{"1000000", "One Million", false},
			{"100", "One Hundred", false},
		},
		Templates: []TemplateDef{
			{
				LangID: 71,
				Template: `def numberToWords(num):
    # Write your solution here
    pass`,
				Wrapper: `{{USER_CODE}}

num = int(input())
print(numberToWords(num))`,
			},
			{
				LangID: 63,
				Template: `function numberToWords(num) {
    // Write your solution here
}`,
				Wrapper: `{{USER_CODE}}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });

rl.on('line', (line) => {
    console.log(numberToWords(parseInt(line)));
    rl.close();
});`,
			},
			{
				LangID: 62,
				Template: `class Solution {
    public String numberToWords(int num) {
        // Write your solution here
        return "";
    }
}`,
				Wrapper: `import java.util.*;

{{USER_CODE}}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int num = Integer.parseInt(sc.nextLine());
        Solution sol = new Solution();
        System.out.println(sol.numberToWords(num));
    }
}`,
			},
			{
				LangID: 60,
				Template: `func numberToWords(num int) string {
    // Write your solution here
    return ""
}`,
				Wrapper: `package main

import (
    "bufio"
    "fmt"
    "os"
)

{{USER_CODE}}

func main() {
    reader := bufio.NewReader(os.Stdin)
    var num int
    fmt.Fscan(reader, &num)
    fmt.Println(numberToWords(num))
}`,
			},
		},
	},
}
