// Server Component — fallback semántico/SEO enriquecido para la página de
// una operating unit específica (evolución sección 18-21, sin WebGL o para
// motores de búsqueda). Antes cada ruta de unidad servía el mismo hero
// genérico que Home; ahora expone el contenido real de esa unidad — leído de
// content/tmc-world/*.md (fuente principal, ver tmcContentSource.ts).

import { getOperatingUnits } from "@/lib/content/tmcContentSource";

export function StaticUnitDetail({ unitId }: { unitId: string }) {
  const unit = getOperatingUnits().find((u) => u.id === unitId);
  if (!unit) return null;

  return (
    <section aria-label={unit.name}>
      <p className="tmcFallback__eyebrow">{unit.descriptor}</p>
      <h2>{unit.name}</h2>
      <p>{unit.intro}</p>
      <ul>
        {unit.capabilities.map((cap) => (
          <li key={cap}>{cap}</li>
        ))}
      </ul>
      <p>{unit.signature}</p>
    </section>
  );
}
