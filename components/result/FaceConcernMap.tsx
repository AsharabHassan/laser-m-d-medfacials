"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ScanFace, Sparkles } from "lucide-react";
import { useWizard } from "@/store/wizard-store";
import {
  regionMarkers,
  regionRect,
  faceVisibleSide,
  CONCERN_COPY,
  CONCERN_LABEL,
  REGION_COPY,
  REGION_LABEL,
  REGION_ORDER,
  type NormEllipse,
  type RegionKey,
} from "@/lib/face-regions";
import type { SkinConcern } from "@/lib/types";
import { cropImage } from "@/lib/crop";
import { useLightFx } from "@/lib/use-light-fx";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Regions shown when Claude returned no mappable concerns (fallback path) — the
// zones LaseMD Ultra treats, so the user still gets a focused, on-device look.
const DEFAULT_REGIONS: RegionKey[] = ["forehead", "undereye", "cheeks", "nose"];

// The lower-face zone a beard hides — when the read is beard-obscured this can't
// be honestly assessed from the photo, so the map says so instead of claiming a read.
const BEARD_COVERED: RegionKey[] = ["perioral"];

interface Mapped {
  region: RegionKey;
  num: number;
  markers: NormEllipse[];
  crop: string | null;
  /** Claude's concerns observed in this region (empty on the fallback path). */
  concerns: SkinConcern[];
  covered: boolean;
}

/**
 * A premium, on-face concern map. Shows the visitor their OWN selfie with the
 * skin zones LaseMD Ultra treats marked anatomically (computed on-device from
 * the MediaPipe mesh) — bilateral areas get a marker on each side so they sit on
 * the real feature, not the nose. Each area links to a cropped close-up, the
 * concern Claude observed there and its improvement potential. Renders nothing
 * on the no-photo path.
 */
export function FaceConcernMap() {
  const imageBase64 = useWizard((s) => s.imageBase64);
  const imageMediaType = useWizard((s) => s.imageMediaType);
  const landmarks = useWizard((s) => s.landmarks);
  const skinConcerns = useWizard((s) => s.result?.skinConcerns);
  const lowerFaceObscured = useWizard((s) => s.result?.lowerFaceObscured);
  const light = useLightFx();

  const beardBlurb = (r: RegionKey) =>
    `Your beard covers this area, so we couldn't read it from your photo. LaseMD Ultra still works beautifully here — Dr Stolte's team will assess your ${REGION_LABEL[
      r
    ].toLowerCase()} precisely in person.`;

  const dataUrl = imageBase64
    ? `data:${imageMediaType};base64,${imageBase64}`
    : null;

  // Concerns grouped by region, in anatomical order. Beard-covered regions are
  // never claimed as read; when obscured, the perioral zone gets a "covered" card.
  const byRegion = useMemo(() => {
    const groups = new Map<RegionKey, SkinConcern[]>();
    for (const c of skinConcerns ?? []) {
      const region = c.region as RegionKey;
      if (!REGION_ORDER.includes(region)) continue;
      if (lowerFaceObscured && BEARD_COVERED.includes(region)) continue;
      const list = groups.get(region) ?? [];
      list.push(c);
      groups.set(region, list);
    }
    return groups;
  }, [skinConcerns, lowerFaceObscured]);

  const regions = useMemo(() => {
    if (!landmarks) return [] as RegionKey[];
    const wanted: RegionKey[] =
      byRegion.size > 0 ? [...byRegion.keys()] : DEFAULT_REGIONS;
    const withBeard = lowerFaceObscured
      ? [...new Set([...wanted, ...BEARD_COVERED])]
      : wanted;
    return REGION_ORDER.filter(
      (r) => withBeard.includes(r) && regionMarkers(r, landmarks).length > 0,
    );
  }, [landmarks, byRegion, lowerFaceObscured]);

  const [mapped, setMapped] = useState<Mapped[]>([]);
  const [active, setActive] = useState<RegionKey | null>(null);
  const cardRefs = useRef<Partial<Record<RegionKey, HTMLDivElement | null>>>({});

  useEffect(() => {
    let cancelled = false;
    if (!imageBase64 || !landmarks || regions.length === 0) {
      // Defer the reset a tick so the effect body never sets state synchronously.
      const t = setTimeout(() => {
        if (!cancelled) setMapped([]);
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
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
          concerns: byRegion.get(region) ?? [],
          covered:
            Boolean(lowerFaceObscured) && BEARD_COVERED.includes(region),
        });
      }
      if (!cancelled) setMapped(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [imageBase64, imageMediaType, landmarks, regions, byRegion, lowerFaceObscured]);

  if (!dataUrl || mapped.length === 0) return null;

  const focusCount = mapped.filter((m) => m.concerns.length > 0).length;
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
          Your personal skin map
        </h3>
      </div>
      <p className="mx-auto mt-1 max-w-md text-center text-[13px] leading-relaxed text-body/80">
        Mapped from your own photo, on your device.
        {focusCount > 0
          ? " The highlighted areas are where LaseMD Ultra can make the most difference for you."
          : " Each marker shows a zone LaseMD Ultra can refine — confirmed at your consultation."}
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
            alt="Your photo with the LaseMD Ultra treatment zones mapped on"
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
              const covered = mapped.find((m) => m.region === p.region)?.covered;
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
          const top = m.concerns[0];
          const title = m.covered
            ? REGION_COPY[m.region].title
            : top
              ? CONCERN_COPY[top.concern].title
              : REGION_COPY[m.region].title;
          const observation = m.concerns.find(
            (c) => c.observation.trim().length > 0,
          )?.observation;
          const blurb = m.covered
            ? beardBlurb(m.region)
            : (observation ??
              (top ? CONCERN_COPY[top.concern].blurb : REGION_COPY[m.region].blurb));
          const improvement = m.concerns.length
            ? Math.max(...m.concerns.map((c) => c.improvementPercent))
            : null;
          const isActive = active === m.region;
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
                  <p className="font-serif text-[15px] text-heading">{title}</p>
                  {m.covered ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-sage/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-body/80">
                      Under your beard
                    </span>
                  ) : (
                    m.concerns.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-peach-light/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-peach-deep">
                        <Sparkles size={9} /> {REGION_LABEL[m.region]}
                      </span>
                    )
                  )}
                </div>
                {!m.covered && m.concerns.length > 1 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.concerns.slice(1).map((c) => (
                      <span
                        key={c.concern}
                        className="rounded-full bg-sage/10 px-1.5 py-0.5 text-[9.5px] font-medium text-body/80"
                      >
                        {CONCERN_LABEL[c.concern]}
                      </span>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-[12.5px] leading-relaxed text-body">
                  {blurb}
                </p>
                {!m.covered && improvement !== null && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em]">
                      <span className="text-body/70">Improvement potential</span>
                      <span className="text-peach-deep">↑ {improvement}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sage/20">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-peach-deep via-peach to-peach-light"
                        initial={{ width: 0 }}
                        animate={{ width: `${improvement}%` }}
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
