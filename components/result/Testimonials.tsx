"use client";

import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { EASE } from "@/lib/motion";

// ─────────────────────────────────────────────────────────────────────────────
// Genuine MEDfacials patient reviews. Update the name/date/quote here to add or
// change reviews.
// ─────────────────────────────────────────────────────────────────────────────

interface Testimonial {
  name: string;
  date: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Beatrice Martin",
    date: "Mar 12, 2026",
    quote:
      "Everyone seems very professional and knows what they are talking about. Also friendly and helpful and explained things properly. Highly recommended.",
  },
  {
    name: "Sue Crossley",
    date: "Apr 14, 2026",
    quote:
      "Had a laser treatment with Leva. Lovely person. Very helpful and friendly, but above all professional. She explained everything to me and the whole procedure went well. She also has a lovely sense of humour which made me feel relaxed.",
  },
  {
    name: "Sarah Lang",
    date: "Apr 23, 2026",
    quote:
      "Amazing energy at this clinic! Professional yet so friendly and down to earth. Such a great experience. My consultation was really informative and I've booked in my procedure.",
  },
  {
    name: "Carol Jones",
    date: "May 27, 2026",
    quote:
      "I felt very confident I was in extremely good hands. The staff are all very friendly and professional. I am very impressed with the service I was given. The premises are very clean and well presented. Will be happy to go there again.",
  },
  {
    name: "Jayne Gray",
    date: "May 22, 2026",
    quote:
      "Had an appointment with Jane today. She was lovely, very knowledgeable, and explained everything clearly. I would definitely recommend her services.",
  },
  {
    name: "Victoria Hersey",
    date: "May 20, 2026",
    quote: "Wonderful professional service, tailored to my individual needs.",
  },
];

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  return (
    <div>
      <h3 className="text-center font-serif text-xl text-heading">
        What our patients say
      </h3>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5, ease: EASE }}
            className="relative flex flex-col rounded-2xl border border-sage/20 bg-white/70 p-5 shadow-soft"
          >
            <Quote
              size={28}
              className="absolute right-4 top-4 text-peach/30"
              aria-hidden
            />

            <div
              className="flex gap-0.5 text-peach-deep"
              aria-label="Five out of five stars"
            >
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={14} fill="currentColor" strokeWidth={0} />
              ))}
            </div>

            <blockquote className="mt-3 flex-1 text-[13px] leading-relaxed text-body">
              “{t.quote}”
            </blockquote>

            <figcaption className="mt-4 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-peach-light text-xs font-semibold text-peach-deep">
                {initials(t.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-heading">
                  {t.name}
                </span>
                <span className="block text-[11px] text-body/60">{t.date}</span>
              </span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </div>
  );
}
