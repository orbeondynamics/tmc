"use client";

// Panel de contenido de operating unit — evolución sección 18-21/29. Se
// muestra cuando la ruta activa corresponde a una unidad (Hybrid B, sección
// 5.2); el Canvas no se remonta, solo aparece/desaparece este panel HTML
// superpuesto, igual que Header/Footer/Hotspots. Copy recibido como prop
// desde WorldExperience — resuelto server-side en layout.tsx a partir de
// content/tmc-world/{luxury,transport,cleaners,project-office}.md (fuente
// principal), con fallback a src/config/tmcContent.ts si un archivo falta.

import { useWorld } from "@/lib/world/WorldContext";
import type { OperatingUnitContent } from "@/config/tmcContent";

export function UnitContentPanel({ units: operatingUnits }: { units: OperatingUnitContent[] }) {
  const { activeWaypointId } = useWorld();
  const unit = operatingUnits.find((u) => u.id === activeWaypointId);
  if (!unit) return null;

  return (
    <aside className="unitPanel" aria-label={unit.name}>
      {/* data-lenis-prevent: sin esto, Lenis captura el wheel del documento
          completo y el intento de hacer scroll dentro del panel mueve la
          cámara/mundo en vez de desplazar este contenido (bug real detectado
          en QA de navegador). */}
      <div className="unitPanel__scroll" data-lenis-prevent>
        <p className="unitPanel__descriptor">{unit.descriptor}</p>
        <h2 className="unitPanel__name">{unit.name}</h2>
        <p className="unitPanel__intro">{unit.intro}</p>

        <ul className="unitPanel__capabilities">
          {unit.capabilities.map((cap) => (
            <li key={cap}>{cap}</li>
          ))}
        </ul>

        <p className="unitPanel__signature">{unit.signature}</p>

        <p className="unitPanel__supporting">{unit.supporting.join(" · ")}</p>

        {unit.extra?.map((paragraph) => (
          <p key={paragraph} className="unitPanel__extra">
            {paragraph}
          </p>
        ))}
      </div>
    </aside>
  );
}
