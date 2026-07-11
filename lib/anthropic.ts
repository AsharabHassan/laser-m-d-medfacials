import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { Bucket, ConcernKey, PhotoAssessment, SkinConcern } from "./types";
import { serverEnv } from "./env";
import { SYSTEM_LASERMD } from "./prompts/system-lasermd";
import { RESULT_SCHEMA } from "./prompts/result-schema";
import { toRegionKey } from "./face-regions";
import type { MediaType } from "@/store/wizard-store";

// ─────────────────────────────────────────────────────────────────────────────
// Server-only Claude Vision call. The system prompt is sent as a cached prefix;
// the photo goes in the user turn. Claude both chooses the cosmetic suitability
// outcome and writes the narrative; the route maps `suitability` to a Bucket.
// ─────────────────────────────────────────────────────────────────────────────

const VALID: Bucket[] = ["excellent", "great", "good", "consultation"];
const MAP: Record<string, Bucket> = {
  excellent: "excellent",
  strong: "great",
  good: "good",
  consultation: "consultation",
};

const CONCERNS: ConcernKey[] = [
  "pigmentation",
  "redness",
  "texture",
  "fine-lines",
  "dullness",
];

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: serverEnv().ANTHROPIC_API_KEY });
  return client;
}

export async function assessPhoto(params: {
  imageBase64: string;
  imageMediaType: MediaType;
}): Promise<PhotoAssessment> {
  const env = serverEnv();

  const message = await getClient().messages.create({
    model: env.ANTHROPIC_MODEL,
    max_tokens: 900,
    thinking: { type: "disabled" },
    system: [
      {
        type: "text",
        text: SYSTEM_LASERMD,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: RESULT_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: params.imageMediaType,
              data: params.imageBase64,
            },
          },
          {
            type: "text",
            text: "Assess this selfie and produce the personalised LaseMD Ultra skin analysis as the structured fields.",
          },
        ],
      },
    ],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("no text block");
  const raw = JSON.parse(block.text) as {
    suitability: string;
    concernClarity: number;
    skinReadiness: number;
    rejuvenationPotential: number;
    lowerFaceObscured: boolean;
    skinConcerns: {
      concern: string;
      region: string;
      improvementPercent: number;
      observation: string;
    }[];
    primaryConcern: string;
    framingAdequate: boolean;
    headline: string;
    narrative: string;
    observedAreas: string[];
    encouragement: string;
  };
  const bucket = MAP[raw.suitability];
  if (
    !bucket ||
    !VALID.includes(bucket) ||
    typeof raw.headline !== "string" ||
    typeof raw.narrative !== "string" ||
    !Array.isArray(raw.observedAreas) ||
    typeof raw.encouragement !== "string"
  ) {
    throw new Error("malformed assessment");
  }

  // The score is the sum of Claude's three observed factors (0–100). Summing
  // independently-judged parts gives a genuine, face-specific number that varies
  // photo-to-photo, instead of anchoring to a band midpoint. Missing/invalid
  // factors → NaN, and buildResult falls back to the bucket midpoint.
  const factors = [
    raw.concernClarity,
    raw.skinReadiness,
    raw.rejuvenationPotential,
  ];
  const score = factors.every((n) => typeof n === "number" && Number.isFinite(n))
    ? factors.reduce((a, b) => a + b, 0)
    : NaN;

  // Validate Claude's skin concerns: known enums only, regions mapped onto our
  // RegionKeys, percentages clamped 0–100, at most 5 rows kept in order.
  const skinConcerns: SkinConcern[] = [];
  if (Array.isArray(raw.skinConcerns)) {
    for (const item of raw.skinConcerns) {
      if (skinConcerns.length >= 5) break;
      const concern = CONCERNS.find((c) => c === item?.concern);
      const region = toRegionKey(String(item?.region ?? ""));
      const pct = Number(item?.improvementPercent);
      if (!concern || !region || !Number.isFinite(pct)) continue;
      skinConcerns.push({
        concern,
        region,
        improvementPercent: Math.max(0, Math.min(100, Math.round(pct))),
        observation:
          typeof item.observation === "string" ? item.observation : "",
      });
    }
  }

  const primaryConcern =
    CONCERNS.find((c) => c === raw.primaryConcern) ??
    skinConcerns[0]?.concern ??
    null;

  return {
    suitability: bucket,
    score,
    lowerFaceObscured: raw.lowerFaceObscured === true,
    skinConcerns,
    primaryConcern,
    framingAdequate: raw.framingAdequate !== false,
    narrative: {
      headline: raw.headline,
      narrative: raw.narrative,
      observedAreas: raw.observedAreas,
      encouragement: raw.encouragement,
    },
  };
}
