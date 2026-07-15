import { describe, it, expect } from "vitest";
import { buildGhlPayload } from "@/lib/ghl";
import type { AnalyzeResult, Lead } from "@/lib/types";

const lead: Lead = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "07700900123",
  marketingConsent: true,
};

const result: AnalyzeResult = {
  bucket: "excellent",
  score: 91,
  usedPhoto: true,
  lowerFaceObscured: false,
  skinConcerns: [
    {
      concern: "pigmentation",
      region: "cheeks",
      improvementPercent: 62,
      observation: "Scattered pigmentation across the upper cheeks.",
    },
    {
      concern: "texture",
      region: "nose",
      improvementPercent: 48,
      observation: "Slightly enlarged pores around the nose.",
    },
    {
      concern: "pigmentation",
      region: "forehead",
      improvementPercent: 55,
      observation: "Some sun-touched tone across the forehead.",
    },
  ],
  primaryConcern: "pigmentation",
  framingAdequate: true,
  narrativeSource: "claude",
  narrative: {
    headline: "LaseMD Ultra looks like an excellent fit",
    narrative: "…",
    observedAreas: ["skin tone", "texture"],
    encouragement: "…",
  },
};

describe("buildGhlPayload", () => {
  it("maps contact fields", () => {
    const p = buildGhlPayload(lead, result, "2026-07-11T10:00:00.000Z");
    expect(p.firstName).toBe("Jane");
    expect(p.lastName).toBe("Doe");
    expect(p.name).toBe("Jane Doe");
    expect(p.email).toBe("jane@example.com");
    expect(p.phone).toBe("07700900123");
    expect(p.source).toBe("LaserMD Suitability Analyzer");
  });

  it("tags the lead with the bucket for AI-agent routing", () => {
    const p = buildGhlPayload(lead, result, "2026-07-11T10:00:00.000Z");
    expect(p.tags).toContain("lasermd-analyzer");
    expect(p.tags).toContain("lasermd-excellent");
  });

  it("always tags voucher eligibility for the GHL booking automation", () => {
    const p = buildGhlPayload(lead, result, "t");
    expect(p.tags).toContain("lasermd-voucher-eligible");
  });

  it("tags the primary concern for follow-up routing", () => {
    const p = buildGhlPayload(lead, result, "t");
    expect(p.tags).toContain("lasermd-concern-pigmentation");

    const noConcern = buildGhlPayload(
      lead,
      { ...result, primaryConcern: null, skinConcerns: [] },
      "t",
    );
    expect(noConcern.tags.some((t) => t.startsWith("lasermd-concern-"))).toBe(
      false,
    );
  });

  it("carries the suitability fields", () => {
    const p = buildGhlPayload(lead, result, "2026-07-11T10:00:00.000Z");
    expect(p.suitabilityBucket).toBe("excellent");
    expect(p.suitabilityScore).toBe(91);
    expect(p.suitabilityLabel).toBe("Excellent candidate");
    expect(p.usedPhoto).toBe(true);
    expect(p.primaryConcern).toBe("pigmentation");
    expect(p.concerns).toEqual(["pigmentation", "texture"]); // deduped, in order
    expect(p.observedAreas).toEqual(["skin tone", "texture"]);
    expect(p.submittedAt).toBe("2026-07-11T10:00:00.000Z");
  });

  it("flattens arrays to comma-separated strings for GHL field mapping", () => {
    const p = buildGhlPayload(lead, result, "t");
    expect(p.concernsText).toBe("pigmentation, texture");
    expect(p.observedAreasText).toBe("skin tone, texture");
    expect(p.tagsText).toBe(
      "lasermd-analyzer, lasermd-excellent, lasermd-voucher-eligible, lasermd-concern-pigmentation",
    );
  });

  it("records marketing consent as its own boolean, separate from the lead", () => {
    const granted = buildGhlPayload(lead, result, "t");
    expect(granted.marketingConsent).toBe(true);

    const declined = buildGhlPayload(
      { ...lead, marketingConsent: false },
      result,
      "t",
    );
    expect(declined.marketingConsent).toBe(false);
  });

  it("tags consultation-routed leads with their bucket", () => {
    const p = buildGhlPayload(lead, {
      ...result,
      bucket: "consultation",
    });
    expect(p.suitabilityBucket).toBe("consultation");
    expect(p.tags).toContain("lasermd-consultation");
  });
});
