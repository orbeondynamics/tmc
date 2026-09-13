// Server Component — fallback semántico de home (siempre presente en el
// HTML, sección 10 CERRADO), para cuando no hay WebGL disponible. El mundo
// 3D solo existe en home (HomeWorldGate.tsx) — las 4 páginas de unidad ya
// no pasan por aquí, son páginas estáticas propias (StaticUnitPage.tsx) que
// no necesitan esta distinción "con/sin WebGL", porque nunca intentan
// montar el mundo 3D en primer lugar.

import { StaticHero } from "@/components/fallback/StaticHero";
import { HotspotSection } from "@/components/fallback/HotspotSection";

export function TmcWorldPage() {
  return (
    <main>
      <div id="tmcFallback" className="tmcFallback">
        <StaticHero />
        <HotspotSection />
      </div>
    </main>
  );
}
