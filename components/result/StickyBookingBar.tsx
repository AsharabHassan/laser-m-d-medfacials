"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CalendarHeart } from "lucide-react";
import { BOOKING_URL } from "@/lib/constants";
import { EASE } from "@/lib/motion";

/**
 * Mobile sticky bottom CTA bar. Appears once the visitor has scrolled past the
 * first screenful of the result (they've seen their score + voucher) and stays
 * until the page's final CTA block scrolls into view, so it never doubles up.
 * Rendered through a portal to <body>: the wizard's StepTransition wrapper
 * carries a motion transform, which would otherwise become the containing
 * block for position:fixed and pin the bar to the page instead of the viewport.
 */
export function StickyBookingBar({ watchEndRef }: {
  watchEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.9);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const el = watchEndRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setNearEnd(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [watchEndRef]);

  const visible = scrolled && !nearEnd;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 sm:hidden"
        >
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-peach px-6 text-[15px] font-semibold text-white shadow-glow transition active:scale-[0.98]"
          >
            <CalendarHeart size={18} />
            Book free consultation · £100 voucher
          </a>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
