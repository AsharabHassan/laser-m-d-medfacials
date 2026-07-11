// ─────────────────────────────────────────────────────────────────────────────
// Domain model for the LaserMD Suitability Analyzer (Lutronic LaseMD Ultra).
// Claude Vision chooses the suitability outcome and identifies the visible skin
// concerns; the server clamps the score into the outcome's display band.
// ─────────────────────────────────────────────────────────────────────────────

/** The four suitability outcomes. Never a flat "you don't qualify". */
export type Bucket = "excellent" | "great" | "good" | "consultation";

/** Skin concerns LaseMD Ultra treats, as identified from the photo. */
export type ConcernKey =
  | "pigmentation"
  | "redness"
  | "texture"
  | "fine-lines"
  | "dullness";

/** A single skin concern Claude observed, tied to a face region. */
export interface SkinConcern {
  concern: ConcernKey;
  /** The face region where the concern is most visible (RegionKey). */
  region: string;
  /** Indicative cosmetic improvement potential (0–100), clamped server-side. */
  improvementPercent: number;
  /** One short, observational, non-diagnostic sentence about THIS face. */
  observation: string;
}

/** The narrative portion Claude authors alongside the structured read. */
export interface ClaudeNarrative {
  headline: string;
  /** 2–3 short sentences, personalized-but-careful, cosmetic not diagnostic. */
  narrative: string;
  /** Concerns Claude observed, phrased in general terms. */
  observedAreas: string[];
  encouragement: string;
}

/** The full result returned by /api/analyze and rendered on the result screen. */
export interface AnalyzeResult {
  bucket: Bucket;
  /** 0–100 suitability score, clamped into the bucket's display band. */
  score: number;
  narrative: ClaudeNarrative;
  /** Whether the narrative came from Claude or the deterministic fallback. */
  narrativeSource: "claude" | "fallback";
  /** True when a photo was analyzed. */
  usedPhoto: boolean;
  /** True when a dense beard hides the perioral/lower-cheek skin from the read. */
  lowerFaceObscured: boolean;
  /** The visible skin concerns, each tied to a face region. */
  skinConcerns: SkinConcern[];
  /** The standout concern, or null when none was identified. */
  primaryConcern: ConcernKey | null;
  /** False when the photo doesn't clearly show the face — prompt a retake. */
  framingAdequate: boolean;
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
  /** Claude's 0–100 suitability score for this face; clamped to the bucket band. */
  score: number;
  narrative: ClaudeNarrative;
  /** True when a dense beard hides the perioral/lower-cheek skin from the read. */
  lowerFaceObscured: boolean;
  skinConcerns: SkinConcern[];
  primaryConcern: ConcernKey | null;
  /** False when the photo doesn't clearly show the face — prompt a retake. */
  framingAdequate: boolean;
}

/** Request body for POST /api/lead. */
export interface LeadRequest {
  lead: Lead;
  result: AnalyzeResult;
}
