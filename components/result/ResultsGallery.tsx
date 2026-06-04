"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { EASE } from "@/lib/motion";

// Real, consented MEDfacials Endolift before/after pairs. Faces are cropped to
// the treatment area only. Replace or extend this list as new cases are approved.
const CASES = [
  { area: "jawline and neck", before: "/results/neck-before.jpg", after: "/results/neck-after.jpg" },
  { area: "under-eye", before: "/results/eyes-before.jpg", after: "/results/eyes-after.jpg" },
] as const;

export function ResultsGallery() {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-center">
        <Sparkles size={14} className="text-peach-deep" />
        <h3 className="font-serif text-xl text-heading">Real results, real patients</h3>
      </div>
      <p className="mx-auto mt-1 max-w-md text-center text-[13px] leading-relaxed text-body/80">
        Actual Endolift results from Dr Stolte&apos;s team in Truro. Individual
        results vary — yours is confirmed at your consultation.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {CASES.map((c, i) => (
          <motion.div
            key={c.area}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * i, duration: 0.5, ease: EASE }}
          >
            <BeforeAfterSlider beforeSrc={c.before} afterSrc={c.after} area={c.area} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
