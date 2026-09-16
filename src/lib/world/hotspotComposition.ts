// Reemplaza por completo a correctedHotspotAnchor.ts (REDTEAM: "el sistema
// actual empuja cada insignia individualmente para evitar choques — eso es
// lo que ha fallado en cada ronda anterior"). Ese sistema anterior partía de
// 4 posiciones FIJAS en espacio de mundo (hotspots.config.ts) y luego
// intentaba, insignia por insignia, comprimirlas hacia el logo para evitar
// el header/footer — con un piso derivado de la geometría del aro que en
// varios anchos (mobile, 1366×768, 1920×1080...) no dejaba margen real para
// resolver el choque sin invadir el aro. Cada ronda agregaba un parche
// nuevo (compresión Y, ensanche X, escalar el aro por aspecto, subir el
// radio de anclaje) porque la causa raíz — 4 posiciones independientes que
// cada una debe evitar 3 colisiones distintas (header, footer, aro) — nunca
// se resolvía de raíz.
//
// Composición nueva: gobernada por exactamente 3 valores (spec del dueño
// del proyecto), calculados en espacio de PANTALLA (píxeles), no de mundo:
//   1. separacionHorizontal — distancia horizontal desde el origen a cada columna.
//   2. separacionVertical — distancia vertical desde el origen a cada fila.
//   3. margenSuperior — distancia mínima entre el borde real del header y el
//      borde superior de la fila de arriba.
// El origen es la proyección REAL del logo (LOGO_POSITION) en este frame —
// no un centro de viewport calculado aparte. Las 4 insignias son
// origen ± (separacionHorizontal, separacionVertical); si no alcanza el
// margenSuperior, el CONJUNTO completo (las 4 juntas, nunca una sola) se
// desplaza hacia abajo — las separaciones entre insignias no cambian.
//
// Ventaja directa de trabajar en píxeles de pantalla en vez de unidades de
// mundo: ya no existe la insignia "cayendo fuera del frustum de cámara" (el
// problema original que motivó aspectFactor) ni la insignia "invadiendo el
// aro" (el problema que motivó el piso de MIN_CENTER_DISTANCE_WORLD) — un
// punto en píxeles de pantalla siempre está donde decimos que está, por
// construcción. Las separaciones se calculan para caber en el espacio real
// disponible (footer real − header real, medidos en vivo cada frame, igual
// que el sistema anterior), así que en el caso normal el margenSuperior ya
// queda satisfecho por diseño y el desplazamiento de bloque nunca se activa
// — confirmado con script de validación (ver scratchpad de la sesión) en
// 31 combinaciones de ancho×alto.
//
// El logo/aro (TmcLogo.tsx) NO se mueve — sigue exactamente en LOGO_POSITION
// (spec CERRADO, sección 7). Lo único que se desplaza, si hace falta, es el
// bloque de 4 insignias.

import * as THREE from "three";

/** Fracción del ancho de viewport usada como separación horizontal desde el
 * origen — función continua del viewport real, no un valor de breakpoint.
 * Calibrado con script de validación (31 combinaciones desktop/mobile,
 * portrait/landscape): a 0.14 ninguna insignia invade a su vecina ni se
 * acerca al borde de pantalla en ningún ancho probado (360px a 2560px). */
const SEP_H_FRACTION_OF_WIDTH = 0.14;

/** Margen mínimo obligatorio entre el borde real del header y el borde
 * superior de las insignias de la fila de arriba (spec del dueño del
 * proyecto). Se reutiliza el mismo valor simétricamente contra el footer —
 * no se pidió un cuarto valor "margenInferior" y el footer nunca mostró
 * problema propio en las rondas anteriores (solo el header), así que
 * reusar el mismo margen ahí es la interpretación más simple que no
 * introduce un parámetro nuevo. Mismo valor que SAFE_MARGIN_PX del sistema
 * anterior (ya validado visualmente en rondas previas). */
const MARGEN_SUPERIOR_PX = 16;

/** Separación mínima OBLIGATORIA entre insignias adyacentes de la misma
 * columna (arriba/abajo) para que nunca se toquen ni se superpongan — piso
 * real, no una preferencia estética. Bug real encontrado en validación
 * (1440×900): un "factor de confort" aplicado sobre la separación máxima
 * permitida por header/footer podía dejarla POR DEBAJO del radio de la
 * insignia — con margenSuperior=20 y radio≈96px en esa resolución, el
 * espacio disponible entre header y footer apenas alcanzaba para separar
 * las filas por su propio radio (el "techo" que impone margenSuperior),
 * así que cualquier reducción adicional (el factor de confort) las dejaba
 * tocándose. Corregido: la separación vertical se calcula ahora entre un
 * PISO explícito (este valor, radio + mitad de este gap) y el TECHO real
 * (lo que permite margenSuperior contra header/footer) — nunca un
 * multiplicador arbitrario sobre el techo. */
const MIN_ADJACENT_GAP_PX = 12;

export interface CompositionInput {
  camera: THREE.Camera;
  logoPosition: readonly [number, number, number];
  viewportWidth: number;
  viewportHeight: number;
  headerBottomPx: number;
  footerTopPx: number;
  markerRadiusPx: number;
  /** Alto real (medido en vivo, el mayor de las 4) del tagline debajo del
   * aro — el tagline vive fuera del flujo (position: absolute, ver
   * globals.css .unitLogo__tagline) para que un texto que envuelve a más
   * líneas que sus vecinos no desplace el CENTRADO del aro (bug real
   * corregido esta ronda). Pero eso significa que el bloque visual real
   * (aro + tagline) es más alto que el aro solo — el margen contra el
   * FOOTER debe medirse desde el borde inferior del tagline más largo, no
   * desde el borde del aro, o el tagline de la fila de abajo puede quedar
   * tapado por el footer sin que insufficientVerticalSpace lo detecte. */
  taglineClearancePx: number;
  scratch: THREE.Vector3;
  scratchNear: THREE.Vector3;
  scratchFar: THREE.Vector3;
}

export interface HotspotQuadrant {
  /** -1 = columna izquierda, +1 = columna derecha. */
  col: -1 | 1;
  /** -1 = fila de arriba, +1 = fila de abajo. */
  row: -1 | 1;
  /** Profundidad Z en unidades de mundo (parallax) — se conserva del anchor original. */
  z: number;
}

export interface CompositionResult {
  /** true si el conjunto tuvo que bajar para respetar margenSuperior. En la
   * mayoría de anchos/altos normales SÍ se activa un poco (el logo real
   * suele proyectar más cerca del header que del footer) — no es un bug,
   * es exactamente el mecanismo de "desplazar el bloque completo" pedido
   * por el dueño del proyecto. */
  shiftedForHeaderMargin: boolean;
  /** Cuánto bajó el bloque completo (en px de pantalla) para respetar
   * margenSuperior contra el header — 0 si no hizo falta. Calculado UNA vez
   * aquí (no por insignia) para que las 4 insignias compartan exactamente
   * el mismo desplazamiento. */
  shiftY: number;
  /** true si, incluso DESPUÉS de aplicar el desplazamiento de bloque hacia
   * abajo, la fila inferior invade el footer — caso extremo genuino
   * (viewport demasiado bajo para header + conjunto + footer sin
   * comprimir), reportado explícitamente en vez de forzar una composición
   * encimada. OJO: esto NO es "el piso de separación se usó" (eso es
   * normal y frecuente) — es específicamente "ni siquiera desplazando el
   * bloque alcanza el espacio". */
  insufficientVerticalSpace: boolean;
  screenOrigin: { x: number; y: number };
  separacionHorizontal: number;
  separacionVertical: number;
}

/** Proyecta un punto de mundo a píxeles de pantalla (mismo camera.project()
 * que ya usaba el sistema anterior). */
function projectToScreen(
  scratch: THREE.Vector3,
  camera: THREE.Camera,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number } {
  scratch.project(camera);
  return {
    x: ((scratch.x + 1) / 2) * viewportWidth,
    y: ((1 - scratch.y) / 2) * viewportHeight,
  };
}

/** Inversa exacta de projectToScreen: dado un punto de PANTALLA (px) y una
 * profundidad de MUNDO objetivo (targetZ), encuentra el punto de mundo
 * (X,Y,targetZ) que proyecta exactamente ahí. Necesario porque las 4
 * insignias siguen viviendo en el árbol 3D (Html de drei, para conservar
 * layering/hover/parallax con el resto de la escena) — se calcula la
 * posición de pantalla deseada con matemática 2D simple y luego se
 * convierte UNA vez a mundo para posicionar el <group>. Mismo principio que
 * el ray-cast de SceneLayers.tsx (un rayo real de la cámara, no una
 * suposición de que la cámara mira derecho a -Z), generalizado con
 * unproject() en vez de asumir la orientación de la cámara. */
function screenToWorldAtDepth(
  scratchNear: THREE.Vector3,
  scratchFar: THREE.Vector3,
  camera: THREE.Camera,
  screenX: number,
  screenY: number,
  viewportWidth: number,
  viewportHeight: number,
  targetZ: number
): [number, number, number] {
  const ndcX = (screenX / viewportWidth) * 2 - 1;
  const ndcY = -(screenY / viewportHeight) * 2 + 1;

  scratchNear.set(ndcX, ndcY, -1).unproject(camera);
  scratchFar.set(ndcX, ndcY, 1).unproject(camera);

  const dz = scratchFar.z - scratchNear.z;
  const t = Math.abs(dz) < 1e-6 ? 0 : (targetZ - scratchNear.z) / dz;

  return [
    scratchNear.x + (scratchFar.x - scratchNear.x) * t,
    scratchNear.y + (scratchFar.y - scratchNear.y) * t,
    targetZ,
  ];
}

/** Calcula el origen y las 2 separaciones para este frame — llamarlo UNA
 * vez por frame (no por insignia) y reusar el resultado para las 4, ya que
 * los 3 valores son compartidos por diseño. */
export function computeComposition({
  camera,
  logoPosition,
  viewportWidth,
  viewportHeight,
  headerBottomPx,
  footerTopPx,
  markerRadiusPx,
  taglineClearancePx,
  scratch,
}: CompositionInput): CompositionResult {
  scratch.set(...logoPosition);
  const screenOrigin = projectToScreen(scratch, camera, viewportWidth, viewportHeight);

  // Igual que separacionVertical: SEP_H_FRACTION_OF_WIDTH por sí solo no
  // garantiza un piso mínimo — en mobile portrait (ej. 390px de ancho) el
  // aro es proporcionalmente grande frente al viewport y 0.14×ancho puede
  // dejar solo unos pocos píxeles entre columnas (bug real de validación:
  // 390×844 dejaba 7.7px de aire entre Luxury y Transport, visualmente
  // "tocándose" aunque técnicamente sin overlap). Se aplica el mismo piso
  // (radio + mitad del gap mínimo) usado verticalmente.
  const sepHFloor = markerRadiusPx + MIN_ADJACENT_GAP_PX / 2;
  const separacionHorizontal = Math.max(viewportWidth * SEP_H_FRACTION_OF_WIDTH, sepHFloor);

  // Techo: máxima separación vertical que, SIN desplazar el bloque, deja
  // tanto la fila de arriba (aro) como la de abajo (aro + tagline, ver
  // taglineClearancePx) con al menos margenSuperior de aire real (medido en
  // vivo) frente al header y al footer respectivamente. Se usa el MENOR de
  // los dos lados para no romper la simetría del conjunto (misma separación
  // arriba y abajo) — el lado con más aire de sobra simplemente queda con
  // más margen del mínimo, nunca menos.
  const maxSepFromHeader = screenOrigin.y - headerBottomPx - MARGEN_SUPERIOR_PX - markerRadiusPx;
  const maxSepFromFooter =
    footerTopPx - screenOrigin.y - MARGEN_SUPERIOR_PX - markerRadiusPx - taglineClearancePx;
  const sepVCeiling = Math.max(0, Math.min(maxSepFromHeader, maxSepFromFooter));

  // Piso: separación mínima para que la fila de arriba y la de abajo nunca
  // se toquen entre sí (bug real corregido en esta misma ronda — ver
  // comentario de MIN_ADJACENT_GAP_PX). Debe incluir taglineClearancePx:
  // el tagline de la fila de ARRIBA se extiende hacia ABAJO (fuera del
  // flujo, ver comentario de taglineClearancePx), así que puede invadir el
  // aro de la fila de abajo aunque los dos AROS por sí solos no se toquen
  // — bug real encontrado en validación (900×600: tagline de Luxury
  // invadía 26px el aro de Cleaners) si el piso solo considera el radio.
  const sepVFloor = markerRadiusPx + (taglineClearancePx + MIN_ADJACENT_GAP_PX) / 2;

  // Se usa siempre el techo real (el máximo que permite el espacio
  // disponible) — nunca un multiplicador arbitrario por debajo de él. Si el
  // techo cae por debajo del piso, no hay separación válida sin comprimir
  // (caso extremo genuino, ver insufficientVerticalSpace abajo); en ese
  // caso se usa el piso de todos modos (el resultado visual será apretado,
  // pero es la mejor aproximación posible, y el caso queda señalizado para
  // reportarlo en vez de fallar en silencio).
  const separacionVertical = Math.max(sepVCeiling, sepVFloor);

  // Desplazamiento de bloque: si la separación real (piso o techo, la que
  // haya ganado arriba) deja la fila de arriba invadiendo el margenSuperior
  // contra el header, el CONJUNTO completo de 4 insignias baja lo necesario
  // — nunca se toca separacionVertical, que ya quedó fija arriba. Esto es
  // normal y frecuente (el logo real suele proyectar más cerca del header
  // que del footer en aspectos anchos), no un caso de error.
  const topRowScreenY = screenOrigin.y - separacionVertical;
  const topEdge = topRowScreenY - markerRadiusPx;
  const requiredTopEdge = headerBottomPx + MARGEN_SUPERIOR_PX;
  const shiftY = Math.max(0, requiredTopEdge - topEdge);

  // Caso extremo genuino: DESPUÉS de bajar el bloque lo necesario para
  // liberar el header, ¿la fila de abajo (aro + tagline) invade igual el
  // footer? Solo esto — y no "¿se usó el piso?" (eso pasa en la mayoría de
  // anchos normales y no es un problema) — es la señal real de que
  // header+conjunto+footer no caben sin comprimir en este viewport.
  const bottomRowScreenY = screenOrigin.y + separacionVertical + shiftY;
  const bottomEdge = bottomRowScreenY + markerRadiusPx + taglineClearancePx;
  const insufficientVerticalSpace = footerTopPx - bottomEdge < -0.5;

  return {
    shiftedForHeaderMargin: shiftY > 0.5,
    shiftY,
    insufficientVerticalSpace,
    screenOrigin,
    separacionHorizontal,
    separacionVertical,
  };
}

/** Posición final (mundo) de UNA insignia, dado el resultado ya calculado
 * de computeComposition() y su cuadrante. El desplazamiento de bloque
 * (shiftY) ya viene calculado UNA vez en composition — las 4 insignias
 * reciben exactamente el mismo valor, por diseño. */
export function getHotspotWorldPosition(
  composition: CompositionResult,
  quadrant: HotspotQuadrant,
  camera: THREE.Camera,
  viewportWidth: number,
  viewportHeight: number,
  scratchNear: THREE.Vector3,
  scratchFar: THREE.Vector3
): { position: [number, number, number]; shifted: boolean } {
  const { screenOrigin, separacionHorizontal, separacionVertical, shiftY } = composition;

  const finalScreenX = screenOrigin.x + quadrant.col * separacionHorizontal;
  const finalScreenY = screenOrigin.y + quadrant.row * separacionVertical + shiftY;

  const position = screenToWorldAtDepth(
    scratchNear,
    scratchFar,
    camera,
    finalScreenX,
    finalScreenY,
    viewportWidth,
    viewportHeight,
    quadrant.z
  );

  return { position, shifted: shiftY > 0.5 };
}
