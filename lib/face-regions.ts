import type { NormalizedPoint } from "@/components/scan/useFaceLandmarker";

// ─────────────────────────────────────────────────────────────────────────────
// Maps the on-device MediaPipe 478-point face mesh to the lower-face regions
// Endolift treats, and turns each into a normalized crop rectangle. This is a
// presentational helper — it gives the user a focused look at their OWN areas;
// it is not a clinical measurement.
// ─────────────────────────────────────────────────────────────────────────────

export type RegionKey = "jawline" | "chin" | "neck" | "cheeks";

/** A crop rectangle in normalized (0–1) image coordinates. */
export interface NormRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RegionConfig {
  /** Landmark indices whose bounding box approximates the region. */
  indices: number[];
  /** Fraction of the bbox size padded on every side for context. */
  margin: number;
  /** Extra fraction of image height added BELOW the bbox (for chin/neck). */
  extendDown?: number;
}

// Approximate MediaPipe FaceMesh indices per region. Exact contours are not
// needed — a padded bounding box reads well as a "focused area" crop.
const REGIONS: Record<RegionKey, RegionConfig> = {
  jawline: {
    indices: [
      234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 378, 379, 365,
      397, 288, 361, 323, 454,
    ],
    margin: 0.16,
  },
  chin: {
    indices: [148, 176, 149, 150, 152, 377, 378, 379, 400, 175, 199, 200, 18],
    margin: 0.3,
    extendDown: 0.04,
  },
  neck: {
    indices: [172, 136, 150, 149, 176, 148, 152, 377, 378, 379, 365, 397],
    margin: 0.1,
    extendDown: 0.24,
  },
  cheeks: {
    indices: [
      234, 93, 132, 58, 205, 187, 123, 117, 118, 101, 100, 454, 323, 361, 288,
      425, 411, 352, 346, 347, 330, 329,
    ],
    margin: 0.12,
  },
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Compute the normalized crop rect for a region, or null if unavailable. */
export function regionRect(
  region: RegionKey,
  landmarks: NormalizedPoint[],
): NormRect | null {
  const cfg = REGIONS[region];
  const pts = cfg.indices.map((i) => landmarks[i]).filter(Boolean);
  if (pts.length < 3) return null;

  let minX = 1;
  let minY = 1;
  let maxX = 0;
  let maxY = 0;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const mw = (maxX - minX) * cfg.margin;
  const mh = (maxY - minY) * cfg.margin;
  minX -= mw;
  maxX += mw;
  minY -= mh;
  maxY += mh;
  if (cfg.extendDown) maxY += cfg.extendDown;

  minX = clamp01(minX);
  minY = clamp01(minY);
  maxX = clamp01(maxX);
  maxY = clamp01(maxY);

  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 0.04 || h < 0.04) return null; // too small to be meaningful
  return { x: minX, y: minY, w, h };
}

/**
 * Map a free-text area string from Claude's narrative (e.g. "under-chin",
 * "jawline & jowls", "neck") to a region key, or null if it isn't a region we
 * can crop.
 */
export function toRegionKey(area: string): RegionKey | null {
  const a = area.toLowerCase();
  if (a.includes("neck")) return "neck";
  if (a.includes("chin")) return "chin";
  if (a.includes("jaw") || a.includes("jowl")) return "jawline";
  if (a.includes("cheek") || a.includes("mid-face") || a.includes("mid face"))
    return "cheeks";
  return null;
}

/** Short, truthful "what Endolift does here" copy per region. No guarantees. */
export const REGION_COPY: Record<RegionKey, { title: string; blurb: string }> = {
  jawline: {
    title: "Your jawline & jowls",
    blurb:
      "Endolift gently tightens along the jawline to soften early jowls and restore a cleaner contour.",
  },
  chin: {
    title: "Your under-chin",
    blurb:
      "It firms the skin beneath the chin, easing a soft or fuller under-chin as collagen rebuilds over 3–6 months.",
  },
  neck: {
    title: "Your neck",
    blurb:
      "Collagen stimulation in the neck helps smooth and tighten crepey or loosening skin.",
  },
  cheeks: {
    title: "Your mid-face & cheeks",
    blurb:
      "Subtle lift and firmness through the mid-face, supporting the cheek area naturally.",
  },
};
