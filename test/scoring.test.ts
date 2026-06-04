import { describe, it, expect } from "vitest";
import { scoreSuitability } from "@/lib/scoring";
import type { QuizAnswers } from "@/lib/types";

/** An ideal "great candidate" baseline; override per test. */
function ideal(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    laxity: "firm",
    areas: ["jawline", "chin"],
    age: "46-55",
    skin: "healthy",
    pregnant: "no",
    conditions: ["none"],
    smoker: "no",
    recentTreatment: "no",
    expectation: "subtle",
    goodHealth: "yes",
    ...overrides,
  };
}

describe("scoreSuitability — happy paths", () => {
  it("routes an ideal profile to 'great' with a high score", () => {
    const r = scoreSuitability(ideal());
    expect(r.bucket).toBe("great");
    expect(r.hardFlags).toHaveLength(0);
    expect(r.softFlagged).toBe(false);
    expect(r.score).toBeGreaterThanOrEqual(80);
    expect(r.score).toBeLessThanOrEqual(100);
  });

  it("routes a moderate-laxity, no-flag profile to 'good'", () => {
    const r = scoreSuitability(ideal({ laxity: "noticeable" }));
    expect(r.bucket).toBe("good");
    expect(r.softFlagged).toBe(false);
    expect(r.score).toBeGreaterThanOrEqual(60);
    expect(r.score).toBeLessThan(80);
  });
});

describe("scoreSuitability — hard flags override everything", () => {
  it("pregnancy routes to consultation regardless of an otherwise ideal profile", () => {
    const r = scoreSuitability(ideal({ pregnant: "yes" }));
    expect(r.bucket).toBe("consultation");
    expect(r.hardFlags).toContain("pregnancy");
  });

  it("severe laxity routes to 'alternative'", () => {
    const r = scoreSuitability(ideal({ laxity: "severe" }));
    expect(r.bucket).toBe("alternative");
    expect(r.hardFlags).toContain("severe-laxity");
  });

  it("active infection routes to consultation", () => {
    const r = scoreSuitability(ideal({ conditions: ["infection"] }));
    expect(r.bucket).toBe("consultation");
    expect(r.hardFlags).toContain("active-infection");
  });

  it("a medical condition (blood thinners) routes to consultation", () => {
    const r = scoreSuitability(ideal({ conditions: ["bloodThinners"] }));
    expect(r.bucket).toBe("consultation");
    expect(r.hardFlags).toContain("medical-condition");
  });

  it("dramatic expectations route to consultation", () => {
    const r = scoreSuitability(ideal({ expectation: "dramatic" }));
    expect(r.bucket).toBe("consultation");
    expect(r.hardFlags).toContain("dramatic-expectation");
  });

  it("poor health routes to consultation", () => {
    const r = scoreSuitability(ideal({ goodHealth: "no" }));
    expect(r.bucket).toBe("consultation");
    expect(r.hardFlags).toContain("poor-health");
  });

  it("a safety (consultation) flag takes priority over severe laxity's alternative routing", () => {
    const r = scoreSuitability(
      ideal({ laxity: "severe", conditions: ["autoimmune"] }),
    );
    expect(r.bucket).toBe("consultation");
    expect(r.hardFlags).toEqual(
      expect.arrayContaining(["severe-laxity", "medical-condition"]),
    );
  });
});

describe("scoreSuitability — soft flags route to consultation", () => {
  it("over-65 (soft flag) routes an otherwise strong profile to consultation", () => {
    const r = scoreSuitability(ideal({ age: "over65" }));
    expect(r.bucket).toBe("consultation");
    expect(r.softFlagged).toBe(true);
    expect(r.hardFlags).toHaveLength(0);
  });

  it("under-eye area selection is a soft flag", () => {
    const r = scoreSuitability(ideal({ areas: ["undereye"] }));
    expect(r.bucket).toBe("consultation");
    expect(r.softFlagged).toBe(true);
  });

  it("thin/sun-damaged skin is a soft flag", () => {
    const r = scoreSuitability(ideal({ skin: "thin-sun" }));
    expect(r.bucket).toBe("consultation");
    expect(r.softFlagged).toBe(true);
  });
});

describe("scoreSuitability — invariants", () => {
  it("never returns a bucket outside the four allowed values", () => {
    const r = scoreSuitability(ideal());
    expect(["great", "good", "consultation", "alternative"]).toContain(
      r.bucket,
    );
  });

  it("always produces a routedReason string", () => {
    expect(scoreSuitability(ideal()).routedReason.length).toBeGreaterThan(0);
    expect(
      scoreSuitability(ideal({ pregnant: "yes" })).routedReason.length,
    ).toBeGreaterThan(0);
  });

  it("clamps score to the 0–100 range for every outcome", () => {
    for (const a of [
      ideal(),
      ideal({ laxity: "noticeable" }),
      ideal({ pregnant: "yes" }),
      ideal({ laxity: "severe" }),
      ideal({ age: "over65" }),
    ]) {
      const r = scoreSuitability(a);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
});
