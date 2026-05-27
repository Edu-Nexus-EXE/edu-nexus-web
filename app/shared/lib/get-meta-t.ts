import { SITE } from '~/shared/config/site'
import { FALLBACK_LANGUAGE, resources, type Language, type Namespace } from '~/shared/lib/i18n/resources'

type ResourceNode = string | { readonly [key: string]: ResourceNode } | readonly ResourceNode[]

function readResourceValue(source: ResourceNode, path: string): string | null {
  const value = path.split('.').reduce<ResourceNode | undefined>((current, segment) => {
    if (!current || typeof current === 'string' || Array.isArray(current)) {
      return undefined
    }

    return (current as Record<string, ResourceNode>)[segment]
  }, source)

  return typeof value === 'string' ? value : null
}

export function getMetaTranslation(namespace: Namespace, key: string, locale: Language = SITE.defaultLocale) {
  return (
    readResourceValue(resources[locale][namespace], key) ??
    readResourceValue(resources[FALLBACK_LANGUAGE][namespace], key) ??
    key
  )
}

export function getMetaTitle(namespace: Namespace, key: string, locale?: Language) {
  return `${getMetaTranslation(namespace, key, locale)} - ${SITE.shortName}`
}
