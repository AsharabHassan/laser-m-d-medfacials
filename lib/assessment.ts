import type { AnalyzeResult, Bucket, PhotoAssessment } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Maps Claude's photo assessment into the full result, and provides a safe
// generic fallback (always "consultation") for when the vision call fails.
// ─────────────────────────────────────────────────────────────────────────────

// Per-bucket display bands. Claude's raw factor sum is RESCALED into the band
// for the outcome it chose (not merely clamped): honest raw sums for a bucket
// tend to sit below its display band, and a hard clamp flattens every visitor
// in that bucket onto the band floor. Mapping the plausible raw range linearly
// onto the band keeps the number varying photo-to-photo while staying coherent
// with the verdict (and within each bucket's gauge band in lib/constants.ts).
// The floor is 62 — a result should never read as a fail.
const BANDS: Record<Bucket, [number, number]> = {
  excellent: [86, 96],
  great: [76, 89],
  good: [67, 82],
  consultation: [62, 74],
};

// The raw factor-sum range Claude realistically produces for each outcome
// (from the anchored guidance in lib/prompts/system-lasermd.ts).
const RAW_RANGE: Record<Bucket, [number, number]> = {
  excellent: [74, 97],
  great: [64, 92],
  good: [56, 86],
  consultation: [45, 78],
};

/** Rescale Claude's 0–100 raw score into the chosen bucket's display band. */
export function scoreInBucket(bucket: Bucket, score: number): number {
  const [lo, hi] = BANDS[bucket];
  if (!Number.isFinite(score)) return Math.round((lo + hi) / 2);
  const [rlo, rhi] = RAW_RANGE[bucket];
  const t = Math.max(0, Math.min(1, (score - rlo) / (rhi - rlo)));
  return Math.round(lo + t * (hi - lo));
}

/** Band midpoint — used when there's no Claude score (error fallback). */
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
    narrative: assessment.narrative,
    narrativeSource: "claude",
    usedPhoto,
    lowerFaceObscured: assessment.lowerFaceObscured,
    skinConcerns: assessment.skinConcerns,
    primaryConcern: assessment.primaryConcern,
    framingAdequate: assessment.framingAdequate,
  };
}

/** Safe default when the photo can't be analysed — routes to a consultation. */
export function genericFallbackResult(usedPhoto: boolean): AnalyzeResult {
  return {
    bucket: "consultation",
    score: scoreForBucket("consultation"),
    narrative: {
      headline: "Let's build your personalised skin protocol",
      narrative:
        "We couldn't fully read your photo this time, but that's no problem at all. The surest way to build your personalised LaseMD Ultra protocol is a quick, friendly consultation with Dr Stolte's team.",
      observedAreas: [],
      encouragement:
        "Book your free, no-pressure consultation in Truro whenever you're ready — we'll talk you through everything.",
    },
    narrativeSource: "fallback",
    usedPhoto,
    lowerFaceObscured: false,
    skinConcerns: [],
    primaryConcern: null,
    // An analysis failure isn't a framing problem — don't push a retake here.
    framingAdequate: true,
  };
}
