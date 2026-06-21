"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useWizard } from "@/store/wizard-store";
import { SuitabilityGauge } from "@/components/result/SuitabilityGauge";
import { AreaFocus } from "@/components/result/AreaFocus";
import { WhatToExpect } from "@/components/result/WhatToExpect";
import { ResultsGallery } from "@/components/result/ResultsGallery";
import { Testimonials } from "@/components/result/Testimonials";
import { BookingCTA } from "@/components/result/BookingCTA";
import { DisclaimerBanner } from "@/components/compliance/DisclaimerBanner";
import { BUCKET_META, ENDOLIFT_AREAS } from "@/lib/constants";
import { EASE } from "@/lib/motion";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: EASE },
});

export function ResultScreen() {
  const result = useWizard((s) => s.result);
  if (!result) return null;

  const meta = BUCKET_META[result.bucket];
  const { narrative } = result;
  const areas =
    narrative.observedAreas.length > 0
      ? narrative.observedAreas
      : (ENDOLIFT_AREAS as readonly string[]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <motion.div {...reveal(0)} className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-peach-light/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-peach-deep">
          <Sparkles size={13} /> {meta.label}
        </span>
        <h2 className="mt-4 font-serif text-[32px] leading-tight text-heading sm:text-[40px]">
          {narrative.headline}
        </h2>
      </motion.div>

      <motion.div {...reveal(0.25)} className="mt-8 flex justify-center">
        <SuitabilityGauge
          score={result.score}
          accent={meta.accent}
          label={meta.label}
        />
      </motion.div>

      <motion.div
        {...reveal(0.5)}
        className="mt-8 rounded-[2rem] border border-sage/20 bg-white/70 p-7 shadow-soft"
      >
        <p className="text-[15px] leading-relaxed text-body">
          {narrative.narrative}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {areas.map((a) => (
            <span
              key={a}
              className="rounded-full bg-cream-deep px-3 py-1 text-xs font-medium capitalize text-heading"
            >
              {a}
            </span>
          ))}
        </div>

        <p className="mt-5 border-t border-sage/15 pt-4 text-[15px] font-medium leading-relaxed text-heading">
          {narrative.encouragement}
        </p>
      </motion.div>

      <motion.div {...reveal(0.6)} className="mt-10">
        <AreaFocus />
      </motion.div>

      <motion.div {...reveal(0.7)} className="mt-8">
        <WhatToExpect />
      </motion.div>

      <motion.div {...reveal(0.8)} className="mt-10">
        <ResultsGallery />
      </motion.div>

      <motion.div {...reveal(0.9)} className="mt-10">
        <Testimonials />
      </motion.div>

      <motion.div {...reveal(1)} className="mt-10">
        <BookingCTA label={meta.ctaLabel} />
      </motion.div>

      <motion.div {...reveal(1.1)}>
        <DisclaimerBanner className="mt-8" />
      </motion.div>
    </div>
  );
}
