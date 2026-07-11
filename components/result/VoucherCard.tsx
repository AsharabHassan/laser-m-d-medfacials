"use client";

import { motion } from "motion/react";
import { Gift } from "lucide-react";
import { VOUCHER, CLINIC } from "@/lib/constants";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The hero conversion element — a premium gift-card panel promising the £100
 * welcome voucher for attending the free in-clinic consultation. Pure promise:
 * the voucher email itself is sent by the GHL automation after booking.
 */
export function VoucherCard({ condensed = false }: { condensed?: boolean }) {
  if (condensed) {
    return (
      <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-peach/40 bg-peach-light/25 px-4 py-3">
        <Gift size={18} className="shrink-0 text-peach-deep" />
        <p className="text-[13px] leading-snug text-body">
          <span className="font-semibold text-heading">
            Your {VOUCHER.amount} welcome voucher
          </span>{" "}
          is still waiting — book your free in-clinic consultation to claim it.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-peach/50 shadow-glow",
        "bg-gradient-to-br from-peach-light/40 via-cream to-cream-deep",
      )}
    >
      {/* ticket notches */}
      <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-peach/40 bg-cream" />
      <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-peach/40 bg-cream" />

      <div className="px-7 py-6 text-center sm:px-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-peach/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-peach-deep">
          <Gift size={12} /> Welcome gift
        </span>
        <p className="mt-3 font-serif text-[38px] leading-none text-heading sm:text-[44px]">
          {VOUCHER.amount}
          <span className="ml-2 align-middle font-serif text-[19px] italic text-peach-deep sm:text-[22px]">
            welcome voucher
          </span>
        </p>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-body">
          {VOUCHER.promise}
        </p>
        <p className="mt-3 text-[11.5px] font-medium uppercase tracking-[0.14em] text-sage-deep">
          {VOUCHER.urgency}
        </p>
      </div>

      <div className="border-t border-dashed border-peach/40 bg-white/40 px-6 py-2.5 text-center">
        <p className="text-[10.5px] text-body/70">
          Redeemable against any treatment at {CLINIC.name}, Lemon Street, Truro
          · one per new client
        </p>
      </div>
    </motion.div>
  );
}
