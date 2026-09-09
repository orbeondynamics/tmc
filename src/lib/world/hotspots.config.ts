// Bloque 1 (MVP) — configuración de las 4 unidades V1 (Master Handoff
// secciones 2, 4, 18). Copy exclusivamente aprobado, sin invención.

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
  /** Punto de anclaje 3D del marcador, en coordenadas del mundo. */
  anchor: [number, number, number];
}

export const hotspots: HotspotConfig[] = [
  {
    id: "tmc-luxury",
    route: "/luxury",
    label: "TMC LUXURY",
    positioning: "PRIVATE PROPERTY MANAGEMENT",
    message: "Your property. Our responsibility.",
    // Cuadrante superior-izquierdo, alrededor del TMC 3D (evolución sección 9).
    anchor: [-18, 9, -4],
  },
  {
    id: "tmc-transport",
    route: "/transport",
    label: "TMC TRANSPORT",
    positioning: "PRIVATE MOBILITY",
    message: "Your destination. Our expertise.",
    // Cuadrante superior-derecho.
    anchor: [18, 9, -8],
  },
  {
    id: "tmc-cleaners",
    route: "/cleaners",
    label: "TMC CLEANERS",
    positioning: "PRIVATE HOME & PROPERTY CARE",
    message: "Immaculate spaces for a better life.",
    // Cuadrante inferior-izquierdo.
    anchor: [-18, 2, -2],
  },
  {
    id: "tmc-project-office",
    route: "/project-office",
    label: "TMC PROJECT OFFICE",
    positioning: "PROJECTS · INVESTMENTS · ADVISORY",
    message: "Turning opportunities into execution.",
    // Cuadrante inferior-derecho.
    anchor: [18, 2, 2],
  },
];
