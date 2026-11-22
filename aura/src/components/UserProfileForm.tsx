import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Sparkles, MapPin, Loader2, XCircle, Settings2, RefreshCw } from "lucide-react";
import { Button, cn } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AutocompleteSearch, type GeoResult } from "@/components/AutocompleteSearch";
import { LanguageSelector } from "@/components/LanguageSelector";
import { type Language, getTranslations, isRTL } from "@/lib/translations";
import type { UserProfile } from "@/lib/ai-service";

type Choice = { value: string; label: string; description: string; icon: string };

const LIFESTYLES: Choice[] = [
  { value: "Budget", label: "Budget", description: "Low-cost, everyday swaps", icon: "₹" },
  {
    value: "Time Availability",
    label: "Time Availability",
    description: "You have time to invest",
    icon: "◷",
  },
];

const CONCERNS: Choice[] = [
  {
    value: "Health focus",
    label: "Health focus",
    description: "Protect yourself and family",
    icon: "♥",
  },
  {
    value: "Environmental focus",
    label: "Environmental focus",
    description: "Reduce your footprint",
    icon: "♻",
  },
];

const STYLES: Choice[] = [
  { value: "Direct", label: "Direct", description: "Short, to the point", icon: "↯" },
  { value: "Detailed", label: "Detailed", description: "Explain the why", icon: "◍" },
  { value: "Friendly", label: "Friendly", description: "Warm and encouraging", icon: "☀" },
];

const MAX_INPUT_LEN = 150;

// Provider definitions (mirrored from ProviderSelector for the entry page)
const PROVIDERS: Record<string, { name: string; defaultModel: string; models: string[]; requiresKey: boolean; freeTier: string; icon: string }> = {
  openai: { name: "OpenAI", defaultModel: "gpt-4o-mini", models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1", "gpt-3.5-turbo"], requiresKey: true, freeTier: "", icon: "O" },
  pollinations: { name: "Pollinations (Free)", defaultModel: "openai", models: ["openai", "mistral", "searchgpt", "qwen-coder"], requiresKey: false, freeTier: "Free — no key needed", icon: "P" },
  anthropic: { name: "Anthropic Claude", defaultModel: "claude-3-5-haiku-latest", models: ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest", "claude-3-opus-latest"], requiresKey: true, freeTier: "Trial credit only", icon: "A" },
  google: { name: "Google Gemini", defaultModel: "gemini-3.8-flash", models: ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"], requiresKey: true, freeTier: "Free tier available", icon: "G" },
  groq: { name: "Groq", defaultModel: "llama-3.3-70b-versatile", models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"], requiresKey: true, freeTier: "Free tier available", icon: "Q" },
  xai: { name: "xAI Grok", defaultModel: "grok-2-latest", models: ["grok-2-latest", "grok-beta"], requiresKey: true, freeTier: "", icon: "X" },
  deepseek: { name: "DeepSeek", defaultModel: "deepseek-chat", models: ["deepseek-chat", "deepseek-reasoner"], requiresKey: true, freeTier: "", icon: "D" },
  mistral: { name: "Mistral", defaultModel: "mistral-small-latest", models: ["mistral-small-latest", "mistral-large-latest", "ministral-8b-latest"], requiresKey: true, freeTier: "Free mode available", icon: "M" },
  openrouter: { name: "OpenRouter", defaultModel: "openrouter/free", models: ["openrouter/free", "meta-llama/llama-3.3-70b-instruct:free", "google/gemini-2.0-flash-exp:free", "deepseek/deepseek-r1:free"], requiresKey: true, freeTier: "Free models available", icon: "R" },
  together: { name: "Together AI", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo", models: ["meta-llama/Llama-3.3-70B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", "mistralai/Mixtral-8x7B-Instruct-v0.1"], requiresKey: true, freeTier: "Free models available", icon: "T" },
  perplexity: { name: "Perplexity", defaultModel: "sonar", models: ["sonar", "sonar-pro", "sonar-reasoning"], requiresKey: true, freeTier: "", icon: "P" },
  lmstudio: { name: "LM Studio", defaultModel: "local-model", models: ["local-model"], requiresKey: false, freeTier: "Local — no key needed", icon: "L" },
  ollama: { name: "Ollama", defaultModel: "llama3.2", models: ["llama3.2"], requiresKey: false, freeTier: "Local — no key needed", icon: "O" },
};

const PROVIDER_ORDER = Object.keys(PROVIDERS);

export interface ProviderConfig {
  id: string;
  apiKey: string;
  model: string;
}

type KeyValidationState = "idle" | "validating" | "valid" | "invalid";

export function UserProfileForm({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (profile: UserProfile, provider: ProviderConfig) => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [lifestyle, setLifestyle] = useState<UserProfile["lifestyle"]>("Budget");
  const [concern, setConcern] = useState<UserProfile["concern"]>("Health focus");
  const [style, setStyle] = useState<UserProfile["communicationStyle"]>("Direct");
  const [lang, setLang] = useState<Language>("en");

  // Provider state
  const [providerId, setProviderId] = useState("pollinations");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("openai");
  const [keyValidation, setKeyValidation] = useState<KeyValidationState>("idle");
  const [validationMsg, setValidationMsg] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const t = getTranslations(lang);
  const rtl = isRTL(lang);
  const currentProvider = PROVIDERS[providerId];

  // Update model when provider changes
  useEffect(() => {
    setModel(PROVIDERS[providerId].defaultModel);
    setApiKey("");
    setKeyValidation("idle");
    setValidationMsg("");
  }, [providerId]);

  // Auto-detect location via GPS
  const handleAutoLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode using Photon API
        try {
          const res = await fetch(`https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const props = data?.features?.[0]?.properties;
            const city = props?.name || "Your Location";
            const state = props?.state || "";
            const nation = props?.country || "";
            setLocation(`${city}${state ? `, ${state}` : ""}${nation ? `, ${nation}` : ""}`);
            if (nation) setCountry(nation);
            setGpsLoading(false);
          } else {
            setGpsError("Could not reverse geocode your location");
            setGpsLoading(false);
          }
        } catch {
          setGpsError("Reverse geocoding failed — try typing your city");
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsError(err.message === "Permission denied" ? "Location access denied — please type your city" : "Could not get your location");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const validateApiKey = async () => {
    if (!currentProvider.requiresKey) {
      setKeyValidation("valid");
      setValidationMsg("Free provider — no key needed");
      return;
    }
    if (!apiKey.trim()) {
      setKeyValidation("invalid");
      setValidationMsg("API key is required for this provider");
      return;
    }
    setKeyValidation("validating");
    setValidationMsg("Checking key...");
    try {
      const res = await fetch("/api/ai-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { name: "test", location: "test", lifestyle: "Budget", concern: "Health focus", communicationStyle: "Direct" },
          ctx: { aqi: 50, riskBand: "good" },
          provider: providerId,
          model: model,
          apiKey: apiKey.trim(),
        }),
      });
      if (res.ok) {
        setKeyValidation("valid");
        setValidationMsg("✓ Key is valid");
      } else {
        const data = await res.json().catch(() => null);
        setKeyValidation("invalid");
        setValidationMsg(data?.error || "Key validation failed");
      }
    } catch {
      setKeyValidation("invalid");
      setValidationMsg("Could not reach server to validate key");
    }
  };

  const submit = () => {
    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    if (!trimmedName || !trimmedLocation) {
      setFormError(t.profileTitle);
      return;
    }
    if (trimmedName.length > MAX_INPUT_LEN || trimmedLocation.length > MAX_INPUT_LEN) {
      setFormError("Please keep each field under 150 characters.");
      return;
    }
    setFormError(null);

    // Validate API key if required
    if (currentProvider.requiresKey && !apiKey.trim()) {
      setValidationMsg("API key is required for this provider");
      setKeyValidation("invalid");
      return;
    }

    onDone(
      {
        name: trimmedName,
        location: trimmedLocation,
        country: country.trim() || undefined,
        lifestyle,
        concern,
        communicationStyle: style,
        language: lang,
      },
      { id: providerId, apiKey: apiKey.trim(), model }
    );
  };

  const handleCitySelect = (result: GeoResult) => {
    const display = result.country
      ? `${result.name}, ${result.country}`
      : result.name;
    setLocation(display);
    if (result.country) setCountry(result.country);
  };

  return (
    <div
      className={`min-h-screen bg-background text-foreground ${rtl ? "text-right" : "text-left"}`}
      dir={rtl ? "rtl" : "ltr"}
    >
      <div className="container mx-auto flex min-h-screen flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            {t.appName}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector
              currentLang={lang}
              onChange={setLang}
              className="hidden sm:block"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className={cn("hidden sm:inline-flex", rtl && "rotate-180")}
            >
              <ArrowRight className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        <main className="grid flex-1 items-start gap-10 py-10 lg:grid-cols-[1fr_380px]">
          {/* Left: Profile form */}
          <section className="max-w-xl">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Step 1 of 2
            </p>
            <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.profileTitle}
            </h1>
            <p className="mb-8 text-sm leading-6 text-muted-foreground">
              {typeof t.profileSubtitle === "function"
                ? t.profileSubtitle("")
                : t.profileSubtitle}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-6"
            >
              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}

              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                  {t.name}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.namePlaceholder}
                  autoComplete="name"
                  maxLength={MAX_INPUT_LEN}
                  className={cn(
                    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    formError && name.trim() ? "border-destructive" : ""
                  )}
                  dir={rtl ? "rtl" : "ltr"}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {name.length}/{MAX_INPUT_LEN}
                </p>
              </div>

              <div>
                <AutocompleteSearch
                  value={location}
                  onChange={setLocation}
                  onSelect={handleCitySelect}
                  placeholder={t.searchPlaceholder}
                  label={t.location}
                  error={formError && location.trim() ? "Select a city from the dropdown" : undefined}
                  className="w-full"
                />
                {country && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Country: {country}
                  </p>
                )}

                {/* Auto-detect via GPS */}
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={handleAutoLocation}
                    disabled={gpsLoading}
                  >
                    {gpsLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : gpsError ? (
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                    {gpsLoading ? "Detecting..." : gpsError ? "Try again" : "Auto-detect location"}
                  </Button>
                  {gpsError && (
                    <span className="text-xs text-muted-foreground">{gpsError}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t.language}
                </label>
                <LanguageSelector
                  currentLang={lang}
                  onChange={setLang}
                />
              </div>

              <fieldset>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold">{t.lifestyle}</h2>
                  <span className="text-xs text-muted-foreground">{t.lifestyleDesc}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LIFESTYLES.map((l) => (
                    <ChoiceButton
                      key={l.value}
                      choice={l}
                      selected={lifestyle === l.value}
                      onClick={() => setLifestyle(l.value as UserProfile["lifestyle"])}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold">{t.concern}</h2>
                  <span className="text-xs text-muted-foreground">{t.concernDesc}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CONCERNS.map((c) => (
                    <ChoiceButton
                      key={c.value}
                      choice={c}
                      selected={concern === c.value}
                      onClick={() => setConcern(c.value as UserProfile["concern"])}
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold">{t.communicationStyle}</h2>
                  <span className="text-xs text-muted-foreground">{t.commStyleDesc}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {STYLES.map((s) => (
                    <ChoiceButton
                      key={s.value}
                      choice={s}
                      selected={style === s.value}
                      onClick={() => setStyle(s.value as UserProfile["communicationStyle"])}
                    />
                  ))}
                </div>
              </fieldset>

              <Button type="submit" size="lg" className="w-full">
                {t.continue}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </section>

          {/* Right: AI Provider Selection */}
          <aside className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  AI Provider
                </div>

                {/* Provider list */}
                <div className="mb-4 space-y-1">
                  <div className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                    Choose provider
                  </div>
                  {PROVIDER_ORDER.map((pid) => {
                    const p = PROVIDERS[pid];
                    const isActive = pid === providerId;
                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => setProviderId(pid)}
                        className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-accent text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {p.icon}
                        </span>
                        <span className="flex-1">{p.name}</span>
                        {p.freeTier && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-[0.55rem] font-medium text-green-700">
                            Free
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* API Key input */}
                {currentProvider.requiresKey && (
                  <div className="mb-3">
                    <div className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                      API Key
                    </div>
                    <div className="mt-1 flex gap-1.5">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setKeyValidation("idle");
                        }}
                        placeholder={`Enter ${currentProvider.name} API key`}
                        className="flex-1 rounded-md border bg-background px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 shrink-0 px-2"
                        onClick={validateApiKey}
                        disabled={keyValidation === "validating"}
                      >
                        {keyValidation === "validating" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {keyValidation === "validating" && (
                      <p className="mt-1 text-[0.625rem] text-muted-foreground">Validating...</p>
                    )}
                    {keyValidation === "valid" && (
                      <p className="mt-1 text-[0.625rem] text-emerald-600 font-medium">✓ {validationMsg}</p>
                    )}
                    {keyValidation === "invalid" && (
                      <p className="mt-1 text-[0.625rem] text-destructive">{validationMsg}</p>
                    )}
                  </div>
                )}

                {/* Model selector */}
                <div className="mb-3">
                  <div className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
                    Model
                  </div>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {currentProvider.models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info */}
                <div className="rounded-md bg-accent/40 px-3 py-2.5 text-[0.6rem] leading-relaxed text-muted-foreground">
                  {currentProvider.requiresKey
                    ? "Enter your API key above and click ✓ to validate before continuing."
                    : `✓ ${currentProvider.freeTier}`}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent/40">
              <CardContent className="p-5">
                <p className="text-sm font-semibold">{t.whyMatters}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t.whyMattersText}
                </p>
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

function ChoiceButton({
  choice,
  selected,
  onClick,
}: {
  choice: Choice;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex h-12 items-center gap-3 rounded-md border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {choice.icon}
      </span>
      <span>
        <span className="block text-sm font-medium">{choice.label}</span>
        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
          {choice.description}
        </span>
      </span>
    </button>
  );
}

export default UserProfileForm;
