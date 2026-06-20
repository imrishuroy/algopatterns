import { questions } from "@/lib/questions";
import Dashboard from "@/components/patterns/Dashboard";

export const metadata = {
  title: "AlgoPatterns - Master DSA Patterns",
  description:
    "Learn algorithms through interactive visualizations and pattern-based problem solving.",
};

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
      <Dashboard questions={questions} />
    </div>
  );
}
