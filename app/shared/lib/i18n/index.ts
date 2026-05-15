import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { STORAGE_KEYS } from "~/shared/config/site";

import {
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  NAMESPACES,
  resources,
  SUPPORTED_LANGUAGES,
} from "./resources";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: FALLBACK_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      ns: NAMESPACES,
      defaultNS: DEFAULT_NAMESPACE,
      interpolation: { escapeValue: false }, // React tự escape
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: STORAGE_KEYS.language,
        caches: ["localStorage"],
      },
    });
}

export default i18n;
export {
  SUPPORTED_LANGUAGES,
  FALLBACK_LANGUAGE,
  NAMESPACES,
  DEFAULT_NAMESPACE,
} from "./resources";
export type { Language, Namespace } from "./resources";
