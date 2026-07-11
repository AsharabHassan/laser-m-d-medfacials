"use client";

import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// On-brand, illustrative "how to take your photo" guide. Pure inline SVG line-art
// (no images to license, no privacy concerns) in the MEDfacials peach/sage
// palette. A clear front-facing, well-lit, whole-face selfie gives the AI the
// best skin read — which keeps suitability results accurate and encouraging.
// ─────────────────────────────────────────────────────────────────────────────

interface Tip {
  ok: boolean;
  label: string;
  art: ReactNode;
}

const svg = "h-full w-full";
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function FaceOn() {
  return (
    <svg viewBox="0 0 64 64" className={svg} aria-hidden>
      <ellipse cx="32" cy="31" rx="15" ry="18" {...stroke} />
      <circle cx="26" cy="29" r="1.6" fill="currentColor" />
      <circle cx="38" cy="29" r="1.6" fill="currentColor" />
      <path d="M27 39 q5 4 10 0" {...stroke} />
    </svg>
  );
}

function GoodLight() {
  return (
    <svg viewBox="0 0 64 64" className={svg} aria-hidden>
      <ellipse cx="29" cy="33" rx="13" ry="16" {...stroke} />
      <circle cx="24" cy="31" r="1.5" fill="currentColor" />
      <circle cx="34" cy="31" r="1.5" fill="currentColor" />
      <path d="M25 40 q4 3 9 0" {...stroke} />
      <g {...stroke}>
        <circle cx="48" cy="16" r="5" />
        <path d="M48 6v3M48 23v3M58 16h-3M41 16h-3M55 9l-2 2M43 21l-2 2M55 23l-2-2M43 11l-2-2" />
      </g>
    </svg>
  );
}

function ChinClear() {
  return (
    <svg viewBox="0 0 64 64" className={svg} aria-hidden>
      <ellipse cx="32" cy="29" rx="14" ry="17" {...stroke} opacity={0.45} />
      <circle cx="27" cy="26" r="1.5" fill="currentColor" />
      <circle cx="37" cy="26" r="1.5" fill="currentColor" />
      {/* neutral mouth, to read as a face rather than a smile */}
      <path d="M28 32h8" {...stroke} />
      {/* emphasised jaw/chin line */}
      <path d="M18 35q14 15 28 0" {...stroke} strokeWidth={3} />
    </svg>
  );
}

function SideAngle() {
  return (
    <svg viewBox="0 0 64 64" className={svg} aria-hidden>
      {/* filled profile silhouette facing left — clearer than thin line-art */}
      <path
        d="M36 14c9 1 11 12 9 19-2 8-4 13-8 14h-7c-3-2-4-5-4-8l-6-3 6-3c0-8 3-17 10-19z"
        fill="currentColor"
        opacity={0.7}
      />
      <circle cx="30" cy="30" r="1.5" fill="#fff" />
    </svg>
  );
}

function TooDark() {
  return (
    <svg viewBox="0 0 64 64" className={svg} aria-hidden>
      <ellipse cx="32" cy="31" rx="15" ry="18" {...stroke} />
      <circle cx="26" cy="28" r="1.5" fill="currentColor" />
      {/* right half of the face in shadow → uneven / too-dark lighting */}
      <path d="M32 13a15 18 0 0 1 0 36z" fill="currentColor" opacity={0.8} />
    </svg>
  );
}

function Covered() {
  return (
    <svg viewBox="0 0 64 64" className={svg} aria-hidden>
      <ellipse cx="32" cy="31" rx="15" ry="18" {...stroke} />
      <circle cx="26" cy="28" r="1.5" fill="currentColor" />
      <circle cx="38" cy="28" r="1.5" fill="currentColor" />
      {/* hair/hand sweeping across the lower face */}
      <path d="M16 36 q16 12 32 2" {...stroke} strokeWidth={4} />
    </svg>
  );
}

const TIPS: Tip[] = [
  { ok: true, label: "Face the camera", art: <FaceOn /> },
  { ok: true, label: "Good, even light", art: <GoodLight /> },
  { ok: true, label: "Whole face in frame", art: <ChinClear /> },
  { ok: false, label: "No side angles", art: <SideAngle /> },
  { ok: false, label: "Not too dark", art: <TooDark /> },
  { ok: false, label: "Don't cover it", art: <Covered /> },
];

export function PhotoGuide() {
  return (
    <div className="rounded-[1.5rem] border border-sage/20 bg-white/55 p-4 sm:p-5">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-body/70">
        For the most accurate read
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {TIPS.map((t) => (
          <div
            key={t.label}
            className="flex flex-col items-center rounded-2xl bg-cream/50 px-1.5 py-2.5 text-center"
          >
            <div className="relative">
              <div
                className={`flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14 ${
                  t.ok ? "text-heading" : "text-heading/70"
                }`}
              >
                {t.art}
              </div>
              <span
                className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-white ${
                  t.ok ? "bg-sage-deep" : "bg-peach-deep"
                }`}
              >
                {t.ok ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
              </span>
            </div>
            <span className="mt-1.5 text-[10px] font-medium leading-tight text-heading/80 sm:text-[11px]">
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
