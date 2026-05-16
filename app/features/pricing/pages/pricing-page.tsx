import { PricingFaq } from '../components/pricing-faq'
import { PricingGrid } from '../components/pricing-grid'
import { PricingHero } from '../components/pricing-hero'

export function PricingPage() {
  return (
    <main className='flex flex-1 flex-col items-center justify-start py-12 px-4 md:px-10 lg:px-40'>
      <PricingHero />
      <PricingGrid />
      <PricingFaq />
    </main>
  )
}
