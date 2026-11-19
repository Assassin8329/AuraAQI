# AuraGuide

React + TypeScript + Vite app that converts live air quality data into personalised, sustainable daily advice.

## Features

- **10 AI providers**: OpenAI, Anthropic Claude, Google Gemini, xAI Grok, DeepSeek, Mistral, OpenRouter, Together AI, Perplexity, Groq
- **Top-right provider selector**: toggle to switch providers, enter API keys, and choose models
- **Server-side key storage**: API keys never leave the backend proxy
- **Rate limiting**: built-in protection against abuse
- **Prompt injection defense**: user input is sanitized before reaching the AI
- **Strict JSON validation**: brace-depth matching prevents malformed AI responses from crashing the app

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

Open [http://localhost:5173](http://localhost:5173)

### 3. Use the app

1. Enter your name and location on the profile form
2. Choose your lifestyle, concerns, and communication style
3. View live air quality data with personalised advice
4. Use the **top-right provider selector** to switch AI providers or enter your own API key

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

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

### Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`.
