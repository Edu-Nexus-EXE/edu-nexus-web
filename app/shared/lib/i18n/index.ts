import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { STORAGE_KEYS } from '~/shared/config/site'
import { readStorage } from '~/shared/lib/storage'

import {
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  NAMESPACES,
  resources,
  SUPPORTED_LANGUAGES,
  type Language
} from './resources'

function isLanguage(value: string | null | undefined): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
}

function detectInitialLanguage(): Language {
  const stored = readStorage(STORAGE_KEYS.language)
  if (isLanguage(stored)) return stored

  if (typeof navigator !== 'undefined') {
    const candidates = [...navigator.languages, navigator.language]
      .filter(Boolean)
      .map((value) => value.toLowerCase().split('-')[0])

    const matched = candidates.find((value): value is Language => SUPPORTED_LANGUAGES.includes(value as Language))

    if (matched) return matched
  }

  return FALLBACK_LANGUAGE
}

if (!i18n.isInitialized) {
  const initialLanguage = detectInitialLanguage()

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: NAMESPACES,
    defaultNS: DEFAULT_NAMESPACE,
    interpolation: { escapeValue: false }
  })
}

export default i18n
export { SUPPORTED_LANGUAGES, FALLBACK_LANGUAGE, NAMESPACES, DEFAULT_NAMESPACE } from './resources'
export type { Language, Namespace } from './resources'
