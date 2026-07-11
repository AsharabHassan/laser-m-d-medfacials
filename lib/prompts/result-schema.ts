// JSON schema for Claude's structured photo assessment. Deliberately simple —
// structured outputs don't support min/max/length constraints, and every object
// needs additionalProperties:false.

export const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    suitability: {
      type: "string",
      enum: ["excellent", "strong", "good", "consultation"],
      description:
        "The cosmetic suitability outcome. 'excellent' = clearly visible, treatable skin-quality concerns in LaseMD Ultra's sweet spot (pigmentation/sun damage, redness, texture/pores, fine lines, dullness) — the ideal candidate; 'strong' = visible but milder or mixed concerns; 'good' = subtle concerns, mostly glow and maintenance (still a positive outcome); 'consultation' = ONLY when the photo genuinely cannot be read. There is no rejection outcome — never tell anyone they are unsuitable.",
    },
    concernClarity: {
      type: "number",
      description:
        "0–40. How CLEARLY LaseMD-treatable skin concerns are visible (pigmentation, sun damage, redness, texture, pores, fine lines, dullness). Clear, visible concerns score HIGH — this is exactly who LaseMD Ultra helps. Near-flawless skin scores mid (glow and maintenance still benefit), never near zero. Judge ONLY from this photo, with fine gradations — avoid identical values across different faces.",
    },
    skinReadiness: {
      type: "number",
      description:
        "0–30. Apparent skin health and resilience for a gentle fractional laser. Be lenient — LaseMD Ultra tolerates most skin well; score high unless the skin looks acutely irritated or compromised. Judge only from this photo, with fine gradations.",
    },
    rejuvenationPotential: {
      type: "number",
      description:
        "0–30. How much visible improvement is realistically achievable for this face — brighter, clearer, smoother, more even. Judge only from this photo, with fine gradations.",
    },
    lowerFaceObscured: {
      type: "boolean",
      description:
        "True ONLY if a dense beard or heavy facial hair visibly covers the mouth-and-chin area or lower cheeks so that skin cannot be reliably assessed from the photo. False for clean-shaven, light stubble, or any face where the lower-face skin is visible. A beard does NOT disqualify treatment — it only limits what the photo can show; a bearded face can still be an excellent candidate on its visible skin.",
    },
    skinConcerns: {
      type: "array",
      description:
        "2–5 skin concerns you can ACTUALLY see in THIS photo, each tied to the face region where it is most visible. improvementPercent is an indicative cosmetic potential 0–100 — how much clearer, smoother or brighter that could realistically look after a course of LaseMD Ultra: a clear, visible concern 50–75; a moderate one 35–55; subtle glow-and-maintenance 20–40. observation is ONE short, observational, non-diagnostic sentence about this face. Do NOT include concerns in regions hidden by a beard. Use fine gradations so different faces differ. If the skin is genuinely clear, report dullness and/or texture as gentle glow-and-maintenance entries with modest percentages.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          concern: {
            type: "string",
            enum: ["pigmentation", "redness", "texture", "fine-lines", "dullness"],
          },
          region: {
            type: "string",
            enum: ["forehead", "under-eye", "cheeks", "nose", "perioral"],
          },
          improvementPercent: { type: "number" },
          observation: {
            type: "string",
            description:
              "One short observational sentence about this concern on THIS face, cosmetic not diagnostic, UK English.",
          },
        },
        required: ["concern", "region", "improvementPercent", "observation"],
      },
    },
    primaryConcern: {
      type: "string",
      enum: ["pigmentation", "redness", "texture", "fine-lines", "dullness"],
      description:
        "The standout concern from skinConcerns — the one most visible or most rewarding to treat for this face.",
    },
    framingAdequate: {
      type: "boolean",
      description:
        "True whenever the photo shows the face — roughly forehead to chin — well enough to assess skin quality. BE LENIENT: a normal front-facing selfie is adequate even if the lighting is ordinary or the framing imperfect. Set false ONLY when the face genuinely cannot be assessed at all: heavily cropped, an extreme angle, a face far too small to make out, or not a real front-facing photo of a face (e.g. a screenshot of text or an object). When false the person should retake their photo.",
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
        "1–3 observed skin qualities referenced in general terms (e.g. 'skin tone', 'texture around the nose', 'overall radiance').",
    },
    encouragement: {
      type: "string",
      description:
        "One reassuring sentence inviting a free consultation, noting that final suitability and safety are confirmed in person.",
    },
  },
  required: [
    "suitability",
    "concernClarity",
    "skinReadiness",
    "rejuvenationPotential",
    "lowerFaceObscured",
    "skinConcerns",
    "primaryConcern",
    "framingAdequate",
    "headline",
    "narrative",
    "observedAreas",
    "encouragement",
  ],
} as const;
