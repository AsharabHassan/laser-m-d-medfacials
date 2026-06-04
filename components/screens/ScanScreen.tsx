"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useWizard } from "@/store/wizard-store";
import {
  useFaceLandmarker,
  type NormalizedPoint,
} from "@/components/scan/useFaceLandmarker";
import { FaceMeshOverlay } from "@/components/scan/FaceMeshOverlay";

const STATUS = [
  "Mapping facial structure",
  "Assessing lower-face contour",
  "Reviewing jawline & skin",
  "Preparing your personalised guide",
];

export function ScanScreen() {
  const imageBase64 = useWizard((s) => s.imageBase64);
  const imageMediaType = useWizard((s) => s.imageMediaType);
  const completeScan = useWizard((s) => s.completeScan);
  const reduce = useReducedMotion();

  const { detect, ready } = useFaceLandmarker();
  const imgRef = useRef<HTMLImageElement>(null);
  const [landmarks, setLandmarks] = useState<NormalizedPoint[] | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  const dataUrl = imageBase64
    ? `data:${imageMediaType};base64,${imageBase64}`
    : null;

  // Detect once the still and the model are both ready.
  useEffect(() => {
    if (ready && imgLoaded && imgRef.current && !landmarks) {
      setLandmarks(detect(imgRef.current));
    }
  }, [ready, imgLoaded, detect, landmarks]);

  // Cycle status lines and finish.
  useEffect(() => {
    const total = reduce ? 1600 : 4200;
    const per = total / STATUS.length;
    const timers = STATUS.map((_, i) =>
      setTimeout(() => setStatusIndex(i), per * i),
    );
    const done = setTimeout(() => completeScan(), total);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [completeScan, reduce]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 py-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-peach-deep">
        Analysing
      </p>
      <h2 className="mt-3 text-center font-serif text-[28px] leading-tight text-heading sm:text-[34px]">
        Reading your features
      </h2>

      <div className="relative mt-8 aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[2rem] border border-sage/30 bg-heading/10 shadow-soft">
        {dataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={dataUrl}
            alt="Your captured photo being analysed"
            onLoad={() => setImgLoaded(true)}
            className="h-full w-full object-cover"
          />
        )}
        {/* soft darkening for mesh contrast */}
        <div className="absolute inset-0 bg-heading/25" />

        {/* mesh */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: landmarks ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <FaceMeshOverlay landmarks={landmarks} className="h-full w-full" />
        </motion.div>

        {/* sweeping analysis bar */}
        {!reduce && (
          <motion.div
            className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent via-peach/50 to-transparent mix-blend-screen"
            initial={{ y: "-120%" }}
            animate={{ y: ["-120%", "520%"] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {/* corner reticle */}
        <Reticle />
      </div>

      <div className="mt-8 h-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={statusIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-sm font-medium tracking-wide text-heading"
          >
            {STATUS[statusIndex]}
            <span className="text-peach-deep">…</span>
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="mt-2 text-xs text-body/55">
        On-device · your photo never leaves this step
      </p>
    </div>
  );
}

function Reticle() {
  const corner = "absolute h-5 w-5 border-white/70";
  return (
    <>
      <span className={`${corner} left-3 top-3 border-l-2 border-t-2 rounded-tl`} />
      <span className={`${corner} right-3 top-3 border-r-2 border-t-2 rounded-tr`} />
      <span className={`${corner} bottom-3 left-3 border-b-2 border-l-2 rounded-bl`} />
      <span className={`${corner} bottom-3 right-3 border-b-2 border-r-2 rounded-br`} />
    </>
  );
}
