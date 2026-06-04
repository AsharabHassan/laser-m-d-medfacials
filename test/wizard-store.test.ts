import { describe, it, expect, beforeEach } from "vitest";
import { useWizard } from "@/store/wizard-store";
import type { AnalyzeResult, Lead } from "@/lib/types";

const s = () => useWizard.getState();

const lead: Lead = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "07700900123",
  marketingConsent: true,
};

const result: AnalyzeResult = {
  bucket: "great",
  score: 90,
  hardFlags: [],
  softFlagged: false,
  routedReason: "",
  usedPhoto: true,
  narrativeSource: "claude",
  narrative: { headline: "h", narrative: "n", observedAreas: [], encouragement: "e" },
};

beforeEach(() => s().reset());

describe("wizard-store transitions", () => {
  it("starts at the hero", () => {
    expect(s().step).toBe("hero");
  });

  it("start() advances to consent", () => {
    s().start();
    expect(s().step).toBe("consent");
  });

  it("beginScan() requires consent and an image", () => {
    s().start();
    s().beginScan();
    expect(s().step).toBe("consent"); // blocked: no consent/image

    s().setImageConsent(true);
    s().setImage("b64", "image/jpeg");
    s().beginScan();
    expect(s().step).toBe("scan");
  });

  it("completeScan() moves from scan straight to the lead gate", () => {
    s().setImageConsent(true);
    s().setImage("b64", "image/jpeg");
    s().beginScan();
    s().completeScan();
    expect(s().step).toBe("lead");
  });
});

describe("wizard-store result gating", () => {
  it("reveal() is blocked until a lead is captured", () => {
    s().reveal(result);
    expect(s().step).not.toBe("result");
    expect(s().result).toBeNull();
  });

  it("reveal() unlocks the result once a lead exists, and clears the image", () => {
    s().setImage("b64", "image/jpeg");
    s().setLead(lead);
    s().reveal(result);
    expect(s().step).toBe("result");
    expect(s().result).toEqual(result);
    expect(s().imageBase64).toBeNull(); // privacy: image dropped after analysis
  });
});

describe("wizard-store reset", () => {
  it("reset() returns to the initial state", () => {
    s().setImageConsent(true);
    s().setImage("b64", "image/jpeg");
    s().setLead(lead);
    s().reset();
    expect(s().step).toBe("hero");
    expect(s().imageBase64).toBeNull();
    expect(s().lead).toBeNull();
    expect(s().imageConsent).toBe(false);
  });
});
