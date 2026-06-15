import enAdmin from "~/locales/en/admin.json";
import enAuth from "~/locales/en/auth.json";
import enCommon from "~/locales/en/common.json";
import enDashboard from "~/locales/en/dashboard.json";
import enLanding from "~/locales/en/landing.json";
import enPortfolio from "~/locales/en/portfolio.json";
import enPricing from "~/locales/en/pricing.json";
import enSettings from "~/locales/en/settings.json";
import enSubscription from "~/locales/en/subscription.json";
import enWelcome from "~/locales/en/welcome.json";
import enJd from "~/locales/en/jd.json";
import enAssessment from "~/locales/en/assessment.json";
import enCv from "~/locales/en/cv.json";
import enOnboarding from "~/locales/en/onboarding.json";
import viAdmin from "~/locales/vi/admin.json";
import viAuth from "~/locales/vi/auth.json";
import viCommon from "~/locales/vi/common.json";
import viDashboard from "~/locales/vi/dashboard.json";
import viLanding from "~/locales/vi/landing.json";
import viPortfolio from "~/locales/vi/portfolio.json";
import viPricing from "~/locales/vi/pricing.json";
import viSettings from "~/locales/vi/settings.json";
import viSubscription from "~/locales/vi/subscription.json";
import viWelcome from "~/locales/vi/welcome.json";
import viJd from "~/locales/vi/jd.json";
import viAssessment from "~/locales/vi/assessment.json";
import viCv from "~/locales/vi/cv.json";
import viOnboarding from "~/locales/vi/onboarding.json";

export const NAMESPACES = ["common", "welcome", "landing", "pricing", "subscription", "auth", "dashboard", "settings", "admin", "jd", "assessment", "cv", "onboarding", "portfolio"] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE: Namespace = "common";

export const resources = {
  en: {
    common: enCommon,
    welcome: enWelcome,
    landing: enLanding,
    pricing: enPricing,
    subscription: enSubscription,
    auth: enAuth,
    dashboard: enDashboard,
    settings: enSettings,
    admin: enAdmin,
    jd: enJd,
    assessment: enAssessment,
    cv: enCv,
    onboarding: enOnboarding,
    portfolio: enPortfolio,
  },
  vi: {
    common: viCommon,
    welcome: viWelcome,
    landing: viLanding,
    pricing: viPricing,
    subscription: viSubscription,
    auth: viAuth,
    dashboard: viDashboard,
    settings: viSettings,
    admin: viAdmin,
    jd: viJd,
    assessment: viAssessment,
    cv: viCv,
    onboarding: viOnboarding,
    portfolio: viPortfolio,
  },
} as const;

export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: Language = "vi";
