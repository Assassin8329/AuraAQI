import { describe, it, expect } from "vitest";
import { buildFallbackAdvice } from "../ai-service";

describe("buildFallbackAdvice", () => {
  const baseProfile = {
    name: "Test User",
    location: "Delhi",
    country: "IN",
    lifestyle: "Budget" as const,
    concern: "Health focus" as const,
    communicationStyle: "Direct" as const,
    language: "en" as const,
  };

  it("returns 3 advice cards", () => {
    const result = buildFallbackAdvice(baseProfile, { aqi: 150, riskBand: "unhealthy" });
    expect(result.cards).toHaveLength(3);
  });

  it("returns correct risk band and AQI", () => {
    const result = buildFallbackAdvice(baseProfile, { aqi: 150, riskBand: "unhealthy" });
    expect(result.riskBand).toBe("unhealthy");
    expect(result.aqi).toBe(150);
  });

  it("cards have correct IDs", () => {
    const result = buildFallbackAdvice(baseProfile, { aqi: 150, riskBand: "unhealthy" });
    const ids = result.cards.map((c) => c.id);
    expect(ids).toContain("routine");
    expect(ids).toContain("indoor");
    expect(ids).toContain("sustainable");
  });

  it("cards have correct tones", () => {
    const result = buildFallbackAdvice(baseProfile, { aqi: 150, riskBand: "unhealthy" });
    expect(result.cards[0].tone).toBe("action");
    expect(result.cards[1].tone).toBe("community");
    expect(result.cards[2].tone).toBe("official");
  });

  it("source is 'fallback'", () => {
    const result = buildFallbackAdvice(baseProfile, { aqi: 150, riskBand: "unhealthy" });
    expect(result.source).toBe("fallback");
  });

  it("includes health impact for health-focused user", () => {
    const profile = { ...baseProfile, concern: "Health focus" as const };
    const result = buildFallbackAdvice(profile, { aqi: 300, riskBand: "hazardous" });
    expect(result.cards[0].detail).toContain("exposure");
  });

  it("includes CO2 impact for environmental-focused user", () => {
    const profile = { ...baseProfile, concern: "Environmental focus" as const };
    const result = buildFallbackAdvice(profile, { aqi: 100, riskBand: "moderate" });
    expect(result.cards[0].detail).toContain("CO2");
  });

  it("includes PM2.5 in routine for budget lifestyle", () => {
    const profile = { ...baseProfile, lifestyle: "Budget" as const };
    const result = buildFallbackAdvice(profile, { aqi: 150, riskBand: "unhealthy", city: "Delhi" });
    expect(result.cards[0].body).toContain("delhi");
  });
});
