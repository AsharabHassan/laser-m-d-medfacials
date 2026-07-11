import { describe, it, expect } from "vitest";
import {
  buildResult,
  genericFallbackResult,
  scoreForBucket,
  scoreInBucket,
} from "@/lib/assessment";
import type { Bucket, PhotoAssessment } from "@/lib/types";

const BUCKETS: Bucket[] = ["excellent", "great", "good", "consultation"];

function assessment(overrides: Partial<PhotoAssessment> = {}): PhotoAssessment {
  return {
    suitability: "excellent",
    score: 91,
    lowerFaceObscured: false,
    skinConcerns: [
      {
        concern: "pigmentation",
        region: "cheeks",
        improvementPercent: 60,
        observation: "Some scattered pigmentation across the cheeks.",
      },
    ],
    primaryConcern: "pigmentation",
    framingAdequate: true,
    narrative: {
      headline: "An excellent match for LaseMD Ultra",
      narrative: "n",
      observedAreas: ["skin tone"],
      encouragement: "e",
    },
    ...overrides,
  };
}

describe("score bands (never-reject)", () => {
  it("never scores below 62 for any bucket", () => {
    for (const bucket of BUCKETS) {
      expect(scoreInBucket(bucket, 0)).toBeGreaterThanOrEqual(62);
      expect(scoreForBucket(bucket)).toBeGreaterThanOrEqual(62);
    }
  });

  it("caps every bucket at or below 96", () => {
    for (const bucket of BUCKETS) {
      expect(scoreInBucket(bucket, 100)).toBeLessThanOrEqual(96);
    }
  });

  it("keeps an in-band Claude score untouched", () => {
    expect(scoreInBucket("excellent", 91)).toBe(91);
    expect(scoreInBucket("great", 80)).toBe(80);
    expect(scoreInBucket("good", 70)).toBe(70);
    expect(scoreInBucket("consultation", 65)).toBe(65);
  });

  it("clamps an out-of-band score into the bucket band", () => {
    expect(scoreInBucket("excellent", 55)).toBe(86);
    expect(scoreInBucket("good", 99)).toBe(82);
  });

  it("falls back to the band midpoint when the score is NaN", () => {
    expect(scoreInBucket("great", NaN)).toBe(scoreForBucket("great"));
  });

  it("orders buckets so better outcomes can always show higher scores", () => {
    expect(scoreInBucket("excellent", 100)).toBeGreaterThan(
      scoreInBucket("great", 100),
    );
    expect(scoreInBucket("great", 100)).toBeGreaterThan(
      scoreInBucket("good", 100),
    );
    expect(scoreInBucket("good", 100)).toBeGreaterThan(
      scoreInBucket("consultation", 100),
    );
  });
});

describe("buildResult", () => {
  it("passes skin concerns and the primary concern through", () => {
    const r = buildResult(assessment(), true);
    expect(r.skinConcerns).toHaveLength(1);
    expect(r.skinConcerns[0].concern).toBe("pigmentation");
    expect(r.primaryConcern).toBe("pigmentation");
    expect(r.narrativeSource).toBe("claude");
    expect(r.usedPhoto).toBe(true);
  });

  it("clamps the score into the chosen bucket's band", () => {
    const r = buildResult(assessment({ suitability: "good", score: 99 }), true);
    expect(r.bucket).toBe("good");
    expect(r.score).toBeLessThanOrEqual(82);
    expect(r.score).toBeGreaterThanOrEqual(67);
  });
});

describe("genericFallbackResult", () => {
  it("routes to a consultation with a safe, on-brand narrative", () => {
    const r = genericFallbackResult(true);
    expect(r.bucket).toBe("consultation");
    expect(r.narrativeSource).toBe("fallback");
    expect(r.skinConcerns).toEqual([]);
    expect(r.primaryConcern).toBeNull();
    expect(r.score).toBeGreaterThanOrEqual(62);
    // An analysis failure isn't a framing problem — never push a retake here.
    expect(r.framingAdequate).toBe(true);
  });
});
