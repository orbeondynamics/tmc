// Server Component — fallback semántico (siempre presente en el HTML,
// sección 10 CERRADO) para una de las 5 rutas de la arquitectura Hybrid B
// (sección 5.2, CERRADO). El mundo 3D (Canvas único y persistente) vive en
// el layout raíz, no aquí — así nunca se remonta al navegar entre rutas.

import { StaticHero } from "@/components/fallback/StaticHero";
import { HotspotSection } from "@/components/fallback/HotspotSection";
import { StaticUnitDetail } from "@/components/fallback/StaticUnitDetail";

export function TmcWorldPage({ unitId }: { unitId?: string } = {}) {
  return (
    <main>
      <div id="tmcFallback" className="tmcFallback">
        <StaticHero />
        {unitId && <StaticUnitDetail unitId={unitId} />}
        <HotspotSection />
      </div>
    </main>
  );
}
