// Bloque 1 (MVP) — configuración de las 4 unidades V1 (Master Handoff
// secciones 2, 4, 18). Copy exclusivamente aprobado, sin invención.

import type { HotspotQuadrant } from "./hotspotComposition";

export interface HotspotConfig {
  id: string;
  /** Ruta dedicada (arquitectura Hybrid B — sección 5.2, CERRADO). */
  route: `/${string}`;
  /** Etiqueta exacta aprobada. */
  label: string;
  /** Posicionamiento aprobado (sección 2). */
  positioning: string;
  /** Mensaje/tagline aprobado (secciones 2 y 4). */
  message: string;
  /** Cuadrante de la composición (hotspotComposition.ts, sistema de 3
   * valores) — reemplaza al anchor [x,y,z] en unidades de mundo que usaba
   * el sistema anterior (REDTEAM: 4 posiciones fijas empujadas
   * individualmente para evitar choques, causa raíz de los choques con
   * header/footer que se repitieron en cada ronda). Solo se conserva la
   * profundidad Z (parallax) de cada anchor original — X/Y ahora se
   * calculan en pantalla a partir del logo real + separacionHorizontal/
   * separacionVertical, no viven más aquí. */
  quadrant: HotspotQuadrant;
}

export const hotspots: HotspotConfig[] = [
  {
    id: "tmc-luxury",
    route: "/luxury",
    label: "TMC LUXURY",
    positioning: "PRIVATE PROPERTY MANAGEMENT",
    message: "Your property. Our responsibility.",
    // Cuadrante superior-izquierdo. Z conservado del anchor original (-4).
    quadrant: { col: -1, row: -1, z: -4 },
  },
  {
    id: "tmc-transport",
    route: "/transport",
    label: "TMC TRANSPORT",
    positioning: "PRIVATE MOBILITY",
    message: "Your destination. Our expertise.",
    // Cuadrante superior-derecho. Z conservado del anchor original (-8).
    quadrant: { col: 1, row: -1, z: -8 },
  },
  {
    id: "tmc-cleaners",
    route: "/cleaners",
    label: "TMC CLEANERS",
    positioning: "PRIVATE HOME & PROPERTY CARE",
    message: "Immaculate spaces for a better life.",
    // Cuadrante inferior-izquierdo. Z conservado del anchor original (-2).
    quadrant: { col: -1, row: 1, z: -2 },
  },
  {
    id: "tmc-project-office",
    route: "/project-office",
    label: "TMC PROJECT OFFICE",
    positioning: "PROJECTS · INVESTMENTS · ADVISORY",
    message: "Turning opportunities into execution.",
    // Cuadrante inferior-derecho. Z conservado del anchor original (2).
    quadrant: { col: 1, row: 1, z: 2 },
  },
];
