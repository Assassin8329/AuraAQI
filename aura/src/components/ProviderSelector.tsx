import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Key,
  Sparkles,
  X,
  Settings2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/input";

// --- Provider definitions (from research) ---
const PROVIDERS: Record<
  string,
  {
    name: string;
    defaultModel: string;
    models: string[];
    requiresKey: boolean;
    freeTier: string;
    icon: string;
  }
> = {
  openai: {
    name: "OpenAI",
    defaultModel: "gpt-4o-mini",
    models: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4.1-mini",
      "gpt-4.1",
      "gpt-3.5-turbo",
    ],
    requiresKey: true,
    freeTier: "",
    icon: "O",
  },
  pollinations: {
    name: "Pollinations (Free)",
    defaultModel: "openai",
    models: [
      "openai",
      "mistral",
      "searchgpt",
      "qwen-coder",
    ],
    requiresKey: false,
    freeTier: "Free — no key needed",
    icon: "P",
  },
  anthropic: {
    name: "Anthropic Claude",
    defaultModel: "claude-3-5-haiku-latest",
    models: [
      "claude-3-5-haiku-latest",
      "claude-3-5-sonnet-latest",
      "claude-3-opus-latest",
    ],
    requiresKey: true,
    freeTier: "Trial credit only",
    icon: "A",
  },
  google: {
    name: "Google Gemini",
    defaultModel: "gemini-3.8-flash",
    models: [
      "gemini-3.8-flash",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ],
    requiresKey: true,
    freeTier: "Free tier available",
    icon: "G",
  },
  groq: {
    name: "Groq",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
    ],
    requiresKey: true,
    freeTier: "Free tier available",
    icon: "Q",
  },
  xai: {
    name: "xAI Grok",
    defaultModel: "grok-2-latest",
    models: ["grok-2-latest", "grok-beta"],
    requiresKey: true,
    freeTier: "",
    icon: "X",
  },
  deepseek: {
    name: "DeepSeek",
    defaultModel: "deepseek-chat",
    models: ["deepseek-chat", "deepseek-reasoner"],
    requiresKey: true,
    freeTier: "",
    icon: "D",
  },
  mistral: {
    name: "Mistral",
    defaultModel: "mistral-small-latest",
    models: [
      "mistral-small-latest",
      "mistral-large-latest",
      "ministral-8b-latest",
    ],
    requiresKey: true,
    freeTier: "Free mode available",
    icon: "M",
  },
  openrouter: {
    name: "OpenRouter",
    defaultModel: "openrouter/free",
    models: [
      "openrouter/free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
      "deepseek/deepseek-r1:free",
    ],
    requiresKey: true,
    freeTier: "Free models available",
    icon: "R",
  },
  together: {
    name: "Together AI",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    models: [
      "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
    ],
    requiresKey: true,
    freeTier: "Free models available",
    icon: "T",
  },
  perplexity: {
    name: "Perplexity",
    defaultModel: "sonar",
    models: ["sonar", "sonar-pro", "sonar-reasoning"],
    requiresKey: true,
    freeTier: "",
    icon: "P",
  },
  lmstudio: {
    name: "LM Studio",
    defaultModel: "local-model",
    models: ["local-model"],
    requiresKey: false,
    freeTier: "Local — no key needed",
    icon: "L",
  },
  ollama: {
    name: "Ollama",
    defaultModel: "llama3.2",
    models: ["llama3.2"],
    requiresKey: false,
    freeTier: "Local — no key needed",
    icon: "O",
  },
};

const PROVIDER_ORDER = Object.keys(PROVIDERS);

export interface ProviderConfig {
  id: string;
  apiKey: string;
  model: string;
}

interface ProviderSelectorProps {
  config: ProviderConfig;
  onChange: (config: ProviderConfig) => void;
}

export function ProviderSelector({ config, onChange }: ProviderSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [providerId, setProviderId] = useState(config.id);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [error, setError] = useState<string | null>(null);

  // Local model state (LM Studio + Ollama)
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localBaseUrl, setLocalBaseUrl] = useState("");
  const [localProviderName, setLocalProviderName] = useState("");

  const currentProvider = PROVIDERS[providerId];

  // Helper to detect local models (tries backend proxy, then direct browser probe)
  const detectLocalModels = useCallback(async (targetProvider: string) => {
    if (targetProvider !== "lmstudio" && targetProvider !== "ollama") {
      setLocalModels([]);
      setLocalError(null);
      return;
    }

    setLocalLoading(true);
    setLocalError(null);

    const applyFoundModels = (models: string[], providerName: string, baseUrl: string) => {
      setLocalProviderName(providerName);
      setLocalBaseUrl(baseUrl);
      const unique = Array.from(new Set(models.filter(Boolean)));
      if (unique.length > 0) {
        setLocalError(null);
        setLocalModels(unique);
        setModel((prev) => (unique.includes(prev) ? prev : unique[0]));
      } else {
        setLocalError(`Connected to ${providerName}, but no models are currently loaded.`);
        setLocalModels([]);
      }
    };

    // 1. Try server proxy
    try {
      const res = await fetch("/api/local-models");
      if (res.ok) {
        const data: Array<{ provider: string; name: string; baseUrl: string; models: string[]; activeModel?: string }> =
          await res.json();
        const providerData = data.find((d) => d.provider === targetProvider);
        if (providerData && providerData.models && providerData.models.length > 0) {
          applyFoundModels(providerData.models, providerData.name, providerData.baseUrl);
          setLocalLoading(false);
          return;
        }
      }
    } catch {}

    // 2. Direct browser fallback (in case backend proxy hasn't restarted yet)
    if (targetProvider === "ollama") {
      const hosts = ["http://127.0.0.1:11434", "http://localhost:11434"];
      for (const host of hosts) {
        try {
          const collected: string[] = [];
          // Check running models via /api/ps
          const psResp = await fetch(`${host}/api/ps`).catch(() => null);
          if (psResp && psResp.ok) {
            const psData = await psResp.json();
            if (Array.isArray(psData.models)) {
              collected.push(...psData.models.map((m: { name?: string; model?: string }) => m.name || m.model || "").filter(Boolean));
            }
          }

          // Check installed models via /api/tags
          const tagsResp = await fetch(`${host}/api/tags`).catch(() => null);
          if (tagsResp && tagsResp.ok) {
            const tagsData = await tagsResp.json();
            if (Array.isArray(tagsData.models)) {
              collected.push(...tagsData.models.map((m: { name?: string; model?: string }) => m.name || m.model || "").filter(Boolean));
            }
          }

          if (collected.length > 0) {
            applyFoundModels(collected, "Ollama", `${host}/v1`);
            setLocalLoading(false);
            return;
          }
        } catch {}
      }
    } else if (targetProvider === "lmstudio") {
      const hosts = ["http://127.0.0.1:1234", "http://localhost:1234"];
      for (const host of hosts) {
        try {
          const resp = await fetch(`${host}/v1/models`).catch(() => null);
          if (resp && resp.ok) {
            const data = await resp.json();
            const models = (data.data || []).map((m: { id?: string }) => m.id || "").filter(Boolean);
            if (models.length > 0) {
              applyFoundModels(models, "LM Studio", `${host}/v1`);
              setLocalLoading(false);
              return;
            }
          }
        } catch {}
      }
    }

    setLocalError(`${targetProvider === "lmstudio" ? "LM Studio" : "Ollama"} is not detected on default ports.`);
    setLocalModels([]);
    setLocalLoading(false);
  }, []);

  // Fetch local models when panel opens or when providerId changes
  useEffect(() => {
    if (isOpen && (providerId === "lmstudio" || providerId === "ollama")) {
      void detectLocalModels(providerId);
    }
  }, [isOpen, providerId, detectLocalModels]);

  const refreshLocalModels = useCallback(() => {
    void detectLocalModels(providerId);
  }, [detectLocalModels, providerId]);

  const handleSave = useCallback(() => {
    if (currentProvider.requiresKey && !apiKey.trim()) {
      setError("API key is required for this provider.");
      return;
    }
    setError(null);
    onChange({ id: providerId, apiKey: apiKey.trim(), model });
    setIsOpen(false);
  }, [providerId, apiKey, model, currentProvider, onChange]);

  const handleReset = useCallback(() => {
    const defaults = PROVIDERS[providerId];
    setApiKey("");
    setModel(defaults.defaultModel);
    setError(null);
  }, [providerId]);

  // Update local state when parent config changes
  useEffect(() => {
    setProviderId(config.id);
    setApiKey(config.apiKey);
    setModel(config.model);
    setError(null);
  }, [config.id, config.apiKey, config.model]);

  const isLocalProvider = providerId === "lmstudio" || providerId === "ollama";

  return (
    <div className="relative">
      {/* Toggle button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 pr-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {currentProvider.icon}
        </span>
        <span className="hidden sm:inline text-xs">{currentProvider.name}</span>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </Button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] rounded-xl border bg-card p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              AI Provider
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Provider list */}
          <div className="mb-3 space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Provider
            </Label>
            {PROVIDER_ORDER.map((pid) => {
              const p = PROVIDERS[pid];
              const isActive = pid === providerId;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => {
                    setProviderId(pid);
                    setModel(p.defaultModel);
                    setApiKey("");
                    setError(null);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-muted-foreground"
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
              <Label className="text-xs font-medium text-muted-foreground">
                <Key className="mr-1 inline h-3 w-3" />
                API Key
              </Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter ${currentProvider.name} API key`}
                className="mt-1 h-8 text-xs"
              />
              {error && (
                <p className="mt-1 text-[0.625rem] text-destructive">{error}</p>
              )}
            </div>
          )}

          {/* Model selector */}
          <div className="mb-3">
            <Label className="text-xs font-medium text-muted-foreground">
              Model
            </Label>
            {isLocalProvider ? (
              localLoading ? (
                <div className="mt-1 flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Detecting {localProviderName || (providerId === "ollama" ? "Ollama" : "LM Studio")}...
                </div>
              ) : localModels.length > 0 ? (
                <div>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {localModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[0.625rem] text-emerald-600 font-medium">
                    ✓ Connected to {localProviderName} ({localBaseUrl})
                  </p>
                </div>
              ) : (
                <div className="mt-1 space-y-1.5">
                  {localError && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[0.625rem] text-amber-800">
                      {localError}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={providerId === "ollama" ? "llama3.2" : "local-model"}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={refreshLocalModels}
                      className="h-8 px-2 text-xs shrink-0"
                      title="Retry detecting models"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-[0.6rem] text-muted-foreground">
                    Ensure {providerId === "ollama" ? "Ollama is running (port 11434)" : "LM Studio local server is started (port 1234)"}
                  </p>
                </div>
              )
            ) : (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {currentProvider.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs gap-1"
              onClick={handleSave}
            >
              <Sparkles className="h-3 w-3" />
              Save
            </Button>
          </div>

          {/* Info footer */}
          <p className="mt-3 text-[0.55rem] text-muted-foreground leading-relaxed">
            Keys are sent to the backend proxy — never stored in the browser.
          </p>
        </div>
      )}
    </div>
  );
}
