import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AlgoPatterns - Master DSA Patterns for FAANG Interviews";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// skipcq: JS-0067
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111827",
        backgroundImage:
          "radial-gradient(circle at 25% 25%, #1e3a5f 0%, transparent 50%), radial-gradient(circle at 75% 75%, #312e81 0%, transparent 50%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 20,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          AlgoPatterns
        </span>
      </div>
      <div
        style={{
          fontSize: 32,
          color: "#9ca3af",
          textAlign: "center",
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        Master 17 DSA Patterns for FAANG Interviews
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 40,
        }}
      >
        {[
          "Two Pointers",
          "Sliding Window",
          "Dynamic Programming",
          "Graphs",
        ].map((pattern) => (
          <div
            key={pattern}
            style={{
              padding: "12px 24px",
              borderRadius: 9999,
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              color: "#a5b4fc",
              fontSize: 18,
            }}
          >
            {pattern}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    }
  );
}
