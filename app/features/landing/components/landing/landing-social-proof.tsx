import { useTranslation } from "react-i18next";

export function LandingSocialProof() {
  const { t } = useTranslation("landing");

  return (
    <section className="border-y border-border bg-muted/30 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
          {t("socialProof.title")}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Vertex */}
          <div className="h-8 flex items-center gap-2" title="Tech University">
            <div className="w-6 h-6 border-2 border-muted-foreground rounded-sm rotate-45" />
            <span className="font-bold text-lg text-muted-foreground">
              Vertex
            </span>
          </div>

          {/* Orbit */}
          <div className="h-8 flex items-center gap-2" title="Global Institute">
            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
            </div>
            <span className="font-bold text-lg text-muted-foreground">
              Orbit
            </span>
          </div>

          {/* Scala */}
          <div className="h-8 flex items-center gap-2" title="Future Systems">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-6 bg-muted-foreground rounded-sm" />
              <div className="w-1.5 h-4 bg-muted-foreground rounded-sm self-end" />
              <div className="w-1.5 h-6 bg-muted-foreground rounded-sm" />
            </div>
            <span className="font-bold text-lg text-muted-foreground">
              Scala
            </span>
          </div>

          {/* Nexus */}
          <div className="h-8 flex items-center gap-2" title="AI Labs">
            <div className="w-6 h-6 border border-muted-foreground rounded-tr-lg rounded-bl-lg" />
            <span className="font-bold text-lg text-muted-foreground">
              Nexus
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
