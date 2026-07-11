"use client";

import { Play } from "lucide-react";
import { OFFER } from "@/lib/constants";

/**
 * A MEDfacials patient's video testimonial, embedded via Instagram's public
 * /embed endpoint (no SDK needed). PLACEHOLDER: currently the clinic's Endolift
 * reel — swap OFFER.instagramReelUrl for a LaseMD Ultra reel when supplied.
 * If Instagram blocks the frame for a visitor, the link below still opens it.
 */
export function InstagramReel() {
  const embedSrc = `${OFFER.instagramReelUrl.replace(/\/+$/, "")}/embed/`;

  return (
    <figure className="mx-auto w-full max-w-[340px]">
      <div className="overflow-hidden rounded-2xl border border-sage/20 bg-white shadow-soft">
        <iframe
          src={embedSrc}
          title="MEDfacials patient testimonial on Instagram"
          loading="lazy"
          allow="encrypted-media"
          className="block h-[560px] w-full border-0"
        />
      </div>
      <figcaption className="mt-3 text-center text-[13px] text-body/80">
        A MEDfacials patient shares her experience.{" "}
        <a
          href={OFFER.instagramReelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-sage-deep transition hover:text-heading"
        >
          <Play size={13} /> Watch on Instagram
        </a>
      </figcaption>
    </figure>
  );
}
