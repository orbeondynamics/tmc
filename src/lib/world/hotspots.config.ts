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

// Anchors X/Y (Fase 3, prompt maestro sección 6.2 — "proporciones exactas
// de insignia"): distribuidos en 4 cuadrantes diagonales a exactamente 90°
// de separación angular entre sí, a radio = 1.0x el diámetro del logo
// corregido (LOGO_SIZE=12 → diámetro del aro = 14.9725 unidades de mundo;
// offset X/Y = radio × cos/sin(45°) = 10.59). Antes los 4 anchors estaban
// angularmente agrupados en pares por lado (Luxury/Cleaners casi en el
// mismo ángulo, solo 7 unidades de separación vertical) — con insignias al
// 74% del diámetro del logo eso producía superposición entre pares del
// mismo lado. La distribución 90° verdadera separa cualquier par adyacente
// por ~21.17 unidades (>> que el diámetro de insignia de ~11.08 unidades),
// sin superposición y sin necesitar ningún ajuste radial adicional. El eje
// Z (profundidad/parallax) de cada anchor se conserva exactamente igual al
// valor anterior — no forma parte de este ajuste angular.
const HOTSPOT_RADIUS_XY = 10.59;

export const hotspots: HotspotConfig[] = [
  {
    id: "tmc-luxury",
    route: "/luxury",
    label: "TMC LUXURY",
    positioning: "PRIVATE PROPERTY MANAGEMENT",
    message: "Your property. Our responsibility.",
    // Cuadrante superior-izquierdo (135°), alrededor del TMC 3D.
    anchor: [-HOTSPOT_RADIUS_XY, 7 + HOTSPOT_RADIUS_XY, -4],
  },
  {
    id: "tmc-transport",
    route: "/transport",
    label: "TMC TRANSPORT",
    positioning: "PRIVATE MOBILITY",
    message: "Your destination. Our expertise.",
    // Cuadrante superior-derecho (45°).
    anchor: [HOTSPOT_RADIUS_XY, 7 + HOTSPOT_RADIUS_XY, -8],
  },
  {
    id: "tmc-cleaners",
    route: "/cleaners",
    label: "TMC CLEANERS",
    positioning: "PRIVATE HOME & PROPERTY CARE",
    message: "Immaculate spaces for a better life.",
    // Cuadrante inferior-izquierdo (225°).
    anchor: [-HOTSPOT_RADIUS_XY, 7 - HOTSPOT_RADIUS_XY, -2],
  },
  {
    id: "tmc-project-office",
    route: "/project-office",
    label: "TMC PROJECT OFFICE",
    positioning: "PROJECTS · INVESTMENTS · ADVISORY",
    message: "Turning opportunities into execution.",
    // Cuadrante inferior-derecho (315°).
    anchor: [HOTSPOT_RADIUS_XY, 7 - HOTSPOT_RADIUS_XY, 2],
  },
];
