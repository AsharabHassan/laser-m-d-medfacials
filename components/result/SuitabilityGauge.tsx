"use client";

import { motion, useReducedMotion } from "motion/react";

interface SuitabilityGaugeProps {
  score: number;
  accent: "peach" | "sage";
  label: string;
}

const ACCENT = {
  peach: "#efac88",
  sage: "#90aaa9",
};

/** Semicircular animated gauge — the focal reveal element. */
export function SuitabilityGauge({ score, accent, label }: SuitabilityGaugeProps) {
  const reduce = useReducedMotion();
  const R = 86;
  const C = Math.PI * R;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = C * (1 - pct);

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 116" className="w-56">
        <path
          d="M14 100 A 86 86 0 0 1 186 100"
          fill="none"
          stroke="rgba(144,170,169,0.2)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <motion.path
          d="M14 100 A 86 86 0 0 1 186 100"
          fill="none"
          stroke={ACCENT[accent]}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: reduce ? offset : C }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduce ? 0 : 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute bottom-1 flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="font-serif text-4xl text-heading"
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sage-deep">
          {label}
        </span>
      </div>
    </div>
  );
}
