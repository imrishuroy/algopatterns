"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Example price arrays
const EXAMPLES = [
  { prices: [7, 1, 5, 3, 6, 4], expected: 5, description: "Classic example" },
  { prices: [7, 6, 4, 3, 1], expected: 0, description: "Decreasing prices" },
  { prices: [2, 4, 1, 7, 5, 3], expected: 6, description: "Buy at 1, sell at 7" },
  { prices: [3, 3, 3, 3], expected: 0, description: "All same price" },
];

interface StepInfo {
  type: "init" | "process" | "new-min" | "new-profit" | "done";
  dayIndex: number;
  price: number;
  minPriceBefore: number;
  minPriceAfter: number;
  currentProfit: number;
  maxProfitBefore: number;
  maxProfitAfter: number;
  message: string;
  buyDay?: number;
  sellDay?: number;
}

// Compute steps for visualization
const computeSteps = (prices: number[]): StepInfo[] => {
  const steps: StepInfo[] = [];
  let minPrice = Infinity;
  let maxProfit = 0;
  let bestBuyDay = -1;
  let bestSellDay = -1;
  let currentMinDay = -1;

  steps.push({
    type: "init",
    dayIndex: -1,
    price: 0,
    minPriceBefore: Infinity,
    minPriceAfter: Infinity,
    currentProfit: 0,
    maxProfitBefore: 0,
    maxProfitAfter: 0,
    message: "Start scanning prices. Track minimum price and maximum profit.",
  });

  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    const minPriceBefore = minPrice;
    const maxProfitBefore = maxProfit;

    // Check if new minimum
    const isNewMin = price < minPrice;
    if (isNewMin) {
      minPrice = price;
      currentMinDay = i;
    }

    // Calculate profit if selling today
    const profit = price - minPrice;

    // Check if new max profit
    const isNewProfit = profit > maxProfit;
    if (isNewProfit) {
      maxProfit = profit;
      bestBuyDay = currentMinDay;
      bestSellDay = i;
    }

    let message = "";
    let stepType: StepInfo["type"] = "process";

    if (isNewMin && profit === 0) {
      stepType = "new-min";
      message = `Day ${i}: Price $${price} is a new minimum! Update minPrice = $${price}. Profit if sell today = $0.`;
    } else if (isNewProfit) {
      stepType = "new-profit";
      message = `Day ${i}: Price $${price}. Profit = $${price} - $${minPrice} = $${profit}. New best profit!`;
    } else {
      message = `Day ${i}: Price $${price}. Profit = $${price} - $${minPrice} = $${profit}. Not better than max $${maxProfit}.`;
    }

    steps.push({
      type: stepType,
      dayIndex: i,
      price,
      minPriceBefore,
      minPriceAfter: minPrice,
      currentProfit: profit,
      maxProfitBefore,
      maxProfitAfter: maxProfit,
      message,
      buyDay: bestBuyDay,
      sellDay: bestSellDay,
    });
  }

  // Final step
  const finalMessage =
    maxProfit > 0
      ? `Done! Maximum profit = $${maxProfit} (Buy day ${bestBuyDay} at $${prices[bestBuyDay]}, Sell day ${bestSellDay} at $${prices[bestSellDay]})`
      : `Done! Maximum profit = $0. No profitable transaction possible.`;

  steps.push({
    type: "done",
    dayIndex: prices.length,
    price: 0,
    minPriceBefore: minPrice,
    minPriceAfter: minPrice,
    currentProfit: 0,
    maxProfitBefore: maxProfit,
    maxProfitAfter: maxProfit,
    message: finalMessage,
    buyDay: bestBuyDay,
    sellDay: bestSellDay,
  });

  return steps;
};

export default function BuyAndSellStockVisualizer() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [currentStep, setCurrentStep] = useState(0);

  const prices = EXAMPLES[selectedExample].prices;
  const steps = useMemo(() => computeSteps(prices), [prices]);

  const handleExampleChange = (idx: number) => {
    setSelectedExample(idx);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const isDone = currentStep >= steps.length;
  const currentStepData = currentStep > 0 ? steps[currentStep - 1] : null;

  const performStep = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, steps.length]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      performStep();
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, performStep, speed]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  // Get current state for display
  const getCurrentState = () => {
    if (!currentStepData) {
      return {
        minPrice: Infinity,
        maxProfit: 0,
        currentDay: -1,
        buyDay: -1,
        sellDay: -1,
      };
    }
    return {
      minPrice: currentStepData.minPriceAfter,
      maxProfit: currentStepData.maxProfitAfter,
      currentDay: currentStepData.dayIndex,
      buyDay: currentStepData.buyDay ?? -1,
      sellDay: currentStepData.sellDay ?? -1,
    };
  };

  const state = getCurrentState();

  // Find the day with minimum price up to current day
  const minPriceDay = useMemo(() => {
    if (state.currentDay < 0) return -1;
    let minDay = 0;
    for (let i = 1; i <= state.currentDay && i < prices.length; i++) {
      if (prices[i] < prices[minDay]) {
        minDay = i;
      }
    }
    return minDay;
  }, [state.currentDay, prices]);

  // Get bar style for each price
  const getBarStyle = (dayIdx: number) => {
    const isCurrent = dayIdx === state.currentDay;
    const isMinPrice = dayIdx === minPriceDay && state.currentDay >= 0;
    const isBuyDay = dayIdx === state.buyDay && state.maxProfit > 0;
    const isSellDay = dayIdx === state.sellDay && state.maxProfit > 0;
    const isProcessed = dayIdx < state.currentDay;

    if (isCurrent) {
      return "bg-yellow-500 border-yellow-400";
    }
    if (isBuyDay && isDone) {
      return "bg-green-500 border-green-400";
    }
    if (isSellDay && isDone) {
      return "bg-blue-500 border-blue-400";
    }
    if (isMinPrice) {
      return "bg-green-500/60 border-green-400";
    }
    if (isProcessed) {
      return "bg-gray-600 border-gray-500";
    }
    return "bg-gray-700 border-gray-600";
  };

  // Calculate max price for scaling
  const maxPrice = Math.max(...prices);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <h3 className="text-lg font-semibold text-white">
          Best Time to Buy and Sell Stock
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Track minimum price and calculate profit at each step
        </p>
      </div>

      <div className="p-4">
        {/* Example Selector */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Choose Example:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleChange(idx)}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  selectedExample === idx
                    ? "bg-green-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                [{ex.prices.join(", ")}]
                <span className="ml-2 text-xs text-gray-500">→ ${ex.expected}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isDone}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              isPlaying ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              if (!isPlaying && !isDone) {
                performStep();
              }
            }}
            disabled={isPlaying || isDone}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Step
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600"
          >
            Reset
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-gray-400 text-sm">Speed:</span>
            <input
              type="range"
              min="200"
              max="1200"
              step="100"
              value={1400 - speed}
              onChange={(e) => setSpeed(1400 - Number(e.target.value))}
              className="w-20 accent-green-500"
            />
          </div>
        </div>

        {/* Price Chart Visualization */}
        <div className="mb-6 p-4 bg-gray-800/30 rounded-lg">
          <div className="text-sm text-gray-400 mb-3 text-center">
            Stock Prices Over Time
          </div>
          <div className="flex items-end justify-center gap-2 h-40">
            {prices.map((price, idx) => {
              const height = (price / maxPrice) * 100;
              const barStyle = getBarStyle(idx);

              return (
                <div key={idx} className="flex flex-col items-center">
                  <motion.div
                    className={`w-10 rounded-t border-2 ${barStyle} relative`}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Price label on top of bar */}
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-gray-300">
                      ${price}
                    </span>

                    {/* Buy/Sell indicators */}
                    {idx === state.buyDay && state.maxProfit > 0 && isDone && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-green-400">
                        BUY
                      </span>
                    )}
                    {idx === state.sellDay && state.maxProfit > 0 && isDone && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-400">
                        SELL
                      </span>
                    )}
                  </motion.div>
                  <span className="mt-1 text-xs text-gray-500">Day {idx}</span>
                </div>
              );
            })}
          </div>

          {/* Profit arrow when done */}
          {isDone && state.maxProfit > 0 && (
            <div className="mt-4 text-center">
              <span className="text-green-400 font-mono">
                Buy at ${prices[state.buyDay]} → Sell at ${prices[state.sellDay]} = 
                <span className="font-bold"> +${state.maxProfit}</span>
              </span>
            </div>
          )}
        </div>

        {/* Current State Display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">
              Min Price (Best Buy)
            </div>
            <div className="text-2xl font-mono font-bold text-green-400">
              {state.minPrice === Infinity ? "∞" : `$${state.minPrice}`}
            </div>
            {minPriceDay >= 0 && state.minPrice !== Infinity && (
              <div className="text-xs text-gray-500 mt-1">Day {minPriceDay}</div>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">Max Profit</div>
            <div
              className={`text-2xl font-mono font-bold ${state.maxProfit > 0 ? "text-blue-400" : "text-gray-500"}`}
            >
              ${state.maxProfit}
            </div>
            {state.maxProfit > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Day {state.buyDay} → Day {state.sellDay}
              </div>
            )}
          </div>
        </div>

        {/* Current Day Info */}
        {currentStepData && currentStepData.type !== "init" && currentStepData.type !== "done" && (
          <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Day {currentStepData.dayIndex}: Price = ${currentStepData.price}
              </span>
              <span className="text-gray-400">
                Profit if sell today = ${currentStepData.price} - ${currentStepData.minPriceAfter} ={" "}
                <span className={currentStepData.currentProfit > 0 ? "text-green-400" : "text-gray-500"}>
                  ${currentStepData.currentProfit}
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Step Explanation */}
        <AnimatePresence mode="wait">
          {currentStepData && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg mb-4 ${
                currentStepData.type === "done"
                  ? state.maxProfit > 0
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-gray-500/10 border border-gray-500/30"
                  : currentStepData.type === "new-profit"
                    ? "bg-blue-500/10 border border-blue-500/30"
                    : currentStepData.type === "new-min"
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-gray-800/50"
              }`}
            >
              <div className="text-sm">
                <span
                  className={
                    currentStepData.type === "done"
                      ? state.maxProfit > 0
                        ? "text-green-400"
                        : "text-gray-400"
                      : currentStepData.type === "new-profit"
                        ? "text-blue-400"
                        : currentStepData.type === "new-min"
                          ? "text-green-400"
                          : "text-gray-300"
                  }
                >
                  {currentStepData.message}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 border border-yellow-400 rounded"></div>
              <span>Current Day</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/60 border border-green-400 rounded"></div>
              <span>Min Price</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 border border-green-400 rounded"></div>
              <span>Buy Day</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 border border-blue-400 rounded"></div>
              <span>Sell Day</span>
            </div>
          </div>
        </div>

        {/* Algorithm Summary */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg text-sm text-gray-400">
          <p>
            <strong className="text-green-400">Key Insight:</strong> At each day,
            the best profit = today&apos;s price - minimum price seen so far. Track the
            minimum as you go, no need to look back!
          </p>
        </div>
      </div>
    </div>
  );
}
