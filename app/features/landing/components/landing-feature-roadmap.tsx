import { useTranslation } from "react-i18next";

export function LandingFeatureRoadmap() {
  const { t } = useTranslation("landing");

  return (
    <section className="py-24 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual Content */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <div className="aspect-video bg-card relative">
                <img
                  alt={t("featureRoadmap.title")}
                  className="object-cover w-full h-full opacity-50 group-hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-KGtATov-WK8BoaQCLiHM0QF_Hq0rC6GBBuuQkhU1znO0tKU_X3P7Fn9fYUrd7v8U5vI-7J5CNBUzrxeCwfZjKAs6cvKsXxMSqEWyPr4YP-f0IXeKCN8rQV3uTW-2yZNhwUbi60EFO2AJwpYGQBizST4XJ5qayX2YfwfuBzRyx0z51CFbPIZS4wx6uqPIb53uVemcJzZdwHauEpi3xN2NaINwfi8oX88nJOKgyOTz7fikvTIHLLdP9ybv20gUIJ_T89_rdLwc41DW"
                />

                {/* Timeline UI Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-center">
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary to-muted-foreground" />

                    <div className="relative pl-10 pb-8">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <h4 className="text-primary-foreground font-medium dark:text-foreground">{t("featureRoadmap.step1")}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{t("featureRoadmap.step1Detail")}</p>
                    </div>

                    <div className="relative pl-10 pb-8">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <h4 className="text-primary-foreground font-medium dark:text-foreground">{t("featureRoadmap.step2")}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{t("featureRoadmap.step2Detail")}</p>
                    </div>

                    <div className="relative pl-10">
                      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-card border-2 border-muted-foreground flex items-center justify-center">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                      </div>
                      <h4 className="text-muted-foreground font-medium">{t("featureRoadmap.step3")}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{t("featureRoadmap.step3Locked")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-2 border-primary/20 rounded-2xl" />
          </div>

          {/* Text Content */}
          <div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-2xl">route</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t("featureRoadmap.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {t("featureRoadmap.description")}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                <span className="block text-2xl font-bold text-foreground mb-1">
                  {t("featureRoadmap.stat1Value")}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("featureRoadmap.stat1Label")}
                </span>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                <span className="block text-2xl font-bold text-foreground mb-1">
                  {t("featureRoadmap.stat2Value")}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t("featureRoadmap.stat2Label")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
