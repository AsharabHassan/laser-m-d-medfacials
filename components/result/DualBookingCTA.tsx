"use client";

import { CalendarHeart, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_URL, VIRTUAL_BOOKING_URL, CLINIC } from "@/lib/constants";

/**
 * The dual conversion CTA. PRIMARY: the free in-clinic consultation at Lemon
 * Street (which carries the £100 voucher promise). SECONDARY, visually
 * subordinate: a free virtual video consultation for people who can't get to
 * Truro yet. Both are plain GHL calendar links — never form_embed.js.
 */
export function DualBookingCTA({
  label = "Book my free in-clinic consultation",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto"
      >
        <Button size="lg" className="w-full sm:w-auto">
          <CalendarHeart size={18} /> {label}
        </Button>
      </a>
      {!compact && (
        <p className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-peach-deep">
          Includes your £100 welcome voucher
        </p>
      )}

      <a
        href={VIRTUAL_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-sage-deep underline-offset-4 transition hover:text-heading hover:underline"
      >
        <Video size={14} /> Can&rsquo;t get to Truro just yet? Book a free
        virtual consultation
      </a>

      {!compact && (
        <a
          href={CLINIC.phoneHref}
          className="flex items-center gap-2 text-[13px] text-body/80 transition hover:text-heading"
        >
          <Phone size={13} /> Or call us on {CLINIC.phone}
        </a>
      )}
    </div>
  );
}
