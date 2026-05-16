import { useTranslation } from "react-i18next";

export function LandingFeatureAnalysis() {
  const { t } = useTranslation("landing");

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-2xl">analytics</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("featureAnalysis.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {t("featureAnalysis.description")}
            </p>
            <ul className="space-y-4 mb-8">
              {(["check1", "check2", "check3"] as const).map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                  <span className="text-foreground">{t(`featureAnalysis.${key}`)}</span>
                </li>
              ))}
            </ul>
            <a href="#" className="text-primary font-medium hover:opacity-80 inline-flex items-center gap-1 group">
              {t("featureAnalysis.demoLink")}
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </a>
          </div>

          {/* Visual Content */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-default">
              <div className="aspect-video bg-card relative">
                <img
                  alt={t("featureAnalysis.title")}
                  className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXxPbx7MLceIdUUwtin-Br2genE9U-boalWxiJOE6qin_oBuEUOhx9HUQ4MXBmuubnjHwBkymnCKsWgbFx9gVkgvfm_XjEGZkMSUytogirLtUvIptGg_oKYidFEC_maA28hNiEQWLGpaDZjJs-cO5ylRBm75OIiYuFTDT1sEZ7hs5DwPdk8bFJP5dfjuQZ2OrInnQCaQsAwPpmD0Z2uh2VLqgPXknViIGGRF2RMB7f31NST86DNAuoJ4kHrVhMljpxJqqfNHHWu6yz"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-card/90 backdrop-blur border border-border p-5 rounded-lg shadow-xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-foreground">{t("featureAnalysis.cardTitle")}</span>
                    <span className="text-xs px-2 py-0.5 bg-destructive/20 text-destructive rounded border border-destructive/20">-14%</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                        <span>{t("featureAnalysis.skillSystemDesign")}</span>
                        <span>{t("featureAnalysis.required", { percent: 90 })}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[76%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                        <span>{t("featureAnalysis.skillCloud")}</span>
                        <span>{t("featureAnalysis.required", { percent: 85 })}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-[60%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
