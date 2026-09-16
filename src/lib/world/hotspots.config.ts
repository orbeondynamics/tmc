// Bloque 1 (MVP) — configuración de las 4 unidades V1 (Master Handoff
// secciones 2, 4, 18). Copy exclusivamente aprobado, sin invención.

export interface HotspotQuadrant {
  /** -1 = columna izquierda, +1 = columna derecha. */
  col: -1 | 1;
  /** -1 = fila de arriba, +1 = fila de abajo. */
  row: -1 | 1;
}

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
  /** Cuadrante de la composición fija en CSS (ver HomeBadgeLayer.tsx —
   * reemplaza por completo al sistema anterior de proyección 3D en vivo,
   * REDTEAM: "cero interacción de mouse sobre objetos 3D" confirmado, así
   * que las 4 insignias son overlay HTML puro posicionado por
   * porcentaje/transform, sin round-trip a posición de mundo). Ya no se
   * conserva una profundidad Z — no hay parallax 3D en las insignias. */
  quadrant: HotspotQuadrant;
}

export const hotspots: HotspotConfig[] = [
  {
    id: "tmc-luxury",
    route: "/luxury",
    label: "TMC LUXURY",
    positioning: "PRIVATE PROPERTY MANAGEMENT",
    message: "Your property. Our responsibility.",
    quadrant: { col: -1, row: -1 },
  },
  {
    id: "tmc-transport",
    route: "/transport",
    label: "TMC TRANSPORT",
    positioning: "PRIVATE MOBILITY",
    message: "Your destination. Our expertise.",
    quadrant: { col: 1, row: -1 },
  },
  {
    id: "tmc-cleaners",
    route: "/cleaners",
    label: "TMC CLEANERS",
    positioning: "PRIVATE HOME & PROPERTY CARE",
    message: "Immaculate spaces for a better life.",
    quadrant: { col: -1, row: 1 },
  },
  {
    id: "tmc-project-office",
    route: "/project-office",
    label: "TMC PROJECT OFFICE",
    positioning: "PROJECTS · INVESTMENTS · ADVISORY",
    message: "Turning opportunities into execution.",
    quadrant: { col: 1, row: 1 },
  },
];
