# LaserMD Suitability Analyzer · MEDfacials

A cinematic, mobile-first lead-generation web app for **MEDfacials** (Truro, Cornwall — Dr Joe Stolte). A visitor takes a selfie, Claude Vision analyses their skin, and they receive a personalised **LaseMD Ultra™** suitability report — on screen and as a branded PDF emailed automatically. Qualified leads flow into **GoHighLevel** with concern tags for AI sales-agent follow-up, and convert via a **free in-clinic consultation (+ £100 welcome voucher)** or a free virtual video consultation as fallback.

> The tool is a **cosmetic, informational pre-consultation guide — not a medical assessment or diagnosis.** Suitability is always confirmed in person.

## How it works

1. **Hero** ("Reveal your skin's natural brilliance") → consent → **photo** (camera or upload).
2. **On-device scan theatre** — MediaPipe draws a 478-point face mesh while the real Claude analysis runs behind it. Landmarks never leave the device; only the selfie goes to `/api/analyze`.
3. **Lead gate** — name/email/phone + a *separate* marketing-consent checkbox (PECR). Submitting fires the lead webhook and the PDF report delivery, then reveals the result.
4. **Result** — animated suitability score (65–95 typical, never a rejection), the visitor's own face mapped with their skin concerns (pigmentation, redness, texture, fine lines, dullness) with cropped close-ups and improvement bars, the **£100 voucher card**, dual booking CTAs, pricing teaser (£149–£499, courses of 3/5), social proof, and a PDF download.

### The conversion model
- **Primary CTA**: free in-clinic consultation at Lemon Street → `NEXT_PUBLIC_BOOKING_URL`. Booking it makes the GHL voucher automation send the £100 voucher email (no voucher logic in the app).
- **Fallback CTA**: free virtual video consultation → `NEXT_PUBLIC_VIRTUAL_BOOKING_URL`, styled subordinate.
- A mobile **sticky booking bar** appears after the first screenful and hides at the final CTA.

### The safety model
- **Claude Vision** (`claude-sonnet-5`) chooses one of four outcomes — excellent / strong / good / consultation. There is **no rejection outcome**; "consultation" is reserved for unreadable photos and framed as "your protocol is confirmed in person".
- Scores are the sum of three factors Claude rates (concernClarity 0–40, skinReadiness 0–30, rejuvenationPotential 0–30), clamped into per-bucket display bands with a floor of 62.
- The AI never names medical conditions ("areas of deeper pigmentation", never "melasma") — see `lib/prompts/system-lasermd.ts`.
- A beard hides the mouth/chin read but **never disqualifies** — upper-face skin is still assessed.
- The uploaded image lives only in the `/api/analyze` request scope and is **never stored or logged**. If Claude is unavailable, a deterministic on-brand fallback routes to a consultation, so a user always gets a result.

## The retargeting offer page — `/offer`

A standalone `noindex` landing page for ad retargeting: voucher-led hero, trust factors, before/after sliders, Instagram testimonial + reviews, **package cards** (single from £149, course of 3 −10%, course of 5 −20%), and the GHL calendar **embedded as a plain iframe on purpose** — GHL's `form_embed.js` hides the iframe until a postMessage handshake that doesn't always complete; see `components/offer/BookingCalendar.tsx`.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind v4 · Motion · MediaPipe Tasks Vision · Anthropic SDK · Zustand · jsPDF · Vitest.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev                         # http://localhost:3000
```

To test the camera on a real phone over LAN (secure context required):
`npm run build` then `node https-server.mjs` → `https://<lan-ip>:3001` (self-signed certs in `certificates/`).

### Environment variables (`.env.local`)
| Var | Scope | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | server | Claude Vision skin analysis |
| `ANTHROPIC_MODEL` | server (optional) | defaults to `claude-sonnet-5` |
| `GHL_WEBHOOK_URL` | server | GoHighLevel inbound lead webhook |
| `GHL_API_TOKEN` | server | GHL Private Integration (report delivery) |
| `GHL_LOCATION_ID` | server | GHL location |
| `GHL_REPORT_FIELD_KEY` | server (optional) | contact custom field, default `lasermd_report_pdf` |
| `NEXT_PUBLIC_BOOKING_URL` | public | in-clinic consultation calendar (primary, voucher) |
| `NEXT_PUBLIC_VIRTUAL_BOOKING_URL` | public | virtual video consultation calendar (fallback) |
| `NEXT_PUBLIC_OFFER_CALENDAR_URL` | public (optional) | `/offer` embed, defaults to in-clinic |
| `NEXT_PUBLIC_SITE_URL` | public | canonical / OG URL |
| `NEXT_PUBLIC_META_PIXEL_ID` | public (optional) | Meta Pixel override |

## GoHighLevel setup (client checklist)

1. **Two calendars**: the free **in-clinic** LaseMD consultation (Lemon Street) and the free **virtual video** consultation → paste both widget URLs into the env vars above.
2. **Inbound webhook workflow** → `GHL_WEBHOOK_URL`. The payload includes `firstName/lastName/email/phone`, `source: "LaserMD Suitability Analyzer"`, `suitabilityBucket/Label/Score`, `primaryConcern`, `concerns[]`, `marketingConsent`, and tags:
   - `lasermd-analyzer`, `lasermd-<bucket>` (excellent/great/good/consultation)
   - `lasermd-voucher-eligible` — key off this for the voucher automation
   - `lasermd-concern-<primaryConcern>` — for concern-specific follow-up
3. **Voucher automation**: workflow trigger = *Appointment Booked* on the **in-clinic** calendar, condition = contact has tag `lasermd-voucher-eligible` → send the £100 voucher email. The app only promises the voucher; GHL fulfils it.
4. **Private Integration** token (contacts.write, medias.write, conversations/message.write) + Location ID, and a contact **custom field** with key `lasermd_report_pdf` (the report PDF URL is written there; the PDF is also uploaded to Media, pinned as a note, and emailed to the client with both booking links).

## Tests & build
```bash
npm test        # 40 unit tests (assessment bands, face regions, GHL payload, quality gate, wizard store)
npm run lint
npm run build   # production build + type-check
```

## Deploy (Vercel)
1. Push to a Git repo and import into Vercel. The app is at the **repository root**, so leave **Root Directory** empty (`./`) — do **not** set it to a subfolder, or Vercel will 404. Framework Preset auto-detects **Next.js**.
2. Set the env vars above (Production + Preview).
3. Point `lasermd.medfacials.com` at the deployment (client adds the CNAME).

## Before go-live (compliance checklist)
- **Dr Stolte sign-off** on all medical-adjacent copy: the AI's non-diagnostic wording, downtime claims in What to Expect, the disclaimer, and the "suitable from teenage years" positioning (recommend an 18+ note since the app captures leads).
- **Voucher T&Cs** — one line from the clinic (new clients only? minimum spend? expiry?) for the VoucherCard and PDF.
- Real **LaseMD Ultra before/after photos** (currently placeholder clinic cases in `public/results/`), a LaserMD Instagram reel for `/offer`, and confirmation of the £149–£499 pricing tiers.
- A **UK GDPR DPIA** for selfie processing is recommended.
- Confirm the Meta Pixel ID and GHL webhook are live, and run the score-distribution test (~10 varied selfies → verify 65–95 spread).
