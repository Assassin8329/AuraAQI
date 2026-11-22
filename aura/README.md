# AuraGuide

React + TypeScript + Vite app that converts live air quality data into personalised, sustainable daily advice.

## Features

- **13 AI providers**: OpenAI, Anthropic Claude, Google Gemini, xAI Grok, DeepSeek, Mistral, OpenRouter, Together AI, Perplexity, Groq, Pollinations (free), Ollama (local), LM Studio (local)
- **Top-right provider selector**: toggle to switch providers, enter API keys, and choose models
- **Server-side key storage**: API keys never leave the backend proxy
- **Rate limiting**: built-in protection against abuse
- **Prompt injection defense**: user input is sanitized before reaching the AI
- **Strict JSON validation**: brace-depth matching prevents malformed AI responses from crashing the app
- **World AQI map**: color-coded SVG world map showing global air quality bands with a legend
- **8-language i18n**: English, Hindi, Spanish, French, German, Japanese, Korean, Arabic — with full RTL support for Arabic
- **Autocomplete city search**: live geocoding dropdown powered by Open-Meteo's free API
- **Product recommendations**: contextual air-purifier, mask, and filter suggestions (Amazon/Flipkart) with extensive fallback logic by AQI band
- **Linear AQI bar**: horizontal progress bar replacing the old circular gauge for clearer at-a-glance reading
- **Country auto-detection**: profile form captures country code from geocoding results

## Quick Start

### 1. Start the backend proxy (required)

```bash
cd server
cp .env.example .env
# Edit .env and set AI_API_KEY for your chosen provider
npm install
npm run dev
```

### 2. Start the frontend

```bash
npm install
npm run dev
```

### 3. Use the app

1. Enter your name and location on the profile form (use the autocomplete dropdown for city search)
2. Choose your lifestyle, concerns, and communication style
3. Select your preferred language from the language picker
4. View live air quality data with the linear AQI bar, world map, and product suggestions
5. Click "Get Advice" to generate personalised AI advice
6. Use the **top-right provider selector** to switch AI providers or enter your own API key

## Architecture

```
Browser (localhost:5173)  →  Backend Proxy (localhost:3001)  →  AI Provider API
                              ↓
                         Air Quality API (WAQI / Open-Meteo)
                              ↓
                         Geocoding API (Open-Meteo)
```

All API keys are stored in the server's `.env` file — never in the browser bundle.

## Security

- API keys are server-side only
- Rate limiting on all endpoints (60 req/min general, 10 req/min for AI)
- CORS restricted to `localhost:5173`
- Input sanitization prevents prompt injection
- CSP header blocks XSS
- Strict JSON schema validation on all AI responses

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_WAQI_TOKEN` | WAQI ground-station API token (optional) | — |
| `VITE_AI_PROVIDER` | AI provider slug | `openai` |
| `VITE_AI_API_KEY` | API key for the chosen provider | — |
| `VITE_AI_MODEL` | Model override (uses provider default if blank) | — |
| `VITE_DEMO_MODE` | Set to `1` to use pre-built advice cards | — |

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

### Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`.
