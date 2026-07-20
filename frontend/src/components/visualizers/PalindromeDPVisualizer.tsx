"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "tree" | "memo" | "table" | "expand";

const str = "babad";
const n = str.length;

// For recursion tree, use "cbbd" to show both match and mismatch branches
const treeStr = "cbbd";
const treeN = treeStr.length;

const PALINDROME_LPS_ANSWER = (() => {
  const solve = (i: number, j: number): number => {
    if (i > j) return 0;
    if (i === j) return 1;
    if (treeStr[i] === treeStr[j]) return 2 + solve(i + 1, j - 1);
    return Math.max(solve(i + 1, j), solve(i, j - 1));
  };
  return solve(0, treeN - 1);
})();

interface RecursionStep {
  i: number;
  j: number;
  action: string;
  result: number | null;
  phase: "enter" | "return";
  substring: string;
}

interface MemoStep {
  i: number;
  j: number;
  value: number;
  action: string;
  fromCache: boolean;
}

interface TableStep {
  i: number;
  j: number;
  isPalin: boolean;
  len: number;
  explanation: string;
  outerMatch: boolean;
  innerResult: boolean | null;
  longestStart: number;
  longestEnd: number;
}

interface ExpandStep {
  center: number;
  centerType: "single" | "double";
  left: number;
  right: number;
  leftChar: string;
  rightChar: string;
  isMatch: boolean;
  currentPalin: string;
  longestSoFar: string;
  action: "start" | "expand" | "stop";
}

// Longest Palindromic SUBSEQUENCE (has branching when mismatch)
const generateRecursionSteps = (): RecursionStep[] => {
  const steps: RecursionStep[] = [];

  const solve = (i: number, j: number): number => {
    const substring = treeStr.substring(i, j + 1);

    if (i > j) {
      steps.push({
        i,
        j,
        action: `LPS(${i},${j}): Empty, return 0`,
        result: 0,
        phase: "return",
        substring: "",
      });
      return 0;
    }

    if (i === j) {
      steps.push({
        i,
        j,
        action: `LPS(${i},${j}): Single char "${treeStr[i]}", return 1`,
        result: 1,
        phase: "return",
        substring: treeStr[i],
      });
      return 1;
    }

    const leftChar = treeStr[i];
    const rightChar = treeStr[j];
    const match = leftChar === rightChar;

    steps.push({
      i,
      j,
      action: `LPS(${i},${j}): "${substring}" - Check '${leftChar}' == '${rightChar}'? ${match ? "Yes!" : "No, try both sides"}`,
      result: null,
      phase: "enter",
      substring,
    });

    let result: number;
    if (match) {
      const inner = solve(i + 1, j - 1);
      result = 2 + inner;
      steps.push({
        i,
        j,
        action: `LPS(${i},${j}): Match! 2 + inner(${inner}) = ${result}`,
        result,
        phase: "return",
        substring,
      });
    } else {
      const left = solve(i + 1, j);
      const right = solve(i, j - 1);
      result = Math.max(left, right);
      steps.push({
        i,
        j,
        action: `LPS(${i},${j}): No match. max(skip left=${left}, skip right=${right}) = ${result}`,
        result,
        phase: "return",
        substring,
      });
    }

    return result;
  };

  solve(0, treeN - 1);
  return steps;
};

const generateMemoSteps = (): { steps: MemoStep[] } => {
  const memo: (number | null)[][] = Array.from({ length: treeN }, () =>
    Array(treeN).fill(null)
  );
  const steps: MemoStep[] = [];

  const solve = (i: number, j: number): number => {
    if (i > j) return 0;
    if (i === j) return 1;

    if (memo[i][j] !== null) {
      steps.push({
        i,
        j,
        value: memo[i][j] as number,
        action: `Cache hit! memo[${i}][${j}] = ${memo[i][j]}`,
        fromCache: true,
      });
      return memo[i][j] as number;
    }

    const leftChar = treeStr[i];
    const rightChar = treeStr[j];

    let result: number;
    if (leftChar === rightChar) {
      const inner = solve(i + 1, j - 1);
      result = 2 + inner;
      steps.push({
        i,
        j,
        value: result,
        action: `'${leftChar}'=='${rightChar}': 2 + inner(${inner}) = ${result}. Store memo[${i}][${j}]`,
        fromCache: false,
      });
    } else {
      const left = solve(i + 1, j);
      const right = solve(i, j - 1);
      result = Math.max(left, right);
      steps.push({
        i,
        j,
        value: result,
        action: `'${leftChar}'!='${rightChar}': max(${left}, ${right}) = ${result}. Store memo[${i}][${j}]`,
        fromCache: false,
      });
    }

    memo[i][j] = result;
    return result;
  };

  solve(0, treeN - 1);
  return { steps };
};

const generateTableSteps = (): { steps: TableStep[]; longest: string } => {
  // skipcq: JS-R1005
  const steps: TableStep[] = [];
  const dp: boolean[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(false));
  let longestStart = 0;
  let longestEnd = 0;

  for (let i = 0; i < n; i++) {
    dp[i][i] = true;
    steps.push({
      i,
      j: i,
      isPalin: true,
      len: 1,
      explanation: `Single char "${str[i]}" is always palindrome`,
      outerMatch: true,
      innerResult: null,
      longestStart,
      longestEnd,
    });
  }

  for (let i = 0; i < n - 1; i++) {
    const match = str[i] === str[i + 1];
    dp[i][i + 1] = match;
    if (match && 2 > longestEnd - longestStart + 1) {
      // skipcq: JS-0104
      longestStart = i;
      longestEnd = i + 1;
    }
    steps.push({
      i,
      j: i + 1,
      isPalin: match,
      len: 2,
      explanation: match
        ? `"${str[i]}${str[i + 1]}": '${str[i]}' == '${str[i + 1]}', palindrome!`
        : `"${str[i]}${str[i + 1]}": '${str[i]}' != '${str[i + 1]}', not palindrome`,
      outerMatch: match,
      innerResult: null,
      longestStart,
      longestEnd,
    });
  }

  for (let len = 3; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      const outerMatch = str[i] === str[j];
      const innerPalin = dp[i + 1][j - 1];
      const isPalin = outerMatch && innerPalin;
      dp[i][j] = isPalin;

      if (isPalin && len > longestEnd - longestStart + 1) {
        longestStart = i;
        longestEnd = j;
      }

      let explanation: string;
      if (!outerMatch) {
        explanation = `"${str.substring(i, j + 1)}": '${str[i]}' != '${str[j]}', not palindrome`;
      } else if (!innerPalin) {
        explanation = `"${str.substring(i, j + 1)}": outer match but inner "${str.substring(i + 1, j)}" is NOT palindrome`;
      } else {
        explanation = `"${str.substring(i, j + 1)}": '${str[i]}' == '${str[j]}' AND inner is palindrome!`;
      }

      steps.push({
        i,
        j,
        isPalin,
        len,
        explanation,
        outerMatch,
        innerResult: innerPalin,
        longestStart,
        longestEnd,
      });
    }
  }

  return {
    steps,
    longest: str.substring(longestStart, longestEnd + 1),
  };
};

const generateExpandSteps = (): { steps: ExpandStep[]; longest: string } => {
  // skipcq: JS-R1005
  const steps: ExpandStep[] = [];
  let longestPalin = str[0];

  for (let center = 0; center < n; center++) {
    let left = center;
    let right = center;

    steps.push({
      center,
      centerType: "single",
      left,
      right,
      leftChar: str[left],
      rightChar: str[right],
      isMatch: true,
      currentPalin: str[center],
      longestSoFar: longestPalin,
      action: "start",
    });

    while (left > 0 && right < n - 1 && str[left - 1] === str[right + 1]) {
      left--;
      right++;
      const currentPalin = str.substring(left, right + 1);
      if (currentPalin.length > longestPalin.length) {
        longestPalin = currentPalin;
      }
      steps.push({
        center,
        centerType: "single",
        left,
        right,
        leftChar: str[left],
        rightChar: str[right],
        isMatch: true,
        currentPalin,
        longestSoFar: longestPalin,
        action: "expand",
      });
    }

    if (left > 0 && right < n - 1) {
      steps.push({
        center,
        centerType: "single",
        left: left - 1,
        right: right + 1,
        leftChar: str[left - 1],
        rightChar: str[right + 1],
        isMatch: false,
        currentPalin: str.substring(left, right + 1),
        longestSoFar: longestPalin,
        action: "stop",
      });
    }

    if (center < n - 1 && str[center] === str[center + 1]) {
      left = center;
      right = center + 1;
      const currentPalin = str.substring(left, right + 1);
      if (currentPalin.length > longestPalin.length) {
        longestPalin = currentPalin;
      }

      steps.push({
        center,
        centerType: "double",
        left,
        right,
        leftChar: str[left],
        rightChar: str[right],
        isMatch: true,
        currentPalin,
        longestSoFar: longestPalin,
        action: "start",
      });

      while (left > 0 && right < n - 1 && str[left - 1] === str[right + 1]) {
        left--;
        right++;
        const expandedPalin = str.substring(left, right + 1);
        if (expandedPalin.length > longestPalin.length) {
          longestPalin = expandedPalin;
        }
        steps.push({
          center,
          centerType: "double",
          left,
          right,
          leftChar: str[left],
          rightChar: str[right],
          isMatch: true,
          currentPalin: expandedPalin,
          longestSoFar: longestPalin,
          action: "expand",
        });
      }

      if (left > 0 && right < n - 1) {
        steps.push({
          center,
          centerType: "double",
          left: left - 1,
          right: right + 1,
          leftChar: str[left - 1],
          rightChar: str[right + 1],
          isMatch: false,
          currentPalin: str.substring(left, right + 1),
          longestSoFar: longestPalin,
          action: "stop",
        });
      }
    }
  }

  return { steps, longest: longestPalin };
};

interface TreeNodeData {
  id: number;
  label: string;
  x: number;
  y: number;
  result: number | null;
  parentId: number | null;
  edgeLabel: string;
  i: number;
  j: number;
}

// Build tree for LPS on "cbbd"
// LPS(0,3) "cbbd": c != d, branch to LPS(1,3) and LPS(0,2)
//   LPS(1,3) "bbd": b != d, branch to LPS(2,3) and LPS(1,2)
//     LPS(2,3) "bd": b != d, branch...
//     LPS(1,2) "bb": b == b, go to LPS(2,1) base
//   LPS(0,2) "cbb": c != b, branch to LPS(1,2) [CACHE HIT] and LPS(0,1)
const buildRecursionTreeData = (): {
  nodes: TreeNodeData[];
  visitOrder: number[];
} => {
  const nodes: TreeNodeData[] = [];
  const visitOrder: number[] = [];

  // Root: LPS(0,3) "cbbd"
  nodes.push({
    id: 0,
    label: "(0,3)",
    x: 350,
    y: 30,
    result: null,
    parentId: null,
    edgeLabel: "",
    i: 0,
    j: 3,
  });

  // Level 1: c != d, two branches
  nodes.push({
    id: 1,
    label: "(1,3)",
    x: 175,
    y: 100,
    result: null,
    parentId: 0,
    edgeLabel: "skip c",
    i: 1,
    j: 3,
  });
  nodes.push({
    id: 2,
    label: "(0,2)",
    x: 525,
    y: 100,
    result: null,
    parentId: 0,
    edgeLabel: "skip d",
    i: 0,
    j: 2,
  });

  // Level 2 from (1,3) "bbd": b != d
  nodes.push({
    id: 3,
    label: "(2,3)",
    x: 90,
    y: 170,
    result: null,
    parentId: 1,
    edgeLabel: "skip b",
    i: 2,
    j: 3,
  });
  nodes.push({
    id: 4,
    label: "(1,2)",
    x: 260,
    y: 170,
    result: null,
    parentId: 1,
    edgeLabel: "skip d",
    i: 1,
    j: 2,
  });

  // Level 2 from (0,2) "cbb": c != b
  nodes.push({
    id: 5,
    label: "(1,2)",
    x: 440,
    y: 170,
    result: null,
    parentId: 2,
    edgeLabel: "skip c",
    i: 1,
    j: 2,
  });
  nodes.push({
    id: 6,
    label: "(0,1)",
    x: 610,
    y: 170,
    result: null,
    parentId: 2,
    edgeLabel: "skip b",
    i: 0,
    j: 1,
  });

  // Level 3: (2,3) "bd" b != d -> (3,3) and (2,2)
  nodes.push({
    id: 7,
    label: "(3,3)",
    x: 50,
    y: 240,
    result: null,
    parentId: 3,
    edgeLabel: "skip b",
    i: 3,
    j: 3,
  });
  nodes.push({
    id: 8,
    label: "(2,2)",
    x: 130,
    y: 240,
    result: null,
    parentId: 3,
    edgeLabel: "skip d",
    i: 2,
    j: 2,
  });

  // Visit order with results
  visitOrder.push(0); // enter (0,3)
  visitOrder.push(1); // enter (1,3)
  visitOrder.push(3); // enter (2,3)
  visitOrder.push(7); // enter (3,3) -> return 1
  nodes[7].result = 1;
  visitOrder.push(7);
  visitOrder.push(8); // enter (2,2) -> return 1
  nodes[8].result = 1;
  visitOrder.push(8);
  nodes[3].result = 1; // (2,3) = max(1,1) = 1
  visitOrder.push(3);
  visitOrder.push(4); // enter (1,2) "bb" match
  visitOrder.push(4); // LPS(2,1) empty base case inside (1,2)
  nodes[4].result = 2;
  visitOrder.push(4); // return (1,2) = 2
  nodes[1].result = 2; // (1,3) = max(1,2) = 2
  visitOrder.push(1);
  visitOrder.push(2); // enter (0,2)
  visitOrder.push(5); // enter (1,2) second time
  visitOrder.push(5); // LPS(2,1) empty base case inside second (1,2)
  nodes[5].result = 2;
  visitOrder.push(5); // return (1,2) = 2
  visitOrder.push(6); // (0,1) "cb" c != b
  nodes[6].result = 1;
  visitOrder.push(6);
  nodes[2].result = 2; // (0,2) = max(2,1) = 2
  visitOrder.push(2);
  nodes[0].result = 2; // (0,3) = max(2,2) = 2
  visitOrder.push(0);

  return { nodes, visitOrder };
};

const buildMemoTreeData = (): {
  nodes: TreeNodeData[];
  visitOrder: { nodeId: number; fromCache: boolean }[];
} => {
  const nodes: TreeNodeData[] = [];
  const visitOrder: { nodeId: number; fromCache: boolean }[] = [];

  // Same tree structure
  nodes.push({
    id: 0,
    label: "(0,3)",
    x: 280,
    y: 30,
    result: null,
    parentId: null,
    edgeLabel: "",
    i: 0,
    j: 3,
  });
  nodes.push({
    id: 1,
    label: "(1,3)",
    x: 140,
    y: 95,
    result: null,
    parentId: 0,
    edgeLabel: "skip c",
    i: 1,
    j: 3,
  });
  nodes.push({
    id: 2,
    label: "(0,2)",
    x: 420,
    y: 95,
    result: null,
    parentId: 0,
    edgeLabel: "skip d",
    i: 0,
    j: 2,
  });
  nodes.push({
    id: 3,
    label: "(2,3)",
    x: 70,
    y: 160,
    result: null,
    parentId: 1,
    edgeLabel: "skip b",
    i: 2,
    j: 3,
  });
  nodes.push({
    id: 4,
    label: "(1,2)",
    x: 210,
    y: 160,
    result: null,
    parentId: 1,
    edgeLabel: "skip d",
    i: 1,
    j: 2,
  });
  nodes.push({
    id: 5,
    label: "(1,2)",
    x: 350,
    y: 160,
    result: null,
    parentId: 2,
    edgeLabel: "skip c",
    i: 1,
    j: 2,
  });
  nodes.push({
    id: 6,
    label: "(0,1)",
    x: 490,
    y: 160,
    result: null,
    parentId: 2,
    edgeLabel: "skip b",
    i: 0,
    j: 1,
  });

  visitOrder.push({ nodeId: 0, fromCache: false });
  visitOrder.push({ nodeId: 1, fromCache: false });
  visitOrder.push({ nodeId: 3, fromCache: false });
  nodes[3].result = 1;
  visitOrder.push({ nodeId: 3, fromCache: false });
  visitOrder.push({ nodeId: 4, fromCache: false });
  nodes[4].result = 2;
  visitOrder.push({ nodeId: 4, fromCache: false });
  nodes[1].result = 2;
  visitOrder.push({ nodeId: 1, fromCache: false });
  visitOrder.push({ nodeId: 2, fromCache: false });
  visitOrder.push({ nodeId: 5, fromCache: true }); // CACHE HIT!
  nodes[5].result = 2;
  visitOrder.push({ nodeId: 6, fromCache: false });
  nodes[6].result = 1;
  visitOrder.push({ nodeId: 6, fromCache: false });
  nodes[2].result = 2;
  visitOrder.push({ nodeId: 2, fromCache: false });
  nodes[0].result = 2;
  visitOrder.push({ nodeId: 0, fromCache: false });

  return { nodes, visitOrder };
};

const TreePhase = ({
  // skipcq: JS-R1005
  step,
  recursionSteps,
}: {
  step: number;
  recursionSteps: RecursionStep[];
}) => {
  const { nodes, visitOrder } = useMemo(() => buildRecursionTreeData(), []);
  const currentStep =
    step > 0 && step <= recursionSteps.length ? recursionSteps[step - 1] : null;

  const visitedSet = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < Math.min(step, visitOrder.length); i++) {
      set.add(visitOrder[i]);
    }
    return set;
  }, [step, visitOrder]);

  const currentNodeId =
    step > 0 && step <= visitOrder.length ? visitOrder[step - 1] : null;

  return (
    // skipcq: JS-0415
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        Longest Palindromic Subsequence on &quot;{treeStr}&quot;
      </div>

      <div className="bg-gray-800/30 rounded-lg p-4 mb-2">
        <div className="text-xs text-gray-500 mb-2">Recurrence (LPS):</div>
        <div className="font-mono text-xs text-blue-300">
          <div>if s[i] == s[j]: LPS(i,j) = 2 + LPS(i+1, j-1)</div>
          <div>else: LPS(i,j) = max(LPS(i+1,j), LPS(i,j-1))</div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          When chars don&apos;t match, try both: skip left OR skip right
        </div>
      </div>

      <div className="flex gap-1 justify-center mb-2">
        {treeStr.split("").map((c, idx) => {
          // skipcq: JS-R1005
          const isHighlighted =
            currentStep && idx >= currentStep.i && idx <= currentStep.j;
          const isOuter =
            currentStep && (idx === currentStep.i || idx === currentStep.j);
          return (
            <div
              // skipcq: JS-0437
              key={`tree-char-${idx}`}
              className="flex flex-col items-center"
            >
              <div className="text-xs text-gray-500">{idx}</div>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded font-mono font-bold text-lg ${
                  isOuter
                    ? "bg-blue-600 text-white"
                    : isHighlighted
                      ? "bg-blue-600/30 text-white"
                      : "bg-gray-800 text-gray-300"
                }`}
              >
                {c}
              </div>
            </div>
          );
        })}
      </div>

      <svg width="700" height="280" className="mx-auto">
        {nodes.map((node) => {
          if (node.parentId === null) return null;
          const parent = nodes.find((nd) => nd.id === node.parentId);
          if (!parent) return null;

          const isVisited = visitedSet.has(node.id);
          return (
            <g key={`edge-${node.id}`} opacity={isVisited ? 1 : 0.2}>
              <line
                x1={parent.x}
                y1={parent.y + 22}
                x2={node.x}
                y2={node.y - 22}
                stroke="#4b5563"
                strokeWidth="2"
              />
              <text
                x={(parent.x + node.x) / 2}
                y={(parent.y + node.y) / 2 - 5}
                fill="#9ca3af"
                fontSize="10"
                textAnchor="middle"
              >
                {node.edgeLabel}
              </text>
            </g>
          );
        })}

        {nodes.map((node) => {
          // skipcq: JS-R1005
          const isVisited = visitedSet.has(node.id);
          const isCurrent = node.id === currentNodeId;
          const hasResult = node.result !== null && isVisited;

          let fill = "#1f2937";
          let stroke = "#4b5563";
          if (isCurrent) {
            fill = "#2563eb";
            stroke = "#60a5fa";
          } else if (hasResult) {
            fill = "#166534";
            stroke = "#22c55e";
          } else if (isVisited) {
            fill = "#374151";
            stroke = "#6b7280";
          }

          return (
            <g key={`node-${node.id}`} opacity={isVisited ? 1 : 0.2}>
              <circle
                cx={node.x}
                cy={node.y}
                r="22"
                fill={fill}
                stroke={stroke}
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + 5}
                fill="white"
                fontSize="12"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="500"
              >
                {node.label}
              </text>
              {hasResult && (
                <text
                  x={node.x + 26}
                  y={node.y + 5}
                  fill="#86efac"
                  fontSize="11"
                  fontWeight="bold"
                >
                  ={node.result}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {currentStep && (
        <div className="text-sm text-center bg-gray-800/50 px-4 py-2 rounded-lg max-w-xl">
          <span className="text-gray-300">{currentStep.action}</span>
        </div>
      )}

      {step >= recursionSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: LPS length = {PALINDROME_LPS_ANSWER}
          </span>
          <span className="text-gray-400 ml-2">(e.g., &quot;bb&quot;)</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        When chars don&apos;t match, tree branches. Green = computed result.
      </div>
    </div>
  );
};

const MemoPhase = ({
  // skipcq: JS-0415, JS-R1005
  step,
  memoSteps,
}: {
  step: number;
  memoSteps: MemoStep[];
}) => {
  const currentStep =
    step > 0 && step <= memoSteps.length ? memoSteps[step - 1] : null;
  const visibleSteps = memoSteps.slice(0, step);

  const { nodes, visitOrder } = useMemo(() => buildMemoTreeData(), []);

  const visitedInfo = useMemo(() => {
    const info = new Map<
      number,
      { visited: boolean; fromCache: boolean; result: number | null }
    >();
    for (let i = 0; i < Math.min(step, visitOrder.length); i++) {
      const v = visitOrder[i]; // skipcq: JS-C1002
      const node = nodes.find((nd) => nd.id === v.nodeId);
      info.set(v.nodeId, {
        visited: true,
        fromCache: v.fromCache,
        result: node?.result ?? null,
      });
    }
    return info;
  }, [step, visitOrder, nodes]);

  const currentNodeId =
    step > 0 && step <= visitOrder.length ? visitOrder[step - 1].nodeId : null;

  const currentMemo = useMemo(() => {
    const memo: (number | null)[][] = Array.from({ length: treeN }, () =>
      Array(treeN).fill(null)
    );
    for (const st of visibleSteps) {
      if (!st.fromCache) {
        memo[st.i][st.j] = st.value;
      }
    }
    return memo;
  }, [visibleSteps]);

  const cacheHits = visibleSteps.filter((s) => s.fromCache).length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        LPS on &quot;{treeStr}&quot; | Yellow = cache hit (saved computation!)
      </div>

      <div className="flex gap-1 justify-center mb-2">
        {treeStr.split("").map((c, idx) => {
          const isHighlighted =
            currentStep && idx >= currentStep.i && idx <= currentStep.j;
          return (
            <div
              // skipcq: JS-0437
              key={`memo-char-${idx}`}
              className="flex flex-col items-center"
            >
              <div className="text-xs text-gray-500">{idx}</div>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded font-mono font-bold text-lg ${isHighlighted ? "bg-blue-600/50 text-white" : "bg-gray-800 text-gray-300"}`}
              >
                {c}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 items-start flex-wrap justify-center">
        <div>
          <div className="text-xs text-gray-500 text-center mb-2">
            Recursion Tree
          </div>
          <svg width="560" height="200" className="mx-auto">
            {nodes.map((node) => {
              // skipcq: JS-R1005
              if (node.parentId === null) return null;
              const parent = nodes.find((nd) => nd.id === node.parentId);
              if (!parent) return null;

              const info = visitedInfo.get(node.id);
              const isVisited = !!info?.visited; // skipcq: JS-0066
              const isCacheHit = info?.fromCache;

              return (
                <g key={`memo-edge-${node.id}`} opacity={isVisited ? 1 : 0.2}>
                  <line
                    x1={parent.x}
                    y1={parent.y + 18}
                    x2={node.x}
                    y2={node.y - 18}
                    stroke={isCacheHit ? "#ca8a04" : "#4b5563"}
                    strokeWidth="2"
                    strokeDasharray={isCacheHit ? "5,3" : "none"}
                  />
                </g>
              );
            })}

            {nodes.map((node) => {
              // skipcq: JS-R1005
              const info = visitedInfo.get(node.id);
              const isVisited = !!info?.visited; // skipcq: JS-0066
              const isCacheHit = info?.fromCache;
              const isCurrent = node.id === currentNodeId;

              let fill = "#1f2937";
              let stroke = "#4b5563";
              if (isCurrent) {
                fill = isCacheHit ? "#854d0e" : "#2563eb";
                stroke = isCacheHit ? "#ca8a04" : "#60a5fa";
              } else if (isCacheHit) {
                fill = "#854d0e";
                stroke = "#ca8a04";
              } else if (isVisited && node.result !== null) {
                fill = "#166534";
                stroke = "#22c55e";
              } else if (isVisited) {
                fill = "#374151";
                stroke = "#6b7280";
              }

              return (
                <g key={`memo-node-${node.id}`} opacity={isVisited ? 1 : 0.2}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill={fill}
                    stroke={stroke}
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="white"
                    fontSize="11"
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontWeight="500"
                  >
                    {node.label}
                  </text>
                  {isVisited && node.result !== null && (
                    <text
                      x={node.x + 24}
                      y={node.y + 4}
                      fill={isCacheHit ? "#fde047" : "#86efac"}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ={node.result}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div>
          <div className="text-xs text-gray-500 text-center mb-2">
            Memo Table
          </div>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-8 h-6 text-xs text-gray-500">i\j</th>
                {Array.from({ length: treeN }, (_, j) => (
                  <th
                    key={`memo-h-${j}`}
                    className="w-10 h-6 text-xs text-gray-500"
                  >
                    {j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentMemo.map((row, rowIndex) => (
                <tr
                  // skipcq: JS-0437
                  key={`memo-r-${rowIndex}`}
                >
                  <td className="w-8 h-10 text-xs text-gray-500 text-center">
                    {rowIndex}
                  </td>
                  {row.map((val, colIndex) => {
                    // skipcq: JS-R1005
                    const isValid = colIndex >= rowIndex;
                    const isCurrentCell =
                      currentStep &&
                      currentStep.i === rowIndex &&
                      currentStep.j === colIndex;
                    const isCacheHit = currentStep?.fromCache && isCurrentCell;

                    return (
                      <td
                        key={`memo-c-${rowIndex}-${colIndex}`} // skipcq: JS-0437
                        className={`w-10 h-10 border border-gray-700 text-center font-mono text-sm transition-all ${
                          !isValid
                            ? "bg-gray-900/30"
                            : isCurrentCell
                              ? isCacheHit
                                ? "bg-yellow-600/30 border-yellow-500"
                                : "bg-blue-600/30 border-blue-500"
                              : val !== null
                                ? "bg-green-600/20"
                                : "bg-gray-800/50"
                        }`}
                      >
                        {isValid ? (val !== null ? val : "-") : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {currentStep && (
        <div
          className={`text-sm text-center font-mono px-4 py-2 rounded-lg ${currentStep.fromCache ? "bg-yellow-600/20 text-yellow-400" : "bg-blue-600/20 text-blue-300"}`}
        >
          {currentStep.action}
        </div>
      )}

      <div className="flex gap-4 text-sm">
        <div className="text-gray-400">
          Computed: <span className="text-green-400">{step - cacheHits}</span>
        </div>
        <div className="text-gray-400">
          Cache hits: <span className="text-yellow-400">{cacheHits}</span>
        </div>
      </div>

      {step >= memoSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: LPS length = {PALINDROME_LPS_ANSWER}
          </span>
          <span className="text-gray-400 ml-2">(e.g., &quot;bb&quot;)</span>
        </div>
      )}
    </div>
  );
};

const Controls = ({
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onBack,
  onReset,
  speed,
  onSpeedChange,
  step,
  total,
}: {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onBack: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  step: number;
  total: number;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onBack}
        disabled={step === 0}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
        title="Back"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      {isPlaying ? (
        <button
          onClick={onPause}
          className="w-12 h-12 flex items-center justify-center bg-yellow-600 rounded-full hover:bg-yellow-500 transition-all shadow-lg"
          title="Pause"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={step >= total}
          className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full hover:bg-green-500 disabled:opacity-30 transition-all shadow-lg"
          title="Play"
        >
          <svg
            className="w-6 h-6 ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
      <button
        onClick={onStep}
        disabled={step >= total}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-30 transition-all"
        title="Step"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all ml-2"
        title="Reset"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Speed</span>
        <div className="flex gap-1">
          {[
            { value: 1000, label: "0.5x" },
            { value: 600, label: "1x" },
            { value: 300, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium ${speed === opt.value ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Step</span>
        <span className="text-sm font-mono text-white">
          {step} <span className="text-gray-500">/</span> {total}
        </span>
      </div>
    </div>
  </div>
);

const TablePhase = ({
  step,
  tableSteps,
}: {
  step: number;
  tableSteps: TableStep[];
}) => {
  // skipcq: JS-R1005
  const dpTable = useMemo(() => {
    const dp: (boolean | null)[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(null));
    for (let s = 0; s < Math.min(step, tableSteps.length); s++) {
      const { i, j, isPalin } = tableSteps[s];
      dp[i][j] = isPalin;
    }
    return dp;
  }, [step, tableSteps]);

  const currentStep =
    step > 0 && step <= tableSteps.length ? tableSteps[step - 1] : null;
  const longestPalin = useMemo(() => {
    if (!currentStep) return str[0];
    return str.substring(currentStep.longestStart, currentStep.longestEnd + 1);
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-gray-800/30 rounded-lg p-3 text-center">
        <div className="text-sm text-gray-400 mb-1">
          Longest Palindromic Substring
        </div>
        <div className="font-mono text-sm text-blue-300">
          dp[i][j] = (s[i] == s[j]) AND dp[i+1][j-1]
        </div>
      </div>

      <div className="flex gap-1 justify-center mb-2">
        {str.split("").map((c, idx) => {
          // skipcq: JS-R1005
          const isInRange =
            currentStep && idx >= currentStep.i && idx <= currentStep.j;
          const isOuter =
            currentStep && (idx === currentStep.i || idx === currentStep.j);
          const isInner =
            currentStep && idx > currentStep.i && idx < currentStep.j;

          let bgColor = "bg-gray-800";
          if (isOuter)
            bgColor = currentStep.outerMatch ? "bg-green-600" : "bg-red-600";
          else if (isInner)
            bgColor = currentStep.innerResult
              ? "bg-green-600/40"
              : currentStep.innerResult === false
                ? "bg-red-600/40"
                : "bg-blue-600/30";
          else if (isInRange) bgColor = "bg-blue-600/30";

          return (
            <div
              // skipcq: JS-0437
              key={`table-char-${idx}`}
              className="flex flex-col items-center"
            >
              <div className="text-xs text-gray-500">{idx}</div>
              <div
                className={`w-11 h-11 flex items-center justify-center rounded font-mono font-bold text-lg text-white ${bgColor}`}
              >
                {c}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="p-1 text-gray-500 w-7 text-xs">i\j</th>
                {str.split("").map((c, colIdx) => (
                  <th
                    // skipcq: JS-0437
                    key={`th-${colIdx}`}
                    className="p-1 text-gray-400 w-9 text-xs"
                  >
                    <div>{colIdx}</div>
                    <div className="text-gray-600">{c}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {str.split("").map((rowChar, rowIdx) => (
                <tr
                  // skipcq: JS-0437
                  key={`tr-${rowIdx}`}
                >
                  <td className="p-1 text-gray-400 font-mono text-xs">
                    <span className="text-gray-600">{rowChar}</span> {rowIdx}
                  </td>
                  {str.split("").map((_, colIdx) => {
                    // skipcq: JS-R1005
                    const isCurrent =
                      currentStep &&
                      currentStep.i === rowIdx &&
                      currentStep.j === colIdx;
                    const isInnerRef =
                      currentStep &&
                      currentStep.len > 2 &&
                      rowIdx === currentStep.i + 1 &&
                      colIdx === currentStep.j - 1;
                    const value = dpTable[rowIdx]?.[colIdx];
                    const isValid = colIdx >= rowIdx;

                    return (
                      <td
                        // skipcq: JS-0437
                        key={`td-${rowIdx}-${colIdx}`}
                        className="p-0.5"
                      >
                        <div
                          className={`w-9 h-9 flex items-center justify-center border-2 rounded font-mono text-xs ${
                            !isValid
                              ? "bg-gray-900/20 border-gray-800/50"
                              : isCurrent
                                ? value
                                  ? "bg-green-600 border-green-400 text-white font-bold"
                                  : "bg-red-600 border-red-400 text-white font-bold"
                                : isInnerRef
                                  ? "bg-blue-600/50 border-blue-400 text-white"
                                  : value === true
                                    ? "bg-green-600/30 border-green-600/50 text-green-400"
                                    : value === false
                                      ? "bg-gray-800/50 border-gray-700 text-gray-600"
                                      : "bg-gray-900/30 border-gray-700 text-gray-600"
                          }`}
                        >
                          {isValid
                            ? value === null
                              ? ""
                              : value
                                ? "T"
                                : "F"
                            : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-800/30 rounded-lg p-3 min-w-[140px]">
          <div className="text-sm text-gray-400 mb-2">Longest:</div>
          <div className="text-xl font-mono text-yellow-400">
            &quot;{longestPalin}&quot;
          </div>
        </div>
      </div>

      {currentStep && (
        <div
          className={`text-sm text-center font-mono px-4 py-2 rounded-lg max-w-lg ${currentStep.isPalin ? "bg-green-600/20 text-green-400" : "bg-gray-800/50 text-gray-400"}`}
        >
          {currentStep.explanation}
        </div>
      )}

      {step >= tableSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Longest Substring = &quot;{longestPalin}&quot;
          </span>
          <span className="text-gray-400 ml-2">
            (length {longestPalin.length})
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500">O(n²) time, O(n²) space</div>
    </div>
  );
};

const ExpandPhase = ({
  step,
  expandSteps,
}: {
  step: number;
  expandSteps: ExpandStep[];
}) => {
  // skipcq: JS-R1005
  const currentStep =
    step > 0 && step <= expandSteps.length ? expandSteps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-gray-800/30 rounded-lg p-3 text-center">
        <div className="font-mono text-sm text-green-300">
          Expand from center while s[left] == s[right]
        </div>
        <div className="text-xs text-gray-500 mt-1">
          O(1) space - no DP table needed!
        </div>
      </div>

      <div className="flex gap-1 justify-center mb-2">
        {str.split("").map((c, idx) => {
          // skipcq: JS-R1005
          const isCenter =
            currentStep &&
            (currentStep.centerType === "single"
              ? idx === currentStep.center
              : idx === currentStep.center || idx === currentStep.center + 1);
          const isPointer =
            currentStep &&
            currentStep.action !== "stop" &&
            (idx === currentStep.left || idx === currentStep.right);
          const isInPalin =
            currentStep &&
            currentStep.action !== "stop" &&
            idx >= currentStep.left &&
            idx <= currentStep.right;
          const isMismatch =
            currentStep &&
            currentStep.action === "stop" &&
            (idx === currentStep.left || idx === currentStep.right);

          let bgColor = "bg-gray-800";
          let borderColor = "border-transparent";
          if (isMismatch) {
            bgColor = "bg-red-600/50";
            borderColor = "border-red-400";
          } else if (isInPalin) {
            bgColor = "bg-purple-600";
            if (isPointer) borderColor = "border-white";
          } else if (isCenter) {
            bgColor = "bg-yellow-600/50";
          }

          return (
            <div
              // skipcq: JS-0437
              key={`expand-char-${idx}`}
              className="flex flex-col items-center"
            >
              <div className="text-xs text-gray-500">{idx}</div>
              <div
                className={`w-11 h-11 flex items-center justify-center rounded font-mono font-bold text-lg text-white border-2 ${bgColor} ${borderColor}`}
              >
                {c}
              </div>
              {isPointer && (
                <div className="text-xs text-blue-400 mt-1">
                  {idx === currentStep.left ? "L" : "R"}
                </div>
              )}
              {isCenter && !isPointer && (
                <div className="text-xs text-yellow-400 mt-1">C</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
        <div className="bg-gray-800/30 rounded-lg p-4 min-w-[220px]">
          {currentStep ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Center:</span>
                <span className="text-yellow-400 font-mono">
                  {currentStep.centerType === "single"
                    ? `${currentStep.center}`
                    : `${currentStep.center},${currentStep.center + 1}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-blue-400">
                  {currentStep.centerType === "single" ? "Odd" : "Even"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Compare:</span>
                <span
                  className={`font-mono ${currentStep.isMatch ? "text-green-400" : "text-red-400"}`}
                >
                  &apos;{currentStep.leftChar}&apos;{" "}
                  {currentStep.isMatch ? "==" : "!="} &apos;
                  {currentStep.rightChar}&apos;
                </span>
              </div>
              <div className="pt-2 border-t border-gray-700">
                <div className="text-purple-400 font-mono text-lg">
                  &quot;{currentStep.currentPalin}&quot;
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">Press play</div>
          )}
        </div>

        <div className="bg-gray-800/30 rounded-lg p-4 min-w-[120px]">
          <div className="text-sm text-gray-400 mb-2">Longest:</div>
          <div className="text-xl font-mono text-yellow-400">
            &quot;{currentStep?.longestSoFar || str[0]}&quot;
          </div>
        </div>
      </div>

      {step >= expandSteps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Longest Substring = &quot;
            {expandSteps[expandSteps.length - 1]?.longestSoFar}&quot;
          </span>
          <span className="text-gray-400 ml-2">
            (length {expandSteps[expandSteps.length - 1]?.longestSoFar.length})
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500">O(n²) time, O(1) space</div>
    </div>
  );
};

// skipcq: JS-0067
export default function PalindromeDPVisualizer() {
  const phases: Phase[] = ["tree", "memo", "table", "expand"];
  const phaseLabels: Record<Phase, string> = {
    tree: "Recursion",
    memo: "Memoization",
    table: "Tabulation",
    expand: "Space Optimized",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("table");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { steps: tableSteps, longest: tableLongest } = useMemo(
    () => generateTableSteps(),
    []
  );
  const { steps: expandSteps } = useMemo(() => generateExpandSteps(), []);
  const recursionSteps = useMemo(() => generateRecursionSteps(), []);
  const { steps: memoSteps } = useMemo(() => generateMemoSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "table") return tableSteps.length;
      if (phase === "expand") return expandSteps.length;
      if (phase === "tree") return recursionSteps.length;
      if (phase === "memo") return memoSteps.length;
      return 1;
    },
    [
      tableSteps.length,
      expandSteps.length,
      recursionSteps.length,
      memoSteps.length,
    ]
  );

  const maxSteps = getMaxSteps(currentPhase);

  useEffect(() => {
    if (isPlaying && step < maxSteps) {
      intervalRef.current = setTimeout(() => {
        setStep((s) => {
          if (s + 1 >= maxSteps) setIsPlaying(false);
          return s + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, step, speed, maxSteps]);

  const goToPhase = (phase: Phase) => {
    setCurrentPhase(phase);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-xl w-full max-w-5xl mx-auto">
      <div className="text-center mb-4">
        <div className="text-lg font-medium text-white">Palindrome DP</div>
        <div className="text-sm text-gray-400">
          Recursion/Memo: LPS (Subsequence) | Tabulation/Expand: Substring
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl flex-wrap justify-center">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPhase === phase ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${currentPhase === phase ? "bg-blue-500" : "bg-gray-700"}`}
                >
                  {index + 1}
                </span>
                {phaseLabels[phase]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Controls
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onStep={() => step < maxSteps && setStep((s) => s + 1)}
          onBack={() => step > 0 && setStep((s) => s - 1)}
          onReset={() => {
            setStep(0);
            setIsPlaying(false);
          }}
          speed={speed}
          onSpeedChange={setSpeed}
          step={step}
          total={maxSteps}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {currentPhase === "tree" && (
            <TreePhase step={step} recursionSteps={recursionSteps} />
          )}
          {currentPhase === "memo" && (
            <MemoPhase step={step} memoSteps={memoSteps} />
          )}
          {currentPhase === "table" && (
            <TablePhase step={step} tableSteps={tableSteps} />
          )}
          {currentPhase === "expand" && (
            <ExpandPhase step={step} expandSteps={expandSteps} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        Substring: &quot;{str}&quot; → &quot;{tableLongest}&quot; | Subsequence:
        &quot;{treeStr}&quot; → &quot;bb&quot; (len 2)
      </div>
    </div>
  );
}
