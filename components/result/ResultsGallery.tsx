"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { EASE } from "@/lib/motion";

// Consented MEDfacials before/after pairs. PLACEHOLDER: these are the clinic's
// existing case photos — swap in real LaseMD Ultra cases as the client approves
// them (same filenames in /public/results, or extend this list).
// Both sliders share one frame size for a balanced grid; each photo is shown
// fully (object-contain) inside that frame, letterboxed where its native ratio
// differs from the frame.
const FRAME_RATIO = "4 / 3";

const CASES = [
  {
    area: "skin tone and texture",
    before: "/results/neck-before.jpg",
    after: "/results/neck-after.jpg",
  },
  {
    area: "under-eye brightness",
    before: "/results/eyes-before.jpg",
    after: "/results/eyes-after.jpg",
  },
] as const;

export function ResultsGallery() {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-center">
        <Sparkles size={14} className="text-peach-deep" />
        <h3 className="font-serif text-xl text-heading">Real results, real patients</h3>
      </div>
      <p className="mx-auto mt-1 max-w-md text-center text-[13px] leading-relaxed text-body/80">
        Actual results from Dr Stolte&apos;s team in Truro. Individual results
        vary — yours is confirmed at your consultation.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {CASES.map((c, i) => (
          <motion.div
            key={c.area}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * i, duration: 0.5, ease: EASE }}
          >
            <BeforeAfterSlider
              beforeSrc={c.before}
              afterSrc={c.after}
              area={c.area}
              ratio={FRAME_RATIO}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
