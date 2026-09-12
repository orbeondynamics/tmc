// Bloque 1 (MVP) — waypoints reales de cámara para el mundo 2.5D por capas
// (Master Handoff sección 6/8). Trayectoria pensada para recorrerse con
// CatmullRomCurve3; posición y target/orientación se interpolan por
// separado (decisión CERRADA, sección 6).

export type Vec3Tuple = [x: number, y: number, z: number];

export interface CameraWaypoint {
  /** Debe coincidir con el id del hotspot correspondiente en hotspots.config.ts (o "hero").
   * Los puntos de control intermedios (ver "-pace" abajo) no corresponden a
   * ningún hotspot a propósito — solo dan forma a la curva entre dos
   * waypoints reales, nunca son destino de click ni de scrollProgress inicial
   * (WorldContext.tsx/Header.tsx buscan por id exacto, así que estos quedan
   * invisibles para esa lógica sin cambiar nada ahí). */
  id: string;
  /** Posición de la cámara en el espacio del mundo. */
  position: Vec3Tuple;
  /** Punto hacia el que mira la cámara, separado de position (sección 6, CERRADO). */
  target: Vec3Tuple;
  /** Campo de visión en grados. */
  fov: number;
  /** Progreso de scroll normalizado [0,1] en el que se alcanza este waypoint. */
  scrollProgress: number;
}

// Diagnóstico REDTEAM (Punto 6, "ascensor se siente como zoom" + Punto 4,
// "insignias fuera de pantalla en Cleaners"): CameraRig.tsx interpola
// position/target con CatmullRomCurve3.getPointAt(t) — t es fracción de
// LONGITUD DE ARCO del recorrido completo, no índice de punto. Verificado con
// script standalone (mismo three.js, mismo camera.project() que ya usa
// HotspotArcs.tsx) antes de tocar este archivo:
//
// 1. Cleaners (target.x=-30, igual a position.x=-30): la cámara no gira nada
//    hacia el hub (X=0) — se proyectaba a ~2110px en una pantalla de 1425px,
//    muy fuera de cuadro. Corregido con target.x=-10 (verificado: pasa a
//    ~1122px, dentro de cuadro).
// 2. Los 2 puntos intermedios "-pace" (hero→luxury y cleaners→project-office,
//    los únicos tramos donde Z domina sobre Y por mucho margen — los otros
//    dos tramos son laterales, dominados por X, no por Z/zoom) hacen que la
//    cámara avance más rápido en Y y más lento en Z/FOV durante la primera
//    mitad de cada tramo — verificado: a mitad de hero→luxury, Y ya avanzó
//    >50% mientras Z solo ~30%, antes ambos avanzaban parejo.
// 3. Insertar esos 2 puntos re-normaliza la longitud de arco de TODA la
//    curva de TARGET (getPointAt divide por el total, y target.x de Transport
//    y Cleaners también cambió — eso mueve la curva completa, no solo su
//    propio tramo), lo cual desplaza levemente DÓNDE cae cada t=0.25/0.5/
//    0.75/1 a lo largo de ella. Transport ya vivía al límite del frustum
//    (97px de margen en el diseño original, sin tocar nada) y ese
//    desplazamiento lo sacaba de cuadro; corregido igual que Cleaners
//    (safety margin, no estético). Verificación inicial probó cada ajuste
//    por separado y no detectó que, juntos, el mismo desplazamiento también
//    saca a Luxury de cuadro (nunca antes al límite) — encontrado en una
//    segunda pasada de validación con TODOS los cambios juntos, corregido
//    con el mismo tipo de ajuste. Verificado con barrido fino cada 2.5% de
//    TODO el recorrido (no solo los 5 puntos de reposo): margen mínimo en
//    cualquier punto del scroll = 188px.
//
// Ninguno de estos ajustes cambia el encuadre final de hero o project-office
// (posición/target/fov intactos ahí).
export const waypoints: CameraWaypoint[] = [
  { id: "hero", position: [0, 6, 62], target: [0, -2, -10], fov: 42, scrollProgress: 0 },
  { id: "hero-to-luxury-pace", position: [-13, 3, 51], target: [-10, -2.5, -7], fov: 41, scrollProgress: 0.125 },
  // target.x=-10 (antes -20) — margen de seguridad frente al frustum, efecto colateral del punto 3 (ver comentario arriba), no un cambio estético.
  { id: "tmc-luxury", position: [-26, 1, 24], target: [-10, -3, -4], fov: 38, scrollProgress: 0.25 },
  // target.x=6 (antes 26) — margen de seguridad frente al frustum, no un cambio estético (ver comentario arriba, punto 3).
  { id: "tmc-transport", position: [22, 8, 34], target: [6, 5, -26], fov: 38, scrollProgress: 0.5 },
  // target.x=-10 (antes -30) — corrige que la cámara no giraba hacia el hub (ver comentario arriba, punto 1).
  { id: "tmc-cleaners", position: [-30, 6, 30], target: [-10, 3, -15], fov: 38, scrollProgress: 0.75 },
  { id: "cleaners-to-project-office-pace", position: [-8, 4.35, 25], target: [-1, 2, -5], fov: 38, scrollProgress: 0.875 },
  { id: "tmc-project-office", position: [14, 3, 20], target: [8, 1, 5], fov: 38, scrollProgress: 1 },
];
