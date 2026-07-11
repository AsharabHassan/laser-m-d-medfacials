import type { NormalizedPoint } from "@/components/scan/useFaceLandmarker";
import type { ConcernKey } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Maps the on-device MediaPipe 478-point face mesh to the skin zones LaseMD
// Ultra treats, and turns each into a normalized crop rectangle and an overlay
// ellipse/centre for the premium concern map. Presentational only — it gives the
// user a focused look at their OWN areas; not a clinical measurement.
// ─────────────────────────────────────────────────────────────────────────────

export type RegionKey = "forehead" | "undereye" | "cheeks" | "nose" | "perioral";

/** A crop rectangle in normalized (0–1) image coordinates. */
export interface NormRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A highlight ellipse in normalized (0–1) image coordinates. */
export interface NormEllipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

interface RegionConfig {
  /** Landmark indices whose bounding box approximates the region (for the CROP). */
  indices: number[];
  /**
   * Tight landmark subset whose centre anchors the on-face MARKER. Distinct from
   * `indices` so each marker sits on its own area (forehead / eyes / cheeks /
   * nose / mouth) and they don't all collapse onto the mid-face centroid. Falls
   * back to `indices` when omitted.
   */
  anchorIndices?: number[];
  /** Fraction of the bbox size padded on every side for the CROP. */
  margin: number;
  /** Extra fraction of image height added BELOW the bbox (for chin coverage). */
  extendDown?: number;
  /** Extra fraction of image height added ABOVE the bbox (the mesh stops at the
   *  hairline, so the forehead crop needs headroom). */
  extendUp?: number;
  /** Multiplier applied to the anchor half-extent for the overlay ELLIPSE. */
  ellipseScale?: number;
}

// Approximate MediaPipe FaceMesh indices per region. Exact contours aren't
// needed — a padded bounding box reads well as a focused crop, and its centre
// drives the on-face marker.
const REGIONS: Record<RegionKey, RegionConfig> = {
  forehead: {
    // Hairline contour + brow line → the full forehead band.
    indices: [
      10, 338, 297, 332, 284, 251, 21, 54, 103, 67, 109, 70, 63, 105, 66, 107,
      336, 296, 334, 293, 300,
    ],
    anchorIndices: [10, 151, 9, 107, 336, 66, 296],
    margin: 0.12,
    extendUp: 0.03,
    ellipseScale: 0.85,
  },
  undereye: {
    // Lower lids + tear-trough of both eyes → a band beneath the eyes.
    indices: [
      33, 7, 163, 144, 145, 153, 154, 155, 133, 117, 118, 119, 120, 121, 47,
      263, 249, 390, 373, 374, 380, 381, 382, 362, 346, 347, 348, 349, 350, 277,
    ],
    anchorIndices: [117, 119, 346, 348, 229, 449, 33, 263],
    margin: 0.22,
    ellipseScale: 0.85,
  },
  cheeks: {
    indices: [
      234, 93, 132, 58, 205, 187, 123, 117, 118, 101, 100, 454, 323, 361, 288,
      425, 411, 352, 346, 347, 330, 329,
    ],
    anchorIndices: [205, 425, 101, 330, 36, 266, 50, 280],
    margin: 0.12,
    ellipseScale: 0.8,
  },
  nose: {
    // Bridge, tip and alae.
    indices: [
      168, 6, 197, 195, 5, 4, 1, 2, 98, 327, 129, 358, 48, 278, 64, 294, 219,
      439,
    ],
    anchorIndices: [4, 5, 1, 195, 197],
    margin: 0.2,
    ellipseScale: 0.85,
  },
  perioral: {
    // Lips + chin → the mouth-and-chin zone.
    indices: [
      61, 291, 0, 17, 37, 267, 84, 314, 91, 321, 146, 375, 405, 181, 152, 175,
      199, 200, 18,
    ],
    anchorIndices: [17, 84, 314, 18, 200, 152],
    margin: 0.18,
    extendDown: 0.02,
    ellipseScale: 0.9,
  },
};

// Per-side marker anchor groups. Bilateral areas (under-eye, cheeks) get a
// marker on EACH side so they sit on the actual feature instead of collapsing
// onto the central nose line; forehead, nose and perioral are a single central
// marker. Every marker for a region shares that region's number + card.
const REGION_MARKERS: Record<RegionKey, number[][]> = {
  forehead: [[10, 151, 9, 107, 336, 66, 296]], // central forehead
  undereye: [
    [117, 118, 119, 120, 121, 100], // right under-eye
    [346, 347, 348, 349, 350, 329], // left under-eye
  ],
  cheeks: [
    [205, 50, 123, 187, 36, 142], // right cheek
    [425, 280, 352, 411, 266, 371], // left cheek
  ],
  nose: [[4, 5, 1, 195, 197]], // nose tip + bridge
  perioral: [[17, 84, 314, 18, 200, 152]], // mouth + chin
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function rawBBox(indices: number[], landmarks: NormalizedPoint[]): BBox | null {
  const pts = indices.map((i) => landmarks[i]).filter(Boolean);
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
  return { minX, minY, maxX, maxY };
}

/** Compute the normalized crop rect for a region, or null if unavailable. */
export function regionRect(
  region: RegionKey,
  landmarks: NormalizedPoint[],
): NormRect | null {
  const cfg = REGIONS[region];
  const bb = rawBBox(cfg.indices, landmarks);
  if (!bb) return null;
  let { minX, minY, maxX, maxY } = bb;

  const mw = (maxX - minX) * cfg.margin;
  const mh = (maxY - minY) * cfg.margin;
  minX -= mw;
  maxX += mw;
  minY -= mh;
  maxY += mh;
  if (cfg.extendDown) maxY += cfg.extendDown;
  if (cfg.extendUp) minY -= cfg.extendUp;

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
 * Compute the normalized overlay ellipse (centre + radii) for a region's
 * marker. Anchored on a tight landmark subset and kept compact so the markers
 * read as precise points on each area rather than overlapping blobs.
 */
export function regionEllipse(
  region: RegionKey,
  landmarks: NormalizedPoint[],
): NormEllipse | null {
  const cfg = REGIONS[region];
  const bb = rawBBox(cfg.anchorIndices ?? cfg.indices, landmarks);
  if (!bb) return null;
  const scale = cfg.ellipseScale ?? 1;
  const cx = (bb.minX + bb.maxX) / 2;
  let cy = (bb.minY + bb.maxY) / 2;
  let rx = ((bb.maxX - bb.minX) / 2) * scale;
  let ry = ((bb.maxY - bb.minY) / 2) * scale;
  if (cfg.extendDown) {
    cy += cfg.extendDown / 2;
    ry += cfg.extendDown / 2;
  }
  if (cfg.extendUp) {
    cy -= cfg.extendUp / 2;
    ry += cfg.extendUp / 2;
  }
  // Compact, consistent marker size — never a face-swallowing blob.
  rx = Math.min(0.1, Math.max(0.04, rx));
  ry = Math.min(0.06, Math.max(0.03, ry));
  return { cx: clamp01(cx), cy: clamp01(cy), rx, ry };
}

/**
 * Compute the on-face MARKER ellipses for a region — one per anatomical side
 * (so bilateral areas sit on each eye/cheek instead of the central nose line),
 * or a single central marker for forehead/nose/perioral. Each is kept compact.
 */
export function regionMarkers(
  region: RegionKey,
  landmarks: NormalizedPoint[],
): NormEllipse[] {
  const cfg = REGIONS[region];
  const out: NormEllipse[] = [];
  for (const group of REGION_MARKERS[region]) {
    const bb = rawBBox(group, landmarks);
    if (!bb) continue;
    const cx = (bb.minX + bb.maxX) / 2;
    let cy = (bb.minY + bb.maxY) / 2;
    let rx = ((bb.maxX - bb.minX) / 2) * 1.3 + 0.012;
    let ry = ((bb.maxY - bb.minY) / 2) * 1.3 + 0.012;
    if (cfg.extendDown) {
      cy += cfg.extendDown / 2;
      ry += cfg.extendDown / 2;
    }
    if (cfg.extendUp) {
      cy -= cfg.extendUp / 2;
      ry += cfg.extendUp / 2;
    }
    rx = Math.min(0.085, Math.max(0.035, rx));
    ry = Math.min(0.055, Math.max(0.028, ry));
    out.push({ cx: clamp01(cx), cy: clamp01(cy), rx, ry });
  }
  return out;
}

/**
 * Estimate which side of the face is toward the camera, from how much cheek is
 * visible on each side of the nose. On a turned (3/4 or profile) photo the
 * far-side bilateral markers bunch up and float, so the map shows only the
 * visible-side marker per area; a roughly front-facing photo returns "both".
 */
export function faceVisibleSide(
  landmarks: NormalizedPoint[],
): "left" | "right" | "both" {
  const nose = landmarks[1];
  const leftEdge = landmarks[234]; // image-left cheek extreme
  const rightEdge = landmarks[454]; // image-right cheek extreme
  if (!nose || !leftEdge || !rightEdge) return "both";
  const leftGap = nose.x - leftEdge.x;
  const rightGap = rightEdge.x - nose.x;
  if (leftGap <= 0.01 || rightGap <= 0.01) {
    return leftGap > rightGap ? "left" : "right";
  }
  const ratio = leftGap / rightGap;
  if (ratio > 1.5) return "left"; // image-left cheek more visible
  if (ratio < 1 / 1.5) return "right"; // image-right cheek more visible
  return "both";
}

/**
 * Map a free-text region string from Claude (e.g. "under-eye", "forehead",
 * "mouth & chin") to a region key, or null if it isn't a region we can map.
 */
export function toRegionKey(area: string): RegionKey | null {
  const a = area.toLowerCase();
  if (a.includes("forehead") || a.includes("brow")) return "forehead";
  if (
    a.includes("eye") ||
    a.includes("tear") ||
    a.includes("periorbital")
  )
    return "undereye";
  if (a.includes("nose") || a.includes("nasal")) return "nose";
  if (
    a.includes("mouth") ||
    a.includes("lip") ||
    a.includes("perioral") ||
    a.includes("chin") ||
    a.includes("jaw")
  )
    return "perioral";
  if (a.includes("cheek") || a.includes("mid-face") || a.includes("mid face"))
    return "cheeks";
  return null;
}

/** Short label for the on-map marker. */
export const REGION_LABEL: Record<RegionKey, string> = {
  forehead: "Forehead",
  undereye: "Under-eye",
  cheeks: "Cheeks & mid-face",
  nose: "Nose",
  perioral: "Mouth & chin",
};

/** Anatomical top-to-bottom order for the concern map and report. */
export const REGION_ORDER: RegionKey[] = [
  "forehead",
  "undereye",
  "cheeks",
  "nose",
  "perioral",
];

/** Short, truthful "what LaseMD Ultra does here" copy per region. No guarantees. */
export const REGION_COPY: Record<RegionKey, { title: string; blurb: string }> = {
  forehead: {
    title: "Your forehead",
    blurb:
      "LaseMD Ultra resurfaces the forehead gently, smoothing fine lines and softening uneven tone as fresh collagen builds.",
  },
  undereye: {
    title: "Your under-eye area",
    blurb:
      "The gentle fractional energy refreshes the delicate skin beneath the eyes — smoothing fine, crepey texture for a brighter, more rested look.",
  },
  cheeks: {
    title: "Your cheeks & mid-face",
    blurb:
      "Across the cheeks, LaseMD Ultra evens tone, lifts dullness and refines texture — often where sun exposure shows first.",
  },
  nose: {
    title: "Your nose",
    blurb:
      "Enlarged pores and uneven texture around the nose respond well to the fine microchannels LaseMD Ultra creates.",
  },
  perioral: {
    title: "Your mouth & chin",
    blurb:
      "Around the mouth and chin, the treatment softens fine lines and refines texture for a smoother, fresher finish.",
  },
};

/** Friendly labels for each skin concern. */
export const CONCERN_LABEL: Record<ConcernKey, string> = {
  pigmentation: "Pigmentation & sun damage",
  redness: "Redness & uneven tone",
  texture: "Texture & pores",
  "fine-lines": "Fine lines",
  dullness: "Dullness & radiance",
};

/** Short, truthful "what LaseMD Ultra does for this" copy per concern. */
export const CONCERN_COPY: Record<ConcernKey, { title: string; blurb: string }> =
  {
    pigmentation: {
      title: "Pigmentation & sun damage",
      blurb:
        "LaseMD Ultra targets excess pigment, gently lifting sun spots and areas of deeper tone to reveal a clearer, more even complexion.",
    },
    redness: {
      title: "Redness & uneven tone",
      blurb:
        "The gentle thulium laser calms persistent redness and evens overall tone, helping skin look settled and balanced.",
    },
    texture: {
      title: "Texture & pores",
      blurb:
        "Fine microchannels renew the skin's surface — tightening enlarged pores and smoothing rough or uneven texture.",
    },
    "fine-lines": {
      title: "Fine lines",
      blurb:
        "By stimulating your skin's own collagen, LaseMD Ultra softens fine lines and early creasing over the weeks after treatment.",
    },
    dullness: {
      title: "Dullness & radiance",
      blurb:
        "Fresh skin renewal restores clarity and glow — the baby-soft brightness LaseMD Ultra is known for, visible from the first session.",
    },
  };
