// Corrección compartida entre Hotspots.tsx y HotspotArcs.tsx — ambos
// proyectan los mismos anchors de hotspots.config.ts y deben quedar
// perfectamente sincronizados (los arcos apuntan a donde están los badges).
// Extraído a un helper único para no duplicar la fórmula en dos archivos.
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
// El eje X ya se corrige aparte vía aspectFactor (útiles distintos: aspect
// ratio vs. proximidad real a header/footer) y no se toca aquí — el defecto
// diagnosticado es vertical. La compresión de Y tiene un piso derivado de la
// geometría real del aro (MIN_CENTER_DISTANCE_WORLD abajo) para no
// intercambiar un overlap por otro: comprimir Y sin límite acerca la
// insignia al logo hasta que sus discos se tocan — confirmado con captura
// real en el waypoint hero, donde una primera versión de este mecanismo
// (piso fijo de 0.3, heredado del ajuste mobile anterior) dejaba el aro
// visiblemente encimado con las insignias superiores.

import * as THREE from "three";
import { RING_OUTER_RADIUS } from "@/components/world/TmcLogo";

/** Margen de seguridad en píxeles entre el borde del header/footer y el
 * punto más cercano de la insignia — evita dejarla pegada justo al límite. */
const SAFE_MARGIN_PX = 16;
/** Mismo ratio que BADGE_DIAMETER_RATIO en badgeDiameter.ts (prompt maestro
 * sección 6.2) — duplicado como literal en vez de importado para no acoplar
 * este archivo al de tamaño; si ese ratio cambia, actualizar también aquí. */
const BADGE_DIAMETER_RATIO = 0.74;
/** Margen extra en unidades de mundo entre el borde del aro y el borde de la
 * insignia, para que el piso de compresión no las deje exactamente
 * tangentes. */
const RING_CLEARANCE_MARGIN_WORLD = 0.5;
/** Distancia mínima (mundo) centro-del-logo↔centro-de-insignia para que el
 * disco de la insignia no invada el disco del aro. */
const MIN_CENTER_DISTANCE_WORLD =
  RING_OUTER_RADIUS + RING_OUTER_RADIUS * BADGE_DIAMETER_RATIO + RING_CLEARANCE_MARGIN_WORLD;
/** Cuando el piso anti-colisión-con-el-aro impide despejar del todo el
 * header/footer (residual confirmado con captura real: waypoint Transport,
 * insignia Project Office contra el footer, ~46-87px), se atenúa la
 * insignia en vez de dejarla encimada a opacidad completa — la insignia
 * sigue siendo clicable e identificable, solo menos prominente en ese tramo
 * puntual. A partir de este residual (px) la opacidad ya está en su piso. */
const OPACITY_FADE_RANGE_PX = 90;
const MIN_OPACITY = 0.45;

function projectedScreenY(
  scratch: THREE.Vector3,
  camera: THREE.Camera,
  viewportHeight: number
): number {
  scratch.project(camera);
  return ((1 - scratch.y) / 2) * viewportHeight;
}

export interface ScreenSafeAnchorInput {
  anchor: [number, number, number];
  aspectFactor: number;
  logoY: number;
  camera: THREE.Camera;
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

export function getCorrectedHotspotAnchor({
  anchor,
  aspectFactor,
  logoY,
  camera,
  viewportHeight,
  headerBottomPx,
  footerTopPx,
  markerRadiusPx,
  scratch,
}: ScreenSafeAnchorInput): ScreenSafeAnchorResult {
  const [ax, ay, az] = anchor;
  const correctedX = ax * aspectFactor;

  const safeTop = headerBottomPx + SAFE_MARGIN_PX + markerRadiusPx;
  const safeBottom = footerTopPx - SAFE_MARGIN_PX - markerRadiusPx;

  scratch.set(correctedX, ay, az);
  const yUncompressed = projectedScreenY(scratch, camera, viewportHeight);

  if (yUncompressed >= safeTop && yUncompressed <= safeBottom) {
    return { position: [correctedX, ay, az], opacity: 1 };
  }

  scratch.set(correctedX, logoY, az);
  const yAtLogoCenter = projectedScreenY(scratch, camera, viewportHeight);

  // Piso de compresión: la insignia nunca debe acercarse tanto al logo que
  // su disco invada el disco del aro. Derivado de la geometría real (no un
  // valor fijo calibrado a mano sobre un solo caso): con X sin comprimir,
  // ¿cuánto offset Y hace falta para que distancia(centro-logo,
  // centro-insignia) = √(X² + Y²) no caiga por debajo de
  // MIN_CENTER_DISTANCE_WORLD? Si X solo ya alcanza, no hace falta Y (piso
  // en 0); si ni siquiera Y=offset completo (k=1) alcanza (aspects muy
  // angostos, X comprimido por aspectFactor), el piso se topa en 1 — lo
  // más que se puede alejar sin tocar el eje X, que esta función no toca.
  const yOffset = ay - logoY;
  const minCompressionSq =
    (MIN_CENTER_DISTANCE_WORLD ** 2 - correctedX ** 2) / (yOffset * yOffset || 1);
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
  scratch.set(correctedX, correctedY, az);
  const yFinal = projectedScreenY(scratch, camera, viewportHeight);
  const residualPx = pushingDown ? Math.max(0, safeTop - yFinal) : Math.max(0, yFinal - safeBottom);
  const opacity = THREE.MathUtils.clamp(1 - residualPx / OPACITY_FADE_RANGE_PX, MIN_OPACITY, 1);

  return { position: [correctedX, correctedY, az], opacity };
}
