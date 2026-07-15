"use client";

import { motion } from "motion/react";
import { Gift, MapPin, Sparkles } from "lucide-react";
import { VOUCHER, CLINIC } from "@/lib/constants";
import { EASE } from "@/lib/motion";
import { useLightFx } from "@/lib/use-light-fx";
import { cn } from "@/lib/utils";

/**
 * The hero conversion element — a premium gift-card panel promising the £100
 * welcome voucher for attending the free IN-CLINIC consultation in Truro.
 * The voucher is redeemable only when the client signs up for a course of 3
 * treatments — that condition gets its own pill and is repeated in the fine
 * print. Pure promise: the voucher email itself is sent by the GHL automation
 * after booking.
 */
export function VoucherCard({ condensed = false }: { condensed?: boolean }) {
  const light = useLightFx();

  if (condensed) {
    return (
      <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-peach/40 bg-peach-light/25 px-4 py-3">
        <Gift size={18} className="shrink-0 text-peach-deep" />
        <p className="text-[13px] leading-snug text-body">
          <span className="font-semibold text-heading">
            Your {VOUCHER.amount} welcome voucher
          </span>{" "}
          — on a course of 3 treatments — is still waiting. Book your free
          in-clinic consultation to claim it.
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
        "relative overflow-hidden rounded-[1.75rem] border-2 border-peach/60 shadow-glow",
        "bg-gradient-to-br from-peach-light/50 via-cream to-cream-deep",
      )}
    >
      {/* slow shimmer sweep so the offer catches the eye */}
      {!light && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
          initial={{ x: "-150%" }}
          animate={{ x: "420%" }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            repeatDelay: 2.2,
            ease: "easeInOut",
          }}
        />
      )}

      {/* ticket notches */}
      <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-peach/40 bg-cream" />
      <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-peach/40 bg-cream" />

      <div className="px-7 py-6 text-center sm:px-10">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-peach/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-peach-deep">
            <Gift size={12} /> Welcome gift
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-heading px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream">
            <Sparkles size={12} /> {VOUCHER.condition}
          </span>
        </div>
        <motion.p
          className="mt-3 font-serif text-[44px] leading-none text-heading sm:text-[52px]"
          animate={light ? undefined : { scale: [1, 1.035, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {VOUCHER.amount}
          <span className="ml-2 align-middle font-serif text-[20px] italic text-peach-deep sm:text-[24px]">
            welcome voucher
          </span>
        </motion.p>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-body">
          {VOUCHER.promise}
        </p>
        <p className="mt-3 text-[11.5px] font-medium uppercase tracking-[0.14em] text-sage-deep">
          {VOUCHER.urgency}
        </p>
      </div>

      <div className="border-t border-dashed border-peach/40 bg-white/40 px-6 py-3 text-center">
        <a
          href={CLINIC.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-heading underline-offset-4 transition hover:text-peach-deep hover:underline"
        >
          <MapPin size={13} className="text-peach-deep" />
          {CLINIC.name} · {CLINIC.addressLines[0]}, Truro — view on Google Maps
        </a>
        <p className="mt-1 text-[10.5px] text-body/70">
          Redeemable in clinic on a course of 3 treatments · one per new client
        </p>
      </div>
    </motion.div>
  );
}
