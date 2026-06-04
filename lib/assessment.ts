import type { AnalyzeResult, Bucket, PhotoAssessment } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Maps Claude's photo assessment into the full result, and provides a safe
// generic fallback (always "consultation") for when the vision call fails.
// ─────────────────────────────────────────────────────────────────────────────

export function scoreForBucket(bucket: Bucket): number {
  switch (bucket) {
    case "great":
      return 90;
    case "good":
      return 72;
    case "consultation":
      return 54;
    case "alternative":
      return 44;
  }
}

export function buildResult(
  assessment: PhotoAssessment,
  usedPhoto: boolean,
): AnalyzeResult {
  return {
    bucket: assessment.suitability,
    score: scoreForBucket(assessment.suitability),
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
