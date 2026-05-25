const APP_VERSION = "1.1.0";

export default function Footer() {
  return (
    <footer
      className="mt-auto py-6 border-t"
      style={{ borderColor: "var(--border-1)" }}
    >
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p style={{ color: "var(--text-3)" }}>
          AlgoPatterns - Interactive Algorithm Visualizations
        </p>
        <div className="mt-3">
          <span style={{ color: "var(--text-3)" }}>v{APP_VERSION}</span>
        </div>
      </div>
    </footer>
  );
}
