"use client";

import { useEffect, useState, startTransition } from "react";

interface Particle {
  id: number;
  color: string;
  size: number;
  endX: number;
  endY: number;
  delay: number;
  rotation: number;
}

const COLORS = [
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#22c55e",
  "#eab308",
  "#06b6d4",
  "#f97316",
  "#ef4444",
  "#10b981",
];

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 600 + 100;

      newParticles.push({
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        endX: Math.cos(angle) * distance,
        endY: Math.sin(angle) * distance,
        delay: Math.random() * 0.15,
        rotation: Math.random() * 720 - 360,
      });
    }

    startTransition(() => {
      setParticles(newParticles);
    });

    const timeout = setTimeout(() => {
      startTransition(() => {
        setParticles([]);
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={
            {
              width: particle.size,
              height: particle.size * (particle.id % 3 === 0 ? 1 : 1.4),
              backgroundColor: particle.color,
              borderRadius: particle.id % 4 === 0 ? "50%" : "2px",
              animation: `explode 1.6s ease-out ${particle.delay}s forwards`,
              "--end-x": `${particle.endX}px`,
              "--end-y": `${particle.endY}px`,
              "--rotation": `${particle.rotation}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
