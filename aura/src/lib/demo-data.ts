export const demoAqi = {
  aqi: 412,
  status: "Severe",
  pm25: 290,
  pm10: 430,
  city: "Delhi",
  region: "Delhi",
  country: "India",
  updated: "2026-11-21",
  observedAt: "2026-11-21T12:00:00Z",
  source: "cached demo data",
  station: "Anand Vihar, Delhi (Demo)"
};

export const cachedResponses = {
  delhi: {
    family_with_children: {
      risk_level: "Severe (Hazardous)",
      priority_tip: {
        action: "Keep children completely indoors during peak winter smog hours (6:00 AM – 11:00 AM).",
        impact: "Reduces child PM2.5 lung exposure by approx. 65%",
        why: "Developing lungs inhale up to 50% more air per pound of body weight than adults, multiplying particulate tissue damage."
      },
      routines: [
        {
          action: "Shift all outdoor physical play and sports to indoor living rooms with closed windows and HEPA filtration.",
          impact: "Avoids inhaling approx. 210 ug/m3 of toxic fine particulates daily",
          why: "Strenuous physical activity in 400+ AQI causes acute bronchial inflammation and triggers childhood asthma flare-ups."
        }
      ],
      indoor_hacks: [
        {
          action: "Seal window perimeter seams with foam stripping and run a certified HEPA air purifier continuously on high in the children's bedroom.",
          impact: "Drops indoor PM2.5 from 290 ug/m3 to under 30 ug/m3 (approx. 90% reduction)",
          why: "Unsealed rooms allow outdoor toxic smog to equalize indoor air quality within 25 minutes."
        }
      ],
      alternatives: [
        {
          action: "Coordinate a neighborhood carpool or utilize the certified school bus rather than open two-wheeler or auto-rickshaw commutes.",
          impact: "Saves approx. 4.2 kg CO2 weekly and prevents 80% of direct roadside exhaust plume inhalation",
          why: "Open-air two-wheeler travel places children directly at the tailpipe height of diesel trucks and buses."
        }
      ]
    },
    elderly_parent: {
      risk_level: "Severe (Hazardous)",
      priority_tip: {
        action: "Cancel morning outdoor walks entirely; substitute with gentle indoor stretching in a filtered room.",
        impact: "Lowers acute cardiac event risk by approx. 45% and avoids cold-smog vasoconstriction",
        why: "Inhaling heavy PM2.5 in cold morning air causes sudden arterial spasm and systemic vascular inflammation in seniors."
      },
      routines: [
        {
          action: "Remain in climate-controlled indoor spaces, using a fitted N95 respirator mask if any step outside is unavoidable.",
          impact: "Filters approx. 95% of toxic particulates down to 0.3 microns",
          why: "Elderly alveolar membranes have reduced macrophage clearance, leading to prolonged particle retention."
        }
      ],
      indoor_hacks: [
        {
          action: "Designate a sealed clean-air sanctuary room, mop floors with damp microfiber (no dry broom sweeping), and maintain 45% humidity.",
          impact: "Suppresses approx. 75% of resuspended floor dust and fine particulates",
          why: "Dry sweeping violently resuspends settled toxic heavy-metal dust directly into senior breathing zones."
        }
      ],
      alternatives: [
        {
          action: "Switch kitchen cooking to electric induction or covered simmer pots, and completely ban indoor incense or dhoop burning.",
          impact: "Eliminates approx. 140 ug/m3 of combustion soot and saves approx. 1.8 kg household emissions weekly",
          why: "Indoor burning produces ultra-fine soot that rapidly diffuses into the bloodstream of vulnerable adults."
        }
      ]
    }
  }
};