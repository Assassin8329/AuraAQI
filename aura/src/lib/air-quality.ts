import { demoAqi } from "./demo-data";

export type AirQuality = {
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  latitude: number;
  longitude: number;
  city: string;
  region: string | null;
  country: string | null;
  observedAt: string | null;
  source: string;
  station: string | null;
};

type GeocodeResult = {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "Request failed. Please try again.");
  }
  return (await response.json()) as T;
}

async function geocode(location: string) {
  const params = new URLSearchParams({
    name: location,
    count: "1",
    language: "en",
    format: "json",
  });
  const response = await fetchJson<{ results: GeocodeResult[] }>(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`
  );
  const place = response.results?.[0];
  if (!place || typeof place.latitude !== "number") {
    throw new Error(`Could not find a location matching "${location}".`);
  }
  return place;
}

async function fetchAirQuality(lat: number, lon: number, place?: GeocodeResult): Promise<AirQuality> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "us_aqi,pm2_5,pm10",
    timezone: "auto",
  });

  const data = await fetchJson<Record<string, unknown>>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`
  );

  const current = (data as any).current as {
    us_aqi?: number;
    pm2_5?: number;
    pm10?: number;
    time?: string;
  } | null;

  if (!current) {
    throw new Error("Air quality data is unavailable right now.");
  }

  // Calculate US AQI from PM2.5 (EPA breakpoints)
  function calcAqiFromPm25(pm25: number): number {
    if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
    if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
    if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
    if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
    if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
    if (pm25 <= 350.4) return Math.round(((400 - 301) / (350.4 - 250.5)) * (pm25 - 250.5) + 301);
    if (pm25 <= 500.4) return Math.round(((500 - 401) / (500.4 - 350.5)) * (pm25 - 350.5) + 401);
    return 500;
  }

  function calcAqiFromPm10(pm10: number): number {
    if (pm10 <= 54) return Math.round((50 / 54) * pm10);
    if (pm10 <= 154) return Math.round(((100 - 51) / (154 - 55)) * (pm10 - 55) + 51);
    if (pm10 <= 254) return Math.round(((150 - 101) / (254 - 155)) * (pm10 - 155) + 101);
    if (pm10 <= 354) return Math.round(((200 - 151) / (354 - 255)) * (pm10 - 255) + 151);
    if (pm10 <= 424) return Math.round(((300 - 201) / (424 - 355)) * (pm10 - 355) + 201);
    if (pm10 <= 504) return Math.round(((400 - 301) / (504 - 425)) * (pm10 - 425) + 301);
    if (pm10 <= 604) return Math.round(((500 - 401) / (604 - 505)) * (pm10 - 505) + 401);
    return 500;
  }

  const rawUsAqi = typeof current.us_aqi === "number" ? current.us_aqi : 0;
  const pm25 = typeof current.pm2_5 === "number" ? current.pm2_5 : null;
  const pm10 = typeof current.pm10 === "number" ? current.pm10 : null;
  const pm25Aqi = pm25 != null ? calcAqiFromPm25(pm25) : 0;
  const pm10Aqi = pm10 != null ? calcAqiFromPm10(pm10) : 0;
  const finalAqi = Math.max(Math.round(rawUsAqi), pm25Aqi, pm10Aqi);

  return {
    aqi: Math.max(1, finalAqi),
    pm25,
    pm10,
    city: (place?.name as string) || "Current Location",
    region: (place?.admin1 as string) || null,
    country: (place?.country as string) || null,
    observedAt: current.time ? new Date(current.time).toISOString() : new Date().toISOString(),
    source: "Open-Meteo (EPA standard)",
    station: null,
  } as unknown as AirQuality;
}

export async function getAirQuality(location: string): Promise<AirQuality> {
  const isDemo = import.meta.env.VITE_DEMO_MODE === "1";
  if (isDemo) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      ...demoAqi,
      latitude: 28.6139,
      longitude: 77.209,
      source: demoAqi.source,
    } as AirQuality;
  }

  const query = location.trim();
  if (!query) throw new Error("Enter a city or region first.");

  const place = await geocode(query);

  try {
    return await fetchAirQuality(place.latitude, place.longitude, place);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Air quality data is unavailable right now."
    );
  }
}
