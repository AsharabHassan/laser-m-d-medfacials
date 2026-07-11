"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { EASE } from "@/lib/motion";

// LaseMD Ultra before/after creatives (client-supplied, 1200px webp).
// Both sliders share one frame size for a balanced grid; each photo is shown
// fully (object-contain) inside that frame, letterboxed where its native ratio
// differs from the frame.
const FRAME_RATIO = "1 / 1";

const CASES = [
  {
    area: "fine lines and skin texture",
    before: "/results/ba1-before.webp",
    after: "/results/ba1-after.webp",
  },
  {
    area: "pigmentation and tone",
    before: "/results/ba2-before.webp",
    after: "/results/ba2-after.webp",
  },
  {
    area: "breakout-prone texture",
    before: "/results/ba3-before.webp",
    after: "/results/ba3-after.webp",
  },
] as const;

export function ResultsGallery() {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-center">
        <Sparkles size={14} className="text-peach-deep" />
        <h3 className="font-serif text-xl text-heading">
          The LaseMD Ultra difference
        </h3>
      </div>
      <p className="mx-auto mt-1 max-w-md text-center text-[13px] leading-relaxed text-body/80">
        Representative results for the concerns LaseMD Ultra treats. Individual
        results vary — yours is confirmed at your consultation.
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
