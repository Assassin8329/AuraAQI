import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Key,
  Sparkles,
  X,
  Settings2,
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
    defaultModel: "gpt-5.6-luna",
    models: [
      "gpt-5.6-luna",
      "gpt-5.6-terra",
      "gpt-5.6-sol",
      "gpt-6-astra",
      "gpt-4o-mini",
    ],
    requiresKey: true,
    freeTier: "",
    icon: "G",
  },
  anthropic: {
    name: "Anthropic Claude",
    defaultModel: "claude-sonnet-4-5-20250514",
    models: [
      "claude-haiku-4-5-20251001",
      "claude-sonnet-4-5-20250514",
      "claude-opus-4-5-20250514",
      "claude-fable-5-1-20250514",
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
      "gemini-3.5-flash-lite",
      "gemini-3.6-flash",
      "gemini-2.5-flash",
    ],
    requiresKey: true,
    freeTier: "Free tier available",
    icon: "G",
  },
  xai: {
    name: "xAI Grok",
    defaultModel: "grok-4.7",
    models: ["grok-4.7", "grok-4.3", "grok-3-fast"],
    requiresKey: true,
    freeTier: "",
    icon: "X",
  },
  deepseek: {
    name: "DeepSeek",
    defaultModel: "deepseek-v4-pro",
    models: ["deepseek-v4-pro", "deepseek-v4-flash", "deepseek-r1"],
    requiresKey: true,
    freeTier: "",
    icon: "D",
  },
  mistral: {
    name: "Mistral",
    defaultModel: "mistral-large-latest",
    models: [
      "mistral-large-latest",
      "mistral-small-latest",
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
      "google/gemma-4",
      "nvidia/nemotron-3",
      "poolside/ling",
    ],
    requiresKey: true,
    freeTier: "Free models available",
    icon: "O",
  },
  together: {
    name: "Together AI",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    models: [
      "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
    ],
    requiresKey: true,
    freeTier: "Free models available",
    icon: "T",
  },
  perplexity: {
    name: "Perplexity",
    defaultModel: "sonar-pro",
    models: ["sonar-pro", "sonar-reasoning-pro", "sonar-reasoning"],
    requiresKey: true,
    freeTier: "",
    icon: "P",
  },
  groq: {
    name: "Groq",
    defaultModel: "openai/gpt-oss-120b",
    models: [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "groq/compound-mini",
    ],
    requiresKey: true,
    freeTier: "Free tier available",
    icon: "G",
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

  const currentProvider = PROVIDERS[providerId];

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
