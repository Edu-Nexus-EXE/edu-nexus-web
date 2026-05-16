import { LandingCta } from '../components/landing/landing-cta'
import { LandingFeatureAnalysis } from '../components/landing/landing-feature-analysis'
import { LandingFeatureRoadmap } from '../components/landing/landing-feature-roadmap'
import { LandingFooter } from '../components/landing/landing-footer'
import { LandingHero } from '../components/landing/landing-hero'
import { LandingNavbar } from '../components/landing/landing-navbar'
import { LandingSocialProof } from '../components/landing/landing-social-proof'
import { MarketingLayout } from '../components/landing/marketing-layout'

export function LandingPage() {
  return (
    <MarketingLayout>
      <div className='overflow-x-hidden selection:bg-primary selection:text-primary-foreground'>
        <LandingNavbar />
        <LandingHero />
        <LandingSocialProof />
        <LandingFeatureAnalysis />
        <LandingFeatureRoadmap />
        <LandingCta />
        <LandingFooter />
      </div>
    </MarketingLayout>
  )
}
