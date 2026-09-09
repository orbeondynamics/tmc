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
  if (!lenis) return;
  const targetY = waypoint.scrollProgress * lenis.limit;
  lenis.scrollTo(targetY, {
    duration: 1.6,
    easing: (x: number) => 1 - Math.pow(1 - x, 3),
    onComplete,
  });
}
