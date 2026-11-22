import { describe, it, expect } from "vitest";
import { riskBandFor } from "../ai-service";

describe("riskBandFor - edge cases", () => {
  it("handles negative AQI", () => {
    expect(riskBandFor(-10)).toBe("good");
    expect(riskBandFor(-1)).toBe("good");
  });

  it("handles zero AQI", () => {
    expect(riskBandFor(0)).toBe("good");
  });

  it("handles boundary values at 50", () => {
    expect(riskBandFor(50)).toBe("good");
    expect(riskBandFor(51)).toBe("moderate");
  });

  it("handles boundary values at 100", () => {
    expect(riskBandFor(100)).toBe("moderate");
    expect(riskBandFor(101)).toBe("unhealthy");
  });

  it("handles boundary values at 200", () => {
    expect(riskBandFor(200)).toBe("unhealthy");
    expect(riskBandFor(201)).toBe("hazardous");
  });

  it("handles very large AQI", () => {
    expect(riskBandFor(9999)).toBe("hazardous");
    expect(riskBandFor(500)).toBe("hazardous");
  });

  it("handles float values", () => {
    expect(riskBandFor(50.5)).toBe("moderate");
    expect(riskBandFor(100.5)).toBe("unhealthy");
    expect(riskBandFor(200.5)).toBe("hazardous");
  });

  it("is deterministic", () => {
    const inputs = [0, 25, 50, 51, 100, 101, 200, 201, 500, 1000];
    const results = inputs.map(riskBandFor);
    const unique = new Set(results);
    expect(unique).toEqual(new Set(["good", "moderate", "unhealthy", "hazardous"]));
  });
});
