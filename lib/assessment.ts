import type { AnalyzeResult, Bucket, PhotoAssessment } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Maps Claude's photo assessment into the full result, and provides a safe
// generic fallback (always "consultation") for when the vision call fails.
// ─────────────────────────────────────────────────────────────────────────────

// Per-bucket display bands. Claude's raw score is clamped into the band for the
// outcome it chose, so the number varies photo-to-photo while staying coherent
// with the verdict (and within each bucket's gauge band in lib/constants.ts).
const BANDS: Record<Bucket, [number, number]> = {
  great: [80, 99],
  good: [62, 86],
  consultation: [50, 74],
  alternative: [38, 62],
};

/** Clamp Claude's 0–100 score into the chosen bucket's band. */
export function scoreInBucket(bucket: Bucket, score: number): number {
  const [lo, hi] = BANDS[bucket];
  if (!Number.isFinite(score)) return Math.round((lo + hi) / 2);
  return Math.max(lo, Math.min(hi, Math.round(score)));
}

/** Band midpoint — used when there's no Claude score (no-photo / error fallback). */
export function scoreForBucket(bucket: Bucket): number {
  const [lo, hi] = BANDS[bucket];
  return Math.round((lo + hi) / 2);
}

export function buildResult(
  assessment: PhotoAssessment,
  usedPhoto: boolean,
): AnalyzeResult {
  return {
    bucket: assessment.suitability,
    score: scoreInBucket(assessment.suitability, assessment.score),
    hardFlags: [],
    softFlagged: false,
    routedReason: "",
    narrative: assessment.narrative,
    narrativeSource: "claude",
    usedPhoto,
  };
}

/** Safe default when the photo can't be analysed — routes to a consultation. */
export function genericFallbackResult(usedPhoto: boolean): AnalyzeResult {
  return {
    bucket: "consultation",
    score: scoreForBucket("consultation"),
    hardFlags: [],
    softFlagged: false,
    routedReason: "",
    narrative: {
      headline: "Let's confirm your fit in person",
      narrative:
        "We couldn't fully read your photo this time, but that's no problem at all. The surest way to know whether Endolift is right for you is a quick look in person with Dr Stolte's team.",
      observedAreas: [],
      encouragement:
        "Book your free, no-pressure consultation in Truro whenever you're ready — we'll talk you through everything.",
    },
    narrativeSource: "fallback",
    usedPhoto,
  };
}
