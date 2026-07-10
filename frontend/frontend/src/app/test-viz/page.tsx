"use client";

import dynamic from "next/dynamic";

const VisualizerLoading = () => (
  <div className="h-64 rounded-md animate-pulse bg-gray-800" />
);

const LISVisualizer = dynamic(
  () => import("@/components/visualizers/LISVisualizer"),
  { loading: VisualizerLoading, ssr: false }
);

const GridDPVisualizer = dynamic(
  () => import("@/components/visualizers/GridDPVisualizer"),
  { loading: VisualizerLoading, ssr: false }
);

const BitmaskDPVisualizer = dynamic(
  () => import("@/components/visualizers/BitmaskDPVisualizer"),
  { loading: VisualizerLoading, ssr: false }
);

const TreeDPVisualizer = dynamic(
  () => import("@/components/visualizers/TreeDPVisualizer"),
  { loading: VisualizerLoading, ssr: false }
);

const MultiStateDPVisualizer = dynamic(
  () => import("@/components/visualizers/MultiStateDPVisualizer"),
  { loading: VisualizerLoading, ssr: false }
);

export default function TestVizPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8 space-y-12">
      <h1 className="text-3xl font-bold text-white">Visualizer Test Page</h1>
      
      <section>
        <h2 className="text-xl text-white mb-4">LIS Visualizer</h2>
        <LISVisualizer />
      </section>
      
      <section>
        <h2 className="text-xl text-white mb-4">Grid DP Visualizer</h2>
        <GridDPVisualizer />
      </section>
      
      <section>
        <h2 className="text-xl text-white mb-4">Bitmask DP Visualizer</h2>
        <BitmaskDPVisualizer />
      </section>
      
      <section>
        <h2 className="text-xl text-white mb-4">Tree DP Visualizer</h2>
        <TreeDPVisualizer />
      </section>
      
      <section>
        <h2 className="text-xl text-white mb-4">Multi-State DP Visualizer</h2>
        <MultiStateDPVisualizer />
      </section>
    </div>
  );
}
