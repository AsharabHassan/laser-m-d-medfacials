import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { CLINIC, DISCLAIMER } from "@/lib/constants";
import { Logo } from "./Logo";

export function ClinicFooter() {
  return (
    <footer className="mt-auto bg-heading px-6 py-12 text-white/80">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo tone="light" withByline />
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {CLINIC.tagline}.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-serif text-base text-white">Visit us</p>
          {CLINIC.addressLines.map((l) => (
            <p key={l} className="text-white/70">
              {l}
            </p>
          ))}
          <a
            href={CLINIC.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/80 underline-offset-4 transition hover:text-peach-light hover:underline"
          >
            <MapPin size={14} /> View on Google Maps
          </a>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-serif text-base text-white">Get in touch</p>
          <a
            href={CLINIC.phoneHref}
            className="flex items-center gap-2 text-white/80 transition hover:text-peach-light"
          >
            <Phone size={14} /> {CLINIC.phone}
          </a>
          <a
            href={`mailto:${CLINIC.email}`}
            className="flex items-center gap-2 text-white/80 transition hover:text-peach-light"
          >
            <Mail size={14} /> {CLINIC.email}
          </a>
          <p className="flex items-center gap-2 text-white/60">
            <Clock size={14} /> {CLINIC.hours}
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-5xl border-t border-white/10 pt-6">
        <p className="text-xs leading-relaxed text-white/45">{DISCLAIMER}</p>
        <p className="mt-3 text-xs text-white/40">
          © {CLINIC.name} · {CLINIC.director}
        </p>
      </div>
    </footer>
  );
}
