"use client";

import { CalendarHeart, Gift, MapPin, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BOOKING_URL,
  VIRTUAL_BOOKING_URL,
  CLINIC,
  VOUCHER,
} from "@/lib/constants";

/**
 * The dual conversion CTA. PRIMARY: the free IN-CLINIC consultation at the
 * Truro clinic (which carries the £100 voucher promise on a course of 3) — with
 * the address + Google Maps link right underneath so nobody wonders where to
 * go. SECONDARY, visually subordinate: a free online video consultation for
 * people who can't get to Truro yet. Both are plain GHL calendar links —
 * never form_embed.js.
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

      <span className="inline-flex items-center gap-1.5 rounded-full bg-peach-light/60 px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-peach-deep">
        <Gift size={13} /> Includes your {VOUCHER.amount} voucher · course of
        3
      </span>

      {!compact && (
        <a
          href={CLINIC.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[12.5px] font-medium text-heading/80 underline-offset-4 transition hover:text-peach-deep hover:underline"
        >
          <MapPin size={13} className="shrink-0 text-peach-deep" />
          In clinic at {CLINIC.addressLines[0]}, Truro · Get directions
        </a>
      )}

      <a
        href={VIRTUAL_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-sage-deep underline-offset-4 transition hover:text-heading hover:underline"
      >
        <Video size={14} /> Can&rsquo;t get to Truro just yet? Book a free
        online consultation
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
