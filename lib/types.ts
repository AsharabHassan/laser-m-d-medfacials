// ─────────────────────────────────────────────────────────────────────────────
// Domain model for the Endolift Suitability Analyzer.
// The scoring engine (lib/scoring.ts) is authoritative over `Bucket`; Claude only
// ever writes narrative copy — it never decides suitability.
// ─────────────────────────────────────────────────────────────────────────────

/** The four suitability outcomes. Never a flat "you don't qualify". */
export type Bucket = "great" | "good" | "consultation" | "alternative";

/** Areas of concern a respondent can select. */
export type AreaId =
  | "jawline"
  | "chin"
  | "neck"
  | "cheeks"
  | "undereye"
  | "body";

/** Medical conditions screened in the contraindication question. */
export type ConditionId =
  | "infection"
  | "bloodThinners"
  | "autoimmune"
  | "photosensitivity"
  | "keloid"
  | "systemic"
  | "none";

/** Structured, typed answers produced by the quiz. */
export interface QuizAnswers {
  laxity: "firm" | "early" | "noticeable" | "severe" | "unsure";
  areas: AreaId[];
  age: "under25" | "25-35" | "36-45" | "46-55" | "56-65" | "over65";
  skin: "healthy" | "thin-sun" | "very-thin";
  pregnant: "yes" | "no";
  conditions: ConditionId[];
  smoker: "no" | "willing" | "not-willing";
  recentTreatment: "no" | "yes";
  expectation: "subtle" | "moderate" | "dramatic";
  goodHealth: "yes" | "partly" | "no";
}

/** Machine-readable reason a hard flag fired. */
export type HardFlag =
  | "pregnancy"
  | "active-infection"
  | "medical-condition"
  | "severe-laxity"
  | "dramatic-expectation"
  | "poor-health";

/** Output of the deterministic scoring engine. */
export interface ScoreResult {
  bucket: Bucket;
  /** 0–100 normalized suitability score (presentational). */
  score: number;
  hardFlags: HardFlag[];
  /** True when a soft flag forced a consultation routing. */
  softFlagged: boolean;
  /** Short, human-readable reason for the routing (used as a fallback narrative seed). */
  routedReason: string;
}

/** The narrative portion Claude is allowed to author (no bucket, no score). */
export interface ClaudeNarrative {
  headline: string;
  /** 2–3 short paragraphs, personalized-but-careful, cosmetic not diagnostic. */
  narrative: string;
  /** Areas Claude observed/affirmed, phrased in general terms. */
  observedAreas: string[];
  encouragement: string;
}

/** The full result returned by /api/analyze and rendered on the result screen. */
export interface AnalyzeResult extends ScoreResult {
  narrative: ClaudeNarrative;
  /** Whether the narrative came from Claude or the deterministic fallback. */
  narrativeSource: "claude" | "fallback";
  /** True when a photo was analyzed (vs. quiz-only path). */
  usedPhoto: boolean;
}

/** Lead captured at the gate. */
export interface Lead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Separate PECR marketing consent. */
  marketingConsent: boolean;
}

/** Request body for POST /api/analyze. */
export interface AnalyzeRequest {
  imageBase64: string | null;
  imageMediaType?: "image/jpeg" | "image/png" | "image/webp";
  /** Explicit consent to process the face image. Required when imageBase64 present. */
  imageConsent: boolean;
}

/** Claude's raw assessment of the photo: a cosmetic suitability read + narrative. */
export interface PhotoAssessment {
  /** The suitability outcome Claude chose, mapped to a Bucket server-side. */
  suitability: Bucket;
  narrative: ClaudeNarrative;
}

/** Request body for POST /api/lead. */
export interface LeadRequest {
  lead: Lead;
  result: AnalyzeResult;
}
