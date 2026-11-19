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

async function fetchAirQuality(lat: number, lon: number): Promise<AirQuality> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  const data = await fetchJson<Record<string, unknown>>(
    `/api/air-quality?${params}`,
  );
  return data as unknown as AirQuality;
}

export async function getAirQuality(location: string): Promise<AirQuality> {
  const query = location.trim();
  if (!query) throw new Error("Enter a city or region first.");

  const place = await geocode(query);

  try {
    return await fetchAirQuality(place.latitude, place.longitude);
  } catch {
    throw new Error("Air quality data is unavailable right now.");
  }
}
