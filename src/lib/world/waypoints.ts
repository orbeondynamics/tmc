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
// Corrección "ascensor se siente como zoom, no como desplazamiento vertical"
// (REDTEAM, ronda posterior a la de arriba — diagnóstico con números reales,
// no otro parche de curva): medidos los deltas reales por eje entre cada par
// de waypoints consecutivos, Y nunca lideraba en ningún tramo — su rango
// total en todo el recorrido (1 a 8, 7 unidades) era ~13% del rango de X (52
// unidades) y ~17% del de Z (42 unidades). El tramo más extremo,
// hero-to-luxury-pace→tmc-luxury, tenía Z moviéndose 13.5× más que Y.
//
// Autorizado explícitamente por el dueño del proyecto (incluye cambiar el
// encuadre final ya aprobado de tmc-luxury y tmc-project-office). Se baja
// SOLO position.y en esos dos waypoints y sus puntos de "pace" — target.y
// queda intacto (no se toca en ninguno de los 4). Intento previo (revertido):
// trasladar position.y Y target.y la misma distancia, preservando el pitch
// exacto — matemáticamente más "puro" para la sensación de traslación, pero
// las insignias viven en posiciones FIJAS del mundo (hotspots.config.ts) y
// trasladar cámara+target juntos aumenta el ángulo hacia ellas, sacándolas
// mucho más de cuadro de lo que ya estaban (confirmado con instrumentación:
// insignia LUXURY pasaba de top=-206px, ya fuera de cuadro en el diseño
// ORIGINAL sin tocar — es esperado, el vuelo de cámara pasa POR ENCIMA del
// marcador hacia el close-up, igual que en Cleaners/Transport/ProjectOffice
// — a top=-733px, un salto mucho mayor). Solo mover position.y deja el
// resultado casi idéntico al original (-220px vs -206px) — la altura de
// cámara cambia (la traslación real que se necesita) sin empeorar
// perceptiblemente qué tan fuera de cuadro queda el marcador respecto a como
// ya estaba.
//
// Resultado (|ΔZ|/|ΔY| por tramo, antes → después): hero→pace1 3.7→1.4;
// pace1→luxury 13.5→4.5 (hero→luxury combinado: 7.6→2.7); cleaners→pace2
// 3.0→1.0; pace2→project-office 3.7→1.0. Los tramos luxury→transport y
// transport→cleaners no se tocan — ya son laterales (X domina, no Z), sin
// sensación de zoom que corregir ahí.
//
// hero y tmc-transport/tmc-cleaners quedan intactos (posición/target/fov).
export const waypoints: CameraWaypoint[] = [
  { id: "hero", position: [0, 6, 62], target: [0, -2, -10], fov: 42, scrollProgress: 0 },
  { id: "hero-to-luxury-pace", position: [-13, -2, 51], target: [-10, -2.5, -7], fov: 41, scrollProgress: 0.125 },
  // target.x=-10 (antes -20) — margen de seguridad frente al frustum, efecto colateral del punto 3 (ver comentario arriba), no un cambio estético.
  { id: "tmc-luxury", position: [-26, -8, 24], target: [-10, -3, -4], fov: 38, scrollProgress: 0.25 },
  // target.x=6 (antes 26) — margen de seguridad frente al frustum, no un cambio estético (ver comentario arriba, punto 3).
  { id: "tmc-transport", position: [22, 8, 34], target: [6, 5, -26], fov: 38, scrollProgress: 0.5 },
  // target.x=-10 (antes -30) — corrige que la cámara no giraba hacia el hub (ver comentario arriba, punto 1).
  { id: "tmc-cleaners", position: [-30, 6, 30], target: [-10, 3, -15], fov: 38, scrollProgress: 0.75 },
  { id: "cleaners-to-project-office-pace", position: [-8, 1, 25], target: [-1, 2, -5], fov: 38, scrollProgress: 0.875 },
  { id: "tmc-project-office", position: [14, -4, 20], target: [8, 1, 5], fov: 38, scrollProgress: 1 },
];
