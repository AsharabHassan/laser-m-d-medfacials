"use client";

import type { AnalyzeResult, Lead } from "./types";
import type { NormalizedPoint } from "@/components/scan/useFaceLandmarker";
import {
  regionMarkers,
  regionRect,
  faceVisibleSide,
  toRegionKey,
  REGION_ORDER,
  REGION_COPY,
  REGION_LABEL,
  type RegionKey,
} from "./face-regions";
import { cropImage } from "./crop";
import {
  BUCKET_META,
  CLINIC,
  BOOKING_URL,
  PRICE_GUIDE,
  DISCLAIMER,
} from "./constants";
import { buildReportPdf, type ReportArea } from "./report-pdf";

// Mirrors the on-screen FaceConcernMap so the PDF matches what the client saw.
const CORE: RegionKey[] = ["undereye", "cheeks", "jawline", "chin"];
const BEARD_COVERED: RegionKey[] = ["jawline", "chin", "neck"];

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = src;
  });
}

function beardBlurb(r: RegionKey): string {
  return `Your beard covers this area, so we couldn't read it from your photo. Endolift still works beautifully here beneath a beard — Dr Stolte's team will assess your ${REGION_LABEL[
    r
  ].toLowerCase()} precisely in person.`;
}

function planRegions(
  landmarks: NormalizedPoint[],
  result: AnalyzeResult,
): { region: RegionKey; num: number; flagged: boolean; covered: boolean }[] {
  const flagged = new Set(
    (result.narrative.observedAreas ?? [])
      .map(toRegionKey)
      .filter((r): r is RegionKey => r !== null),
  );
  const wanted = [...CORE, ...(flagged.has("neck") ? (["neck"] as const) : [])];
  const regions = REGION_ORDER.filter(
    (r) => wanted.includes(r) && regionMarkers(r, landmarks).length > 0,
  );
  return regions.map((region, i) => ({
    region,
    num: i + 1,
    flagged: flagged.has(region),
    covered: Boolean(result.lowerFaceObscured) && BEARD_COVERED.includes(region),
  }));
}

async function renderAnnotatedFace(
  imageBase64: string,
  mediaType: string,
  landmarks: NormalizedPoint[],
  result: AnalyzeResult,
): Promise<{ url: string; aspect: number } | null> {
  try {
    const img = await loadImage(`data:${mediaType};base64,${imageBase64}`);
    const W = 620;
    const H = Math.max(1, Math.round((W * img.naturalHeight) / img.naturalWidth));
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, W, H);

    const vs = faceVisibleSide(landmarks);
    for (const { region, num, covered } of planRegions(landmarks, result)) {
      let markers = regionMarkers(region, landmarks);
      if (markers.length === 2 && vs !== "both") {
        const sorted = [...markers].sort((a, b) => a.cx - b.cx);
        markers = [vs === "right" ? sorted[1] : sorted[0]];
      }
      for (const e of markers) {
        const cx = e.cx * W;
        const cy = e.cy * H;
        ctx.beginPath();
        ctx.ellipse(cx, cy, e.rx * W, e.ry * H, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(239,172,136,0.95)";
        ctx.lineWidth = 2;
        ctx.setLineDash(covered ? [6, 5] : []);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(cx, cy, 11, 0, Math.PI * 2);
        ctx.fillStyle = "#efac88";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Helvetica, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(num), cx, cy + 0.5);
      }
    }
    return { url: canvas.toDataURL("image/png"), aspect: W / H };
  } catch {
    return null;
  }
}

/**
 * Build the branded suitability report PDF entirely in the browser. Returns a PDF
 * Blob. Works with or without a photo (quiz-only → verdict-only report).
 */
export async function generateReportPdf(opts: {
  result: AnalyzeResult;
  imageBase64: string | null;
  imageMediaType: string;
  landmarks: NormalizedPoint[] | null;
  lead: Lead | null;
}): Promise<Blob> {
  const { result, imageBase64, imageMediaType, landmarks, lead } = opts;
  const meta = BUCKET_META[result.bucket];

  let faceImageDataUrl: string | null = null;
  let faceImageAspect: number | undefined;
  let areas: ReportArea[] = [];

  if (result.usedPhoto && imageBase64 && landmarks) {
    const face = await renderAnnotatedFace(
      imageBase64,
      imageMediaType,
      landmarks,
      result,
    );
    faceImageDataUrl = face?.url ?? null;
    faceImageAspect = face?.aspect;
    const plan = planRegions(landmarks, result);
    areas = await Promise.all(
      plan.map(async ({ region, num, flagged, covered }) => {
        const rect = regionRect(region, landmarks);
        const cropDataUrl = rect
          ? await cropImage(imageBase64, imageMediaType, rect)
          : null;
        return {
          num,
          title: REGION_COPY[region].title,
          blurb: covered ? beardBlurb(region) : REGION_COPY[region].blurb,
          cropDataUrl,
          covered,
          flagged,
          enhancement: covered
            ? null
            : (result.areaEnhancements?.[region] ?? null),
        } satisfies ReportArea;
      }),
    );
  }

  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return buildReportPdf({
    clinicName: CLINIC.name,
    treatmentName: "Endolift",
    byline: CLINIC.byline,
    palette: {
      bg: [255, 248, 238],
      panel: [246, 234, 216],
      gold: [201, 124, 74],
      goldLt: [227, 148, 107],
      heading: [72, 86, 86],
      body: [117, 117, 117],
      faint: [156, 150, 142],
      line: [226, 216, 203],
      badgeText: [255, 255, 255],
    },
    phone: CLINIC.phone,
    email: CLINIC.email,
    bookingUrl: BOOKING_URL.replace(/^https?:\/\//, ""),
    addressLines: [...CLINIC.addressLines],
    preparedFor: lead?.firstName?.trim() || undefined,
    dateStr,
    verdictLabel: meta.label,
    headline: result.narrative.headline,
    score: result.score,
    narrative: result.narrative.narrative,
    encouragement: result.narrative.encouragement,
    usedPhoto: result.usedPhoto,
    lowerFaceObscured: result.lowerFaceObscured,
    faceImageDataUrl,
    faceImageAspect,
    areas,
    priceFrom: PRICE_GUIDE.from,
    priceNote: PRICE_GUIDE.note,
    disclaimer: DISCLAIMER,
  });
}
