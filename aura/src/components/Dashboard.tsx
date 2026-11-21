import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Leaf, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RiskGauge } from "@/components/ui/risk-gauge";
import { AdviceCard } from "@/components/AdviceCard";
import { ProviderSelector } from "@/components/ProviderSelector";
import { getAirQuality, type AirQuality } from "@/lib/air-quality";
import {
  buildFallbackAdvice,
  fetchAIAdvice,
  riskBandFor,
  type AIAdvice,
  type ProviderConfig,
  type RiskBand,
  type UserProfile,
} from "@/lib/ai-service";

const ADVISORY: Record<RiskBand, string> = {
  good: "Air is clean today. A great day to be outdoors and to build greener habits.",
  moderate:
    "Some pollutants are elevated. Sensitive groups should limit prolonged outdoor exertion.",
  unhealthy:
    "Air is unhealthy for sensitive group. Keep windows sealed and limit outdoor activity.",
  hazardous:
    "Air is hazardous. Stay indoors, seal your home, and run air purifiers on high.",
};

// Default to Pollinations (free live AI, zero setup) if no custom valid API key is present
const envKey = (import.meta.env.VITE_AI_API_KEY || "").trim();
const validEnvKey = /^(test_key|your_api_key_here|placeholder)$/i.test(envKey) ? "" : envKey;

const DEFAULT_PROVIDER: ProviderConfig = {
  id: validEnvKey
    ? (import.meta.env.VITE_AI_PROVIDER || "openai").toLowerCase()
    : "pollinations",
  apiKey: validEnvKey,
  model: validEnvKey
    ? (import.meta.env.VITE_AI_MODEL || "gpt-4o-mini")
    : "openai",
};

export function Dashboard({
  profile,
  onEditProfile,
}: {
  profile: UserProfile;
  onEditProfile: () => void;
}) {
  const [air, setAir] = useState<AirQuality | null>(null);
  const [airLoading, setAirLoading] = useState(true);
  const [airError, setAirError] = useState<string | null>(null);

  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  const [provider, setProvider] = useState<ProviderConfig>(() => {
    try {
      const saved = localStorage.getItem("auraguide-provider");
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved provider was OpenAI with dummy test_key or empty key, upgrade to Pollinations for instant demo success
        if (parsed.apiKey === "test_key" || (!parsed.apiKey && parsed.id === "openai" && !validEnvKey)) {
          return DEFAULT_PROVIDER;
        }
        if ((!parsed.apiKey || parsed.apiKey === "test_key") && validEnvKey) {
          parsed.apiKey = validEnvKey;
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_PROVIDER;
  });

  // Persist provider config
  useEffect(() => {
    localStorage.setItem("auraguide-provider", JSON.stringify(provider));
  }, [provider]);

  const loadAir = useCallback(
    async (cancelled?: () => boolean) => {
      setAirLoading(true);
      setAirError(null);
      try {
        const next = await getAirQuality(profile.location);
        if (cancelled?.()) return;
        setAir(next);
        return next;
      } catch (error) {
        if (!cancelled?.()) {
          setAirError(error instanceof Error ? error.message : "Failed to load air quality.");
        }
      } finally {
        if (!cancelled?.()) setAirLoading(false);
      }
    },
    [profile.location],
  );

  useEffect(() => {
    let cancelled = false;
    void loadAir(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [loadAir]);

  const riskBand = air ? riskBandFor(air.aqi) : null;

  const loadAdvice = useCallback(async () => {
    if (!air) return;
    setAdviceLoading(true);
    setAdviceError(null);
    try {
      const next = await fetchAIAdvice(profile, {
        aqi: air.aqi,
        riskBand: riskBandFor(air.aqi),
        city: air.city,
        pm25: air.pm25,
        pm10: air.pm10,
      }, provider);
      setAdvice(next);
    } catch (error) {
      setAdviceError(error instanceof Error ? error.message : "Failed to generate advice.");
    } finally {
      setAdviceLoading(false);
    }
  }, [air, profile, provider]);

  const refresh = useCallback(async () => {
    setAdvice(null);
    setAdviceError(null);
    await loadAir();
  }, [loadAir]);

  const placeLabel = [air?.city, air?.region, air?.country].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto flex min-h-screen flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            AuraGuide
          </div>
          <div className="flex items-center gap-3">
            <ProviderSelector config={provider} onChange={setProvider} />
            <Button variant="ghost" size="sm" onClick={onEditProfile} className="hidden sm:inline-flex">
              <ArrowLeft className="h-4 w-4" />
              Edit profile
            </Button>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_420px]">
          <section className="max-w-xl">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Step 2 of 2</p>
            <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your air quality dashboard
            </h1>
            <p className="mb-8 text-sm leading-6 text-muted-foreground">
              Live readings for {placeLabel || profile.location}, with advice generated for your
              profile.
            </p>

            <div className="mb-6 flex items-center gap-4">
              <Card className="h-32 shrink-0">
                <CardContent className="flex h-full items-center justify-center p-2">
                  {air ? (
                    <RiskGauge aqi={air.aqi} className="h-24 w-24" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center text-xs text-muted-foreground">
                      {airLoading ? "Loading…" : "No data"}
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Current advisory</p>
                {airError ? (
                  <div className="mt-1 text-sm text-destructive">
                    {airError}
                    <Button variant="outline" size="sm" className="ml-2" onClick={() => void refresh()}>
                      Retry
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 text-sm leading-6">
                    {riskBand ? ADVISORY[riskBand] : "Fetching the latest readings…"}
                  </p>
                )}
                {air && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    PM2.5 {air.pm25 ?? "—"} µg/m³ · PM10 {air.pm10 ?? "—"} µg/m³ ·{" "}
                    {air.observedAt ? new Date(air.observedAt).toLocaleString() : "now"}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Source: {air?.source ?? "WAQI ground station"}
                  {air?.station ? ` · Station: ${air.station}` : ""}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => void loadAdvice()}
                disabled={!air || adviceLoading}
              >
                <Sparkles className="h-4 w-4" />
                Get advice
              </Button>
              <Button variant="outline" size="lg" onClick={() => void refresh()} disabled={airLoading}>
                <RefreshCw className="h-4 w-4" />
                Refresh AQI
              </Button>
              <Button variant="outline" size="lg" onClick={onEditProfile}>
                <ArrowLeft className="h-4 w-4" />
                Edit profile
              </Button>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Personalised advice</h2>
                {advice && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[0.6875rem] font-medium text-secondary-foreground">
                    <Leaf className="h-3 w-3" />
                    {advice.source === "fallback"
                      ? "Offline fallback"
                      : advice.source === "demo"
                        ? "Demo data"
                        : `Generated by ${advice.model ? advice.model : "AI"}`}
                  </span>
                )}
              </div>
              {adviceError ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  <p className="font-medium">{adviceError}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => void loadAdvice()}>
                      Try again
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        if (air) {
                          setAdvice(buildFallbackAdvice(profile, {
                            aqi: air.aqi,
                            riskBand: riskBandFor(air.aqi),
                            city: air.city,
                            pm25: air.pm25,
                            pm10: air.pm10,
                          }));
                          setAdviceError(null);
                        }
                      }}
                    >
                      Use offline fallback
                    </Button>
                  </div>
                </div>
              ) : adviceLoading ? (
                <p className="text-sm text-muted-foreground">
                  Asking the GenAI Engine for your plan…
                </p>
              ) : advice ? (
                <div className="space-y-4">
                  {advice.cards.map((card) => (
                    <AdviceCard key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <Button variant="default" size="lg" onClick={() => void loadAdvice()} disabled={!air}>
                  <Sparkles className="h-4 w-4" />
                  Get my personalised advice
                </Button>
              )}
            </div>
          </section>

          <aside className="hidden lg:block">
            <Card className="bg-accent/40">
              <CardContent className="p-6">
                <p className="text-sm font-semibold">How AuraGuide works</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your profile sets the tone. Live ground-station readings and an online AI model
                  turn today's air quality into three clear actions — a low-emission routine, an
                  indoor air quality hack, and a sustainable switch.
                </p>
                <div className="mt-6 space-y-4 border-t border-border pt-5">
                  <Step label="01" text="Profile" />
                  <Step label="02" text="Live readings" />
                  <Step label="03" text="AI advice" />
                </div>
                <div className="mt-6 rounded-md bg-background/60 p-3 text-xs leading-5 text-muted-foreground">
                  Tailored for{" "}
                  <span className="font-medium text-foreground">{profile.name}</span> ·{" "}
                  {profile.lifestyle} · {profile.concern} · {profile.communicationStyle} tone
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>

        <footer className="text-xs text-muted-foreground">
          AuraGuide · Air quality data by World Air Quality Index (WAQI) · Advice is not a
          substitute for medical advice.
        </footer>
      </div>
    </div>
  );
}

function Step({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {label}
      </span>
      {text}
    </div>
  );
}
