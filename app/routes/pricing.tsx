import { LandingFooter } from '~/features/landing/components/landing-footer'
import { LandingNavbar } from '~/features/landing/components/landing-navbar'
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
    <div className='bg-background text-foreground font-display antialiased min-h-screen flex flex-col'>
      <LandingNavbar />
      <PricingPage />
      <LandingFooter />
    </div>
  )
}
