import { LandingFooter, LandingNavbar, MarketingLayout } from '~/features/landing'
import { PricingPage } from '~/features/pricing'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/pricing'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('pricing', 'hero.title') },
    {
      name: 'description',
      content: getMetaTranslation('pricing', 'hero.subtitle')
    }
  ]
}

export default function Pricing() {
  return (
    <MarketingLayout>
      <LandingNavbar />
      <PricingPage />
      <LandingFooter />
    </MarketingLayout>
  )
}
