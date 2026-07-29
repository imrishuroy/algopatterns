# Bit Manipulation Pattern Improvement Prompt

Use this prompt to create or improve the Bit Manipulation pattern to match the quality of the DP pattern.

---

# Create/Improve the Bit Manipulation Pattern to Match the Quality of the DP Pattern

I want you to create a comprehensive Bit Manipulation pattern for `patterns.json` that matches the quality of the Dynamic Programming pattern.

Before making any changes, carefully study the Dynamic Programming pattern in this project. The DP pattern is the quality benchmark.

---

# PART 1: FUNDAMENTALS (For Beginners)

Bit manipulation is not a topic most developers use daily. Unlike arrays or loops, working with individual bits feels unfamiliar. This section builds intuition from scratch.

---

## What Are Bits?

A **bit** (binary digit) is the smallest unit of data in computing. It can only be **0** or **1**.

Everything in your computer is stored as bits: numbers, text, images, videos. When we say "bit manipulation," we mean working directly with these 0s and 1s.

### Why Binary?

Computers use binary because electronic circuits have two states:
- **Off** = 0 (no voltage)
- **On** = 1 (voltage present)

It's like a light switch, not a dimmer. Simple and reliable.

---

## How Numbers Are Stored: Binary Representation

### Decimal to Binary

We normally use **decimal** (base 10) with digits 0-9. Computers use **binary** (base 2) with digits 0-1.

**Decimal 13 in binary:**

```
Decimal:  13 = 8 + 4 + 1 = 2^3 + 2^2 + 2^0

Position:  3   2   1   0    (right to left, starting at 0)
Power:     8   4   2   1    (2^position)
Binary:    1   1   0   1    (is this power included?)

So 13 in binary = 1101
```

**Conversion table:**

| Decimal | Binary | How to read it |
|---------|--------|----------------|
| 0 | 0000 | No powers of 2 |
| 1 | 0001 | 2^0 = 1 |
| 2 | 0010 | 2^1 = 2 |
| 3 | 0011 | 2^1 + 2^0 = 3 |
| 4 | 0100 | 2^2 = 4 |
| 5 | 0101 | 2^2 + 2^0 = 5 |
| 6 | 0110 | 2^2 + 2^1 = 6 |
| 7 | 0111 | 2^2 + 2^1 + 2^0 = 7 |
| 8 | 1000 | 2^3 = 8 |
| 9 | 1001 | 2^3 + 2^0 = 9 |
| 10 | 1010 | 2^3 + 2^1 = 10 |

**Pattern:** Each position is a power of 2. A "1" means include that power, "0" means skip it.

### Binary to Decimal

Read right to left, multiply each bit by its position's power of 2:

```
Binary: 1 0 1 1
        │ │ │ └── Position 0: 1 × 2^0 = 1 × 1 = 1
        │ │ └──── Position 1: 1 × 2^1 = 1 × 2 = 2
        │ └────── Position 2: 0 × 2^2 = 0 × 4 = 0
        └──────── Position 3: 1 × 2^3 = 1 × 8 = 8
                                              ───
                                        Total: 11
```

> **Quick Check:** What is binary 1100 in decimal?
>
> <details>
> <summary>Think first, then click</summary>
>
> 1100 = 1×8 + 1×4 + 0×2 + 0×1 = 8 + 4 = **12**
> </details>

---

## Bit Numbering and Terminology

```
Binary number: 0 0 1 0 1 1 0 1
Bit position:  7 6 5 4 3 2 1 0   (right to left!)
               ↑           ↑
              MSB         LSB

MSB = Most Significant Bit (leftmost, highest value)
LSB = Least Significant Bit (rightmost, lowest value)
```

**Important:** Bit positions start at 0 from the RIGHT.

**Terminology:**
- **Set bit** = bit that is 1
- **Clear bit** = bit that is 0
- **Toggle** = flip a bit (0→1 or 1→0)
- **Mask** = a pattern of bits used to select/modify specific bits

---

## How Negative Numbers Work: Two's Complement

Computers use **two's complement** to represent negative numbers. This is crucial for understanding bit manipulation.

### The Problem

With 4 bits, we can represent 16 values (0-15). But how do we represent negative numbers?

### Two's Complement Rule

To get -n from n:
1. Flip all bits (NOT operation)
2. Add 1

**Example: Finding -5 (using 8 bits)**

```
Step 1: Start with 5
5 in binary:     0000 0101

Step 2: Flip all bits (NOT)
~5:              1111 1010

Step 3: Add 1
~5 + 1:          1111 1011

So -5 in binary = 1111 1011
```

### Why Two's Complement Works

The beauty is that addition works the same for positive and negative:

```
  5 + (-3) should equal 2

    0000 0101   (5)
  + 1111 1101   (-3 in two's complement)
  ───────────
    0000 0010   (2)  ✓

(The overflow bit is discarded)
```

### Signed vs Unsigned Integers

| Type | 8-bit Range | How MSB is interpreted |
|------|-------------|------------------------|
| Unsigned | 0 to 255 | Just another bit |
| Signed | -128 to 127 | 0 = positive, 1 = negative |

**The MSB (leftmost bit) determines sign in signed integers:**
- `0xxxxxxx` = positive (or zero)
- `1xxxxxxx` = negative

### Common Values to Know

| Value | 8-bit Signed | 32-bit Signed |
|-------|--------------|---------------|
| 0 | 0000 0000 | all zeros |
| -1 | 1111 1111 | all ones |
| MAX | 0111 1111 (127) | 0111...1 (2^31 - 1) |
| MIN | 1000 0000 (-128) | 1000...0 (-2^31) |

**Key insight:** `-1` is all 1s in two's complement. This is useful for bit tricks.

> **Quick Check:** In two's complement, why is -1 represented as all 1s?
>
> <details>
> <summary>Think first, then click</summary>
>
> To get -1 from 1:
> 1. Start with 1: `0000 0001`
> 2. Flip all bits: `1111 1110`
> 3. Add 1: `1111 1111`
>
> Also, adding 1 to all-1s gives 0 (with overflow), which is correct: -1 + 1 = 0
> </details>

---

## The Six Bitwise Operators (In Depth)

### 1. AND (`&`): Both Must Be 1

```
Truth table:
0 & 0 = 0
0 & 1 = 0
1 & 0 = 0
1 & 1 = 1   ← Only case that gives 1

Example:
    1 0 1 1   (11)
  & 0 1 1 0   (6)
  ─────────
    0 0 1 0   (2)
```

**Real-world analogy:** Two switches in SERIES. Both must be ON for current to flow.

**Use cases:**
- Check if a bit is set: `n & (1 << i)`
- Clear bits (mask out): `n & 0x0F` keeps only last 4 bits
- Check if even/odd: `n & 1` (0 = even, 1 = odd)

### 2. OR (`|`): Either Can Be 1

```
Truth table:
0 | 0 = 0
0 | 1 = 1
1 | 0 = 1
1 | 1 = 1   ← Any 1 gives 1

Example:
    1 0 1 1   (11)
  | 0 1 1 0   (6)
  ─────────
    1 1 1 1   (15)
```

**Real-world analogy:** Two switches in PARALLEL. Either ON makes current flow.

**Use cases:**
- Set a bit: `n | (1 << i)`
- Combine flags: `READ | WRITE | EXECUTE`

### 3. XOR (`^`): Must Be Different

```
Truth table:
0 ^ 0 = 0   ← Same
0 ^ 1 = 1   ← Different
1 ^ 0 = 1   ← Different
1 ^ 1 = 0   ← Same

Example:
    1 0 1 1   (11)
  ^ 0 1 1 0   (6)
  ─────────
    1 1 0 1   (13)
```

**Real-world analogy:** A light controlled by two switches. Flipping either switch toggles the light.

**Key properties:**
- `a ^ a = 0` (self-inverse: XOR with itself gives 0)
- `a ^ 0 = a` (identity: XOR with 0 gives itself)
- `a ^ b = b ^ a` (commutative)
- `(a ^ b) ^ c = a ^ (b ^ c)` (associative)

**Use cases:**
- Find unique element: XOR all, pairs cancel
- Toggle a bit: `n ^ (1 << i)`
- Swap without temp: `a ^= b; b ^= a; a ^= b;`

### 4. NOT (`~`): Flip Every Bit

```
~0 = 1
~1 = 0

Example (8-bit):
  ~ 0000 0101   (5)
  ───────────
    1111 1010   (-6 in two's complement)
```

**Why `~5 = -6`?** In two's complement, `~n = -n - 1`.

Proof: `n + ~n = all 1s = -1`, so `~n = -1 - n = -(n+1)`

**Use cases:**
- Create mask to clear bits: `n & ~(1 << i)` clears bit i
- Part of two's complement: `-n = ~n + 1`

### 5. Left Shift (`<<`): Multiply by Powers of 2

```
Shift bits left, fill with 0s on the right.

5 << 1:
  0000 0101  (5)
  ─────────
  0000 1010  (10)   → 5 × 2 = 10

5 << 2:
  0000 0101  (5)
  ─────────
  0001 0100  (20)   → 5 × 4 = 20
```

**Rule:** `n << k` = n × 2^k

**Use cases:**
- Create bit mask: `1 << i` creates mask with only bit i set
- Multiply by power of 2: faster than multiplication

**Warning:** Shifting too far causes overflow. `1 << 32` in 32-bit wraps around!

### 6. Right Shift (`>>` and `>>>`): Divide by Powers of 2

There are two types:

**Arithmetic shift (`>>`):** Preserves sign bit (fills with MSB)
```
-8 >> 1:
  1111 1000  (-8)
  ─────────
  1111 1100  (-4)   → -8 / 2 = -4 ✓

The sign bit (1) is copied to fill the left.
```

**Logical shift (`>>>`):** Always fills with 0s (JavaScript/Java)
```
-8 >>> 1  (in 32-bit):
  1111...1000  (-8)
  ───────────
  0111...1100  (a large positive number)
```

**Rule:** `n >> k` = n / 2^k (rounds toward negative infinity)

**Use cases:**
- Divide by power of 2
- Extract bits: `(n >> i) & 1` gets bit at position i
- Process number bit by bit

---

## Bit Manipulation Building Blocks

These are the fundamental operations you'll use repeatedly:

### Get Bit at Position i

```java
// Returns 1 if bit i is set, 0 otherwise
int getBit(int n, int i) {
    return (n >> i) & 1;
}
```

**How it works:**
1. Shift right by i: moves bit i to position 0
2. AND with 1: masks out all other bits

```
n = 13 (1101), i = 2

Step 1: 1101 >> 2 = 0011
Step 2: 0011 & 0001 = 0001 = 1

Bit 2 of 13 is 1 ✓
```

### Set Bit at Position i (Make it 1)

```java
int setBit(int n, int i) {
    return n | (1 << i);
}
```

**How it works:**
1. Create mask with only bit i set: `1 << i`
2. OR with n: sets bit i, leaves others unchanged

```
n = 9 (1001), i = 1

Step 1: 1 << 1 = 0010
Step 2: 1001 | 0010 = 1011 = 11
```

### Clear Bit at Position i (Make it 0)

```java
int clearBit(int n, int i) {
    return n & ~(1 << i);
}
```

**How it works:**
1. Create mask with only bit i set: `1 << i`
2. Flip it: `~(1 << i)` has all bits set EXCEPT i
3. AND with n: clears bit i, preserves others

```
n = 11 (1011), i = 1

Step 1: 1 << 1 = 0010
Step 2: ~0010 = 1101
Step 3: 1011 & 1101 = 1001 = 9
```

### Toggle Bit at Position i (Flip it)

```java
int toggleBit(int n, int i) {
    return n ^ (1 << i);
}
```

**How it works:**
XOR with 1 flips a bit. XOR with 0 keeps it same.

```
n = 9 (1001), i = 1

Step 1: 1 << 1 = 0010
Step 2: 1001 ^ 0010 = 1011 = 11

Toggle again: 1011 ^ 0010 = 1001 = 9 (back to original)
```

### Check if Number is Even or Odd

```java
boolean isOdd(int n) {
    return (n & 1) == 1;
}
```

**Why it works:** The LSB (bit 0) determines odd/even.
- Even numbers end in 0: 2=10, 4=100, 6=110
- Odd numbers end in 1: 1=1, 3=11, 5=101

### Multiply by 2^k

```java
int multiplyByPowerOf2(int n, int k) {
    return n << k;
}
```

### Divide by 2^k

```java
int divideByPowerOf2(int n, int k) {
    return n >> k;
}
```

---

## Summary Table: All Building Blocks

| Operation | Code | Example |
|-----------|------|---------|
| Get bit i | `(n >> i) & 1` | `(5 >> 1) & 1 = 0` |
| Set bit i | `n \| (1 << i)` | `5 \| (1 << 1) = 7` |
| Clear bit i | `n & ~(1 << i)` | `7 & ~(1 << 1) = 5` |
| Toggle bit i | `n ^ (1 << i)` | `5 ^ (1 << 1) = 7` |
| Check even | `(n & 1) == 0` | `4 & 1 = 0` (even) |
| Check odd | `(n & 1) == 1` | `5 & 1 = 1` (odd) |
| Multiply by 2^k | `n << k` | `3 << 2 = 12` |
| Divide by 2^k | `n >> k` | `12 >> 2 = 3` |
| Clear all bits | `n & 0` | Any & 0 = 0 |
| Keep lowest k bits | `n & ((1 << k) - 1)` | `15 & 7 = 7` |

---

## Why Learn Bit Manipulation?

### 1. Speed

Bitwise operations are among the fastest operations a CPU can perform. They happen in a single clock cycle.

| Operation | Relative Speed |
|-----------|----------------|
| Bitwise AND/OR/XOR | 1x (fastest) |
| Addition/Subtraction | 1x |
| Multiplication | 3-4x slower |
| Division | 10-20x slower |

### 2. Space Efficiency

A single 32-bit integer can store 32 boolean flags. Instead of:
```java
boolean[] visited = new boolean[32];  // 32+ bytes
```

Use:
```java
int visited = 0;  // 4 bytes, same info!
// Set element i as visited: visited |= (1 << i)
// Check if visited: (visited >> i) & 1
```

### 3. Elegant Solutions

Some problems have beautiful bit manipulation solutions:

- **Swap two numbers without temp:** `a ^= b; b ^= a; a ^= b;`
- **Check power of 2:** `n > 0 && (n & (n-1)) == 0`
- **Find unique element:** XOR all elements

### 4. Interview Favorite

FAANG companies love bit manipulation because:
- It tests low-level understanding
- Solutions are elegant and optimal
- It shows you can think beyond standard libraries

---

## Language-Specific Notes

### Java

```java
// Java has both >> (arithmetic) and >>> (logical/unsigned)
int x = -8;
x >> 1;   // -4 (sign-extended)
x >>> 1;  // Large positive (zero-filled)

// int is 32-bit, long is 64-bit
// For 64-bit, use 1L << i instead of 1 << i
long mask = 1L << 40;  // Correct
long wrong = 1 << 40;   // WRONG! 1 is int, wraps around
```

### JavaScript

```javascript
// JavaScript bitwise operators work on 32-bit integers!
// Numbers are 64-bit floats, but bit ops convert to 32-bit

// Use >>> 0 to convert to unsigned 32-bit
let n = -1;
n >>> 0;  // 4294967295 (all 32 bits set, as unsigned)

// For numbers > 32 bits, use BigInt
let big = 1n << 40n;  // BigInt syntax with 'n' suffix
```

### Python

```python
# Python integers have unlimited size
# No overflow issues!
1 << 1000  # Works fine

# Negative numbers work differently
# Python doesn't use fixed-width two's complement
~5  # -6 (mathematical definition: ~n = -n-1)

# To get unsigned behavior, mask with desired width
n & 0xFFFFFFFF  # Keep only 32 bits
```

---

# PART 2: PATTERNS AND PROBLEMS

Now that you understand the fundamentals, let's learn the patterns that solve interview problems.

---

# What is Bit Manipulation?

Bit manipulation involves directly manipulating individual bits of numbers using bitwise operators. It's a fundamental technique that enables:

1. **O(1) operations** that would otherwise require O(n) or O(log n)
2. **Space-efficient** representations (bitmasks as sets)
3. **Elegant solutions** to problems involving pairs, uniqueness, or binary properties

## Core Bitwise Operators (Quick Reference)

| Operator | Symbol | Description | Example |
|----------|--------|-------------|---------|
| AND | `&` | 1 if both bits are 1 | `5 & 3 = 1` (101 & 011 = 001) |
| OR | `\|` | 1 if either bit is 1 | `5 \| 3 = 7` (101 \| 011 = 111) |
| XOR | `^` | 1 if bits are different | `5 ^ 3 = 6` (101 ^ 011 = 110) |
| NOT | `~` | Flip all bits | `~5 = -6` (inverts all bits) |
| Left Shift | `<<` | Shift bits left (multiply by 2) | `5 << 1 = 10` |
| Right Shift | `>>` | Shift bits right (divide by 2) | `5 >> 1 = 2` |

---

# Problems to Cover (from image + common FAANG problems)

## Easy Problems
1. **Single Number** - Find the element that appears once (all others appear twice)
2. **Number of 1 Bits** - Count set bits (Hamming Weight)
3. **Counting Bits** - Count 1s for all numbers from 0 to n
4. **Reverse Bits** - Reverse bits of a 32-bit unsigned integer
5. **Missing Number** - Find the missing number in [0, n]

## Medium Problems
6. **Sum of Two Integers** - Add without using + or -
7. **Reverse Integer** - Reverse digits (watch for overflow)
8. **Single Number II** - Element appears once, others appear three times
9. **Single Number III** - Two elements appear once, others twice
10. **Power of Two** - Check if n is a power of 2
11. **Bitwise AND of Numbers Range** - AND all numbers in range [m, n]

## Hard Problems
12. **Maximum XOR of Two Numbers in Array** - Using Trie
13. **UTF-8 Validation** - Validate UTF-8 encoding

---

# The 6 Bit Manipulation Patterns

## Pattern 1: XOR for Uniqueness/Pairing

**Key insight:** `a ^ a = 0` and `a ^ 0 = a`

XOR has these properties:
- Self-inverse: `x ^ x = 0`
- Identity: `x ^ 0 = x`
- Commutative: `a ^ b = b ^ a`
- Associative: `(a ^ b) ^ c = a ^ (b ^ c)`

**When to use:**
- Find single unique element among pairs
- Find missing number
- Swap two numbers without temp variable

**Template:**
```
result = 0
for each num:
    result ^= num
return result
```

**Problems:** Single Number, Missing Number, Single Number III

## Pattern 2: Isolate the Rightmost Bit

**Key insight:** `x & (-x)` isolates the rightmost set bit

**Why it works:** `-x` in two's complement is `~x + 1`, which flips all bits and adds 1. This makes the rightmost 1-bit and all zeros to its right remain, while everything to the left becomes opposite.

```
x     = 1010 1100
-x    = 0101 0100
x & -x= 0000 0100  (rightmost 1 bit isolated)
```

**When to use:**
- Separate two unique numbers (Single Number III)
- Process bits one at a time

## Pattern 3: Clear the Rightmost Set Bit

**Key insight:** `x & (x - 1)` clears the rightmost set bit

**Why it works:** `x - 1` flips all bits from the rightmost 1-bit to the end.

```
x     = 1010 1100
x - 1 = 1010 1011
x & (x-1) = 1010 1000
```

**When to use:**
- Count number of set bits (Brian Kernighan's algorithm)
- Check if power of 2 (only one bit set)

**Template for counting bits:**
```
count = 0
while x != 0:
    x = x & (x - 1)
    count++
return count
```

**Problems:** Number of 1 Bits, Power of Two, Counting Bits

## Pattern 4: Bit-by-Bit Construction

**Key insight:** Build result by processing each bit position

**When to use:**
- Reverse bits
- Add numbers without + operator
- Bit manipulation on individual positions

**Template:**
```
result = 0
for i in range(32):
    bit = (n >> i) & 1
    // process bit
    result |= (processed_bit << position)
return result
```

**Problems:** Reverse Bits, Sum of Two Integers

## Pattern 5: Common Prefix (Bitwise AND Range)

**Key insight:** AND of range [m, n] is the common prefix of m and n (in binary)

**Why it works:** Any bit position where m and n differ will eventually see both 0 and 1 in the range, making that bit 0 in the AND result.

**Template:**
```
shift = 0
while m != n:
    m >>= 1
    n >>= 1
    shift++
return m << shift
```

**Problems:** Bitwise AND of Numbers Range

## Pattern 6: Counting by Modular Arithmetic (for k occurrences)

**Key insight:** When all elements appear k times except one, count bits modulo k

For Single Number II (k=3):
- Count 1s at each bit position
- If count % 3 != 0, the unique number has a 1 at that position

**Template:**
```
result = 0
for i in range(32):
    count = 0
    for num in nums:
        count += (num >> i) & 1
    if count % k != 0:
        result |= (1 << i)
return result
```

**Problems:** Single Number II

---

# Input Constraint Analysis

## When Bit Manipulation is Feasible

| Input Size | Bit Operations | Notes |
|------------|----------------|-------|
| n <= 31 | O(1) per number | Fits in 32-bit int |
| n <= 63 | O(1) per number | Fits in 64-bit long |
| n <= 10^9 | O(32) = O(1) | Process each of 32 bits |
| Array of n numbers | O(n * 32) = O(n) | XOR all, count bits, etc. |

## Constraint Signals for Bit Problems

| Constraint | Likely Pattern |
|------------|----------------|
| "All appear twice except one" | XOR (Pattern 1) |
| "Count 1 bits" | Brian Kernighan or lookup table (Pattern 3) |
| "Power of 2" | `n & (n-1) == 0` (Pattern 3) |
| "Without + or -" | Bit-by-bit with carry (Pattern 4) |
| "Reverse bits" | Bit-by-bit construction (Pattern 4) |
| "All appear k times except one" | Count bits mod k (Pattern 6) |
| "AND of range" | Common prefix (Pattern 5) |

---

# Problem-by-Problem Guide

## 1. Single Number

**Problem:** Array where every element appears twice except one. Find it.

**Pattern:** XOR for Uniqueness (Pattern 1)

**Key Insight:** XOR all elements. Pairs cancel out (a ^ a = 0), leaving the unique element.

```
Input: [4, 1, 2, 1, 2]

XOR all: 4 ^ 1 ^ 2 ^ 1 ^ 2
       = 4 ^ (1 ^ 1) ^ (2 ^ 2)
       = 4 ^ 0 ^ 0
       = 4
```

**Dry-run trace:**

| Step | num | result | Calculation |
|------|-----|--------|-------------|
| init | - | 0 | Start with 0 |
| 1 | 4 | 4 | 0 ^ 4 = 4 |
| 2 | 1 | 5 | 4 ^ 1 = 5 |
| 3 | 2 | 7 | 5 ^ 2 = 7 |
| 4 | 1 | 6 | 7 ^ 1 = 6 |
| 5 | 2 | 4 | 6 ^ 2 = 4 |

**Code:**
```java
public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}
```

```javascript
function singleNumber(nums) {
    return nums.reduce((acc, num) => acc ^ num, 0);
}
```

**Complexity:** Time O(n), Space O(1)

**Follow-ups:**
| Follow-up | Approach |
|-----------|----------|
| "What if one appears once, rest appear 3 times?" | Count bits mod 3 (Pattern 6) |
| "What if two appear once?" | XOR all, then separate by rightmost bit (Pattern 2) |

---

## 2. Number of 1 Bits (Hamming Weight)

**Problem:** Count the number of 1 bits in an unsigned integer.

**Pattern:** Clear Rightmost Bit (Pattern 3)

**Key Insight:** `n & (n-1)` clears the rightmost 1 bit. Count how many times until n becomes 0.

**Visualization:**
```
n = 11 (binary: 1011)

Step 1: 1011 & 1010 = 1010 (count = 1)
Step 2: 1010 & 1001 = 1000 (count = 2)
Step 3: 1000 & 0111 = 0000 (count = 3)

Result: 3 ones
```

**Dry-run trace:**

| Step | n (binary) | n-1 (binary) | n & (n-1) | count |
|------|------------|--------------|-----------|-------|
| init | 1011 | - | - | 0 |
| 1 | 1011 | 1010 | 1010 | 1 |
| 2 | 1010 | 1001 | 1000 | 2 |
| 3 | 1000 | 0111 | 0000 | 3 |
| done | 0000 | - | - | 3 |

**Code:**
```java
// Brian Kernighan's Algorithm - O(number of 1 bits)
public int hammingWeight(int n) {
    int count = 0;
    while (n != 0) {
        n &= (n - 1);  // Clear rightmost 1 bit
        count++;
    }
    return count;
}
```

```javascript
function hammingWeight(n) {
    let count = 0;
    while (n !== 0) {
        n &= (n - 1);
        count++;
    }
    return count;
}
```

**Alternative (check each bit):**
```java
// O(32) - check all 32 bits
public int hammingWeight(int n) {
    int count = 0;
    for (int i = 0; i < 32; i++) {
        if ((n & (1 << i)) != 0) count++;
    }
    return count;
}
```

**Complexity:** 
- Brian Kernighan: O(k) where k = number of 1 bits
- Bit-by-bit: O(32) = O(1)

---

## 3. Counting Bits

**Problem:** For every number i in [0, n], count the number of 1 bits.

**Pattern:** DP with Bit Manipulation

**Key Insight:** `countBits[i] = countBits[i >> 1] + (i & 1)`

**Why it works:** 
- `i >> 1` is i with the last bit removed
- `i & 1` is the last bit (0 or 1)
- So the count for i = count for i/2 + last bit

**Visualization:**
```
i = 5 (binary: 101)
i >> 1 = 2 (binary: 10)
i & 1 = 1

countBits[5] = countBits[2] + 1
```

**Dry-run trace:**

| i | binary | i >> 1 | i & 1 | dp[i >> 1] | dp[i] |
|---|--------|--------|-------|------------|-------|
| 0 | 0 | - | - | - | 0 (base) |
| 1 | 1 | 0 | 1 | 0 | 1 |
| 2 | 10 | 1 | 0 | 1 | 1 |
| 3 | 11 | 1 | 1 | 1 | 2 |
| 4 | 100 | 2 | 0 | 1 | 1 |
| 5 | 101 | 2 | 1 | 1 | 2 |

**Code:**
```java
public int[] countBits(int n) {
    int[] dp = new int[n + 1];
    for (int i = 1; i <= n; i++) {
        dp[i] = dp[i >> 1] + (i & 1);
    }
    return dp;
}
```

```javascript
function countBits(n) {
    const dp = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        dp[i] = dp[i >> 1] + (i & 1);
    }
    return dp;
}
```

**Alternative DP relation:** `dp[i] = dp[i & (i-1)] + 1`

**Complexity:** Time O(n), Space O(n)

---

## 4. Reverse Bits

**Problem:** Reverse bits of a 32-bit unsigned integer.

**Pattern:** Bit-by-Bit Construction (Pattern 4)

**Key Insight:** Extract bit at position i, place it at position (31-i).

**Visualization:**
```
Input:  00000010100101000001111010011100
Output: 00111001011110000010100101000000

Position 0 -> Position 31
Position 1 -> Position 30
...
Position 31 -> Position 0
```

**Dry-run trace (first few bits):**

| i | bit at i | target pos | result (partial) |
|---|----------|------------|------------------|
| 0 | 0 | 31 | 0 |
| 1 | 0 | 30 | 0 |
| 2 | 1 | 29 | 0010 0000 ... |
| 3 | 1 | 28 | 0011 0000 ... |
| 4 | 1 | 27 | 0011 1000 ... |

**Code:**
```java
public int reverseBits(int n) {
    int result = 0;
    for (int i = 0; i < 32; i++) {
        int bit = (n >> i) & 1;           // Extract bit at position i
        result |= (bit << (31 - i));       // Place at reversed position
    }
    return result;
}
```

```javascript
function reverseBits(n) {
    let result = 0;
    for (let i = 0; i < 32; i++) {
        const bit = (n >>> i) & 1;         // Use >>> for unsigned shift
        result = (result << 1) | bit;       // Shift result and add bit
    }
    return result >>> 0;                    // Convert to unsigned
}
```

**Complexity:** Time O(32) = O(1), Space O(1)

---

## 5. Missing Number

**Problem:** Given array of n distinct numbers in [0, n], find the missing one.

**Pattern:** XOR for Uniqueness (Pattern 1)

**Key Insight:** XOR all numbers from 0 to n, then XOR all elements in array. Pairs cancel out, leaving the missing number.

**Alternative:** Sum formula: missing = n*(n+1)/2 - sum(array)

**Visualization:**
```
Input: [3, 0, 1]
n = 3

XOR indices:  0 ^ 1 ^ 2 ^ 3 = 0
XOR array:    3 ^ 0 ^ 1 = 2
Combined:     0 ^ 2 = 2

Missing number: 2
```

**Code:**
```java
public int missingNumber(int[] nums) {
    int xor = nums.length;  // Start with n
    for (int i = 0; i < nums.length; i++) {
        xor ^= i ^ nums[i];  // XOR index and element
    }
    return xor;
}
```

```javascript
function missingNumber(nums) {
    let xor = nums.length;
    for (let i = 0; i < nums.length; i++) {
        xor ^= i ^ nums[i];
    }
    return xor;
}
```

**Complexity:** Time O(n), Space O(1)

---

## 6. Sum of Two Integers

**Problem:** Calculate sum of two integers without using + or -.

**Pattern:** Bit-by-Bit with Carry (Pattern 4)

**Key Insight:**
- `a ^ b` = sum without carry
- `(a & b) << 1` = carry
- Repeat until carry is 0

**Why it works:**
```
5 + 3 = 8

Binary:
  5 = 101
  3 = 011

Step 1: sum = 101 ^ 011 = 110 (6), carry = (101 & 011) << 1 = 010 (2)
Step 2: sum = 110 ^ 010 = 100 (4), carry = (110 & 010) << 1 = 100 (4)
Step 3: sum = 100 ^ 100 = 000 (0), carry = (100 & 100) << 1 = 1000 (8)
Step 4: sum = 000 ^ 1000 = 1000 (8), carry = 0

Result: 8
```

**Dry-run trace:**

| Step | a | b | a ^ b | (a & b) << 1 | Note |
|------|---|---|-------|--------------|------|
| 1 | 5 (101) | 3 (011) | 6 (110) | 2 (010) | XOR = sum without carry |
| 2 | 6 (110) | 2 (010) | 4 (100) | 4 (100) | Continue |
| 3 | 4 (100) | 4 (100) | 0 (000) | 8 (1000) | Continue |
| 4 | 0 | 8 | 8 | 0 | Carry is 0, done! |

**Code:**
```java
public int getSum(int a, int b) {
    while (b != 0) {
        int carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;
}
```

```javascript
function getSum(a, b) {
    while (b !== 0) {
        const carry = (a & b) << 1;
        a = a ^ b;
        b = carry;
    }
    return a;
}
```

**Complexity:** Time O(32) = O(1), Space O(1)

**Note:** For negative numbers, JavaScript needs special handling with `>>> 0` for unsigned conversion.

---

## 7. Reverse Integer

**Problem:** Reverse digits of a 32-bit signed integer. Return 0 if overflow.

**Key Insight:** This is more math than bit manipulation, but overflow checking can use bit properties.

**Overflow check:** Before adding digit, check if result would exceed INT_MAX/10.

**Code:**
```java
public int reverse(int x) {
    int result = 0;
    while (x != 0) {
        int digit = x % 10;
        x /= 10;
        
        // Check for overflow before multiplying
        if (result > Integer.MAX_VALUE / 10 || 
            (result == Integer.MAX_VALUE / 10 && digit > 7)) {
            return 0;
        }
        if (result < Integer.MIN_VALUE / 10 || 
            (result == Integer.MIN_VALUE / 10 && digit < -8)) {
            return 0;
        }
        
        result = result * 10 + digit;
    }
    return result;
}
```

```javascript
function reverse(x) {
    const INT_MAX = 2147483647;
    const INT_MIN = -2147483648;
    
    let result = 0;
    while (x !== 0) {
        const digit = x % 10;
        x = Math.trunc(x / 10);
        
        if (result > Math.floor(INT_MAX / 10) || 
            (result === Math.floor(INT_MAX / 10) && digit > 7)) {
            return 0;
        }
        if (result < Math.ceil(INT_MIN / 10) || 
            (result === Math.ceil(INT_MIN / 10) && digit < -8)) {
            return 0;
        }
        
        result = result * 10 + digit;
    }
    return result;
}
```

**Complexity:** Time O(log x), Space O(1)

---

# Common Bit Tricks Reference

| Operation | Code | Example |
|-----------|------|---------|
| Check if bit i is set | `(n >> i) & 1` | `(5 >> 1) & 1 = 0` |
| Set bit i | `n \| (1 << i)` | `5 \| (1 << 1) = 7` |
| Clear bit i | `n & ~(1 << i)` | `7 & ~(1 << 1) = 5` |
| Toggle bit i | `n ^ (1 << i)` | `5 ^ (1 << 1) = 7` |
| Check if power of 2 | `n > 0 && (n & (n-1)) == 0` | `8 & 7 = 0, true` |
| Count 1 bits | Loop: `n &= (n-1)` | See Number of 1 Bits |
| Isolate rightmost 1 | `n & (-n)` | `12 & (-12) = 4` |
| Clear rightmost 1 | `n & (n - 1)` | `12 & 11 = 8` |
| Get lowest k bits | `n & ((1 << k) - 1)` | `15 & 7 = 7` |
| Check if all bits set | `(n + 1) & n == 0` | `7 + 1 = 8, 8 & 7 = 0` |
| Swap a and b | `a ^= b; b ^= a; a ^= b` | - |
| Multiply by 2^k | `n << k` | `5 << 2 = 20` |
| Divide by 2^k | `n >> k` | `20 >> 2 = 5` |

---

# Edge Cases Checklist

## Universal Bit Manipulation Edge Cases

- [ ] **Zero:** `n = 0`
- [ ] **All 1s:** `n = -1` (in two's complement, all bits are 1)
- [ ] **Power of 2:** `n = 1, 2, 4, 8, ...`
- [ ] **One less than power of 2:** `n = 0, 1, 3, 7, 15, ...` (all low bits set)
- [ ] **Maximum int:** `n = 2^31 - 1` (Integer.MAX_VALUE)
- [ ] **Minimum int:** `n = -2^31` (Integer.MIN_VALUE)
- [ ] **Single bit set:** `n = 1, 2, 4, ...`
- [ ] **Alternating bits:** `n = 0b10101010...`

## Problem-Specific Edge Cases

**Single Number:**
- [ ] Single element array: `[42]`
- [ ] Negative numbers: `[-1, -1, -2]`

**Number of 1 Bits:**
- [ ] Zero: `n = 0` (return 0)
- [ ] All 1s: `n = -1` or `n = 0xFFFFFFFF` (return 32)

**Reverse Bits:**
- [ ] Zero: `n = 0` (return 0)
- [ ] All 1s: return unchanged

**Missing Number:**
- [ ] Missing 0: `[1, 2, 3]`
- [ ] Missing n: `[0, 1, 2]` (missing 3)
- [ ] Single element: `[0]` (missing 1) or `[1]` (missing 0)

**Sum of Two Integers:**
- [ ] Both zero: `a = 0, b = 0`
- [ ] One negative: `a = -5, b = 3`
- [ ] Both negative: `a = -5, b = -3`

**Reverse Integer:**
- [ ] Zero: `x = 0`
- [ ] Overflow after reverse: `x = 1534236469`
- [ ] Negative: `x = -123`
- [ ] Trailing zeros: `x = 120` (becomes 21)

---

# Complexity Reference

| Problem | Time | Space | Pattern |
|---------|------|-------|---------|
| Single Number | O(n) | O(1) | XOR |
| Number of 1 Bits | O(k) or O(32) | O(1) | Clear rightmost |
| Counting Bits | O(n) | O(n) | DP + bit |
| Reverse Bits | O(32) | O(1) | Bit-by-bit |
| Missing Number | O(n) | O(1) | XOR |
| Sum of Two Integers | O(32) | O(1) | Carry propagation |
| Reverse Integer | O(log n) | O(1) | Math |

---

# Interview Communication

## The UMPIRE Method for Bit Manipulation

### Understand
> "Let me make sure I understand. We have [numbers] and need to [operation]. Are we dealing with 32-bit or 64-bit integers? Are negatives possible?"

### Match
> "This looks like a bit manipulation problem. I recognize the pattern: [XOR for uniqueness / counting bits / bit-by-bit construction]."

### Plan
> "I'll use [pattern]. The key insight is [one sentence explaining the trick]."

**For Single Number:**
> "XOR has the property that a ^ a = 0 and a ^ 0 = a. So if I XOR all elements, pairs cancel out and I'm left with the unique element."

**For Number of 1 Bits:**
> "I'll use Brian Kernighan's algorithm. The trick is n & (n-1) clears the rightmost 1 bit. I count how many times I can do this before n becomes 0."

**For Sum without +:**
> "I'll simulate binary addition. XOR gives sum without carry, AND shifted left gives the carry. I repeat until there's no carry."

### Implement
Write clean code with comments.

### Review
Trace through an example:
> "Let me trace [5, 3, 5]. Initial result = 0. XOR with 5 gives 5. XOR with 3 gives 6. XOR with 5 gives 3. Result is 3."

### Evaluate
> "Time: O(n) because I visit each element once. Space: O(1) because I only use a single variable."

---

# Pattern Recognition Flowchart

```
Is it a bit manipulation problem?
├── "Find element that appears once/different times"
│   └── Use XOR (Pattern 1) or count bits mod k (Pattern 6)
├── "Count 1 bits" or "Power of 2"
│   └── Use n & (n-1) (Pattern 3)
├── "Reverse/manipulate individual bits"
│   └── Process bit by bit (Pattern 4)
├── "Add/subtract without operators"
│   └── Use XOR for sum, AND for carry (Pattern 4)
├── "AND/OR/XOR of range"
│   └── Find common prefix (Pattern 5)
└── "Use set of elements efficiently"
    └── Bitmask (related: Bitmask DP)
```

---

# Checkpoint Questions

## After XOR Properties

> **Quick Check:** What is the result of XOR-ing all numbers from 1 to 4?
>
> <details>
> <summary>Think first, then click</summary>
>
> 1 ^ 2 ^ 3 ^ 4 = 4
>
> Why? 
> - 1 ^ 2 = 3 (01 ^ 10 = 11)
> - 3 ^ 3 = 0 (11 ^ 11 = 00)
> - 0 ^ 4 = 4 (00 ^ 100 = 100)
> </details>

## After n & (n-1)

> **Quick Check:** How can you check if a number is a power of 2 using bit manipulation?
>
> <details>
> <summary>Think first, then click</summary>
>
> `n > 0 && (n & (n - 1)) == 0`
>
> Why? A power of 2 has exactly one 1 bit. `n & (n-1)` clears the rightmost 1 bit. If the result is 0, there was only one 1 bit.
>
> Example: 8 = 1000, 7 = 0111, 8 & 7 = 0000. It's a power of 2!
> </details>

## After Isolate Rightmost Bit

> **Quick Check:** What does `12 & (-12)` give you?
>
> <details>
> <summary>Think first, then click</summary>
>
> 4
>
> Why?
> - 12 in binary: 1100
> - -12 in two's complement: 0100 (flip bits: 0011, add 1: 0100)
> - 1100 & 0100 = 0100 = 4
>
> This isolates the rightmost 1 bit (the "4" position in 12).
> </details>

---

# Follow-up Questions

| Original Problem | Common Follow-up | How to Handle |
|-----------------|------------------|---------------|
| Single Number | "What if one appears once, rest appear 3 times?" | Count bits mod 3 |
| Single Number | "What if two numbers appear once?" | XOR all, use rightmost bit to separate into groups |
| Number of 1 Bits | "How to do it in O(1)?" | Lookup table for bytes |
| Counting Bits | "Can you do it without the formula?" | Use n & (n-1) for each number |
| Sum of Two Integers | "How to handle negatives?" | Same algorithm works (two's complement) |
| Missing Number | "What if two numbers are missing?" | Use two equations or XOR + rightmost bit |

---

# Pattern Comparison

| Problem Type | Bit Manipulation | Alternative | When to Use Bits |
|--------------|------------------|-------------|------------------|
| Find unique element | XOR: O(n), O(1) | Hash map: O(n), O(n) | When pairs cancel out |
| Count set bits | Brian Kernighan: O(k) | String conversion: O(n) | Always prefer bits |
| Check power of 2 | n & (n-1): O(1) | Division loop: O(log n) | Always prefer bits |
| Sum without + | Bit carry: O(32) | Not possible otherwise | Only option |
| Missing number | XOR: O(n), O(1) | Sum formula: O(n), O(1) | Either works, XOR avoids overflow |

---

# Visualizer Suggestions

Consider creating visualizers for:

1. **XOR Visualizer** - Show bits being XOR'd with cancellation animation
2. **BitCountVisualizer** - Show n & (n-1) clearing rightmost bit step by step
3. **ReverseBitsVisualizer** - Animate bits moving to reversed positions
4. **AddWithCarryVisualizer** - Show XOR (sum) and AND (carry) in binary addition

---

# JSON Structure for patterns.json

```json
{
  "id": "bit-manipulation",
  "category": "Bit Manipulation",
  "difficulty": "Intermediate",
  "description": "Bit manipulation uses bitwise operators to solve problems in O(1) space and often O(n) or O(1) time. Master XOR for uniqueness, n & (n-1) for counting bits, and bit-by-bit construction for building results.",
  "whenToUse": [
    "Find unique element(s) among duplicates - use XOR",
    "Count set bits or check power of 2 - use n & (n-1)",
    "Add/subtract without arithmetic operators - use XOR and AND",
    "Reverse or manipulate individual bits",
    "Need O(1) space solution for array problems",
    "Optimize set operations with bitmasks"
  ],
  "codeTemplates": { ... },
  "keyInsights": [
    "XOR: a ^ a = 0, a ^ 0 = a - perfect for finding unique elements",
    "n & (n-1) clears the rightmost 1 bit - use for counting bits, checking power of 2",
    "n & (-n) isolates the rightmost 1 bit - use for separating groups",
    "Left shift << multiplies by 2, right shift >> divides by 2",
    "Two's complement: -n = ~n + 1 (flip all bits and add 1)",
    "For k occurrences except one: count bits mod k at each position"
  ],
  "commonMistakes": [
    "Forgetting JavaScript uses 32-bit for bitwise ops (use >>> 0 for unsigned)",
    "Not handling negative numbers (two's complement has different high bits)",
    "Off-by-one in bit positions (bit 0 is rightmost, bit 31 is leftmost for 32-bit)",
    "Overflow when left-shifting (1 << 32 wraps around)",
    "Using == instead of === in JavaScript for bit comparison"
  ],
  "variations": [
    {
      "id": "bit-var-1",
      "name": "XOR for Uniqueness",
      "desc": "Find element(s) that appear different number of times",
      "when": "Single Number, Missing Number, Single Number III",
      "template": { ... },
      "problems": ["Single Number", "Missing Number", "Single Number III"]
    },
    {
      "id": "bit-var-2",
      "name": "Bit Counting (Brian Kernighan)",
      "desc": "Count set bits, check power of 2",
      "when": "Number of 1 Bits, Power of Two, Counting Bits",
      "template": { ... },
      "problems": ["Number of 1 Bits", "Power of Two", "Counting Bits"]
    },
    {
      "id": "bit-var-3",
      "name": "Bit-by-Bit Construction",
      "desc": "Build result by processing each bit position",
      "when": "Reverse Bits, Sum of Two Integers",
      "template": { ... },
      "problems": ["Reverse Bits", "Sum of Two Integers"]
    },
    {
      "id": "bit-var-4",
      "name": "Count Bits Mod K",
      "desc": "When elements appear k times except one",
      "when": "Single Number II, elements appear 3/4/k times",
      "template": { ... },
      "problems": ["Single Number II"]
    }
  ],
  "commonProblems": [
    "Single Number",
    "Number of 1 Bits",
    "Counting Bits",
    "Reverse Bits",
    "Missing Number",
    "Sum of Two Integers",
    "Power of Two"
  ],
  "timeComplexity": "O(n) for array problems, O(32) = O(1) for single number operations",
  "spaceComplexity": "O(1) for most problems, O(n) for Counting Bits",
  "tutorial": [
    // See tutorial sections below
  ]
}
```

---

# Review Checklist

## Content Completeness
- [ ] Introduction with real-world analogy and clear definition
- [ ] All 6 bit operations explained with examples
- [ ] Input constraint mapping table
- [ ] All 7 target problems covered (Single Number, Number of 1 Bits, Counting Bits, Reverse Bits, Missing Number, Sum of Two Integers, Reverse Integer)
- [ ] Checkpoint questions after key concepts
- [ ] Follow-up questions for each problem
- [ ] Edge case checklist
- [ ] Interview communication scripts

## Visualizations
- [ ] ASCII visualizations for XOR, AND, bit clearing
- [ ] Dry-run trace tables for each problem
- [ ] Consider visualizer components

## Teaching Quality
- [ ] Problems ordered by difficulty (Easy -> Medium -> Hard)
- [ ] Complexity derivations with intuition
- [ ] Pattern recognition flowchart
- [ ] Common mistakes section

## Code Quality
- [ ] Both Java and JavaScript for every problem
- [ ] JavaScript-specific notes (>>> for unsigned)
- [ ] Edge cases handled in code
- [ ] Consistent naming

---

# Implementation Priority

## Phase 1: Critical
1. Define core bit operations with clear examples
2. Cover all 7 target problems
3. Add XOR and bit counting patterns

## Phase 2: High Value
4. Add checkpoint questions
5. Add follow-up questions
6. Complete edge case checklist
7. Add interview communication scripts

## Phase 3: Polish
8. Add complexity derivations
9. Create ASCII visualizations
10. Add dry-run trace tables
11. Add pattern comparison section

---

# Final Deliverable

After implementing all improvements:

1. All 7 problems covered with code in Java and JavaScript
2. 4+ checkpoint questions
3. Follow-up questions for major problems
4. Complete edge case checklist
5. Interview scripts for bit manipulation
6. Constraint mapping table
7. Dry-run trace tables for all problems
8. Pattern recognition flowchart

The Bit Manipulation pattern should become the best bit manipulation learning resource online, matching the quality of the DP pattern.
