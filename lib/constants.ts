import type { Bucket } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Clinic brand + contact constants (MEDfacials, Truro). Single source of truth
// for copy that appears across screens.
// ─────────────────────────────────────────────────────────────────────────────

export const CLINIC = {
  name: "MEDfacials",
  byline: "by Dr Stolte",
  director: "Dr Joe Stolte",
  tagline: "Truro's Trusted Aesthetic Skin, Laser & Haircare Clinic",
  addressLines: ["Kent House, 14/15 Lemon Street", "Truro, Cornwall, TR1 2LS"],
  phone: "01872 229740",
  phoneHref: "tel:+441872229740",
  email: "contact@medfacials.com",
  hours: "Mon–Fri 9–6 · Sat 9–2",
  /** Google Maps link so in-clinic visitors know exactly where to come. */
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=MEDfacials%2C%20Kent%20House%2C%2014%2F15%20Lemon%20Street%2C%20Truro%20TR1%202LS",
} as const;

export const TRUST_MARKERS = [
  "Lutronic LaseMD Ultra™",
  "Save Face accredited",
  "CQC registered",
  "Doctor-led",
] as const;

/** Booking + site URLs (overridable via public env at deploy).
 *  BOOKING_URL is the PRIMARY conversion — the free in-clinic consultation at
 *  Lemon Street (books the £100 voucher automation in GHL).
 *  VIRTUAL_BOOKING_URL is the fallback — a free virtual video consultation. */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ??
  "https://links.medfacials.com/widget/bookings/book-laser-m-d-treatment";

export const VIRTUAL_BOOKING_URL =
  process.env.NEXT_PUBLIC_VIRTUAL_BOOKING_URL ??
  "https://links.medfacials.com/widget/bookings/endolift-free-online-consultation";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://lasermd.medfacials.com";

// ─────────────────────────────────────────────────────────────────────────────
// Per-bucket presentation metadata. Claude chooses the bucket; this drives the
// result screen's headline, tone colour, gauge band and CTA.
// ─────────────────────────────────────────────────────────────────────────────

export interface BucketMeta {
  label: string;
  /** Default headline used by the deterministic fallback narrative. */
  headline: string;
  /** Encouraging sub-line. */
  blurb: string;
  /** Brand token used to theme the verdict (CSS var name without `--color-`). */
  accent: "peach" | "sage";
  ctaLabel: string;
  /** Indicative gauge band centre for this bucket (0–100). */
  gaugeBand: [number, number];
}

export const BUCKET_META: Record<Bucket, BucketMeta> = {
  excellent: {
    label: "Excellent candidate",
    headline: "LaseMD Ultra looks like an excellent fit for you",
    blurb:
      "Your skin shows exactly the kind of concerns LaseMD Ultra treats beautifully — this is where it shines.",
    accent: "peach",
    ctaLabel: "Book your free in-clinic consultation",
    gaugeBand: [86, 100],
  },
  great: {
    label: "Strong candidate",
    headline: "LaseMD Ultra looks like a strong fit for you",
    blurb:
      "Your skin shows the kind of tone and texture changes LaseMD Ultra addresses beautifully.",
    accent: "peach",
    ctaLabel: "Book your free in-clinic consultation",
    gaugeBand: [76, 92],
  },
  good: {
    label: "Good candidate",
    headline: "LaseMD Ultra could work well for you",
    blurb:
      "Your skin is a good match — from refining texture to protecting the glow you already have.",
    accent: "peach",
    ctaLabel: "Book your free in-clinic consultation",
    gaugeBand: [67, 85],
  },
  consultation: {
    label: "Personalised protocol",
    headline: "Let's build your personalised protocol",
    blurb:
      "Your consultation will confirm your personalised protocol — that's completely normal, and it's free.",
    accent: "sage",
    ctaLabel: "Book your free in-clinic consultation",
    gaugeBand: [60, 78],
  },
};

/** Skin concerns LaseMD Ultra treats, for the result screen's context. */
export const LASERMD_CONCERNS = [
  "Pigmentation & sun damage",
  "Redness & uneven tone",
  "Texture & enlarged pores",
  "Fine lines",
  "Dullness & radiance",
] as const;

/** Indicative UK pricing guidance (clinic-stated ranges). */
export const PRICE_GUIDE = {
  from: "£149",
  to: "£499",
  courses: "Courses of 3 (save 10%) · Courses of 5 (save 20%)",
  note: "Indicative — your exact plan is confirmed at consultation.",
} as const;

/** The welcome voucher promised on in-clinic consultation bookings. The voucher
 *  email itself is sent by a GHL automation after the appointment is booked —
 *  the app only makes the promise. */
export const VOUCHER = {
  amount: "£100",
  title: "£100 Welcome Voucher",
  promise:
    "Yours when you attend your free in-clinic consultation at our Truro clinic and start a course of 3 LaseMD Ultra treatments.",
  condition: "Redeemable on a course of 3 treatments",
  urgency: "Consultation places at our Truro clinic are limited each month.",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Retargeting offer page (/offer): package pricing, the embedded GoHighLevel
// booking calendar and social proof.
// ─────────────────────────────────────────────────────────────────────────────

export const OFFER = {
  /** Single-session "from" price in GBP. */
  price: 149,
  /** Headline single-session price for the flagship package. */
  topPrice: 499,
  /** GoHighLevel booking calendar embedded on the offer page (defaults to the
   *  same in-clinic calendar every other booking CTA uses). */
  calendarUrl: process.env.NEXT_PUBLIC_OFFER_CALENDAR_URL ?? BOOKING_URL,
  /** Instagram reel — a MEDfacials patient testimonial. */
  instagramReelUrl: "https://www.instagram.com/reel/DJUhCJEMtsw/",
  /** Clinic finance page (Payl8r on medfacials.com). */
  financeUrl: "https://medfacials.com/easy-finance/",
} as const;

export const DISCLAIMER =
  "This tool offers general information to help you prepare for a consultation. It is not a medical assessment or diagnosis. Suitability for LaseMD Ultra is confirmed in person by a qualified practitioner. The £100 welcome voucher is redeemable only when you sign up for a course of 3 treatments; one per new client, issued at your in-clinic consultation.";
