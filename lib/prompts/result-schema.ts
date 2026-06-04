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
        "The cosmetic suitability outcome. 'strong' = clearly mild laxity, ideal; 'good' = mild-to-moderate; 'consultation' = unclear photo or more pronounced laxity needing in-person review; 'alternative' = clearly heavy/loose skin better suited to another approach. When unsure, choose 'consultation'.",
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
  required: ["suitability", "headline", "narrative", "observedAreas", "encouragement"],
} as const;
