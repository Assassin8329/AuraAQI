import { describe, it, expect } from "vitest";
import { getTranslations, type Language } from "../translations";

describe("getTranslations", () => {
  const languages: Language[] = ["en", "hi", "es", "fr", "de", "ja", "ko", "ar"];

  it("returns translations for all supported languages", () => {
    for (const lang of languages) {
      const t = getTranslations(lang);
      expect(t).toBeDefined();
      expect(t.appName).toBeDefined();
      expect(t.dashboardTitle).toBeDefined();
      expect(typeof t.dashboardTitle).toBe("string");
    }
  });

  it("returns English translations by default", () => {
    const t = getTranslations("en");
    expect(t.appName).toBe("AuraGuide");
    expect(t.dashboardTitle).toBe("Your air quality dashboard");
  });

  it("returns Arabic translations", () => {
    const t = getTranslations("ar");
    expect(t.appName).toBe("أورا غايد");
  });

  it("returns Hindi translations", () => {
    const t = getTranslations("hi");
    expect(t.appName).toBe("ऑरागाइड");
  });

  it("dashboardSubtitle supports dynamic city", () => {
    const t = getTranslations("en");
    const subtitle = typeof t.dashboardSubtitle === "function"
      ? t.dashboardSubtitle("Delhi")
      : t.dashboardSubtitle;
    expect(typeof subtitle).toBe("string");
    expect(subtitle).toContain("Delhi");
  });

  it("profileContext supports dynamic values", () => {
    const t = getTranslations("en");
    const profileCtx = typeof t.profileContext === "function"
      ? t.profileContext("John", "Budget", "Health focus", "Direct")
      : t.profileContext;
    expect(typeof profileCtx).toBe("string");
    expect(profileCtx).toContain("John");
  });

  it("generatedBy supports dynamic model name", () => {
    const t = getTranslations("en");
    const genBy = typeof t.generatedBy === "function"
      ? t.generatedBy("Gemini")
      : t.generatedBy;
    expect(typeof genBy).toBe("string");
    expect(genBy).toContain("Gemini");
  });

  it("all translations have required keys", () => {
    const requiredKeys = [
      "appName", "dashboardTitle", "dashboardSubtitle",
      "getAdvice", "refreshAqi", "editProfile",
      "loading", "noData", "currentAdvisory",
      "pm25", "pm10", "observedAt", "source", "station",
      "personalizedAdvice", "offlineFallback", "demoData",
      "generatedBy", "tryAgain", "useFallback",
      "howItWorks", "howItWorksText", "step01", "step02", "step03",
      "profileContext", "footer",
    ];
    for (const lang of languages) {
      const t = getTranslations(lang);
      for (const key of requiredKeys) {
        expect(t).toHaveProperty(key);
      }
    }
  });
});
