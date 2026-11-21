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
    // Show the server's own message when it sent one
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
  // Server returns one flat place object (not a results array)
  const place = await fetchJson<GeocodeResult>(`/api/geocode?${params}`);
  if (!place || typeof place.latitude !== "number") {
    throw new Error(`Could not find a location matching "${location}".`);
  }
  return place;
}

async function fetchAirQuality(lat: number, lon: number, place?: GeocodeResult): Promise<AirQuality> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  if (place?.name) params.set("city", place.name);
  if (place?.admin1) params.set("region", place.admin1);
  if (place?.country) params.set("country", place.country);

  const data = await fetchJson<Record<string, unknown>>(
    `/api/air-quality?${params}`,
  );
  return {
    ...data,
    latitude: lat,
    longitude: lon,
    city: (data.city as string) || place?.name || "Current Location",
    region: (data.region as string) || place?.admin1 || null,
    country: (data.country as string) || place?.country || null,
  } as unknown as AirQuality;
}

export async function getAirQuality(location: string): Promise<AirQuality> {
  const isDemo = import.meta.env.VITE_DEMO_MODE === "1";
  if (isDemo) {
    // Fake loading delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Return demo data
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
    throw new Error(error instanceof Error ? error.message : "Air quality data is unavailable right now.");
  }
}
