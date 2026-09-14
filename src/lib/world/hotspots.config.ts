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
// offset X/Y = radio × cos/sin(45°), originalmente 10.59). Antes los 4
// anchors estaban angularmente agrupados en pares por lado (Luxury/Cleaners
// casi en el mismo ángulo, solo 7 unidades de separación vertical) — con
// insignias al 74% del diámetro del logo eso producía superposición entre
// pares del mismo lado. La distribución 90° verdadera separa cualquier par
// adyacente por 2×radio (>> que el diámetro de insignia), sin superposición.
//
// Radio subido de 10.59 a 14 (REDTEAM "logos muy arriba, cerca del header"):
// con 10.59, las insignias superiores (Luxury/Transport) quedaban tan cerca
// del centro que ni siquiera el mecanismo anti-colisión de
// correctedHotspotAnchor.ts (comprimir Y hacia el logo) tenía margen real
// para alejarlas del header sin invadir el aro — confirmado con simulación
// exacta (misma proyección de cámara que usa esa función) en 12 combinaciones
// de ancho/alto reales (1024×768 a 2560×1440 en desktop, 375×812 a 1100×900
// en mobile/tablet): con radio 10.59, 1366×768 y 1920×1080 mostraban overlap
// real (residual de 48-62px, opacidad forzada al piso 0.45); un ajuste solo
// en Y no alcanzaba sin meter la insignia dentro del aro (el piso de
// distancia mínima centro-logo↔centro-insignia lo impide). Subir el radio
// completo (X e Y, preservando el ángulo de 45° y la simetría de los 4
// cuadrantes) aleja la insignia del aro Y del header/footer a la vez — con
// radio 14, las 12 combinaciones probadas dan opacidad 1.0 y residual 0px
// sin necesitar compresión ni atenuación. El eje Z (profundidad/parallax) de
// cada anchor se conserva exactamente igual al valor anterior.
const HOTSPOT_RADIUS_XY = 14;

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
