# Endolift Suitability Analyzer · MEDfacials

A cinematic, standalone web-app lead magnet for **MEDfacials** (Truro, Cornwall — Dr Joe Stolte). A visitor takes a selfie, answers a short clinical quiz, and receives a personalised Endolift suitability result. Qualified leads flow into **GoHighLevel** for AI sales-agent follow-up.

> The tool is a **cosmetic, informational pre-consultation guide — not a medical assessment or diagnosis.** Suitability is always confirmed in person.

## How it works

1. **Hero** → consent → **photo** (camera or upload) *or* a no-photo quiz-only path.
2. **On-device scan** — MediaPipe draws a 478-point face mesh as an "AI analysis" animation. The selfie never leaves the device for this step.
3. **Quiz** — 10 one-at-a-time screening questions.
4. **Lead gate** — name/email/phone + a *separate* marketing-consent checkbox. Submitting fires the lead to GoHighLevel.
5. **Result** — an animated verdict (strong / good / consultation / explore-options), a personalised narrative, target areas, what-to-expect, and a booking CTA to Phorest.

### The safety model
- `lib/scoring.ts` is the **authoritative** engine. Hard flags (pregnancy, infection, contraindications, severe laxity, etc.) override everything and route to a consultation. It never returns a flat "you don't qualify".
- **Claude Vision** (`claude-sonnet-4-6`) only writes the narrative *within* the bucket the scorer already chose — it can never escalate suitability.
- The uploaded image lives only in the `/api/analyze` request scope and is **never stored or logged**. If Claude is unavailable, a deterministic on-brand fallback narrative is used, so a user always gets a result.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind v4 · Motion · MediaPipe Tasks Vision · Anthropic SDK · Zustand · Vitest.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev                         # http://localhost:3000
```

The **quiz-only path works with no configuration.** The photo + Claude narrative and GoHighLevel delivery need the env vars below.

### Environment variables (`.env.local`)
| Var | Scope | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | server | Claude Vision narrative |
| `ANTHROPIC_MODEL` | server (optional) | defaults to `claude-sonnet-4-6` |
| `GHL_WEBHOOK_URL` | server | GoHighLevel inbound webhook |
| `NEXT_PUBLIC_PHOREST_BOOKING_URL` | public | booking link |
| `NEXT_PUBLIC_SITE_URL` | public | canonical / OG URL |

## Tests & build
```bash
npm test        # 39 unit tests (scoring, GHL payload, quality gate, wizard store)
npm run build   # production build + type-check
```

## Deploy (Vercel)
1. Push to a Git repo and import into Vercel (root: `endolift-app`).
2. Set the env vars above in the Vercel project.
3. Point `endolift.medfacials.com` at the deployment.

## Before go-live
- **Dr Stolte should sign off the contraindication / hard-flag copy** in `lib/scoring.ts` and `components/quiz/questions.ts` — it carries medical-liability weight.
- Confirm the GoHighLevel webhook URL and that the AI-agent sequence keys off the `endolift-<bucket>` tags and the `marketingConsent` field.
- A UK GDPR DPIA covering the selfie processing is recommended (the app minimises risk by never storing the image and keeping marketing consent separate).
