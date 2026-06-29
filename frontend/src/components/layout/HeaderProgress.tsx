"use client";

import { questions } from "@/lib/questions";
import { useProgress } from "@/contexts/ProgressContext";

export default function HeaderProgress() {
  const { completed } = useProgress();
  const completedCount = completed.size;
  const total = questions.length;

  const percent = total ? Math.round((completedCount / total) * 100) : 0;
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/80 rounded-md border border-gray-700">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#1e3a5f"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{percent}%</span>
        </div>
      </div>
      <div className="hidden sm:block">
        <p className="text-sm text-gray-400">Completed</p>
        <p className="text-base font-semibold text-indigo-400">
          {completedCount} / {total}
        </p>
      </div>
    </div>
  );
}
