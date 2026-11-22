import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Leaf, RefreshCw, Sparkles } from "lucide-react";
import { Button, cn } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinearAQIBar } from "@/components/LinearAQIBar";
import { AdviceCard } from "@/components/AdviceCard";
import { ProviderSelector } from "@/components/ProviderSelector";
import { WorldMap } from "@/components/WorldMap";
import { ProductSuggestions } from "@/components/ProductSuggestions";
import { LanguageSelector } from "@/components/LanguageSelector";
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
import { getTranslations, type Language } from "@/lib/translations";

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
  provider: initialProvider,
  onEditProfile,
}: {
  profile: UserProfile;
  provider?: ProviderConfig;
  onEditProfile: () => void;
}) {
  const [air, setAir] = useState<AirQuality | null>(null);
  const [airLoading, setAirLoading] = useState(true);
  const [airError, setAirError] = useState<string | null>(null);

  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  const [provider, setProvider] = useState<ProviderConfig>(() => {
    // Use the provider prop from App.tsx (set on entry via ProviderSelector) before falling back to localStorage
    if (initialProvider && initialProvider.apiKey) return initialProvider;
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

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("auraguide-lang");
    return (saved as Language) || profile.language || "en";
  });
  const t = getTranslations(lang);

  // Persist language
  useEffect(() => {
    localStorage.setItem("auraguide-lang", lang);
  }, [lang]);

  const displayCity = air?.city || profile.location;

  return (
    <div className={cn("min-h-screen bg-background text-foreground", lang === "ar" && "text-right")} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto flex min-h-screen flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            {t.appName}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector currentLang={lang} onChange={setLang} />
            <ProviderSelector config={provider} onChange={setProvider} />
            <Button variant="ghost" size="sm" onClick={onEditProfile} className="hidden sm:inline-flex">
              <ArrowLeft className="h-4 w-4" />
              {t.editProfile}
            </Button>
          </div>
        </header>

        <main className="grid flex-1 items-start gap-10 py-10 lg:grid-cols-[1fr_520px]">
          {/* Left column */}
          <section className="max-w-2xl space-y-8">
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Step 2 of 2
              </p>
              <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t.dashboardTitle}
              </h1>
              <p className="mb-8 text-sm leading-6 text-muted-foreground">
                {typeof t.dashboardSubtitle === "function"
                  ? t.dashboardSubtitle(displayCity)
                  : t.dashboardSubtitle}
              </p>

              {/* AQI Display - Linear Bar */}
              <div className="mb-6">
                <Card>
                  <CardContent className="p-6">
                    {air ? (
                      <LinearAQIBar aqi={air.aqi} className="w-full" />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                        {airLoading ? t.loading : t.noData}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Advisory + details */}
              {air && (
                <div className="mb-6 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{t.currentAdvisory}</p>
                  {airError ? (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <span>{airError}</span>
                      <Button variant="outline" size="sm" onClick={() => void refresh()}>
                        {t.retry}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm leading-6">
                      {riskBand ? ADVISORY[riskBand] : t.loading}
                    </p>
                  )}
                  {air && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{t.pm25}: {air.pm25 ?? "—"} µg/m³</span>
                      <span>{t.pm10}: {air.pm10 ?? "—"} µg/m³</span>
                      <span>{t.observedAt}: {air.observedAt ? new Date(air.observedAt).toLocaleString() : "now"}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t.source}: {air?.source ?? "WAQI ground station"}
                    {air?.station ? ` · ${t.station}: ${air.station}` : ""}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => void loadAdvice()}
                  disabled={!air || adviceLoading}
                >
                  <Sparkles className="h-4 w-4" />
                  {t.getAdvice}
                </Button>
                <Button variant="outline" size="lg" onClick={() => void refresh()} disabled={airLoading}>
                  <RefreshCw className="h-4 w-4" />
                  {t.refreshAqi}
                </Button>
                <Button variant="outline" size="lg" onClick={onEditProfile}>
                  <ArrowLeft className="h-4 w-4" />
                  {t.editProfile}
                </Button>
              </div>
            </div>

            {/* Product Suggestions */}
            {air && (
              <div className="space-y-4">
                <ProductSuggestions
                  aqi={air.aqi}
                  riskBand={riskBandFor(air.aqi)}
                  city={displayCity}
                  profile={profile}
                  language={lang}
                />
              </div>
            )}

            {/* AI Advice */}
            <div className="space-y-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{t.personalizedAdvice}</h2>
                {advice && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[0.6875rem] font-medium text-secondary-foreground">
                    <Leaf className="h-3 w-3" />
                    {advice.source === "fallback"
                      ? t.offlineFallback
                      : advice.source === "demo"
                        ? t.demoData
                        : typeof t.generatedBy === "function"
                          ? t.generatedBy(advice.model || "")
                          : `Generated by ${advice.model || "AI"}`}
                  </span>
                )}
              </div>
              {adviceError ? (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  <p className="font-medium">{adviceError}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => void loadAdvice()}>
                      {t.tryAgain}
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
                      {t.useFallback}
                    </Button>
                  </div>
                </div>
              ) : adviceLoading ? (
                <p className="text-sm text-muted-foreground">
                  {t.personalizedAdvice}…
                </p>
              ) : advice ? (
                <div className="space-y-4">
                  {advice.cards.map((card) => (
                    <AdviceCard key={card.id} card={card} />
                  ))}
                </div>
              ) : (
                <Button variant="default" size="lg" onClick={() => void loadAdvice()} disabled={!air} className="w-full">
                  <Sparkles className="h-4 w-4" />
                  {t.personalizedAdvice}
                </Button>
              )}
            </div>
          </section>

          {/* Right column: World Map + How it works */}
          <aside className="space-y-6">
            {/* World Map */}
            <Card>
              <CardContent className="p-4">
                <WorldMap className="w-full" />
              </CardContent>
            </Card>

            {/* How AuraGuide works */}
            <Card className="bg-accent/40">
              <CardContent className="p-6">
                <p className="text-sm font-semibold">{t.howItWorks}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t.howItWorksText}
                </p>
                <div className="mt-6 space-y-4 border-t border-border pt-5">
                  <Step label="01" text={t.step01} />
                  <Step label="02" text={t.step02} />
                  <Step label="03" text={t.step03} />
                </div>
                <div className="mt-6 rounded-md bg-background/60 p-3 text-xs leading-5 text-muted-foreground">
                  {typeof t.profileContext === "function"
                    ? t.profileContext(profile.name, profile.lifestyle, profile.concern, profile.communicationStyle)
                    : t.profileContext}
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>

        <footer className="text-xs text-muted-foreground">
          {t.footer}
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
