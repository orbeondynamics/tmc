// Presentación compartida del contenido de una operating unit — extraída de
// UnitContentPanel.tsx (cambio de alcance: las 4 páginas de unidad dejan de
// ser parte del mundo 3D y pasan a ser páginas estáticas normales, sección
// "Punto 1 — arquitectura unificada"). La usan dos contenedores distintos:
// UnitContentPanel (overlay sobre el mundo 3D en home) y StaticUnitPage (la
// nueva página estática) — mismo markup/contenido en ambos, solo cambia el
// envoltorio (fondo con degradado que se disuelve hacia la escena vs. fondo
// sólido de página normal). Sin "use client": no usa hooks, se renderiza
// igual desde un padre server o client.

import type { OperatingUnitContent } from "@/config/tmcContent";

export function UnitPanelContent({ unit }: { unit: OperatingUnitContent }) {
  return (
    <>
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
    </>
  );
}
