import { describe, it, expect } from "vitest";
import {
  regionRect,
  regionMarkers,
  toRegionKey,
  REGION_ORDER,
  CONCERN_COPY,
  CONCERN_LABEL,
  REGION_COPY,
  REGION_LABEL,
  type RegionKey,
} from "@/lib/face-regions";
import type { NormalizedPoint } from "@/components/scan/useFaceLandmarker";

// A synthetic 478-point mesh: points spread over a face-like oval in the middle
// of the frame. Not anatomically exact — enough for geometric sanity checks.
function syntheticLandmarks(): NormalizedPoint[] {
  const pts: NormalizedPoint[] = [];
  for (let i = 0; i < 478; i++) {
    const a = (i / 478) * Math.PI * 2;
    const r = 0.18 + 0.12 * ((i * 7919) % 100) / 100; // deterministic spread
    pts.push({
      x: 0.5 + Math.cos(a) * r * 0.8,
      y: 0.45 + Math.sin(a) * r,
      z: 0,
    });
  }
  return pts;
}

describe("toRegionKey", () => {
  it("maps Claude's region strings onto our five zones", () => {
    expect(toRegionKey("forehead")).toBe("forehead");
    expect(toRegionKey("brow area")).toBe("forehead");
    expect(toRegionKey("under-eye")).toBe("undereye");
    expect(toRegionKey("tear trough")).toBe("undereye");
    expect(toRegionKey("cheeks")).toBe("cheeks");
    expect(toRegionKey("mid-face")).toBe("cheeks");
    expect(toRegionKey("nose")).toBe("nose");
    expect(toRegionKey("perioral")).toBe("perioral");
    expect(toRegionKey("mouth & chin")).toBe("perioral");
    expect(toRegionKey("chin")).toBe("perioral");
  });

  it("returns null for unmappable strings", () => {
    expect(toRegionKey("body")).toBeNull();
    expect(toRegionKey("")).toBeNull();
  });
});

describe("region geometry", () => {
  const landmarks = syntheticLandmarks();

  it("produces a sane crop rect for every region", () => {
    for (const region of REGION_ORDER) {
      const rect = regionRect(region, landmarks);
      expect(rect, region).not.toBeNull();
      if (!rect) continue;
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.y).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.w).toBeLessThanOrEqual(1);
      expect(rect.y + rect.h).toBeLessThanOrEqual(1);
      expect(rect.w).toBeGreaterThanOrEqual(0.04);
      expect(rect.h).toBeGreaterThanOrEqual(0.04);
    }
  });

  it("produces at least one compact marker per region", () => {
    for (const region of REGION_ORDER) {
      const markers = regionMarkers(region, landmarks);
      expect(markers.length, region).toBeGreaterThan(0);
      for (const m of markers) {
        expect(m.rx).toBeLessThanOrEqual(0.085);
        expect(m.ry).toBeLessThanOrEqual(0.055);
        expect(m.cx).toBeGreaterThanOrEqual(0);
        expect(m.cx).toBeLessThanOrEqual(1);
        expect(m.cy).toBeGreaterThanOrEqual(0);
        expect(m.cy).toBeLessThanOrEqual(1);
      }
    }
  });

  it("gives bilateral regions two markers and central regions one", () => {
    expect(regionMarkers("undereye", landmarks)).toHaveLength(2);
    expect(regionMarkers("cheeks", landmarks)).toHaveLength(2);
    expect(regionMarkers("forehead", landmarks)).toHaveLength(1);
    expect(regionMarkers("nose", landmarks)).toHaveLength(1);
    expect(regionMarkers("perioral", landmarks)).toHaveLength(1);
  });

  it("returns null/empty when landmarks are missing", () => {
    expect(regionRect("forehead", [])).toBeNull();
    expect(regionMarkers("cheeks", [])).toHaveLength(0);
  });
});

describe("copy tables", () => {
  it("covers every region", () => {
    for (const region of REGION_ORDER) {
      expect(REGION_LABEL[region]).toBeTruthy();
      expect(REGION_COPY[region].title).toBeTruthy();
      expect(REGION_COPY[region].blurb).toBeTruthy();
    }
  });

  it("covers every concern", () => {
    const concerns = [
      "pigmentation",
      "redness",
      "texture",
      "fine-lines",
      "dullness",
    ] as const;
    for (const c of concerns) {
      expect(CONCERN_LABEL[c]).toBeTruthy();
      expect(CONCERN_COPY[c].title).toBeTruthy();
      expect(CONCERN_COPY[c].blurb).toBeTruthy();
    }
  });

  it("orders regions anatomically top to bottom", () => {
    expect(REGION_ORDER).toEqual([
      "forehead",
      "undereye",
      "cheeks",
      "nose",
      "perioral",
    ] satisfies RegionKey[]);
  });
});
