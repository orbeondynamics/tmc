// Bloque 1 (MVP) — mapea la ruta actual (App Router) al waypoint que le
// corresponde (arquitectura Hybrid B, sección 5.2, CERRADO). Se usa para que
// una entrada directa a una ruta posicione la cámara en el waypoint correcto
// sin depender de props de montaje — el Canvas es único y persistente
// (sección 5.1) y vive en el layout raíz, no en cada page.tsx.

import { hotspots } from "./hotspots.config";

export function pathToWaypointId(pathname: string): string {
  const match = hotspots.find((h) => h.route === pathname);
  return match?.id ?? "hero";
}
