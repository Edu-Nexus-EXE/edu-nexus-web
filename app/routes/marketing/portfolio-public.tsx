import { LandingFooter } from '~/features/landing/components/landing/landing-footer'
import { LandingNavbar } from '~/features/landing/components/landing/landing-navbar'
import { MarketingLayout } from '~/features/landing/components/landing/marketing-layout'
import { PortfolioPublicPage } from '~/features/portfolio'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/portfolio-public'

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: getMetaTitle('portfolio', 'public.title') },
    {
      name: 'description',
      content: getMetaTranslation('portfolio', 'public.subtitle')
    },
    {
      name: 'robots',
      content: params.slug ? 'index,follow' : 'noindex'
    }
  ]
}

export default function MarketingPortfolioPublicRoute() {
  return (
    <MarketingLayout>
      <LandingNavbar />
      <PortfolioPublicPage />
      <LandingFooter />
    </MarketingLayout>
  )
}
