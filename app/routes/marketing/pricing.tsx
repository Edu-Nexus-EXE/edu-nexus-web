import { LandingFooter } from '~/features/landing/components/landing/landing-footer'
import { LandingNavbar } from '~/features/landing/components/landing/landing-navbar'
import { MarketingLayout } from '~/features/landing/components/landing/marketing-layout'
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
