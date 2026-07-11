"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Sparkles, Info, Download, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWizard } from "@/store/wizard-store";
import { SuitabilityGauge } from "@/components/result/SuitabilityGauge";
import { FaceConcernMap } from "@/components/result/FaceConcernMap";
import { WhatToExpect } from "@/components/result/WhatToExpect";
import { ResultsGallery } from "@/components/result/ResultsGallery";
import { Testimonials } from "@/components/result/Testimonials";
import { DualBookingCTA } from "@/components/result/DualBookingCTA";
import { VoucherCard } from "@/components/result/VoucherCard";
import { PricingTeaser } from "@/components/result/PricingTeaser";
import { StickyBookingBar } from "@/components/result/StickyBookingBar";
import { DisclaimerBanner } from "@/components/compliance/DisclaimerBanner";
import { BUCKET_META, LASERMD_CONCERNS } from "@/lib/constants";
import { CONCERN_LABEL } from "@/lib/face-regions";
import { EASE } from "@/lib/motion";

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: EASE },
});

export function ResultScreen() {
  const result = useWizard((s) => s.result);
  const imageBase64 = useWizard((s) => s.imageBase64);
  const imageMediaType = useWizard((s) => s.imageMediaType);
  const landmarks = useWizard((s) => s.landmarks);
  const lead = useWizard((s) => s.lead);
  const [downloading, setDownloading] = useState(false);
  const finalCtaRef = useRef<HTMLDivElement | null>(null);

  if (!result) return null;

  const meta = BUCKET_META[result.bucket];
  const { narrative } = result;

  async function downloadReport() {
    if (!result) return;
    setDownloading(true);
    try {
      const { generateReportPdf } = await import("@/lib/report");
      const blob = await generateReportPdf({
        result,
        imageBase64,
        imageMediaType,
        landmarks,
        lead,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const who = lead?.firstName ? `-${lead.firstName}` : "";
      a.download = `LaserMD-Report${who}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch {
      /* ignore — download is best-effort */
    } finally {
      setDownloading(false);
    }
  }

  // Concern chips: Claude's observed skin qualities, or the treatable list.
  const chips =
    result.skinConcerns.length > 0
      ? [...new Set(result.skinConcerns.map((c) => CONCERN_LABEL[c.concern]))]
      : narrative.observedAreas.length > 0
        ? narrative.observedAreas
        : (LASERMD_CONCERNS as readonly string[]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 pb-24 sm:pb-10">
      {/* ── 1 · The personal payoff ─────────────────────────────────────── */}
      <motion.div {...reveal(0)} className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-peach-light/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-peach-deep">
          <Sparkles size={13} /> {meta.label}
        </span>
        <h2 className="mt-4 font-serif text-[32px] leading-tight text-heading sm:text-[40px]">
          {narrative.headline}
        </h2>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-peach/50 bg-peach-light/40 px-4 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-peach-deep">
          <Gift size={13} /> £100 welcome voucher with your free in-clinic
          consultation
        </span>
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
          {chips.map((a) => (
            <span
              key={a}
              className="rounded-full bg-cream-deep px-3 py-1 text-xs font-medium text-heading"
            >
              {a}
            </span>
          ))}
        </div>

        <p className="mt-5 border-t border-sage/15 pt-4 text-[15px] font-medium leading-relaxed text-heading">
          {narrative.encouragement}
        </p>
      </motion.div>

      {result.usedPhoto && result.lowerFaceObscured && (
        <motion.div
          {...reveal(0.55)}
          className="mt-6 flex items-start gap-2.5 rounded-2xl border border-peach/30 bg-peach-light/25 px-4 py-3"
        >
          <Info size={16} className="mt-0.5 shrink-0 text-peach-deep" />
          <p className="text-[13px] leading-relaxed text-body">
            <span className="font-semibold text-heading">Beard noticed.</span>{" "}
            A fuller beard hides the skin around the mouth and chin, so
            we&rsquo;ve kept the read light there. LaseMD Ultra works just as
            well on that skin — Dr Stolte&rsquo;s team will confirm it precisely
            in person.
          </p>
        </motion.div>
      )}

      {/* ── 2 · Voucher + primary conversion (strike while emotion is high) */}
      <motion.div {...reveal(0.58)} className="mt-10">
        <VoucherCard />
      </motion.div>
      <motion.div {...reveal(0.62)} className="mt-6">
        <DualBookingCTA label={meta.ctaLabel} />
      </motion.div>

      {/* ── 3 · Their own face, mapped ──────────────────────────────────── */}
      <motion.div {...reveal(0.66)} className="mt-12">
        <FaceConcernMap />
      </motion.div>

      {/* ── 4 · Mid-page compact CTA ────────────────────────────────────── */}
      <motion.div {...reveal(0.7)} className="mt-10">
        <DualBookingCTA compact />
      </motion.div>

      {/* ── 5 · Investment guide ────────────────────────────────────────── */}
      <motion.div {...reveal(0.74)} className="mt-10">
        <PricingTeaser />
      </motion.div>

      {/* ── 6 · What a session feels like ──────────────────────────────── */}
      <motion.div {...reveal(0.78)} className="mt-10">
        <WhatToExpect />
      </motion.div>

      {/* ── 7–8 · Social proof ──────────────────────────────────────────── */}
      <motion.div {...reveal(0.84)} className="mt-10">
        <ResultsGallery />
      </motion.div>

      <motion.div {...reveal(0.9)} className="mt-10">
        <Testimonials />
      </motion.div>

      {/* ── 9 · Final close: voucher reminder + full CTA ────────────────── */}
      <motion.div {...reveal(0.96)} className="mt-12" ref={finalCtaRef}>
        <VoucherCard condensed />
        <div className="mt-6">
          <DualBookingCTA label={meta.ctaLabel} />
        </div>
      </motion.div>

      {/* ── 10 · Low-key PDF download (the report is also emailed) ─────── */}
      <motion.div {...reveal(1.02)} className="mt-8 flex justify-center">
        <Button
          variant="outline"
          onClick={downloadReport}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Preparing your
              report…
            </>
          ) : (
            <>
              <Download size={16} /> Download your report (PDF)
            </>
          )}
        </Button>
      </motion.div>

      <motion.div {...reveal(1.06)}>
        <DisclaimerBanner className="mt-8" />
      </motion.div>

      <StickyBookingBar watchEndRef={finalCtaRef} />
    </div>
  );
}
