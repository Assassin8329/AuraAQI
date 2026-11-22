// Provider health check utilities for AuraGuide

export interface ProviderHealthStatus {
  id: string;
  name: string;
  status: "unknown" | "testing" | "healthy" | "unhealthy";
  error?: string;
  latency?: number;
}

export const PROVIDER_IDS = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "deepseek",
  "mistral",
  "openrouter",
  "together",
  "perplexity",
  "groq",
  "pollinations",
  "ollama",
  "lmstudio",
] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

const PROVIDER_NAMES: Record<ProviderId, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic Claude",
  google: "Google Gemini",
  xai: "xAI Grok",
  deepseek: "DeepSeek",
  mistral: "Mistral",
  openrouter: "OpenRouter",
  together: "Together AI",
  perplexity: "Perplexity",
  groq: "Groq",
  pollinations: "Pollinations (Free)",
  ollama: "Ollama",
  lmstudio: "LM Studio",
};

// Test a provider by making a lightweight request
export async function testProviderHealth(
  id: ProviderId,
  apiKey?: string,
): Promise<ProviderHealthStatus> {
  const status: ProviderHealthStatus = {
    id,
    name: PROVIDER_NAMES[id],
    status: "testing",
  };

  const startTime = Date.now();

  try {
    if (id === "pollinations") {
      // Pollinations is free — just test connectivity
      const res = await fetch("https://text.pollinations.ai/openai/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [{ role: "user", content: "Say hello" }],
          max_tokens: 5,
        }),
      });
      if (res.ok) {
        status.status = "healthy";
        status.latency = Date.now() - startTime;
      } else {
        status.status = "unhealthy";
        status.error = `Status ${res.status}`;
      }
      return status;
    }

    if (id === "ollama" || id === "lmstudio") {
      // Test local model connectivity
      const host = id === "ollama"
        ? ["http://127.0.0.1:11434", "http://localhost:11434"]
        : ["http://127.0.0.1:1234", "http://localhost:1234"];

      let found = false;
      for (const h of host) {
        try {
          const res = await fetch(`${h}/v1/models`, { signal: AbortSignal.timeout(3000) });
          if (res.ok) {
            status.status = "healthy";
            status.latency = Date.now() - startTime;
            found = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!found) {
        status.status = "unhealthy";
        status.error = `Local ${PROVIDER_NAMES[id]} not detected on default ports`;
      }
      return status;
    }

    // For API-key providers, test with a minimal request
    if (!apiKey) {
      status.status = "unhealthy";
      status.error = "No API key provided";
      return status;
    }

    // Use the server proxy for testing
    const res = await fetch("/api/ai-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: {
          name: "Test",
          location: "New York",
          lifestyle: "Budget",
          concern: "Health focus",
          communicationStyle: "Direct",
        },
        ctx: {
          aqi: 50,
          riskBand: "good",
          city: "New York",
        },
        provider: id,
        model: "",
        apiKey: apiKey,
      }),
    });

    if (res.ok) {
      status.status = "healthy";
      status.latency = Date.now() - startTime;
    } else {
      const errText = await res.text().catch(() => "");
      status.status = "unhealthy";
      status.error = errText || `Status ${res.status}`;
    }
  } catch (err) {
    status.status = "unhealthy";
    status.error = err instanceof Error ? err.message : "Connection failed";
  }

  return status;
}

// Test all providers and return results
export async function testAllProviders(
  keys: Record<string, string>,
): Promise<ProviderHealthStatus[]> {
  const results: Promise<ProviderHealthStatus>[] = [];

  for (const id of PROVIDER_IDS) {
    const apiKey = keys[id] || keys[`${id.toUpperCase()}_API_KEY`] || keys["AI_API_KEY"] || "";
    results.push(testProviderHealth(id, apiKey || undefined));
  }

  return Promise.all(results);
}
