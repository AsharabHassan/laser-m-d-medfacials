import type { AnalyzeResult, Lead } from "./types";
import { BUCKET_META } from "./constants";

// ─────────────────────────────────────────────────────────────────────────────
// Pure builder for the GoHighLevel inbound-webhook payload. No network here —
// the route owns delivery/retry. Marketing consent is carried as its own field,
// deliberately separate from the lead's intent to see their result (PECR).
// The `lasermd-voucher-eligible` tag lets the GHL voucher automation fire when
// an in-clinic appointment is booked; the concern tag drives follow-up routing.
//
// Every array is ALSO emitted as a comma-separated string (`*Text`): GHL's
// inbound-webhook mapper can't map a JSON array into a plain text custom field,
// so the flattened strings are what you map into contact fields. The arrays stay
// for GHL's native tag handling and any structured downstream use.
// ─────────────────────────────────────────────────────────────────────────────

export interface GhlPayload {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  tags: string[];
  /** Flattened `tags` for text-field mapping in GHL, e.g. "lasermd-analyzer, …". */
  tagsText: string;
  suitabilityBucket: string;
  suitabilityLabel: string;
  suitabilityScore: number;
  primaryConcern: string | null;
  concerns: string[];
  /** Flattened `concerns` for text-field mapping in GHL, e.g. "pigmentation, texture". */
  concernsText: string;
  observedAreas: string[];
  /** Flattened `observedAreas` for text-field mapping in GHL. */
  observedAreasText: string;
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
  const observedAreas = result.narrative.observedAreas;
  const tags = [
    "lasermd-analyzer",
    `lasermd-${result.bucket}`,
    "lasermd-voucher-eligible",
    ...(result.primaryConcern
      ? [`lasermd-concern-${result.primaryConcern}`]
      : []),
  ];
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    name: `${lead.firstName} ${lead.lastName}`.trim(),
    email: lead.email,
    phone: lead.phone,
    source: "LaserMD Suitability Analyzer",
    tags,
    tagsText: tags.join(", "),
    suitabilityBucket: result.bucket,
    suitabilityLabel: BUCKET_META[result.bucket].label,
    suitabilityScore: result.score,
    primaryConcern: result.primaryConcern,
    concerns,
    concernsText: concerns.join(", "),
    observedAreas,
    observedAreasText: observedAreas.join(", "),
    usedPhoto: result.usedPhoto,
    narrativeSource: result.narrativeSource,
    headline: result.narrative.headline,
    marketingConsent: lead.marketingConsent,
    submittedAt,
  };
}
