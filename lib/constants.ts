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
} as const;

export const TRUST_MARKERS = [
  "Cornwall's only certified Endolift® provider",
  "Save Face accredited",
  "CQC registered",
  "Doctor-led",
] as const;

/** Booking + site URLs (overridable via public env at deploy). */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_PHOREST_BOOKING_URL ??
  "https://phorest.com/book/salons/medfacials";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://endolift.medfacials.com";

// ─────────────────────────────────────────────────────────────────────────────
// Per-bucket presentation metadata. The scoring engine chooses the bucket; this
// drives the result screen's headline, tone colour, gauge band and CTA.
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
  great: {
    label: "Strong candidate",
    headline: "Endolift looks like a strong fit for you",
    blurb:
      "Your answers point to exactly the kind of early-to-moderate firmness Endolift addresses beautifully.",
    accent: "peach",
    ctaLabel: "Book your free consultation",
    gaugeBand: [80, 100],
  },
  good: {
    label: "Good candidate",
    headline: "Endolift could work well for you",
    blurb:
      "You show many of the signs that respond well to Endolift — a consultation will confirm the detail.",
    accent: "peach",
    ctaLabel: "Book your free consultation",
    gaugeBand: [60, 80],
  },
  consultation: {
    label: "Consultation recommended",
    headline: "Endolift may help — let's confirm in person",
    blurb:
      "A few of your answers are best reviewed by Dr Stolte's team before we can be sure. That's completely normal.",
    accent: "sage",
    ctaLabel: "Book your free consultation",
    gaugeBand: [40, 65],
  },
  alternative: {
    label: "Let's explore your options",
    headline: "Another treatment may suit you better",
    blurb:
      "Your goals may be better met by a different approach. A free consultation is the best way to find the right one.",
    accent: "sage",
    ctaLabel: "Discuss your options",
    gaugeBand: [25, 50],
  },
};

/** Friendly labels for the areas a respondent can select. */
export const AREA_LABELS: Record<string, string> = {
  jawline: "jawline & jowls",
  chin: "under-chin",
  neck: "neck",
  cheeks: "mid-face & cheeks",
  undereye: "under-eye area",
  body: "body area",
};

/** Areas Endolift targets, for the result screen's "what it treats" context. */
export const ENDOLIFT_AREAS = [
  "Jawline & jowls",
  "Under-chin / double chin",
  "Neck",
  "Mid-face & cheeks",
] as const;

/** Indicative UK pricing guidance (clinic-stated ranges). */
export const PRICE_GUIDE = {
  from: "£1,450",
  note: "Indicative — your exact plan is confirmed at consultation.",
} as const;

export const DISCLAIMER =
  "This tool offers general information to help you prepare for a consultation. It is not a medical assessment or diagnosis. Suitability for Endolift is confirmed in person by a qualified practitioner.";
