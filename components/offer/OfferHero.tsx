"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarHeart, ScanFace, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustMarkers } from "@/components/brand/TrustMarkers";
import { OFFER, CLINIC, VOUCHER } from "@/lib/constants";
import { EASE } from "@/lib/motion";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

/**
 * Retargeting hero: leads with the welcome voucher + entry price, then drives
 * to the on-page booking calendar (#book) with the AI scan as the secondary
 * path for visitors who want to re-check suitability first.
 */
export function OfferHero() {
  return (
    <section className="relative px-6 pb-14 pt-16 text-center sm:pt-20">
      <div className="mx-auto max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-peach/40 bg-peach-light/40 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-peach-deep"
        >
          <Sparkles size={13} /> {VOUCHER.amount} welcome voucher
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
          className="mt-5 text-4xl leading-tight sm:text-5xl"
        >
          Time waits for no one, but your skin can look{" "}
          <span className="text-peach-deep">timeless</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.6, ease: EASE }}
          className="mt-3 text-lg text-body"
        >
          LaseMD Ultra sessions from{" "}
          <span className="font-semibold text-peach-deep">
            {gbp.format(OFFER.price)}
          </span>{" "}
          — 20 minutes, minimal downtime, glow from the first session.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.24, duration: 0.6, ease: EASE }}
          className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-body/80"
        >
          You recently checked your LaseMD Ultra suitability with {CLINIC.name}.
          Book your free in-clinic consultation at Lemon Street below — attend
          and a {VOUCHER.amount} welcome voucher is yours when you start a
          course of 3 treatments at the clinic.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.6, ease: EASE }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a href="#book" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              <CalendarHeart size={18} /> Book your free consultation
            </Button>
          </a>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <ScanFace size={18} /> Take the AI skin scan
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44, duration: 0.6, ease: EASE }}
        >
          <TrustMarkers className="mt-9" />
        </motion.div>
      </div>
    </section>
  );
}
