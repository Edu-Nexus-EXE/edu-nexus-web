import { LandingNavbar } from "./components/landing-navbar";
import { LandingHero } from "./components/landing-hero";
import { LandingSocialProof } from "./components/landing-social-proof";
import { LandingFeatureAnalysis } from "./components/landing-feature-analysis";
import { LandingFeatureRoadmap } from "./components/landing-feature-roadmap";
import { LandingCta } from "./components/landing-cta";
import { LandingFooter } from "./components/landing-footer";

export function LandingPage() {
  return (
    <div className="bg-background text-foreground font-display antialiased min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      <LandingNavbar />
      <LandingHero />
      <LandingSocialProof />
      <LandingFeatureAnalysis />
      <LandingFeatureRoadmap />
      <LandingCta />
      <LandingFooter />
    </div>
  );
}
