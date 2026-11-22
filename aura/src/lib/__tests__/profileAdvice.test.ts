import { describe, it, expect } from "vitest";
import { buildFallbackAdvice, type UserProfile } from "../ai-service";

describe("buildFallbackAdvice - profile-specific", () => {
  function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
    return {
      name: "Test User",
      location: "Delhi",
      country: "IN",
      lifestyle: "Budget" as const,
      concern: "Health focus" as const,
      communicationStyle: "Direct" as const,
      language: "en" as const,
      ...overrides,
    };
  }

  it("adapts to Budget lifestyle", () => {
    const result = buildFallbackAdvice(makeProfile({ lifestyle: "Budget" }), { aqi: 150, riskBand: "unhealthy" });
    expect(result.cards[0].body).toContain("Limit outdoor activity");
  });

  it("adapts to Time Availability lifestyle", () => {
    const result = buildFallbackAdvice(makeProfile({ lifestyle: "Time Availability" }), { aqi: 150, riskBand: "unhealthy" });
    expect(result.cards[0].body).toContain("Move your workout indoors");
  });

  it("adapts to Environmental concern", () => {
    const result = buildFallbackAdvice(makeProfile({ concern: "Environmental focus" }), { aqi: 100, riskBand: "moderate" });
    expect(result.cards[0].detail).toContain("CO2");
  });

  it("adapts to Health concern", () => {
    const result = buildFallbackAdvice(makeProfile({ concern: "Health focus" }), { aqi: 300, riskBand: "hazardous" });
    expect(result.cards[0].detail).toContain("exposure");
  });

  it("includes city name in advice", () => {
    const result = buildFallbackAdvice(makeProfile({ location: "Mumbai" }), { aqi: 150, riskBand: "unhealthy", city: "Mumbai" });
    expect(result.cards[0].body).toContain("mumbai");
  });
});
