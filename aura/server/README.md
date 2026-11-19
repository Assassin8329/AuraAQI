# AuraGuide Server

Backend proxy for the AuraGuide frontend. Holds API keys server-side and provides rate limiting, input sanitization, and CORS protection.

## Setup

```bash
cd server
cp .env.example .env
# Edit .env and add your API keys
npm install
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `openai` | Provider ID: `openai`, `anthropic`, `google`, `xai`, `deepseek`, `mistral`, `openrouter`, `together`, `perplexity`, `groq` |
| `AI_API_KEY` | | API key for the selected provider |
| `AI_ENDPOINT` | (provider default) | Override the base URL |
| `AI_MODEL` | (provider default) | Override the default model |
| `WAQI_TOKEN` | | World Air Quality Index token (optional, falls back to Open-Meteo) |
| `SERVER_PORT` | `3001` | Server port |

## Supported Providers

| Provider | Default Model | Free Tier |
|----------|--------------|-----------|
| OpenAI | gpt-5.6-luna | Paid only |
| Anthropic Claude | claude-sonnet-4-5-20250514 | Trial credit |
| Google Gemini | gemini-3.8-flash | Free tier available |
| xAI Grok | grok-4.7 | Paid only |
| DeepSeek | deepseek-v4-pro | Paid only |
| Mistral | mistral-large-latest | Free mode available |
| OpenRouter | openrouter/free | Free models available |
| Together AI | meta-llama/Llama-3.3-70B-Instruct-Turbo-Free | Free models available |
| Perplexity | sonar-pro | Paid only |
| Groq | openai/gpt-oss-120b | Free tier available |

## Endpoints

- `GET /health` — health check
- `GET /api/providers` — list available providers and current config
- `GET /api/geocode?name=<city>` — geocodes a location name
- `GET /api/air-quality?lat=<lat>&lon=<lon>` — fetches air quality data (auto-falls-back to Open-Meteo)
- `POST /api/ai-advice` — generates AI advice (requires `{ profile, ctx, provider, model }` in body)

## Security

- **Rate limiting**: 60 req/min general, 10 req/min for AI generation
- **CORS**: restricted to `localhost:5173`
- **Input sanitization**: strips control characters and neutralizes prompt-injection patterns
- **No secrets in client bundle**: all API keys are server-side only
