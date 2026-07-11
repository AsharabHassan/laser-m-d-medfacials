import type { AnalyzeResult, Lead } from "./types";
import { BUCKET_META } from "./constants";

// ─────────────────────────────────────────────────────────────────────────────
// Pure builder for the GoHighLevel inbound-webhook payload. No network here —
// the route owns delivery/retry. Marketing consent is carried as its own field,
// deliberately separate from the lead's intent to see their result (PECR).
// The `lasermd-voucher-eligible` tag lets the GHL voucher automation fire when
// an in-clinic appointment is booked; the concern tag drives follow-up routing.
// ─────────────────────────────────────────────────────────────────────────────

export interface GhlPayload {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  tags: string[];
  suitabilityBucket: string;
  suitabilityLabel: string;
  suitabilityScore: number;
  primaryConcern: string | null;
  concerns: string[];
  observedAreas: string[];
  usedPhoto: boolean;
  narrativeSource: string;
  headline: string;
  marketingConsent: boolean;
  submittedAt?: string;
}

export function buildGhlPayload(
  lead: Lead,
  result: AnalyzeResult,
  submittedAt?: string,
): GhlPayload {
  const concerns = [...new Set(result.skinConcerns.map((c) => c.concern))];
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    source: "LaserMD Suitability Analyzer",
    tags: [
      "lasermd-analyzer",
      `lasermd-${result.bucket}`,
      "lasermd-voucher-eligible",
      ...(result.primaryConcern
        ? [`lasermd-concern-${result.primaryConcern}`]
        : []),
    ],
    suitabilityBucket: result.bucket,
    suitabilityLabel: BUCKET_META[result.bucket].label,
    suitabilityScore: result.score,
    primaryConcern: result.primaryConcern,
    concerns,
    observedAreas: result.narrative.observedAreas,
    usedPhoto: result.usedPhoto,
    narrativeSource: result.narrativeSource,
    headline: result.narrative.headline,
    marketingConsent: lead.marketingConsent,
    submittedAt,
  };
}
