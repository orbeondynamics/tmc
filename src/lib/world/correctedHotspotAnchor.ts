// Usado por Hotspots.tsx para proyectar los anchors de hotspots.config.ts a
// una posición segura en pantalla (antes también por HotspotArcs.tsx, ahora
// eliminado — los arcos decorativos se quitaron del todo por diagnóstico
// REDTEAM, se veían torcidos y mal ubicados sin solución viable de posición).
//
// Corrección de causa raíz (diagnóstico REDTEAM "insignias tapan el
// header/footer"): el anchor vive en una posición FIJA del mundo 3D
// alrededor del logo — lo único que cambia durante el scroll es la cámara
// (waypoints.ts, CatmullRom). Cuando esa posición fija se proyecta cerca del
// borde superior/inferior de la pantalla, la insignia se superpone al
// header o al footer sin importar qué tan bien esté calibrado su tamaño —
// confirmado con captura real: ocurre tanto en tránsito temprano (t≈0.02 en
// el primer tramo, Home→Luxury) como en reposo (waypoint Transport, t=0.5).
//
// Un ajuste anterior comprimía el offset Y del anchor solo por debajo de un
// breakpoint de ancho fijo (mobile, <720px), con un factor fijo calibrado a
// mano sobre una sola geometría medida. Esto generaliza ese mismo mecanismo
// — comprimir el offset Y del anchor hacia el Y del logo — de forma
// continua, para cualquier viewport y cualquier progreso de scroll: cada
// frame se proyecta el anchor real a píxeles de pantalla (mismo
// camera.project() que ya usa HotspotArcs.tsx) y, solo si esa proyección cae
// dentro de la franja real del header o el footer (medida en vivo vía
// getBoundingClientRect, no un ancho de viewport asumido), se calcula cuánta
// compresión hace falta para devolverla a zona segura.
//
// Bug real encontrado en validación mobile (375px, waypoint hero, insignias
// Luxury/Transport): incluso en reposo, sin ninguna colisión de
// header/footer de por medio, la insignia YA estaba dentro de la zona de
// exclusión del aro en ese aspect. Causa raíz real (no de este archivo):
// TmcLogo.tsx renderizaba el aro a tamaño completo en cualquier aspect,
// mientras que badgeDiameter.ts YA ASUMÍA que el diámetro aparente del aro
// se reduce con aspectFactor (apparentRingDiameterWorld =
// RING_OUTER_RADIUS*2*aspectFactor) — el wordmark sí aplicaba ese factor
// (uniformScale), el mesh del aro no. En aspects angostos el aro se veía
// (y ocupaba) más grande de lo que esta función asumía, dejando a las
// insignias superiores sin ningún Y disponible para alejarse del header sin
// invadir el aro. Corregido en TmcLogo.tsx (el mesh del aro ahora también
// escala por aspectFactor, igual que el wordmark) — MIN_CENTER_DISTANCE_WORLD
// abajo se recalcula con ese mismo aspectFactor para no quedar desincronizado
// del tamaño real ya renderizado.
//
// Como margen adicional (el aro más chico ya resuelve el caso mobile por sí
// solo, pero se mantiene por completitud/robustez ante aspects intermedios):
// si comprimir Y con el X ya corregido por aspectFactor no alcanza a
// despejar el header/footer, se permite ensanchar X — medido en vivo contra
// el frustum real de este frame (mismo camera.project(), ahora también en
// X, contra el ancho real del viewport, sin asumir un breakpoint) y nunca
// más allá del ancho de diseño original (ax, previo a aspectFactor) — antes
// de recurrir al fallback de opacidad.
//
// La compresión de Y sigue teniendo un piso derivado de la geometría real
// del aro (MIN_CENTER_DISTANCE_WORLD abajo) para no intercambiar un overlap
// por otro: comprimir Y sin límite acerca la insignia al logo hasta que sus
// discos se tocan — confirmado con captura real en el waypoint hero, donde
// una primera versión de este mecanismo (piso fijo de 0.3, heredado del
// ajuste mobile anterior) dejaba el aro visiblemente encimado con las
// insignias superiores.

import * as THREE from "three";
import { RING_OUTER_RADIUS } from "@/components/world/TmcLogo";

/** Margen de seguridad en píxeles entre el borde del header/footer (o del
 * borde de pantalla, en X) y el punto más cercano de la insignia — evita
 * dejarla pegada justo al límite. */
const SAFE_MARGIN_PX = 16;
/** Mismo ratio que BADGE_DIAMETER_RATIO en badgeDiameter.ts (prompt maestro
 * sección 6.2) — duplicado como literal en vez de importado para no acoplar
 * este archivo al de tamaño; si ese ratio cambia, actualizar también aquí. */
const BADGE_DIAMETER_RATIO = 0.74;
/** Margen extra en unidades de mundo entre el borde del aro y el borde de la
 * insignia, para que el piso de compresión no las deje exactamente
 * tangentes. */
const RING_CLEARANCE_MARGIN_WORLD = 0.5;
/** Cuando el piso anti-colisión-con-el-aro impide despejar del todo el
 * header/footer (residual confirmado con captura real: waypoint Transport,
 * insignia Project Office contra el footer, ~46-87px), se atenúa la
 * insignia en vez de dejarla encimada a opacidad completa — la insignia
 * sigue siendo clicable e identificable, solo menos prominente en ese tramo
 * puntual. A partir de este residual (px) la opacidad ya está en su piso. */
const OPACITY_FADE_RANGE_PX = 90;
const MIN_OPACITY = 0.45;

/** Distancia mínima (mundo) centro-del-logo↔centro-de-insignia para que el
 * disco de la insignia no invada el disco del aro — derivada del tamaño
 * REAL renderizado del aro en este aspect (TmcLogo.tsx ahora escala el mesh
 * del aro por aspectFactor; esta función debe usar el mismo factor para no
 * desincronizarse de lo que realmente se ve en pantalla). */
function getMinCenterDistanceWorld(aspectFactor: number): number {
  const ringRadius = RING_OUTER_RADIUS * aspectFactor;
  return ringRadius + ringRadius * BADGE_DIAMETER_RATIO + RING_CLEARANCE_MARGIN_WORLD;
}

function projectedScreenY(
  scratch: THREE.Vector3,
  camera: THREE.Camera,
  viewportHeight: number
): number {
  scratch.project(camera);
  return ((1 - scratch.y) / 2) * viewportHeight;
}

function projectedScreenX(
  scratch: THREE.Vector3,
  camera: THREE.Camera,
  viewportWidth: number
): number {
  scratch.project(camera);
  return ((1 + scratch.x) / 2) * viewportWidth;
}

export interface ScreenSafeAnchorInput {
  anchor: [number, number, number];
  aspectFactor: number;
  logoY: number;
  camera: THREE.Camera;
  /** Ancho real del viewport en píxeles (size.width de useThree) — usado
   * solo para el margen X de emergencia descrito arriba (mismo criterio que
   * viewportHeight ya usaba para header/footer). */
  viewportWidth: number;
  viewportHeight: number;
  /** Borde inferior real del <header> en píxeles de pantalla (getBoundingClientRect().bottom). */
  headerBottomPx: number;
  /** Borde superior real del <footer> en píxeles de pantalla (getBoundingClientRect().top). */
  footerTopPx: number;
  /** Radio actual de la insignia en píxeles (diámetro/2, ver badgeDiameter.ts)
   * — imprescindible: camera.project() da la posición del CENTRO del anchor,
   * pero lo que no debe invadir el header/footer es el borde visible de la
   * insignia completa, no su punto central. Sin este radio, una insignia con
   * centro apenas "seguro" puede tener la mitad de su disco real metida en
   * el header (bug encontrado en validación: waypoint Transport, centro a
   * 95.6px con header en 80px — técnicamente fuera del margen de 16px, pero
   * el disco de ~150px de diámetro seguía tapando el nav). */
  markerRadiusPx: number;
  /** Vector3 reutilizable del llamador (useRef) — evita asignar uno nuevo cada frame. */
  scratch: THREE.Vector3;
}

export interface ScreenSafeAnchorResult {
  position: [number, number, number];
  /** 1 = opacidad normal. Baja del piso anti-colisión-con-el-aro deja
   * residual (ver OPACITY_FADE_RANGE_PX) — el llamador decide qué hacer con
   * esto (Hotspots.tsx atenúa la insignia; HotspotArcs.tsx puede ignorarlo). */
  opacity: number;
}

interface CompressionAttempt {
  position: [number, number, number];
  opacity: number;
  residualPx: number;
}

/** Intenta despejar el header/footer comprimiendo Y hacia logoY, con el
 * piso anti-colisión-con-el-aro derivado de xForRender (distancia real al
 * centro del logo en X para ESTE intento). */
function attemptVerticalCompression(
  xForRender: number,
  ay: number,
  az: number,
  logoY: number,
  minCenterDistanceWorld: number,
  camera: THREE.Camera,
  viewportHeight: number,
  safeTop: number,
  safeBottom: number,
  scratch: THREE.Vector3
): CompressionAttempt {
  scratch.set(xForRender, ay, az);
  const yUncompressed = projectedScreenY(scratch, camera, viewportHeight);

  if (yUncompressed >= safeTop && yUncompressed <= safeBottom) {
    return { position: [xForRender, ay, az], opacity: 1, residualPx: 0 };
  }

  scratch.set(xForRender, logoY, az);
  const yAtLogoCenter = projectedScreenY(scratch, camera, viewportHeight);

  // Piso de compresión: la insignia nunca debe acercarse tanto al logo que
  // su disco invada el disco del aro. Derivado de la geometría real (no un
  // valor fijo calibrado a mano sobre un solo caso): con X fija en
  // xForRender, ¿cuánto offset Y hace falta para que distancia(centro-logo,
  // centro-insignia) = √(X² + Y²) no caiga por debajo de
  // minCenterDistanceWorld? Si X sola ya alcanza, no hace falta Y (piso en
  // 0); si ni siquiera Y=offset completo (k=1) alcanza, el piso se topa en
  // 1 — lo más que se puede comprimir sin invadir el aro con esta X.
  const yOffset = ay - logoY;
  const minCompressionSq =
    (minCenterDistanceWorld ** 2 - xForRender ** 2) / (yOffset * yOffset || 1);
  const minCompression = THREE.MathUtils.clamp(Math.sqrt(Math.max(0, minCompressionSq)), 0, 1);

  const pushingDown = yUncompressed < safeTop;
  const target = pushingDown ? safeTop : safeBottom;
  const denom = yUncompressed - yAtLogoCenter;
  const rawK = Math.abs(denom) < 1e-3 ? minCompression : (target - yAtLogoCenter) / denom;
  const k = THREE.MathUtils.clamp(rawK, minCompression, 1);

  const correctedY = logoY + yOffset * k;

  // Residual: el piso anti-colisión-con-el-aro puede impedir llegar
  // exactamente a target (ver comentario de OPACITY_FADE_RANGE_PX arriba).
  // Se proyecta la posición FINAL (ya comprimida) para medir cuánto queda
  // todavía dentro de la franja insegura, en vez de asumirlo a partir de k.
  scratch.set(xForRender, correctedY, az);
  const yFinal = projectedScreenY(scratch, camera, viewportHeight);
  const residualPx = pushingDown ? Math.max(0, safeTop - yFinal) : Math.max(0, yFinal - safeBottom);
  const opacity = THREE.MathUtils.clamp(1 - residualPx / OPACITY_FADE_RANGE_PX, MIN_OPACITY, 1);

  return { position: [xForRender, correctedY, az], opacity, residualPx };
}

export function getCorrectedHotspotAnchor({
  anchor,
  aspectFactor,
  logoY,
  camera,
  viewportWidth,
  viewportHeight,
  headerBottomPx,
  footerTopPx,
  markerRadiusPx,
  scratch,
}: ScreenSafeAnchorInput): ScreenSafeAnchorResult {
  const [ax, ay, az] = anchor;
  const correctedX = ax * aspectFactor;
  const minCenterDistanceWorld = getMinCenterDistanceWorld(aspectFactor);

  const safeTop = headerBottomPx + SAFE_MARGIN_PX + markerRadiusPx;
  const safeBottom = footerTopPx - SAFE_MARGIN_PX - markerRadiusPx;

  const base = attemptVerticalCompression(
    correctedX,
    ay,
    az,
    logoY,
    minCenterDistanceWorld,
    camera,
    viewportHeight,
    safeTop,
    safeBottom,
    scratch
  );

  if (base.residualPx === 0) {
    return { position: base.position, opacity: base.opacity };
  }

  // Margen X de emergencia (ver comentario de archivo arriba): solo se usa
  // cuando comprimir Y con el X ya corregido por aspectFactor no alcanzó a
  // despejar el header/footer. Se mide, en este mismo frame, hasta qué X de
  // pantalla real cabe la insignia sin tocar el borde del viewport (mismo
  // camera.project() que el resto de este archivo, sin asumir un ancho de
  // breakpoint), y se ensancha el anchor hacia allá — nunca más allá del
  // ancho de diseño original (ax, previo a aspectFactor).
  scratch.set(0, ay, az);
  const screenXAtCenter = projectedScreenX(scratch, camera, viewportWidth);
  scratch.set(ax, ay, az);
  const screenXAtFullAnchor = projectedScreenX(scratch, camera, viewportWidth);

  const targetScreenX =
    ax >= 0 ? viewportWidth - SAFE_MARGIN_PX - markerRadiusPx : SAFE_MARGIN_PX + markerRadiusPx;
  const screenXSlope = screenXAtFullAnchor - screenXAtCenter;
  const maxXWorld =
    Math.abs(screenXSlope) < 1e-3
      ? ax
      : (ax * (targetScreenX - screenXAtCenter)) / screenXSlope;

  const sign = Math.sign(ax) || 1;
  const widenedMagnitude = THREE.MathUtils.clamp(
    Math.abs(maxXWorld),
    Math.abs(correctedX),
    Math.abs(ax)
  );
  const xWidened = sign * widenedMagnitude;

  if (xWidened === correctedX) {
    return { position: base.position, opacity: base.opacity };
  }

  const widened = attemptVerticalCompression(
    xWidened,
    ay,
    az,
    logoY,
    minCenterDistanceWorld,
    camera,
    viewportHeight,
    safeTop,
    safeBottom,
    scratch
  );

  const best = widened.residualPx < base.residualPx ? widened : base;
  return { position: best.position, opacity: best.opacity };
}
