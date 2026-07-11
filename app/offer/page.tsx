import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarHeart,
  Gift,
  ScanFace,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ClinicFooter } from "@/components/brand/ClinicFooter";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Button } from "@/components/ui/button";
import { ResultsGallery } from "@/components/result/ResultsGallery";
import { Testimonials } from "@/components/result/Testimonials";
import { OfferHero } from "@/components/offer/OfferHero";
import { BookingCalendar } from "@/components/offer/BookingCalendar";
import { InstagramReel } from "@/components/offer/InstagramReel";
import { CLINIC, PRICE_GUIDE, VOUCHER } from "@/lib/constants";

export const metadata: Metadata = {
  title:
    "LaseMD Ultra from £149 · £100 welcome voucher · MEDfacials Truro",
  description:
    "LaseMD Ultra laser skin rejuvenation at MEDfacials, Truro — sessions from £149, plus a £100 welcome voucher when you attend your free in-clinic consultation. Doctor-led, CQC registered.",
  // Ad retargeting landing page — keep it out of search results.
  robots: { index: false, follow: false },
};

// Expanded trust factors for the retargeting page — same claims as the
// site-wide TRUST_MARKERS, with a line of supporting copy each.
const TRUST_CARDS = [
  {
    icon: BadgeCheck,
    title: "Genuine Lutronic LaseMD Ultra™",
    copy: "The new-generation thulium fractional laser — patented ampoules, gentle resurfacing, and results visible from the first session.",
  },
  {
    icon: Stethoscope,
    title: "Doctor-led, always",
    copy: `Your treatment plan is built by ${CLINIC.director}, GP and aesthetic doctor, at our ${CLINIC.addressLines[1].split(",")[0]} clinic.`,
  },
  {
    icon: ShieldCheck,
    title: "Save Face accredited & CQC registered",
    copy: "Independently assessed against national standards for safety, hygiene and patient care.",
  },
  {
    icon: Gift,
    title: `${VOUCHER.amount} welcome voucher`,
    copy: "Attend your free in-clinic consultation and a £100 voucher is yours — redeemable against your LaseMD Ultra treatment plan.",
  },
] as const;

const PACKAGES = [
  {
    name: "Single session",
    price: "from £149",
    copy: "A 20-minute glow reset — brightness and clarity from the very first treatment.",
  },
  {
    name: "Course of 3",
    price: "save 10%",
    copy: "The sweet spot for visible tone and texture change, spaced a few weeks apart.",
    featured: true,
  },
  {
    name: "Course of 5",
    price: "save 20%",
    copy: "The full transformation protocol for deeper pigmentation, texture and lines.",
  },
] as const;

export default function OfferPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AmbientBackground />

      {/* Sticky header: brand + the one action that matters */}
      <header className="sticky top-0 z-40 border-b border-sage/15 bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Logo />
          <a href="#book">
            <Button size="md">
              <CalendarHeart size={16} />
              <span className="sm:hidden">Book now</span>
              <span className="max-sm:hidden">Book free consultation</span>
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1">
        <OfferHero />

        {/* Trust factors */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Why patients choose {CLINIC.name}
            </h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {TRUST_CARDS.map(({ icon: Icon, title, copy }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-2xl border border-sage/20 bg-white/70 p-5 shadow-soft"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-peach-light/60 text-peach-deep">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-serif text-base text-heading">
                      {title}
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-body">
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before / after */}
        <section className="px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <ResultsGallery />
          </div>
        </section>

        {/* Social proof: video testimonial + written reviews */}
        <section className="bg-grain px-6 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Hear it from our patients
            </h2>
            <div className="mt-8 grid items-start gap-10 lg:grid-cols-[340px_1fr]">
              <InstagramReel />
              <Testimonials />
            </div>
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="px-6 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-3xl leading-snug text-heading">
              LaseMD Ultra sessions from{" "}
              <span className="text-peach-deep">{PRICE_GUIDE.from}</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-body">
              Tailored packages up to {PRICE_GUIDE.to}. Your exact protocol —
              and how your {VOUCHER.amount} welcome voucher applies — is
              confirmed at your free consultation.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {PACKAGES.map((p) => (
                <div
                  key={p.name}
                  className={
                    "featured" in p && p.featured
                      ? "rounded-2xl border-2 border-peach/60 bg-peach-light/20 p-6 text-center shadow-glow"
                      : "rounded-2xl border border-sage/20 bg-white/70 p-6 text-center shadow-soft"
                  }
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-deep">
                    {p.name}
                  </p>
                  <p className="mt-2 font-serif text-2xl text-heading">
                    {p.price}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-body">
                    {p.copy}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a href="#book" className="inline-block">
                <Button size="lg">
                  <CalendarHeart size={18} /> Claim your consultation & voucher
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Booking calendar */}
        <section id="book" className="scroll-mt-20 px-6 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-serif text-2xl text-heading">
              Pick a time for your free in-clinic consultation
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm text-body/80">
              At our Lemon Street clinic in Truro. Dr Stolte&apos;s team will
              assess your skin, build your personal plan — and your{" "}
              {VOUCHER.amount} welcome voucher is yours for attending.
            </p>
            <div className="mt-7">
              <BookingCalendar />
            </div>
          </div>
        </section>

        {/* Secondary path: retake the AI scan */}
        <section className="px-6 pb-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-sage/25 bg-sage/10 px-6 py-8 text-center">
            <ScanFace size={26} className="text-sage-deep" />
            <h2 className="font-serif text-xl text-heading">
              Not sure LaseMD Ultra is right for you?
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-body">
              Take the free 60-second AI skin scan (again, if you like) — one
              selfie, and you&apos;ll get a personal suitability report before
              you book.
            </p>
            <Link href="/">
              <Button variant="sage" size="md">
                <ScanFace size={16} /> Take the AI skin scan
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <ClinicFooter />
    </div>
  );
}
