"use client";

import { BadgePercent } from "lucide-react";
import { PRICE_GUIDE } from "@/lib/constants";

/**
 * A light pricing teaser — enough to anchor value without turning the result
 * page into a price list. The voucher line ties pricing back to the primary CTA.
 */
export function PricingTeaser() {
  return (
    <div className="rounded-[1.75rem] border border-sage/20 bg-white/70 px-7 py-6 text-center shadow-soft">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sage-deep">
        <BadgePercent size={12} /> Investment guide
      </span>
      <p className="mt-3 font-serif text-2xl text-heading">
        Sessions from{" "}
        <span className="text-peach-deep">{PRICE_GUIDE.from}</span>
      </p>
      <p className="mt-1.5 text-[13.5px] text-body">
        Tailored packages up to {PRICE_GUIDE.to} · {PRICE_GUIDE.courses}
      </p>
      <p className="mx-auto mt-3 max-w-md border-t border-sage/15 pt-3 text-[12.5px] leading-relaxed text-body/80">
        Your exact protocol is confirmed at your free in-clinic consultation in
        Truro — where your £100 welcome voucher (on a course of 3 treatments)
        is waiting.
      </p>
    </div>
  );
}
