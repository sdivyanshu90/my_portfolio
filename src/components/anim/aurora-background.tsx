import React from "react";

type Blob = {
  color: string;
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  animation: string;
  opacity: number;
};

// Soft pastel aurora that slowly drifts behind the frosted-glass panels.
// Pure CSS transforms (GPU-friendly); the global reduced-motion guard in
// globals.css freezes the drift for users who prefer reduced motion.
const BLOBS: Blob[] = [
  {
    color: "#a5b4fc", // indigo
    size: "46rem",
    top: "-14rem",
    left: "-10rem",
    animation: "aurora-1 26s ease-in-out infinite",
    opacity: 0.5,
  },
  {
    color: "#c4b5fd", // violet
    size: "40rem",
    top: "-8rem",
    right: "-12rem",
    animation: "aurora-2 32s ease-in-out infinite",
    opacity: 0.45,
  },
  {
    color: "#7dd3fc", // sky
    size: "36rem",
    bottom: "-16rem",
    left: "12%",
    animation: "aurora-3 30s ease-in-out infinite",
    opacity: 0.4,
  },
  {
    color: "#6ee7b7", // emerald
    size: "34rem",
    bottom: "-14rem",
    right: "4%",
    animation: "aurora-1 36s ease-in-out infinite",
    opacity: 0.34,
  },
  {
    color: "#fbcfe8", // pink
    size: "30rem",
    top: "32%",
    left: "38%",
    animation: "aurora-2 40s ease-in-out infinite",
    opacity: 0.3,
  },
];

export default function AuroraBackground() {
  return (
    <div className="aurora-wrap" aria-hidden>
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          className="aurora-blob"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            right: blob.right,
            bottom: blob.bottom,
            opacity: blob.opacity,
            background: `radial-gradient(circle at 50% 50%, ${blob.color} 0%, transparent 68%)`,
            animation: blob.animation,
          }}
        />
      ))}
    </div>
  );
}
