import enAuth from "~/locales/en/auth.json";
import enCommon from "~/locales/en/common.json";
import enDashboard from "~/locales/en/dashboard.json";
import enLanding from "~/locales/en/landing.json";
import enPricing from "~/locales/en/pricing.json";
import enWelcome from "~/locales/en/welcome.json";
import viAuth from "~/locales/vi/auth.json";
import viCommon from "~/locales/vi/common.json";
import viDashboard from "~/locales/vi/dashboard.json";
import viLanding from "~/locales/vi/landing.json";
import viPricing from "~/locales/vi/pricing.json";
import viWelcome from "~/locales/vi/welcome.json";

/**
 * Tập hợp tài nguyên i18n. Mỗi feature 1 namespace riêng để:
 * - Tránh đè key giữa các feature.
 * - Sau này dễ chuyển sang lazy-load (mỗi namespace 1 file riêng).
 *
 * Khi thêm namespace mới:
 *   1. Tạo locales/{en,vi}/<feature>.json
 *   2. Import + thêm vào object dưới
 *   3. Thêm tên namespace vào NAMESPACES
 */

export const NAMESPACES = ["common", "welcome", "landing", "pricing", "auth", "dashboard"] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE: Namespace = "common";

export const resources = {
  en: {
    common: enCommon,
    welcome: enWelcome,
    landing: enLanding,
    pricing: enPricing,
    auth: enAuth,
    dashboard: enDashboard,
  },
  vi: {
    common: viCommon,
    welcome: viWelcome,
    landing: viLanding,
    pricing: viPricing,
    auth: viAuth,
    dashboard: viDashboard,
  },
} as const;

export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: Language = "vi";
