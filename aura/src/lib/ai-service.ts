export type UserProfile = {
  name: string;
  location: string;
  lifestyle: "Budget" | "Time Availability";
  concern: "Health focus" | "Environmental focus";
  communicationStyle: "Direct" | "Detailed" | "Friendly";
};

export type RiskBand = "good" | "moderate" | "unhealthy" | "hazardous";

export type AdviceCard = {
  id: string;
  title: string;
  kicker: string;
  body: string;
  detail?: string;
  tone: "action" | "community" | "official";
};

export type AIAdvice = {
  riskBand: RiskBand;
  aqi: number;
  cards: AdviceCard[];
  source: "pollinations" | "fallback";
  model?: string;
};

export type AdviceContext = {
  aqi: number;
  riskBand: RiskBand;
  city?: string;
  pm25?: number | null;
  pm10?: number | null;
};

export function riskBandFor(aqi: number): RiskBand {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 200) return "unhealthy";
  return "hazardous";
}

const CO2_SAVED: Record<RiskBand, { Budget: string; "Time Availability": string }> = {
  good: { Budget: "10-15g", "Time Availability": "30-40g" },
  moderate: { Budget: "0.05kg", "Time Availability": "0.3kg" },
  unhealthy: { Budget: "0.2kg", "Time Availability": "0.4kg" },
  hazardous: { Budget: "0.6kg", "Time Availability": "1.5kg" },
};

const HEALTH_IMPACT: Record<RiskBand, string> = {
  good: "Near-zero added respiratory risk today",
  moderate: "15-20% lower respiratory risk with indoor measures",
  unhealthy: "35-50% lower respiratory risk by staying indoors",
  hazardous: "60-80% lower exposure by sealing your home",
};

function isHumidClimate(location: string): boolean {
  const l = location.toLowerCase();
  return [
    "tropical",
    "asia",
    "africa",
    "mumbai",
    "delhi",
    "kolkata",
    "chennai",
    "singapore",
    "bangkok",
    "dhaka",
  ].some((keyword) => l.includes(keyword));
}

function impactFor(profile: UserProfile, riskBand: RiskBand): string {
  const co2 = CO2_SAVED[riskBand][profile.lifestyle];
  return profile.concern === "Environmental focus"
    ? `Impact: ~${co2} CO2 saved today`
    : `Impact: ${HEALTH_IMPACT[riskBand]}`;
}

function weekdayRoutine(city: string, profile: UserProfile, riskBand: RiskBand, window: number): string {
  const budget = profile.lifestyle === "Budget";

  switch (riskBand) {
    case "good":
      return budget
        ? "Take your usual walking route (no extra cost). Bike short errands instead of taking a bus. Skip one ride-share today."
        : "Swap the car for a bike or public transit. Take a 30-minute brisk walk in a park. Park two blocks early and walk the rest.";
    case "moderate":
      return budget
        ? `In ${city}, keep windows closed during the morning peak, then air out at night when traffic eases. Batch errands into one trip.`
        : `In ${city}, shift outdoor exercise to the ${window}:00 window and use transit instead of driving for the commute.`;
    case "unhealthy":
      return budget
        ? `Limit outdoor activity in ${city} to ${window} short, well-timed windows. Walk indoors and combine trips to cut emissions.`
        : "Move your workout indoors, take calls from home instead of commuting, and wear a certified mask if you must go out.";
    default:
      return `Air is hazardous in ${city}. Stay indoors for the next ${window} hour(s). Seal windows and keep the purifier running on high.`;
  }
}

function indoorHack(profile: UserProfile, riskBand: RiskBand, city: string, hours: number): string {
  if (riskBand === "good") {
    return `Air is clean in ${city} — open windows for ${hours * 10} minutes to flush stale indoor air at no cost.`;
  }
  if (isHumidClimate(profile.location)) {
    return `In humid ${city}, seal windows during the smog peak, run the AC on recirculate, and use a dehumidifier to stop mold while a HEPA filter scrubs the air for ${hours} hour(s).`;
  }
  return `Seal windows during the ${city} peak, run a HEPA purifier for ${hours} hour(s), and switch the HVAC to recirculate so outdoor particulates aren't drawn inside.`;
}

function sustainableSwitch(profile: UserProfile, riskBand: RiskBand, city: string): string {
  const budget = profile.lifestyle === "Budget";
  if (budget) {
    return riskBand === "good"
      ? `In ${city}, walk or cycle for errands under 2 km — free, healthy, and zero tailpipe emissions.`
      : `In ${city}, air-dry laundry and cook with a covered pan to cut indoor PM2.5 and energy use — both cost nothing.`;
  }
  return riskBand === "good"
    ? `In ${city}, try an e-bike or transit pass for the weekly commute to cut car emissions without losing time.`
    : `In ${city}, consider a certified HEPA + activated-carbon purifier and a smart thermostat to cut both indoor exposure and household emissions.`;
}

export function buildFallbackAdvice(
  profile: UserProfile,
  ctx: AdviceContext,
): AIAdvice {
  const city = (ctx.city ?? profile.location).toLowerCase() || "your city";
  const seed = city.length + ctx.aqi + profile.lifestyle.length;
  const window = 1 + (seed % 2);
  const hours = 2 + (seed % 2);

  const cards: AdviceCard[] = [
    {
      id: "routine",
      title: "Daily Routine",
      kicker: "Your move today",
      body: weekdayRoutine(city, profile, ctx.riskBand, window),
      detail: impactFor(profile, ctx.riskBand),
      tone: "action",
    },
    {
      id: "indoor",
      title: "Indoor Air Quality Hack",
      kicker: "For your home",
      body: indoorHack(profile, ctx.riskBand, city, hours),
      detail:
        profile.lifestyle === "Budget"
          ? "Free or low-cost"
          : "Low upfront cost, pays back in health + energy savings",
      tone: "community",
    },
    {
      id: "sustainable",
      title: "Sustainable Switch",
      kicker: "Lower your footprint",
      body: sustainableSwitch(profile, ctx.riskBand, city),
      detail:
        ctx.riskBand === "good"
          ? `Best outdoor window: 6:00–10:00 AM in ${city}`
          : `Follow local air-quality advisories for ${city}.`,
      tone: "official",
    },
  ];

  return {
    riskBand: ctx.riskBand,
    aqi: ctx.aqi,
    cards,
    source: "fallback",
  };
}

// --- Strict card schema validation ---
const ALLOWED_TONES = new Set(["action", "community", "official"]);
const ALLOWED_CARD_IDS = new Set(["routine", "indoor", "sustainable"]);
const MAX_BODY_LEN = 500;
const MAX_DETAIL_LEN = 300;

function validateCards(value: unknown): AdviceCard[] {
  if (!value || typeof value !== "object") throw new Error("Invalid AI response.");
  const cards = (value as { cards?: unknown }).cards;
  if (!Array.isArray(cards) || cards.length !== 3) {
    throw new Error("AI response must contain exactly 3 cards.");
  }

  return cards.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error(`Card ${index + 1} is invalid.`);
    const card = raw as Record<string, unknown>;

    // Strict tone check
    const tone = card.tone;
    if (typeof tone !== "string" || !ALLOWED_TONES.has(tone)) {
      throw new Error(`Card ${index + 1} has invalid tone: ${String(tone)}.`);
    }

    // Strict ID check (must match expected card IDs)
    const id = card.id;
    if (typeof id !== "string" || !ALLOWED_CARD_IDS.has(id)) {
      throw new Error(`Card ${index + 1} has invalid id: ${String(id)}.`);
    }

    const required: Array<keyof Pick<AdviceCard, "title" | "kicker" | "body">> = [
      "title", "kicker", "body",
    ];
    for (const key of required) {
      if (typeof card[key] !== "string" || !(card[key] as string).trim()) {
        throw new Error(`Card ${index + 1} missing "${String(key)}".`);
      }
    }

    const body = String(card.body).slice(0, MAX_BODY_LEN);
    const detail = typeof card.detail === "string" ? String(card.detail).slice(0, MAX_DETAIL_LEN) : undefined;

    return {
      id: String(card.id),
      title: String(card.title).slice(0, 200),
      kicker: String(card.kicker).slice(0, 100),
      body,
      detail,
      tone: tone as AdviceCard["tone"],
    };
  });
}

// --- Robust JSON extraction with brace-depth matching ---
function extractJson(text: string): unknown {
  let cleaned = text.trim();

  // Strip markdown code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }

  // Find the first '{' and then match brace depth to find the correct closing '}'
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) {
    throw new Error("AI returned no JSON object.");
  }

  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let end = -1;

  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (ch === "\\" && inString) {
      escapeNext = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
  }

  if (end === -1) {
    throw new Error("AI returned malformed JSON (unmatched braces).");
  }

  const jsonSlice = cleaned.slice(firstBrace, end + 1);

  // Extra safety: reject if the slice contains obvious injection artifacts
  if (/\[sanitized\]/.test(jsonSlice)) {
    throw new Error("AI response contained injection artifacts.");
  }

  return JSON.parse(jsonSlice);
}

// --- Strict input sanitization to prevent prompt injection ---
const MAX_NAME_LEN = 100;
const MAX_LOCATION_LEN = 150;

function sanitizeForPrompt(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[\n\r]/g, " ")
    .replace(/[`]/g, "")
    .replace(/(?:ignore|bypass|override|disregard|reveal your|system prompt|previous instructions)/gi, "[sanitized]")
    .trim()
    .slice(0, MAX_LOCATION_LEN);
}

function sanitizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    name: sanitizeForPrompt(profile.name).slice(0, MAX_NAME_LEN) || "User",
    location: sanitizeForPrompt(profile.location) || "Unknown",
  };
}

// --- Provider type ---
export interface ProviderConfig {
  id: string;
  apiKey: string;
  model: string;
}

// --- Proxy call: the server holds API keys and sanitizes input ---
async function generateWithAI(
  profile: UserProfile,
  ctx: AdviceContext,
  providerConfig: ProviderConfig,
): Promise<AIAdvice> {
  const response = await fetch("/api/ai-advice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profile: sanitizeProfile(profile),
      ctx,
      provider: providerConfig.id,
      model: providerConfig.model,
    }),
  });

  if (!response.ok) {
    await response.text().catch(() => "");
    // Don't leak raw API errors — show a clean message
    throw new Error("AI generation failed. Please check your provider settings and try again.");
  }

  const data = await response.json();
  const text = data.text;
  if (!text) throw new Error("AI returned an empty response.");

  return {
    riskBand: ctx.riskBand,
    aqi: ctx.aqi,
    cards: validateCards(extractJson(text)),
    source: "pollinations",
    model: data.model,
  };
}

export async function fetchAIAdvice(
  profile: UserProfile,
  ctx: AdviceContext,
  providerConfig?: ProviderConfig,
): Promise<AIAdvice> {
  // Default to OpenAI if no provider config
  const config = providerConfig || { id: "openai", apiKey: "", model: "gpt-5.6-luna" };

  try {
    return await generateWithAI(profile, ctx, config);
  } catch (error) {
    console.warn("AI advice failed, using local fallback:", error);
  }

  return buildFallbackAdvice(profile, ctx);
}
