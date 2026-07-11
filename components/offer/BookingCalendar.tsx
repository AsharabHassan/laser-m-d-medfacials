"use client";

import { Phone, ExternalLink } from "lucide-react";
import { OFFER, CLINIC } from "@/lib/constants";

/**
 * GoHighLevel booking calendar embedded directly in the page as a plain
 * iframe. Deliberately does NOT load GHL's form_embed.js helper: that script
 * hides the iframe (opacity 0, off-screen) until a "ready" postMessage
 * arrives from the widget, and when that handshake fails the calendar stays
 * permanently invisible. The plain iframe always renders and scrolls its own
 * content; the height comfortably fits the widget's ~1090px layout.
 */
export function BookingCalendar() {
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-sage/20 bg-white shadow-soft">
        <iframe
          src={OFFER.calendarUrl}
          title="Book your free LaseMD Ultra in-clinic consultation"
          id="lasermd-consult-calendar"
          className="block h-[1120px] w-full border-0 max-sm:h-[980px]"
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 text-sm text-body/80 sm:flex-row sm:justify-center sm:gap-6">
        <a
          href={CLINIC.phoneHref}
          className="inline-flex items-center gap-1.5 font-medium text-sage-deep transition hover:text-heading"
        >
          <Phone size={14} /> Or call us on {CLINIC.phone}
        </a>
        <a
          href={OFFER.calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-sage-deep transition hover:text-heading"
        >
          <ExternalLink size={14} /> Open the calendar in a new tab
        </a>
      </div>
    </div>
  );
}
