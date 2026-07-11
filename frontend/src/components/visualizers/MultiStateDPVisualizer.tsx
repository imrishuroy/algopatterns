"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "product" | "cooldown" | "fee" | "paint";

// Max Product Subarray data
const productNums = [2, 3, -2, 4, -1];

// Stock with Cooldown data
const stockPrices = [1, 2, 3, 0, 2];

// Stock with Fee data
const feePrices = [1, 3, 2, 8, 4, 9];
const transactionFee = 2;

// Paint House data
const houseCosts = [
  [17, 2, 17],
  [16, 16, 5],
  [14, 3, 19],
];
const colors = ["Red", "Blue", "Green"];

interface ProductStep {
  index: number;
  num: number;
  currMax: number;
  currMin: number;
  maxProd: number;
  decision: "start" | "extendMax" | "extendMin";
  explanation: string;
}

interface CooldownStep {
  day: number;
  price: number;
  hold: number;
  sold: number;
  rest: number;
  action: string;
  decision: "buy" | "sell" | "rest" | "init";
}

interface FeeStep {
  day: number;
  price: number;
  hold: number;
  cash: number;
  action: string;
  decision: "buy" | "sell" | "hold" | "init";
}

interface PaintStep {
  house: number;
  costs: number[];
  dp: number[];
  action: string;
  chosen: number;
}

const generateProductSteps = (): ProductStep[] => {
  const result: ProductStep[] = [];
  let maxProd = productNums[0];
  let currMax = productNums[0];
  let currMin = productNums[0];

  result.push({
    index: 0,
    num: productNums[0],
    currMax: productNums[0],
    currMin: productNums[0],
    maxProd: productNums[0],
    decision: "start",
    explanation: `Initialize: currMax=${productNums[0]}, currMin=${productNums[0]}, maxProd=${productNums[0]}`,
  });

  for (let i = 1; i < productNums.length; i++) {
    const num = productNums[i];
    const temp = currMax;

    const candidates = [num, num * currMax, num * currMin];
    const newMax = Math.max(...candidates);
    const newMin = Math.min(num, num * temp, num * currMin);

    let decision: "start" | "extendMax" | "extendMin";
    let explanation: string;

    if (newMax === num) {
      decision = "start";
      explanation = `${num} alone (${num}) beats extending. Start fresh!`;
    } else if (newMax === num * temp) {
      decision = "extendMax";
      explanation = `${num} × max(${temp}) = ${num * temp}. Extend the product.`;
    } else {
      decision = "extendMin";
      explanation = `${num} × min(${currMin}) = ${num * currMin}. Negative × Negative = Positive!`;
    }

    currMax = newMax;
    currMin = newMin;
    maxProd = Math.max(maxProd, currMax);

    result.push({
      index: i,
      num,
      currMax,
      currMin,
      maxProd,
      decision,
      explanation,
    });
  }

  return result;
};

const generateCooldownSteps = (): CooldownStep[] => { // skipcq: JS-R1005
  const result: CooldownStep[] = [];
  let hold = -Infinity;
  let sold = 0;
  let rest = 0;

  result.push({
    day: -1,
    price: 0,
    hold: -9999,
    sold: 0,
    rest: 0,
    action: "Initialize: hold=-∞, sold=0, rest=0",
    decision: "init",
  });

  for (let i = 0; i < stockPrices.length; i++) {
    const price = stockPrices[i];
    const prevHold = hold;
    const prevSold = sold;
    const prevRest = rest;

    const newHold = Math.max(prevHold, prevRest - price);
    const newRest = Math.max(prevRest, prevSold);
    const newSold = prevHold + price;

    let decision: "buy" | "sell" | "rest";
    let action: string;

    if (newHold > prevHold && newHold === prevRest - price) {
      decision = "buy";
      action = `Day ${i}: Buy at $${price}. hold=max(${prevHold === -Infinity ? "-∞" : prevHold}, ${prevRest}-${price})=${newHold}`;
    } else if (newSold > prevSold) {
      decision = "sell";
      action = `Day ${i}: Can sell for $${price}. sold=${prevHold === -Infinity ? "-∞" : prevHold}+${price}=${newSold}`;
    } else {
      decision = "rest";
      action = `Day ${i}: Rest. rest=max(${prevRest}, ${prevSold})=${newRest}`;
    }

    hold = newHold;
    sold = newSold;
    rest = newRest;

    result.push({
      day: i,
      price,
      hold: hold === -Infinity ? -9999 : hold,
      sold: sold === -Infinity ? -9999 : sold,
      rest,
      action,
      decision,
    });
  }

  return result;
};

const generateFeeSteps = (): FeeStep[] => { // skipcq: JS-R1005
  const result: FeeStep[] = [];
  let hold = -feePrices[0];
  let cash = 0;

  result.push({
    day: 0,
    price: feePrices[0],
    hold: -feePrices[0],
    cash: 0,
    action: `Initialize: hold=-$${feePrices[0]} (buy first stock), cash=$0`,
    decision: "init",
  });

  for (let i = 1; i < feePrices.length; i++) {
    const price = feePrices[i];
    const prevHold = hold;
    const prevCash = cash;

    const newHold = Math.max(prevHold, prevCash - price);
    const newCash = Math.max(prevCash, prevHold + price - transactionFee);

    let decision: "buy" | "sell" | "hold";
    let action: string;

    if (newHold !== prevHold && newHold === prevCash - price) {
      decision = "buy";
      action = `Day ${i}: Buy at $${price}. hold=max(${prevHold}, ${prevCash}-${price})=${newHold}`;
    } else if (newCash !== prevCash && newCash === prevHold + price - transactionFee) {
      decision = "sell";
      action = `Day ${i}: Sell at $${price} - $${transactionFee} fee. cash=max(${prevCash}, ${prevHold}+${price}-${transactionFee})=${newCash}`;
    } else {
      decision = "hold";
      action = `Day ${i}: Hold. No profitable action.`;
    }

    hold = newHold;
    cash = newCash;

    result.push({
      day: i,
      price,
      hold,
      cash,
      action,
      decision,
    });
  }

  return result;
};

const generatePaintSteps = (): PaintStep[] => {
  const result: PaintStep[] = [];
  const n = houseCosts.length;
  let dp = [...houseCosts[0]];

  result.push({
    house: 0,
    costs: houseCosts[0],
    dp: [...dp],
    action: `House 0: Direct costs. Red=$${houseCosts[0][0]}, Blue=$${houseCosts[0][1]}, Green=$${houseCosts[0][2]}`,
    chosen: dp.indexOf(Math.min(...dp)),
  });

  for (let i = 1; i < n; i++) {
    const newDp = [
      houseCosts[i][0] + Math.min(dp[1], dp[2]),
      houseCosts[i][1] + Math.min(dp[0], dp[2]),
      houseCosts[i][2] + Math.min(dp[0], dp[1]),
    ];

    const minCost = Math.min(...newDp);
    const chosen = newDp.indexOf(minCost);

    result.push({
      house: i,
      costs: houseCosts[i],
      dp: [...newDp],
      action: `House ${i}: Red=$${houseCosts[i][0]}+min(Blue,Green)=$${newDp[0]}, Blue=$${houseCosts[i][1]}+min(Red,Green)=$${newDp[1]}, Green=$${houseCosts[i][2]}+min(Red,Blue)=$${newDp[2]}`,
      chosen,
    });

    dp = newDp;
  }

  return result;
};

const Controls = ({ // skipcq: JS-0415
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
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
          <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all ml-2"
        title="Reset"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    <div className="flex items-center justify-center gap-4">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
        <span className="text-xs text-gray-500 uppercase">Speed</span>
        <div className="flex gap-1">
          {[
            { value: 1200, label: "0.5x" },
            { value: 800, label: "1x" },
            { value: 400, label: "2x" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSpeedChange(opt.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium ${speed === opt.value ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
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

const ProductPhase = ({ step, steps }: { step: number; steps: ProductStep[] }) => { // skipcq: JS-R1005
  const currentStep = step > 0 && step <= steps.length ? steps[step - 1] : null;

  const decisionClass =
    currentStep?.decision === "start"
      ? "bg-blue-500/20 border border-blue-500/50 text-blue-400"
      : currentStep?.decision === "extendMin"
        ? "bg-pink-500/20 border border-pink-500/50 text-pink-400"
        : "bg-green-500/20 border border-green-500/50 text-green-400";

  const decisionText =
    currentStep?.decision === "start"
      ? "Start Fresh"
      : currentStep?.decision === "extendMin"
        ? "Extend via Min (Negative Flip!)"
        : "Extend via Max";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        Array: [{productNums.join(", ")}] | Track currMax AND currMin
      </div>

      <div className="flex gap-2 justify-center">
        {productNums.map((num, idx) => ( // skipcq: JS-R1005 
          <div
            // skipcq: JS-0437
            key={`prod-${idx}`}
            className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">{idx}</div>
            <motion.div
              animate={{
                backgroundColor: currentStep && idx === currentStep.index ? "#a855f7" : idx < (currentStep?.index ?? 0) ? "#374151" : "#1f2937",
                scale: currentStep && idx === currentStep.index ? 1.15 : 1,
              }}
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-gray-600"
            >
              <span className={num < 0 ? "text-red-400" : "text-white"}>{num}</span>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <div className="text-xs text-gray-400 mb-1">currMax</div>
          <motion.div key={currentStep?.currMax} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-xl font-bold text-green-400">
            {currentStep?.currMax ?? productNums[0]}
          </motion.div>
        </div>
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
          <div className="text-xs text-gray-400 mb-1">currMin</div>
          <motion.div key={currentStep?.currMin} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-xl font-bold text-red-400">
            {currentStep?.currMin ?? productNums[0]}
          </motion.div>
        </div>
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
          <div className="text-xs text-gray-400 mb-1">maxProd</div>
          <motion.div key={currentStep?.maxProd} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-xl font-bold text-purple-400">
            {currentStep?.maxProd ?? productNums[0]}
          </motion.div>
        </div>
      </div>

      {currentStep && step > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`px-4 py-2 rounded-lg text-center font-medium ${decisionClass}`}>
          {decisionText}
        </motion.div>
      )}

      {currentStep && (
        <div className="text-sm text-center bg-gray-800/50 px-4 py-2 rounded-lg max-w-lg text-gray-300">
          {currentStep.explanation}
        </div>
      )}

      {step >= steps.length && step > 0 && (
        <div className="text-sm text-center bg-purple-600/20 px-4 py-2 rounded-lg">
          <span className="text-purple-400 font-bold">Answer: Maximum Product = {steps[steps.length - 1].maxProd}</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        Key insight: Negative × Negative = Positive. Track both max AND min because today&apos;s minimum might become tomorrow&apos;s maximum!
      </div>
    </div>
  );
};

const CooldownPhase = ({ step, steps }: { step: number; steps: CooldownStep[] }) => { // skipcq: JS-R1005
  const currentStep = step > 0 && step <= steps.length ? steps[step - 1] : null;

  const stateColors = {
    hold: "bg-blue-500",
    sold: "bg-green-500",
    rest: "bg-yellow-500",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        Prices: [{stockPrices.join(", ")}] | States: hold, sold, rest (1-day cooldown after sell)
      </div>

      <div className="flex gap-2 justify-center">
        {stockPrices.map((price, idx) => ( // skipcq: JS-R1005 
          <div
            // skipcq: JS-0437
            key={`cool-${idx}`}
            className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Day {idx}</div>
            <motion.div
              animate={{
                backgroundColor: currentStep && idx === currentStep.day ? "#10b981" : idx < (currentStep?.day ?? -1) ? "#374151" : "#1f2937",
                scale: currentStep && idx === currentStep.day ? 1.15 : 1,
              }}
              className="w-14 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-gray-600"
            >
              ${price}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center mt-2">
        <div className="flex items-center gap-1 text-xs">
          <div className={`w-3 h-3 rounded ${stateColors.hold}`} />
          <span className="text-gray-400">hold (own stock)</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className={`w-3 h-3 rounded ${stateColors.sold}`} />
          <span className="text-gray-400">sold (just sold)</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <div className={`w-3 h-3 rounded ${stateColors.rest}`} />
          <span className="text-gray-400">rest (cooldown)</span>
        </div>
      </div>

      <svg width="400" height="180" className="mx-auto">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>

        <circle cx="100" cy="50" r="35" fill={currentStep?.decision === "buy" ? "#2563eb" : "#1e3a5a"} stroke="#3b82f6" strokeWidth="2" />
        <text x="100" y="45" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">HOLD</text>
        <text x="100" y="60" fill="#93c5fd" fontSize="10" textAnchor="middle">
          {currentStep ? (currentStep.hold === -9999 ? "-∞" : currentStep.hold) : "-∞"}
        </text>

        <circle cx="300" cy="50" r="35" fill={currentStep?.decision === "sell" ? "#166534" : "#14532d"} stroke="#22c55e" strokeWidth="2" />
        <text x="300" y="45" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">SOLD</text>
        <text x="300" y="60" fill="#86efac" fontSize="10" textAnchor="middle">
          {currentStep ? (currentStep.sold === -9999 ? "-∞" : currentStep.sold) : 0}
        </text>

        <circle cx="200" cy="140" r="35" fill={currentStep?.decision === "rest" ? "#854d0e" : "#713f12"} stroke="#eab308" strokeWidth="2" />
        <text x="200" y="135" fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">REST</text>
        <text x="200" y="150" fill="#fde047" fontSize="10" textAnchor="middle">
          {currentStep?.rest ?? 0}
        </text>

        <line x1="135" y1="50" x2="260" y2="50" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="197" y="40" fill="#9ca3af" fontSize="9" textAnchor="middle">sell +price</text>

        <line x1="300" y1="85" x2="235" y2="125" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="280" y="115" fill="#9ca3af" fontSize="9" textAnchor="middle">cooldown</text>

        <line x1="165" y1="125" x2="100" y2="85" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="110" y="115" fill="#9ca3af" fontSize="9" textAnchor="middle">buy -price</text>

        <path d="M 65 50 A 40 40 0 0 1 100 15" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        <text x="55" y="25" fill="#9ca3af" fontSize="9">keep</text>

        <path d="M 200 105 A 40 40 0 0 1 235 140" stroke="#6b7280" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        <text x="245" y="155" fill="#9ca3af" fontSize="9">keep</text>
      </svg>

      {currentStep && (
        <div className="text-sm text-center bg-gray-800/50 px-4 py-2 rounded-lg max-w-lg text-gray-300">
          {currentStep.action}
        </div>
      )}

      {step >= steps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">Answer: Max Profit = ${Math.max(
            steps[steps.length - 1].sold === -9999 ? -Infinity : steps[steps.length - 1].sold,
            steps[steps.length - 1].rest
          )}</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        State machine: After selling, must rest 1 day before buying again.
        hold = max(hold, rest - price), rest = max(rest, sold), sold = hold + price
      </div>
    </div>
  );
};

const FeePhase = ({ step, steps }: { step: number; steps: FeeStep[] }) => { // skipcq: JS-R1005
  const currentStep = step > 0 && step <= steps.length ? steps[step - 1] : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        Prices: [{feePrices.join(", ")}] | Fee: ${transactionFee} per transaction
      </div>

      <div className="flex gap-2 justify-center">
        {feePrices.map((price, idx) => ( // skipcq: JS-R1005 
          <div
            // skipcq: JS-0437
            key={`fee-${idx}`}
            className="flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Day {idx}</div>
            <motion.div
              animate={{
                backgroundColor: currentStep && idx === currentStep.day ? "#f59e0b" : idx < (currentStep?.day ?? 0) ? "#374151" : "#1f2937",
                scale: currentStep && idx === currentStep.day ? 1.15 : 1,
              }}
              className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border-2 border-gray-600"
            >
              ${price}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="flex gap-8 justify-center mt-4">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center min-w-[120px]">
          <div className="text-xs text-gray-400 mb-1">HOLD (own stock)</div>
          <motion.div key={currentStep?.hold} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-2xl font-bold text-blue-400">
            ${currentStep?.hold ?? -feePrices[0]}
          </motion.div>
          <div className="text-xs text-gray-500 mt-1">max profit while holding</div>
        </div>
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center min-w-[120px]">
          <div className="text-xs text-gray-400 mb-1">CASH (no stock)</div>
          <motion.div key={currentStep?.cash} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="text-2xl font-bold text-green-400">
            ${currentStep?.cash ?? 0}
          </motion.div>
          <div className="text-xs text-gray-500 mt-1">max profit without stock</div>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div className={`px-3 py-1 rounded ${currentStep?.decision === "buy" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>
          Buy: cash - price
        </div>
        <div className={`px-3 py-1 rounded ${currentStep?.decision === "sell" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"}`}>
          Sell: hold + price - fee
        </div>
        <div className={`px-3 py-1 rounded ${currentStep?.decision === "hold" ? "bg-yellow-600 text-white" : "bg-gray-800 text-gray-400"}`}>
          Hold: no change
        </div>
      </div>

      {currentStep && (
        <div className="text-sm text-center bg-gray-800/50 px-4 py-2 rounded-lg max-w-lg text-gray-300">
          {currentStep.action}
        </div>
      )}

      {step >= steps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">Answer: Max Profit = ${steps[steps.length - 1].cash}</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        Two states: hold and cash. Fee is paid when selling.
        hold = max(hold, cash - price), cash = max(cash, hold + price - fee)
      </div>
    </div>
  );
};

const PaintPhase = ({ step, steps }: { step: number; steps: PaintStep[] }) => { // skipcq: JS-R1005
  const currentStep = step > 0 && step <= steps.length ? steps[step - 1] : null;

  const colorClasses = [
    { bg: "bg-red-500", border: "border-red-400", text: "text-red-400" },
    { bg: "bg-blue-500", border: "border-blue-400", text: "text-blue-400" },
    { bg: "bg-green-500", border: "border-green-400", text: "text-green-400" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-400">
        Paint {houseCosts.length} houses. Adjacent houses cannot be same color.
      </div>

      <div className="flex gap-4 justify-center">
        {houseCosts.map((costs, idx) => ( 
          <div
            // skipcq: JS-0437
            key={`house-${idx}`}
            className="flex flex-col items-center">
            <motion.div
              animate={{
                scale: currentStep && idx === currentStep.house ? 1.1 : 1,
                opacity: currentStep && idx <= currentStep.house ? 1 : 0.5,
              }}
              className="w-16 h-20 bg-gray-700 rounded-t-lg border-2 border-gray-600 flex flex-col items-center justify-center"
            >
              <div className="text-xs text-gray-400">House {idx}</div>
              <div className="w-6 h-8 bg-yellow-600 rounded-t-sm mt-1" />
            </motion.div>
            <div className="flex gap-1 mt-2">
              {costs.map((cost, cIdx) => (
                <div
                  // skipcq: JS-0437
                  key={`cost-${idx}-${cIdx}`} // skipcq: JS-0437
                  className={`w-5 h-5 rounded text-xs flex items-center justify-center ${colorClasses[cIdx].bg} ${currentStep && idx === currentStep.house && cIdx === currentStep.chosen ? "ring-2 ring-white" : ""}`}
                >
                  {cost}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="text-xs text-gray-500 text-center mb-2">Min cost to paint houses 0..i ending with each color:</div>
        <div className="flex gap-4 justify-center">
          {colors.map((color, cIdx) => ( 
            <div
              // skipcq: JS-0437
              key={`dp-${cIdx}`}
              className={`p-3 rounded-lg text-center min-w-[80px] bg-${color.toLowerCase()}-500/10 border ${colorClasses[cIdx].border}`}>
              <div className={`text-xs ${colorClasses[cIdx].text} mb-1`}>{color}</div>
              <motion.div
                key={currentStep?.dp[cIdx]}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`text-xl font-bold ${colorClasses[cIdx].text}`}
              >
                ${currentStep?.dp[cIdx] ?? houseCosts[0][cIdx]}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {currentStep && (
        <div className="text-sm text-center bg-gray-800/50 px-4 py-2 rounded-lg max-w-lg text-gray-300">
          {currentStep.action}
        </div>
      )}

      {step >= steps.length && step > 0 && (
        <div className="text-sm text-center bg-green-600/20 px-4 py-2 rounded-lg">
          <span className="text-green-400 font-bold">
            Answer: Min Cost = ${Math.min(...steps[steps.length - 1].dp)}
          </span>
          <span className="text-gray-400 ml-2">
            ({colors[steps[steps.length - 1].dp.indexOf(Math.min(...steps[steps.length - 1].dp))]} for last house)
          </span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center max-w-md">
        dp[color] = cost[color] + min(dp[other colors]). No adjacent houses can have same color.
      </div>
    </div>
  );
};

// skipcq: JS-0067
export default function MultiStateDPVisualizer() {
  const phases: Phase[] = ["product", "cooldown", "fee", "paint"];
  const phaseLabels: Record<Phase, string> = {
    product: "Max Product",
    cooldown: "Stock + Cooldown",
    fee: "Stock + Fee",
    paint: "Paint House",
  };

  const [currentPhase, setCurrentPhase] = useState<Phase>("product");
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const productSteps = useMemo(() => generateProductSteps(), []);
  const cooldownSteps = useMemo(() => generateCooldownSteps(), []);
  const feeSteps = useMemo(() => generateFeeSteps(), []);
  const paintSteps = useMemo(() => generatePaintSteps(), []);

  const getMaxSteps = useCallback(
    (phase: Phase) => {
      if (phase === "product") return productSteps.length;
      if (phase === "cooldown") return cooldownSteps.length;
      if (phase === "fee") return feeSteps.length;
      if (phase === "paint") return paintSteps.length;
      return 0;
    },
    [productSteps.length, cooldownSteps.length, feeSteps.length, paintSteps.length]
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
        <div className="text-lg font-medium text-white">Multi-State DP</div>
        <div className="text-sm text-gray-400">
          Track multiple DP values at each position (when one value isn&apos;t enough)
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-800/50 p-1 rounded-xl flex-wrap justify-center gap-1">
          {phases.map((phase, index) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPhase === phase ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${currentPhase === phase ? "bg-purple-500" : "bg-gray-700"}`}>
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
          {currentPhase === "product" && <ProductPhase step={step} steps={productSteps} />}
          {currentPhase === "cooldown" && <CooldownPhase step={step} steps={cooldownSteps} />}
          {currentPhase === "fee" && <FeePhase step={step} steps={feeSteps} />}
          {currentPhase === "paint" && <PaintPhase step={step} steps={paintSteps} />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 pt-4 border-t border-gray-800 text-sm text-gray-500 text-center">
        Multi-State DP: When tracking ONE value per position isn&apos;t enough, track multiple states (max/min, hold/sold/rest, colors).
      </div>
    </div>
  );
}
