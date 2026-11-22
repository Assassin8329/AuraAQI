import { describe, it, expect } from "vitest";
import { getAirQuality, type AirQuality } from "../air-quality";

describe("getAirQuality", () => {
  it("returns valid AirQuality for Delhi", async () => {
    const result = await getAirQuality("Delhi");
    expect(result).toBeDefined();
    expect(typeof result.aqi).toBe("number");
    expect(result.aqi).toBeGreaterThanOrEqual(0);
    expect(typeof result.pm25).toBe("number");
    expect(typeof result.pm10).toBe("number");
  });

  it("returns valid AirQuality for Mumbai", async () => {
    const result = await getAirQuality("Mumbai");
    expect(result).toBeDefined();
    expect(typeof result.aqi).toBe("number");
    expect(result.aqi).toBeGreaterThanOrEqual(0);
  });

  it("returns valid AirQuality for a US city", async () => {
    const result = await getAirQuality("Los Angeles");
    expect(result).toBeDefined();
    expect(typeof result.aqi).toBe("number");
    expect(result.aqi).toBeGreaterThanOrEqual(0);
  });

  it("handles empty location gracefully", async () => {
    await expect(getAirQuality("")).rejects.toThrow();
  });
});
