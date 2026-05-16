import { LandingFooter, LandingNavbar, MarketingLayout } from '~/features/landing'
import { PricingPage } from '~/features/pricing'

import type { Route } from './+types/pricing'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Bảng giá - Edu-Nexus' },
    {
      name: 'description',
      content: 'Chọn gói dịch vụ phù hợp để tối ưu hóa hành trình học tập và sự nghiệp với AI.',
    },
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
