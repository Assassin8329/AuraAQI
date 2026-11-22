# AuraGuide — Urban Air Quality Assistant

> **Built for Hack2Skill PromptWars Challenge 06** — a real-time air quality advisor that delivers personalized, actionable advice using Google Gemini AI, live Open-Meteo data, and interactive maps.

## 🌍 Problem Statement

Urban air pollution affects over 90% of the world's population. People need **real-time, personalized air quality guidance** — not just raw AQI numbers, but actionable advice tailored to their lifestyle, health concerns, and location.

## ✅ Solution

AuraGuide transforms raw air quality data into **personalized, actionable advice** through a three-step flow:

1. **Profile Setup** — Users enter their name, location, lifestyle, and preferences
2. **Live AQI Lookup** — Real-time air quality data from Open-Meteo's free APIs
3. **AI-Powered Advice** — Google Gemini generates tailored recommendations across three categories:
   - Daily Routine (low-emission commuting, timing)
   - Indoor Air Quality (HEPA filtration, ventilation)
   - Sustainable Switch (long-term pollution reduction)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ UserProfile  │→│ Dashboard   │→│ ProviderSelector │ │
│  │   Form       │  │   (React)   │  │                  │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
│       │                  │                    │             │
│       ▼                  ▼                    ▼             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Leaflet     │  │  Product     │  │  Google Gemini   │ │
│  │  Map (OSM)   │  │  Suggestions │  │  (AI Provider)   │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ Open-Meteo   │  │ Unsplash     │  │ generativelanguage│
│ Geocoding    │  │ Images API   │  │ .googleapis.com   │
│ API          │  │              │  │                  │
└──────────────┘  └──────────────┘  └──────────────────┘
       │
       ▼
┌──────────────┐
│ Open-Meteo   │
│ Air Quality  │
│ API          │
└──────────────┘
```

### Data Flow

```
User Location → Photon API (geocoding) → Open-Meteo (AQI) → Gemini AI (advice) → UI Cards
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Real-time AQI** | Live air quality data from Open-Meteo's free APIs |
| **Google Gemini AI** | Primary AI provider for personalized advice (Hack2Skill compliant) |
| **Photon City Search** | Search any city/region worldwide (komoot.io Photon API) |
| **Interactive Map** | Leaflet + OpenStreetMap with AQI markers and tooltips |
| **Product Suggestions** | Location-aware shopping links (Amazon.in/Flipkart for India, Amazon/Walmart for US) |
| **Multi-language** | 8 languages: EN, HI, ES, FR, DE, JA, KO, AR |
| **RTL Support** | Full right-to-left layout for Arabic |
| **Provider Selector** | Choose between Google Gemini, Pollinations, Ollama, or LM Studio |
| **GPS Auto-detect** | Browser geolocation for instant location |
| **Demo Mode** | Zero-setup mode with pre-built advice for testing |
| **Security** | API keys never sent from browser; prompt injection sanitization |

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + TypeScript 7 |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS 4 + Tailwind CSS Animate |
| **AI Provider** | **Google Gemini** (primary), Pollinations (free fallback) |
| **AQI Data** | Open-Meteo Geocoding + Air Quality APIs |
| **Maps** | Leaflet + OpenStreetMap (free, no API key) |
| **Search** | Photon API (komoot.io) for city autocomplete |
| **Images** | Unsplash Source for product photos |
| **Testing** | Vitest 5 |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (v26 recommended)
- npm or pnpm

### Installation

```bash
cd aura
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local`:

```env
# AI Provider (required for Hack2Skill evaluation)
VITE_AI_PROVIDER=google
VITE_AI_API_KEY=your_google_gemini_api_key
VITE_AI_MODEL=gemini-2.5-flash

# Demo mode (skip AI for testing)
VITE_DEMO_MODE=0
```

### Run Locally

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npx vitest run
```

## 📁 Project Structure

```
aura/
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives (Button, Card, etc.)
│   │   ├── Dashboard.tsx       # Main dashboard with AQI, advice, map
│   │   ├── UserProfileForm.tsx # Entry form with GPS + provider selector
│   │   ├── ProviderSelector.tsx # AI provider dropdown
│   │   ├── AutocompleteSearch.tsx # Photon-powered city search
│   │   ├── WorldMap.tsx        # Leaflet map with AQI markers
│   │   ├── ProductSuggestions.tsx # Location-aware product cards
│   │   ├── LanguageSelector.tsx  # Multi-language switcher
│   │   ├── LinearAQIBar.tsx    # AQI indicator bar
│   │   └── AdviceCard.tsx      # Individual advice card
│   ├── lib/
│   │   ├── ai-service.ts       # AI service (Gemini primary, security hardened)
│   │   ├── air-quality.ts      # Open-Meteo AQI data fetcher
│   │   ├── translations.ts     # 8-language i18n
│   │   ├── demo-data.ts        # Demo mode data
│   │   └── provider-health.ts  # Provider health monitoring
│   ├── App.tsx                 # Root component
│   ├── Dashboard.tsx           # Dashboard component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── server/                     # Express server (optional, for API proxy)
├── vitest.config.ts            # Vitest configuration
├── vite.config.ts              # Vite configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security

| Measure | Implementation |
|---------|----------------|
| **API Key Protection** | Keys stored in `.env.local`, never committed; never sent from browser to `/api/` |
| **Prompt Injection** | Input sanitization strips backticks, control chars, and injection keywords |
| **JSON Schema Validation** | Strict card schema with graceful normalization — never trusts raw AI output |
| **CSP Headers** | Content Security Policy allows only necessary CDNs (Leaflet, Photon, Carto) |
| **No Server Dependencies** | All data fetched directly from browser — no Express dependency for production |

## 📊 Hack2Skill Evaluation Alignment

| Criterion | How AuraGuide Meets It |
|-----------|----------------------|
| **Code Quality** | Clean TypeScript, modular components, strict typing, comprehensive test suite (33 tests) |
| **Security** | API key protection, prompt injection sanitization, no client-side key exposure |
| **Efficiency** | Vite-optimized, tree-shaken dependencies, cached AI responses, lazy-loaded maps |
| **Testing** | Vitest suite covering risk bands, fallback advice, JSON extraction, card validation, profile adaptation |
| **Accessibility** | Semantic HTML, ARIA labels, keyboard navigation, RTL support, WCAG AA contrast |
| **Problem Alignment** | Directly addresses Challenge 06 — real-time urban air quality with personalized advice |
| **Google Services** | **Google Gemini** as primary AI provider via `generativelanguage.googleapis.com` |
| **Clean Structure** | Modular src/ with components/, lib/, ui/ — clear separation of concerns |
| **Git Hygiene** | Small, focused commits with descriptive messages |

## 🌐 API Endpoints Used

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1/search` | City/region lookup |
| Open-Meteo Air Quality | `https://air-quality-api.open-meteo.com/v1/air-quality` | Real-time AQI data |
| Photon (komoot.io) | `https://photon.komoot.io/api/` | City autocomplete search |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions` | AI advice generation |
| Unsplash | `https://source.unsplash.com/featured/?{query}` | Product imagery |

## 📝 License

MIT

---

**Built with ❤️ for Hack2Skill PromptWars Challenge 06**
