"use client";

import { motion } from "motion/react";
import { Zap, Hourglass, Leaf, BadgePoundSterling } from "lucide-react";
import { PRICE_GUIDE } from "@/lib/constants";

const POINTS = [
  {
    icon: Zap,
    title: "Minimally invasive",
    body: "A fine laser fibre works beneath the skin — no incisions, only local numbing.",
  },
  {
    icon: Hourglass,
    title: "Little downtime",
    body: "Most people are back to normal within days; mild redness or swelling settles quickly.",
  },
  {
    icon: Leaf,
    title: "Builds over months",
    body: "Some lift is immediate, with collagen renewal continuing over roughly 3–6 months.",
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
          Endolift at MEDfacials from{" "}
          <span className="font-semibold text-heading">{PRICE_GUIDE.from}</span>.{" "}
          <span className="text-body/70">{PRICE_GUIDE.note}</span>
        </span>
      </p>
    </div>
  );
}
