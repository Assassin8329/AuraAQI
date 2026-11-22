import { describe, it, expect } from "vitest";
import { riskBandFor } from "../ai-service";

describe("riskBandFor", () => {
  it("returns 'good' for AQI 0-50", () => {
    expect(riskBandFor(0)).toBe("good");
    expect(riskBandFor(25)).toBe("good");
    expect(riskBandFor(50)).toBe("good");
  });

  it("returns 'moderate' for AQI 51-100", () => {
    expect(riskBandFor(51)).toBe("moderate");
    expect(riskBandFor(75)).toBe("moderate");
    expect(riskBandFor(100)).toBe("moderate");
  });

  it("returns 'unhealthy' for AQI 101-200", () => {
    expect(riskBandFor(101)).toBe("unhealthy");
    expect(riskBandFor(150)).toBe("unhealthy");
    expect(riskBandFor(200)).toBe("unhealthy");
  });

  it("returns 'hazardous' for AQI above 200", () => {
    expect(riskBandFor(201)).toBe("hazardous");
    expect(riskBandFor(300)).toBe("hazardous");
    expect(riskBandFor(500)).toBe("hazardous");
  });
});
