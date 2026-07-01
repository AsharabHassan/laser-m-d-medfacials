"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ScanFace, Sparkles } from "lucide-react";
import { useWizard } from "@/store/wizard-store";
import {
  regionMarkers,
  regionRect,
  toRegionKey,
  faceVisibleSide,
  REGION_COPY,
  REGION_LABEL,
  REGION_ORDER,
  type NormEllipse,
  type RegionKey,
} from "@/lib/face-regions";
import { cropImage } from "@/lib/crop";
import { useLightFx } from "@/lib/use-light-fx";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

// The core areas Endolift addresses — always shown when the face is readable.
// Neck is added only if Claude flagged it, so the map stays focused.
const CORE: RegionKey[] = ["undereye", "cheeks", "jawline", "chin"];

// Lower-face areas a beard hides — when the read is beard-obscured these can't be
// honestly assessed from the photo, so the map says so instead of claiming a read.
const BEARD_COVERED: RegionKey[] = ["jawline", "chin", "neck"];

interface Mapped {
  region: RegionKey;
  num: number;
  markers: NormEllipse[];
  crop: string | null;
  flagged: boolean;
}

/**
 * A premium, on-face concern map. Shows the visitor their OWN selfie with the
 * areas Endolift treats marked anatomically (computed on-device from the
 * MediaPipe mesh) — bilateral areas get a marker on each side so they sit on the
 * real feature, not the nose. Each area links to a cropped close-up and a short
 * note on how the treatment helps it. Renders nothing on the no-photo path.
 */
export function FaceConcernMap() {
  const imageBase64 = useWizard((s) => s.imageBase64);
  const imageMediaType = useWizard((s) => s.imageMediaType);
  const landmarks = useWizard((s) => s.landmarks);
  const observedAreas = useWizard((s) => s.result?.narrative.observedAreas);
  const lowerFaceObscured = useWizard((s) => s.result?.lowerFaceObscured);
  const areaEnhancements = useWizard((s) => s.result?.areaEnhancements);
  const light = useLightFx();

  const isCovered = (r: RegionKey) =>
    Boolean(lowerFaceObscured) && BEARD_COVERED.includes(r);
  const beardBlurb = (r: RegionKey) =>
    `Your beard covers this area, so we couldn't read it from your photo. Endolift still works beautifully here beneath a beard — Dr Stolte's team will assess your ${REGION_LABEL[
      r
    ].toLowerCase()} precisely in person.`;

  const dataUrl = imageBase64
    ? `data:${imageMediaType};base64,${imageBase64}`
    : null;

  const flaggedSet = useMemo(
    () =>
      new Set(
        (observedAreas ?? [])
          .map(toRegionKey)
          .filter((r): r is RegionKey => r !== null),
      ),
    [observedAreas],
  );

  const regions = useMemo(() => {
    if (!landmarks) return [] as RegionKey[];
    const wanted = [
      ...CORE,
      ...(flaggedSet.has("neck") ? ["neck" as const] : []),
    ];
    return REGION_ORDER.filter(
      (r) => wanted.includes(r) && regionMarkers(r, landmarks).length > 0,
    );
  }, [landmarks, flaggedSet]);

  const [mapped, setMapped] = useState<Mapped[]>([]);
  const [active, setActive] = useState<RegionKey | null>(null);
  const cardRefs = useRef<Partial<Record<RegionKey, HTMLDivElement | null>>>({});

  useEffect(() => {
    if (!imageBase64 || !landmarks || regions.length === 0) {
      setMapped([]);
      return;
    }
    let cancelled = false;
    const vs = faceVisibleSide(landmarks);
    (async () => {
      const out: Mapped[] = [];
      for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        let markers = regionMarkers(region, landmarks);
        if (markers.length === 0) continue;
        // On a turned face keep only the visible-side marker per bilateral area,
        // so the far-side (foreshortened) markers don't bunch up or float.
        if (markers.length === 2 && vs !== "both") {
          const sorted = [...markers].sort((a, b) => a.cx - b.cx);
          markers = [vs === "right" ? sorted[1] : sorted[0]];
        }
        const rect = regionRect(region, landmarks);
        const crop = rect
          ? await cropImage(imageBase64, imageMediaType, rect)
          : null;
        out.push({
          region,
          num: out.length + 1,
          markers,
          crop,
          flagged: flaggedSet.has(region),
        });
      }
      if (!cancelled) setMapped(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [imageBase64, imageMediaType, landmarks, regions, flaggedSet]);

  if (!dataUrl || mapped.length === 0) return null;

  const focusCount = mapped.filter((m) => m.flagged).length;
  const pins = mapped.flatMap((m) =>
    m.markers.map((e, k) => ({
      key: `${m.region}-${k}`,
      region: m.region,
      num: m.num,
      e,
    })),
  );

  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-center">
        <ScanFace size={15} className="text-peach-deep" />
        <h3 className="font-serif text-xl text-heading sm:text-2xl">
          Your Endolift face map
        </h3>
      </div>
      <p className="mx-auto mt-1 max-w-md text-center text-[13px] leading-relaxed text-body/80">
        Mapped from your own photo, on your device.
        {focusCount > 0
          ? " The highlighted areas are where Endolift can make the most difference for you."
          : " Each marker shows an area Endolift can refine — confirmed at your consultation."}
      </p>

      {/* ── The map ─────────────────────────────────────────────────────── */}
      <div className="mt-6 flex justify-center">
        <motion.figure
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative w-full max-w-[min(86vw,360px)] overflow-hidden rounded-[2rem] border border-peach/30 bg-cream-deep shadow-soft"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt="Your photo with the Endolift treatment areas mapped on"
            className="block h-auto w-full select-none"
            draggable={false}
          />

          {/* region highlights */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <filter id="fcm-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.1" />
              </filter>
            </defs>
            {pins.map((p, i) => {
              const isActive = active === p.region;
              const covered = isCovered(p.region);
              return (
                <motion.g
                  key={p.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
                >
                  {!covered && (
                    <ellipse
                      cx={p.e.cx * 100}
                      cy={p.e.cy * 100}
                      rx={p.e.rx * 100}
                      ry={p.e.ry * 100}
                      fill="rgba(239,172,136,0.18)"
                      filter="url(#fcm-glow)"
                      opacity={isActive ? 1 : 0.5}
                    />
                  )}
                  <ellipse
                    cx={p.e.cx * 100}
                    cy={p.e.cy * 100}
                    rx={p.e.rx * 100}
                    ry={p.e.ry * 100}
                    fill="none"
                    stroke={isActive ? "#e3946b" : "rgba(227,148,107,0.75)"}
                    strokeWidth={isActive ? 1.75 : 1}
                    strokeDasharray={covered ? "3 2.5" : undefined}
                    opacity={covered && !isActive ? 0.6 : 1}
                    vectorEffect="non-scaling-stroke"
                  />
                </motion.g>
              );
            })}
          </svg>

          {/* one-shot analysis sweep */}
          {!light && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-peach/45 to-transparent mix-blend-screen"
              initial={{ y: "-120%" }}
              animate={{ y: ["-120%", "460%"] }}
              transition={{ duration: 1.6, ease: "easeInOut", delay: 0.4 }}
            />
          )}

          {/* numbered pins */}
          {pins.map((p) => {
            const isActive = active === p.region;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setActive(p.region);
                  cardRefs.current[p.region]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }}
                onMouseEnter={() => setActive(p.region)}
                aria-label={`${REGION_LABEL[p.region]} — area ${p.num}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.e.cx * 100}%`, top: `${p.e.cy * 100}%` }}
              >
                {!light && isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-peach/40"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <span
                  className={cn(
                    "relative flex items-center justify-center rounded-full text-[10px] font-semibold transition-all",
                    isActive
                      ? "h-5 w-5 bg-peach text-white shadow-[0_0_14px_-2px_rgba(227,148,107,0.9)]"
                      : "h-[18px] w-[18px] bg-white/85 text-peach-deep ring-1 ring-peach backdrop-blur-sm",
                  )}
                >
                  {p.num}
                </span>
              </button>
            );
          })}

          <Reticle />

          <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-heading/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            Tap an area
          </span>
        </motion.figure>
      </div>

      {/* ── Concern detail cards ────────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {mapped.map((m, i) => {
          const copy = REGION_COPY[m.region];
          const isActive = active === m.region;
          const covered = isCovered(m.region);
          return (
            <motion.div
              key={m.region}
              ref={(el) => {
                cardRefs.current[m.region] = el;
              }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: EASE }}
              onMouseEnter={() => setActive(m.region)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(m.region)}
              className={cn(
                "flex cursor-default gap-3 rounded-2xl border p-3 transition-colors",
                isActive
                  ? "border-peach/60 bg-peach-light/25"
                  : "border-sage/20 bg-white/70",
              )}
            >
              <div className="relative shrink-0">
                <div className="h-16 w-16 overflow-hidden rounded-xl border border-peach/25 bg-cream-deep sm:h-20 sm:w-20">
                  {m.crop ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.crop}
                      alt={`Close-up of your ${REGION_LABEL[m.region].toLowerCase()}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-peach-deep/60">
                      <ScanFace size={20} />
                    </div>
                  )}
                </div>
                <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-peach text-[11px] font-semibold text-white shadow">
                  {m.num}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-serif text-[15px] text-heading">
                    {copy.title}
                  </p>
                  {covered ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-sage/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-body/80">
                      Under your beard
                    </span>
                  ) : (
                    m.flagged && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-peach-light/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-peach-deep">
                        <Sparkles size={9} /> Focus
                      </span>
                    )
                  )}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-body">
                  {covered ? beardBlurb(m.region) : copy.blurb}
                </p>
                {!covered &&
                  typeof areaEnhancements?.[m.region] === "number" && (
                    <div className="mt-2.5">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em]">
                        <span className="text-body/70">
                          Enhancement potential
                        </span>
                        <span className="text-peach-deep">
                          ↑ {areaEnhancements[m.region]}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sage/20">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-peach-deep via-peach to-peach-light"
                          initial={{ width: 0 }}
                          animate={{ width: `${areaEnhancements[m.region]}%` }}
                          transition={{
                            duration: 0.9,
                            ease: EASE,
                            delay: 0.25 + i * 0.06,
                          }}
                        />
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Reticle() {
  const corner = "pointer-events-none absolute h-5 w-5 border-peach/50";
  return (
    <>
      <span className={`${corner} left-3 top-3 rounded-tl border-l-2 border-t-2`} />
      <span className={`${corner} right-3 top-3 rounded-tr border-r-2 border-t-2`} />
      <span className={`${corner} bottom-9 left-3 rounded-bl border-b-2 border-l-2`} />
      <span className={`${corner} bottom-9 right-3 rounded-br border-b-2 border-r-2`} />
    </>
  );
}
