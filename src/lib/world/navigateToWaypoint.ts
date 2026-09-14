"use client";

// Bloque 1 (MVP) — al hacer click en un hotspot, se anima el scroll real
// (vía Lenis) hasta la posición que corresponde al waypoint destino. El
// progreso de cámara se deriva del scroll en un único lugar (ver
// useScrollProgress), así que scroll y navegación directa convergen en la
// misma fuente y en la misma pose de cámara (Master Handoff sección 6,
// CERRADO).

import type Lenis from "lenis";
import type { CameraWaypoint } from "./waypoints";

export function navigateToWaypoint({
  waypoint,
  lenisRef,
  onComplete,
}: {
  waypoint: CameraWaypoint;
  lenisRef: React.MutableRefObject<Lenis | null>;
  onComplete?: () => void;
}) {
  const lenis = lenisRef.current;
  // Guarda explícita sobre scrollTo (no solo `!lenis`): bug real confirmado
  // con stack trace — lenisRef puede llegar aquí con un valor truthy que NO
  // es una instancia real de Lenis (ver WorldContext.tsx, DEGRADED_CONTEXT,
  // causa raíz corregida ahí). Esta guarda es la red de seguridad adicional
  // para que este archivo nunca vuelva a asumir que "truthy" implica "Lenis
  // real", sin importar de dónde venga el ref.
  if (!lenis || typeof lenis.scrollTo !== "function") return;
  const targetY = waypoint.scrollProgress * lenis.limit;
  lenis.scrollTo(targetY, {
    duration: 1.6,
    easing: (x: number) => 1 - Math.pow(1 - x, 3),
    onComplete,
  });
}
