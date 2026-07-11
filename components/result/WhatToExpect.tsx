"use client";

import { motion } from "motion/react";
import { Clock3, Sun, Sparkle, BadgePoundSterling } from "lucide-react";
import { PRICE_GUIDE } from "@/lib/constants";

const POINTS = [
  {
    icon: Clock3,
    title: "A 20-minute session",
    body: "Numbing cream first, then a gentle, warm fractional pass across the skin — comfortable and quick.",
  },
  {
    icon: Sun,
    title: "Minimal downtime",
    body: "Light redness and a fine, sandpaper feel settle within a few days — you're back to normal life the same day.",
  },
  {
    icon: Sparkle,
    title: "Glow that builds",
    body: "Brightness shows from the first week, and collagen renewal keeps improving tone and texture over the following weeks.",
  },
];

export function WhatToExpect() {
  return (
    <div>
      <h3 className="font-serif text-xl text-heading">What to expect</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {POINTS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            className="rounded-2xl border border-sage/20 bg-white/70 p-4"
          >
            <p.icon size={20} className="text-peach-deep" />
            <p className="mt-3 text-sm font-semibold text-heading">{p.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-body">{p.body}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-body">
        <BadgePoundSterling size={16} className="text-sage-deep" />
        <span>
          LaseMD Ultra at MEDfacials from{" "}
          <span className="font-semibold text-heading">{PRICE_GUIDE.from}</span>.{" "}
          <span className="text-body/70">{PRICE_GUIDE.note}</span>
        </span>
      </p>
    </div>
  );
}
