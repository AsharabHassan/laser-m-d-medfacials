// JSON schema for Claude's structured photo assessment. Deliberately simple —
// structured outputs don't support min/max/length constraints, and every object
// needs additionalProperties:false.

export const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    suitability: {
      type: "string",
      enum: ["strong", "good", "consultation", "alternative"],
      description:
        "The cosmetic suitability outcome. 'strong' = a clear, treatable lower-face concern in an Endolift target area (jawline softening, jowls, under-chin fullness, neck laxity) — the ideal candidate; 'good' = milder/subtler softening; 'consultation' = the photo can't be assessed or the case is genuinely borderline; 'alternative' = clearly excessive/heavy skin realistically needing surgery.",
    },
    laxityFit: {
      type: "number",
      description:
        "0–40. How CLEARLY a treatable lower-face concern is present (visible jawline softening, jowls, under-chin fullness, neck laxity). A clear, treatable concern scores HIGH — this is exactly who Endolift helps. Score low only when there is no visible concern at all, or the laxity is so excessive it realistically needs surgery. Judge ONLY from this photo, with fine gradations — avoid identical values across different faces.",
    },
    skinQuality: {
      type: "number",
      description:
        "0–30. Apparent skin health and resilience for an energy-based tightening treatment (healthy, even skin scores higher). Judge only from this photo, with fine gradations.",
    },
    areaFit: {
      type: "number",
      description:
        "0–30. How well the standout concern sits in an Endolift target area (jawline, jowls, under-chin, neck, mid-face). A concern squarely in these areas scores high. Judge only from this photo, with fine gradations.",
    },
    lowerFaceObscured: {
      type: "boolean",
      description:
        "True ONLY if a dense beard or heavy facial hair visibly hides the jawline, under-chin or neck so that skin cannot be reliably assessed from the photo. False for clean-shaven, light/patchy stubble, or any face where the lower-face skin is visible. A beard does NOT disqualify treatment — it only limits what the photo can show.",
    },
    areaEnhancements: {
      type: "array",
      description:
        "For each Endolift target area whose skin you can ACTUALLY see and assess in THIS photo, an indicative cosmetic enhancement potential — roughly how much firmer, smoother or more defined that area could realistically look after Endolift, as a percentage 0–100. Higher for clearly treatable concerns (55–80), modest for subtle areas (30–50), low where little is needed (20–35). Do NOT include any area hidden by a beard or not clearly visible. 1–5 items, judged from this face with fine gradations.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          area: {
            type: "string",
            enum: [
              "under-eye",
              "cheeks",
              "mid-face",
              "jawline",
              "jowls",
              "chin",
              "under-chin",
              "neck",
            ],
          },
          enhancementPercent: { type: "number" },
        },
        required: ["area", "enhancementPercent"],
      },
    },
    framingAdequate: {
      type: "boolean",
      description:
        "True only if the photo clearly shows the LOWER face — the jawline, under-chin and ideally the neck — well enough to assess for skin tightening. False if the photo shows mostly the upper/mid face, the jaw/chin/neck is cut off or out of frame, the head is at too steep an angle, the face is too small/far, or it's a screenshot or not a clean front-facing selfie. When false the person should retake their photo.",
    },
    headline: {
      type: "string",
      description: "A warm, 6–10 word headline for the result screen.",
    },
    narrative: {
      type: "string",
      description:
        "2–3 short sentences, personalized-but-careful, cosmetic not diagnostic. UK English.",
    },
    observedAreas: {
      type: "array",
      items: { type: "string" },
      description:
        "1–3 lower-face areas referenced in general terms (e.g. 'jawline', 'under-chin').",
    },
    encouragement: {
      type: "string",
      description:
        "One reassuring sentence inviting a free consultation, noting that final suitability and safety are confirmed in person.",
    },
  },
  required: [
    "suitability",
    "laxityFit",
    "skinQuality",
    "areaFit",
    "lowerFaceObscured",
    "areaEnhancements",
    "framingAdequate",
    "headline",
    "narrative",
    "observedAreas",
    "encouragement",
  ],
} as const;
