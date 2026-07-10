"use client";

import dynamic from "next/dynamic";

const VisualizerLoading = () => (
  <div className="h-64 rounded-md animate-pulse bg-gray-800">Loading...</div>
);

const LISVisualizer = dynamic(
  () => import("@/components/visualizers/LISVisualizer"),
  { loading: VisualizerLoading, ssr: false }
);

// skipcq: JS-0067
export default function TestVizPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">LIS Visualizer Test</h1>
      <LISVisualizer />
    </div>
  );
}
