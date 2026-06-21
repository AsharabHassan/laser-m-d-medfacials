import type { NormRect } from "./face-regions";

// ─────────────────────────────────────────────────────────────────────────────
// Client-only canvas cropping. Takes the in-memory selfie (base64) plus a
// normalized rectangle and returns a cropped JPEG data URL. Nothing leaves the
// device — this is the same Canvas API the capture/overlay steps already use.
// ─────────────────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = src;
  });
}

/**
 * Crop the source image to `rect` (normalized 0–1 coords) and return a JPEG data
 * URL. Returns null if the image can't be loaded or the canvas is unavailable.
 */
export async function cropImage(
  base64: string,
  mediaType: string,
  rect: NormRect,
): Promise<string | null> {
  try {
    const img = await loadImage(`data:${mediaType};base64,${base64}`);
    const sx = Math.round(rect.x * img.naturalWidth);
    const sy = Math.round(rect.y * img.naturalHeight);
    const sw = Math.max(1, Math.round(rect.w * img.naturalWidth));
    const sh = Math.max(1, Math.round(rect.h * img.naturalHeight));

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return null;
  }
}
