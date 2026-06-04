import type {
  Bucket,
  HardFlag,
  QuizAnswers,
  ScoreResult,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic, AUTHORITATIVE suitability engine.
//
// Safety model:
//   1. HARD FLAGS (pregnancy, infection, medical conditions, severe laxity,
//      dramatic expectations, poor health) override all scoring. Consultation-
//      type flags take priority over the "alternative" (surgical referral)
//      routing, because a clinician must review.
//   2. SOFT FLAGS (delicate areas, age extremes, fragile skin, smoking, recent
//      treatments, partial health) route an otherwise-strong profile to a
//      consultation. They never produce a flat rejection.
//   3. Only a clean, no-flag profile can reach "great" or "good".
//
// Nothing here calls a model or the network — it is pure and fully testable.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RAW = 17;

const REASONS: Record<HardFlag, string> = {
  pregnancy:
    "We recommend revisiting Endolift after pregnancy and breastfeeding — it isn't advised during this time.",
  "active-infection":
    "An active skin concern in the treatment area should settle first; your clinician will advise on timing.",
  "medical-condition":
    "One of your answers needs a quick clinical review for safety before treatment.",
  "severe-laxity":
    "Your answers suggest more advanced laxity, which a different approach may address more effectively.",
  "dramatic-expectation":
    "For the dramatic change you're after, it's best to discuss all your options in person.",
  "poor-health":
    "A brief health review with the team will make sure any treatment is right and safe for you.",
};

/** Conditions (other than 'none' and 'infection') that require clinician review. */
const MEDICAL_CONDITIONS = new Set([
  "bloodThinners",
  "autoimmune",
  "photosensitivity",
  "keloid",
  "systemic",
]);

function laxityPoints(v: QuizAnswers["laxity"]): number {
  switch (v) {
    case "firm":
      return 4;
    case "early":
      return 3;
    case "noticeable":
      return 2;
    case "unsure":
      return 1;
    default:
      return 0; // severe is a hard flag
  }
}

function agePoints(v: QuizAnswers["age"]): number {
  switch (v) {
    case "36-45":
    case "46-55":
      return 3;
    case "56-65":
      return 2;
    case "25-35":
    case "over65":
      return 1;
    default:
      return 0; // under25
  }
}

function skinPoints(v: QuizAnswers["skin"]): number {
  return v === "healthy" ? 2 : v === "thin-sun" ? 1 : 0;
}

function expectationPoints(v: QuizAnswers["expectation"]): number {
  return v === "subtle" ? 3 : v === "moderate" ? 2 : 0;
}

const CORE_AREAS = new Set(["jawline", "chin", "neck", "cheeks"]);

/** Map a raw point total + bucket to a presentational 0–100 score. */
function scoreFor(bucket: Bucket, raw: number): number {
  const mapped = Math.round((raw / MAX_RAW) * 100);
  const clamp = (n: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, n));
  switch (bucket) {
    case "great":
      return clamp(mapped, 82, 98);
    case "good":
      return clamp(mapped, 62, 79);
    case "consultation":
      return 52;
    case "alternative":
      return 42;
  }
}

export function scoreSuitability(answers: QuizAnswers): ScoreResult {
  // ── 1. Hard flags ──────────────────────────────────────────────────────────
  const hardFlags: HardFlag[] = [];
  if (answers.pregnant === "yes") hardFlags.push("pregnancy");
  if (answers.conditions.includes("infection"))
    hardFlags.push("active-infection");
  if (answers.conditions.some((c) => MEDICAL_CONDITIONS.has(c)))
    hardFlags.push("medical-condition");
  if (answers.laxity === "severe") hardFlags.push("severe-laxity");
  if (answers.expectation === "dramatic")
    hardFlags.push("dramatic-expectation");
  if (answers.goodHealth === "no") hardFlags.push("poor-health");

  const consultationFlags: HardFlag[] = [
    "pregnancy",
    "active-infection",
    "medical-condition",
    "dramatic-expectation",
    "poor-health",
  ];

  if (hardFlags.length > 0) {
    // Safety routing (consultation) wins over the surgical-alternative routing.
    const needsConsult = hardFlags.some((f) => consultationFlags.includes(f));
    const bucket: Bucket = needsConsult ? "consultation" : "alternative";
    // Reason: lead with the most relevant flag for the bucket.
    const primary = needsConsult
      ? hardFlags.find((f) => consultationFlags.includes(f))!
      : "severe-laxity";
    return {
      bucket,
      score: scoreFor(bucket, 0),
      hardFlags,
      softFlagged: false,
      routedReason: REASONS[primary],
    };
  }

  // ── 2. Soft flags ───────────────────────────────────────────────────────────
  const softFlagged =
    answers.laxity === "unsure" ||
    answers.areas.includes("undereye") ||
    answers.areas.includes("body") ||
    answers.age === "under25" ||
    answers.age === "over65" ||
    answers.skin === "thin-sun" ||
    answers.skin === "very-thin" ||
    answers.smoker !== "no" ||
    answers.recentTreatment === "yes" ||
    answers.goodHealth === "partly";

  // ── 3. Soft score ───────────────────────────────────────────────────────────
  let raw = 0;
  raw += laxityPoints(answers.laxity);
  raw += agePoints(answers.age);
  raw += skinPoints(answers.skin);
  raw += expectationPoints(answers.expectation);
  raw += answers.areas.some((a) => CORE_AREAS.has(a)) ? 1 : 0;
  raw += answers.smoker === "no" ? 1 : 0;
  raw += answers.recentTreatment === "no" ? 1 : 0;
  raw += answers.goodHealth === "yes" ? 2 : answers.goodHealth === "partly" ? 1 : 0;

  let bucket: Bucket;
  let routedReason: string;
  if (softFlagged) {
    bucket = "consultation";
    routedReason =
      "You're a promising candidate — a couple of your answers are simply best confirmed in a quick consultation.";
  } else if (raw >= 16) {
    bucket = "great";
    routedReason =
      "Your answers point to exactly the kind of early-to-moderate firmness Endolift addresses well.";
  } else {
    bucket = "good";
    routedReason =
      "You show many of the signs that respond well to Endolift; a consultation will confirm the finer detail.";
  }

  return {
    bucket,
    score: scoreFor(bucket, raw),
    hardFlags,
    softFlagged,
    routedReason,
  };
}
