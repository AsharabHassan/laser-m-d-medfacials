import { create } from "zustand";
import type { AnalyzeResult, Lead } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// The wizard is a small, explicit state machine: hero → consent → scan → lead →
// result. The result cannot be revealed until a lead is captured, and the selfie
// is dropped from memory the moment it's no longer needed (privacy).
// ─────────────────────────────────────────────────────────────────────────────

export type Step = "hero" | "consent" | "scan" | "lead" | "result";

export type MediaType = "image/jpeg" | "image/png" | "image/webp";

interface WizardState {
  step: Step;
  imageConsent: boolean;
  imageBase64: string | null;
  imageMediaType: MediaType;
  lead: Lead | null;
  result: AnalyzeResult | null;
  error: string | null;

  // transitions
  start: () => void;
  setImageConsent: (v: boolean) => void;
  setImage: (base64: string, mediaType: MediaType) => void;
  beginScan: () => void;
  completeScan: () => void;
  goToLead: () => void;
  setLead: (lead: Lead) => void;
  reveal: (result: AnalyzeResult) => void;
  clearImage: () => void;
  setError: (msg: string | null) => void;
  goToStep: (step: Step) => void;
  reset: () => void;
}

const initial = {
  step: "hero" as Step,
  imageConsent: false,
  imageBase64: null as string | null,
  imageMediaType: "image/jpeg" as MediaType,
  lead: null as Lead | null,
  result: null as AnalyzeResult | null,
  error: null as string | null,
};

export const useWizard = create<WizardState>((set, get) => ({
  ...initial,

  start: () => set({ step: "consent" }),

  setImageConsent: (v) => set({ imageConsent: v }),

  setImage: (base64, mediaType) =>
    set({ imageBase64: base64, imageMediaType: mediaType }),

  beginScan: () => {
    const { imageConsent, imageBase64 } = get();
    if (!imageConsent || !imageBase64) return; // blocked
    set({ step: "scan" });
  },

  completeScan: () => set({ step: "lead" }),

  goToLead: () => set({ step: "lead" }),

  setLead: (lead) => set({ lead }),

  reveal: (result) => {
    if (!get().lead) return; // gated behind lead capture
    set({ step: "result", result, imageBase64: null });
  },

  clearImage: () => set({ imageBase64: null }),

  setError: (msg) => set({ error: msg }),

  goToStep: (step) => set({ step }),

  reset: () => set({ ...initial }),
}));
