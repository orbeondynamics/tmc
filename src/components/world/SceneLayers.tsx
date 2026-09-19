"use client";

// TMC World — Master Miami en 2.5D por capas (Master Handoff sección 8,
// CERRADO). Los 6 assets comparten exactamente el mismo encuadre/relación de
// aspecto (1672x941), por lo que se apilan como planos alineados a distintas
// profundidades Z — la técnica clásica de parallax cutout.
//
// Corrección (diagnóstico de causa raíz, defecto "persona/piscina fuera de
// cuadro"): el cálculo anterior asumía una cámara mirando exactamente al eje
// -Z, sin inclinación, y usaba una distancia de referencia fija (la del
// waypoint hero). La cámara real tiene pitch en todos los waypoints (target.y
// < position.y) y su posición/distancia real varía mucho por ruta — con la
// fórmula antigua, la ventana visible sobre cada plano quedaba centrada en el
// centro geométrico fijo del plano (Y=0) en vez de en el punto donde el eje
// óptico real de la cámara intersecta ese plano, cortando las capas más
// bajas de la composición (terraza/piscina/persona).
//
// Solución: cada frame, se proyecta el rayo de mira real de la cámara
// (camera.position + t·forward) hasta encontrar su intersección con el plano
// Z de esta capa, y el plano se recentra ahí — no en (0,0,z) fijo. La
// distancia usada para dimensionar el "cover" es la distancia real a lo
// largo de ese rayo (magnitud de t), no una resta de Z fija. Esto es
// correcto para cualquier waypoint y para cualquier punto intermedio de una
// transición de scroll, sin necesitar un caso especial por ruta. Se actualiza
// vía useFrame (imperativo, sin re-render de React) siguiendo el mismo
// patrón ya establecido en CameraRig.tsx/HotspotArcs.tsx para todo lo que
// cambia con el scroll.
//
// Bug real confirmado con captura en anchos de escritorio angostos (700px:
// persona totalmente fuera de cuadro; 900px: igual; 1100px: solo un borde de
// ~15px visible; recién a ~1400px+ se ve completa): "cover" siempre recorta
// SIMÉTRICAMENTE alrededor del centro de la imagen (el recentrado de arriba
// solo corrige Y por inclinación de cámara, X siempre queda centrado en el
// eje óptico). La persona vive en un punto FIJO y lejano del centro
// horizontal de la composición (medido por análisis de canal alfa real del
// asset: x = 7.3%–22.7% del ancho de person.webp, muy a la izquierda del
// centro 50%). En aspects angostos, la ventana visible de "cover" es
// necesariamente una franja estrecha centrada en ese 50% — matemáticamente,
// ningún valor de COVERAGE_MARGIN mueve esa franja hacia la izquierda (de
// hecho subirlo la angosta más, no menos: más margen = plano más grande =
// fracción de imagen visible MENOR). El recorte de la persona en anchos
// angostos es inherente a un "cover" puramente centrado, no un defecto de
// margen — hace falta descentrarlo.
//
// Fase 2 (Punto 5, cobertura y regla de reparto) — reemplaza a keepInViewU
// por capa (que solo protegía a la persona, a la IZQUIERDA, y al desplazar la
// ventana hacia ese lado empujaba palmera y lámpara, a la DERECHA, fuera de
// cuadro en cualquier aspect). Ahora: (1) COVERAGE_MARGIN = 1.0 (el "cover"
// exacto: a 16:9 se ve el 100% de la imagen); (2) UN solo centro de ventana
// horizontal (uCenter) por frame, común a las 6 capas, que protege AMBOS
// extremos — persona (izquierda, u 0.073–0.2285, medido en el alfa real) y
// lámpara+palmera (derecha, u 0.933–1.0, medido en el alfa real):
//   • si la ventana visible cabe ambos extremos completos, se usa el
//     desplazamiento MÍNIMO desde el centro (0.5) que los incluye;
//   • si NO caben (aspects angostos), el recorte se reparte de forma
//     proporcional y simétrica: cada extremo pierde la MISMA fracción de su
//     propio ancho — ninguno se sacrifica por completo mientras el otro queda
//     intacto. Es continuo con el caso anterior.
//   • mobile portrait (aspect < 1.24, decisión del equipo): la ventana ya no
//     puede tocar ambos sujetos, y se prioriza a la PERSONA sobre
//     palmera/lámpara: la ventana se centra en la persona (sin salirse de la
//     imagen). Palmera/lámpara se pierden ahí.
// Al ser el mismo centro para todas las capas quedan registradas entre sí
// (antes terraza/persona iban ~49px desplazadas del resto, dejando ver el
// fondo #060B18 por los cortes de las capas inferiores).
//
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { tmcAssets } from "@/config/tmcAssets";

const IMAGE_ASPECT = 1672 / 941;
// (Fase 2: ahora 1.0 — ver cabecera. Historia del valor anterior:)
// Margen sobre el frustum "sin margen" (el que mapea el frustum real 1:1 al
// alto completo de la imagen). Medido en navegador (Fase de diagnóstico):
// con el valor anterior (2.0) el frustum real solo veía el 50% central de
// cada imagen (1/COVERAGE_MARGIN) — cortando sistemáticamente el tercio
// superior E inferior de la composición (cielo arriba, persona/piscina
// abajo), sin relación con el pitch de cámara. Como el plano ahora se
// recentra cada frame en el punto real donde mira la cámara (ver useFrame
// abajo), ya no depende de este margen para "absorber" el paneo lateral de
// los demás waypoints — ese margen solo necesita cubrir la variación de
// pitch/distancia entre las 6 capas a distintas profundidades Z y un
// pequeño colchón de seguridad.
const COVERAGE_MARGIN = 1.0;

interface LayerDef {
  src: string;
  z: number;
  /** Plano base de relleno (Fase 2, Punto 6): master-background.webp opaco. */
  fill?: boolean;
}

// Fase 2 (Punto 6, "0% de agujeros #060B18"): las 6 capas son recortes que
// dejan huecos transparentes entre sí (5.75% del composite de las capas ya
// era el fondo #060B18 con registro perfecto, medido contra
// master-background.webp). Solución: un plano base con el master-background.webp
// original (la imagen de la que salieron las capas) detrás de todo, con
// EXACTAMENTE la misma transformación que las capas (mismo centro de ventana,
// misma escala: queda registrado), así cualquier hueco muestra la foto real.
//
// Cobertura del frustum (causa raíz, medida con el modelo exacto): los planos
// son z-perpendiculares y se dimensionan sobre el EJE ÓPTICO, pero cuando la
// cámara gira (yaw hasta ~30° hacia Luxury/Cleaners/Project Office) el frustum
// corta el plano como un trapecio cuya parte lejana se sale de la imagen hasta
// 0.56 de su ancho (0.88 en 21:9) y 0.59 de su alto. Ninguna escala razonable
// lo cubre sin cambiar la composición, y la imagen es finita: hay que
// EXTENDER el contenido más allá de sus bordes. FillExtension es un plano
// opaco, registrado con la misma transformación, cuya textura (baja
// resolución) es el master con sus bordes prolongados (clamp) y difuminados —
// sin espejo, sin repetición: no puede duplicar elementos, y no deja ver
// #060B18 en ningún punto del frustum dentro de EXT_PAD_U/EXT_PAD_V.
const EXT_PAD_U = 1.0; // extensión por lado, en anchos de imagen (máx. necesario medido: 0.88)
const EXT_PAD_V = 0.7; // por lado, en altos de imagen (máx. necesario medido: 0.62)
const EXT_LOWRES_DIV = 6; // el master se reduce 1/6 para la extensión (el borde nítido lo pone el plano master)
const EXT_BLUR_RADIUS = 3; // px en baja resolución: suaviza costuras y esquinas
const EXT_AMBIENT_STRIP = 0.18; // franja exterior (fracción de la dimensión) que define el color ambiente
const EXT_FEATHER = 0.14; // distancia (fracción de la dimensión) en la que el borde real se funde al ambiente
const EXT_PROFILE_BLUR = 0.05; // suavizado del perfil ambiente, fracción de la dimensión

function boxBlurChannelPass(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number, r: number, horizontal: boolean) {
  const len = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const step = horizontal ? 4 : w * 4;
  const lineStep = horizontal ? w * 4 : 4;
  const norm = 1 / (2 * r + 1);
  for (let c = 0; c < 3; c++) {
    for (let l = 0; l < lines; l++) {
      const base = l * lineStep + c;
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += src[base + Math.min(len - 1, Math.max(0, i)) * step];
      for (let i = 0; i < len; i++) {
        dst[base + i * step] = acc * norm;
        acc += src[base + Math.min(len - 1, i + r + 1) * step] - src[base + Math.max(0, i - r) * step];
      }
    }
  }
}

/** Suaviza un perfil RGB (n x 3) con una caja de radio r, 3 pasadas. */
function smoothProfile(p: Float32Array, n: number, r: number) {
  const tmp = new Float32Array(p.length);
  for (let pass = 0; pass < 3; pass++) {
    for (let c = 0; c < 3; c++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += p[Math.min(n - 1, Math.max(0, i)) * 3 + c];
      for (let i = 0; i < n; i++) {
        tmp[i * 3 + c] = acc / (2 * r + 1);
        acc += p[Math.min(n - 1, i + r + 1) * 3 + c] - p[Math.max(0, i - r) * 3 + c];
      }
    }
    p.set(tmp);
  }
}

const ease = (x: number) => x * x * (3 - 2 * x);

/**
 * Textura de extensión: el master en baja resolución en el centro; fuera de
 * sus bordes, el píxel del borde REAL (continuidad exacta con el plano nítido)
 * se funde suavemente a un color ambiente por fila/columna — el promedio de la
 * franja exterior de la imagen, suavizado. Sin espejo ni repetición de
 * contenido: no puede duplicar elementos. (Prolongar sin más la columna del
 * borde daba bandas marrones por palmeras/terraza oscuras en el borde.)
 */
function buildExtensionTexture(image: CanvasImageSource & { width: number; height: number }): { texture: THREE.CanvasTexture; geometry: THREE.PlaneGeometry } {
  const w0 = Math.round(image.width / EXT_LOWRES_DIV);
  const h0 = Math.round(image.height / EXT_LOWRES_DIV);
  const pu = Math.round(w0 * EXT_PAD_U);
  const pv = Math.round(h0 * EXT_PAD_V);
  const W = w0 + 2 * pu;
  const H = h0 + 2 * pv;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, pu, pv, w0, h0);
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const at = (x: number, y: number) => (y * W + x) * 4;

  // 1) izquierda / derecha (filas de la imagen)
  const stripW = Math.max(1, Math.round(w0 * EXT_AMBIENT_STRIP));
  const featherU = Math.max(1, w0 * EXT_FEATHER);
  const left = new Float32Array(h0 * 3);
  const right = new Float32Array(h0 * 3);
  for (let y = 0; y < h0; y++) {
    for (let c = 0; c < 3; c++) {
      let sl = 0;
      let sr = 0;
      for (let k = 0; k < stripW; k++) {
        sl += d[at(pu + k, pv + y) + c];
        sr += d[at(pu + w0 - 1 - k, pv + y) + c];
      }
      left[y * 3 + c] = sl / stripW;
      right[y * 3 + c] = sr / stripW;
    }
  }
  const pr = Math.max(1, Math.round(h0 * EXT_PROFILE_BLUR));
  smoothProfile(left, h0, pr);
  smoothProfile(right, h0, pr);
  for (let y = 0; y < h0; y++) {
    for (let x = 0; x < pu; x++) {
      const tL = ease(Math.min(1, (pu - x) / featherU));
      const tR = ease(Math.min(1, (x + 1) / featherU));
      for (let c = 0; c < 3; c++) {
        const eL = d[at(pu, pv + y) + c];
        const eR = d[at(pu + w0 - 1, pv + y) + c];
        d[at(x, pv + y) + c] = eL + (left[y * 3 + c] - eL) * tL;
        d[at(pu + w0 + x, pv + y) + c] = eR + (right[y * 3 + c] - eR) * tR;
      }
    }
  }

  // 2) arriba / abajo sobre TODO el ancho (así las esquinas también se cubren)
  const stripH = Math.max(1, Math.round(h0 * EXT_AMBIENT_STRIP));
  const featherV = Math.max(1, h0 * EXT_FEATHER);
  const top = new Float32Array(W * 3);
  const bottom = new Float32Array(W * 3);
  for (let x = 0; x < W; x++) {
    for (let c = 0; c < 3; c++) {
      let st = 0;
      let sb = 0;
      for (let k = 0; k < stripH; k++) {
        st += d[at(x, pv + k) + c];
        sb += d[at(x, pv + h0 - 1 - k) + c];
      }
      top[x * 3 + c] = st / stripH;
      bottom[x * 3 + c] = sb / stripH;
    }
  }
  const pc = Math.max(1, Math.round(w0 * EXT_PROFILE_BLUR));
  smoothProfile(top, W, pc);
  smoothProfile(bottom, W, pc);
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < pv; y++) {
      const tT = ease(Math.min(1, (pv - y) / featherV));
      const tB = ease(Math.min(1, (y + 1) / featherV));
      for (let c = 0; c < 3; c++) {
        const eT = d[at(x, pv) + c];
        const eB = d[at(x, pv + h0 - 1) + c];
        d[at(x, y) + c] = eT + (top[x * 3 + c] - eT) * tT;
        d[at(x, pv + h0 + y) + c] = eB + (bottom[x * 3 + c] - eB) * tB;
      }
    }
  }

  // 3) suavizado ligero de costuras/esquinas y alfa opaco
  const tmp = new Uint8ClampedArray(d.length);
  for (let i = 0; i < 2; i++) {
    boxBlurChannelPass(d, tmp, W, H, EXT_BLUR_RADIUS, true);
    boxBlurChannelPass(tmp, d, W, H, EXT_BLUR_RADIUS, false);
  }
  for (let i = 3; i < d.length; i += 4) d[i] = 255;
  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const geometry = new THREE.PlaneGeometry(IMAGE_ASPECT * (W / w0), H / h0);
  return { texture, geometry };
}

// Sujetos protegidos, rango horizontal normalizado [0,1] de la imagen
// (0=borde izquierdo), medidos con el canal alfa real de los assets:
// persona (person.webp) y lámpara+palmera derechas (terrace-pool-furniture.webp
// / islands-vegetation.webp).
const LEFT_SUBJECT_U: [number, number] = [0.073, 0.2285];
const RIGHT_SUBJECT_U: [number, number] = [0.933, 1.0];

const LAYERS: LayerDef[] = [
  { src: tmcAssets.masterBackground, z: -45, fill: true },
  { src: tmcAssets.layers.skyClouds, z: -40 },
  { src: tmcAssets.layers.miamiSkyline, z: -30 },
  { src: tmcAssets.layers.bayWater, z: -20 },
  { src: tmcAssets.layers.islandsVegetation, z: -12 },
  { src: tmcAssets.layers.terracePoolFurniture, z: -6 },
  { src: tmcAssets.layers.person, z: -2 },
];

// Decisión del equipo (mobile portrait): por debajo de este aspect la persona se
// prioriza sobre palmera/lámpara — es aceptable perder estas últimas, parcial o
// totalmente, con tal de mostrar a la persona. Por encima rige la regla simétrica.
const PERSON_PRIORITY_MAX_ASPECT = 1.24;

/** Centro horizontal (u, 0..1) de la ventana visible sobre la imagen.
 * halfFrac = mitad de la fracción del ancho de imagen que entra en pantalla
 * (depende solo del aspect y COVERAGE_MARGIN, no del scroll). Ver cabecera. */
export function windowCenterU(halfFrac: number, aspect: number): number {
  const [a1, a2] = LEFT_SUBJECT_U;
  const [b1, b2] = RIGHT_SUBJECT_U;
  if (aspect < PERSON_PRIORITY_MAX_ASPECT) {
    // Ventana centrada en la persona, sin salirse de la imagen (una ventana
    // más ancha que el sujeto queda pegada al borde izquierdo en vez de
    // mostrar fuera de [0,1]).
    return THREE.MathUtils.clamp((a1 + a2) / 2, halfFrac, 1 - halfFrac);
  }
  const span = b2 - a1;
  const fraction = 2 * halfFrac;
  if (fraction >= span) {
    // Caben ambos extremos completos: mínimo desplazamiento desde 0.5.
    return THREE.MathUtils.clamp(0.5, b2 - halfFrac, a1 + halfFrac);
  }
  // No caben: cada extremo pierde la misma fracción k de su propio ancho.
  const wL = a2 - a1;
  const wR = b2 - b1;
  const k = Math.min(1, (span - fraction) / (wL + wR));
  return (a1 + b2) / 2 + (k * (wL - wR)) / 2;
}

/** Coloca un plano de fondo (z fijo) con la transformación común a todas las
 * capas: centrado en la intersección del eje óptico con su plano, alto = cover
 * exacto (COVERAGE_MARGIN) y desplazado por el centro de ventana windowCenterU.
 * Misma matemática para las 6 capas, el plano master y la extensión: quedan
 * registrados entre sí. */
function usePlanePlacement(meshRef: React.RefObject<THREE.Mesh | null>, z: number) {
  const { camera, size } = useThree();
  const forward = useRef(new THREE.Vector3());
  const ray = useRef(new THREE.Vector3());

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || !(camera instanceof THREE.PerspectiveCamera)) return;

    camera.getWorldDirection(forward.current);
    // t = distancia a lo largo del rayo de mira real hasta llegar al plano Z
    // de esta capa — si forward.z ~ 0 la cámara mira paralela al plano
    // (no debería ocurrir con los waypoints actuales); se ignora ese frame
    // en vez de dividir por ~0.
    if (Math.abs(forward.current.z) < 1e-6) return;
    const t = (z - camera.position.z) / forward.current.z;
    if (t <= 0) return; // plano detrás de la cámara — no debería pasar, guarda de seguridad

    const ix = camera.position.x + t * forward.current.x;
    const iy = camera.position.y + t * forward.current.y;
    const distance = t; // forward es unitario: t ya es la distancia real 3D

    const aspect = size.width / size.height;
    const vFovRad = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * distance * Math.tan(vFovRad / 2);
    const visibleWidth = visibleHeight * aspect;
    // "cover": el plano excede el frustum visible en ambas dimensiones,
    // preservando siempre el aspect ratio real de la imagen (planeGeometry
    // base ya tiene ese aspect horneado — ver abajo — así que solo hace
    // falta un factor de escala uniforme).
    const requiredHeight = Math.max(
      (visibleWidth * COVERAGE_MARGIN) / IMAGE_ASPECT,
      visibleHeight * COVERAGE_MARGIN
    );
    const planeWidth = requiredHeight * IMAGE_ASPECT;

    // Centro de ventana horizontal común a todas las capas (ver cabecera):
    // uCenter=0.5 = centrado (sin desplazamiento).
    const halfFracVisible = visibleWidth / (2 * planeWidth);
    const uCenter = windowCenterU(halfFracVisible, aspect);
    const ixFinal = ix + (0.5 - uCenter) * planeWidth;

    // Centrado VERTICAL (corrección del recorte inferior): con pitch, el rango
    // visible sobre el plano no es simétrico alrededor de la intersección del
    // eje óptico (iy) — el plano quedaba alto: en Hero faltaba imagen abajo
    // (15–24 px en todo el ancho, medido) y sobraba arriba. Se centra sobre el
    // punto medio del rango vertical realmente visible (rayos de los bordes
    // superior e inferior de la pantalla, columna central). Sin cambio de
    // escala ni del centro horizontal (regla de persona/palmera/lámpara).
    let yCenter = iy;
    const yEdge = [0, 0];
    let edgesOk = true;
    for (let k = 0; k < 2; k++) {
      ray.current.set(0, k === 0 ? 1 : -1, 0.5).unproject(camera).sub(camera.position);
      if (ray.current.z >= -1e-9) {
        edgesOk = false;
        break;
      }
      yEdge[k] = camera.position.y + ray.current.y * ((z - camera.position.z) / ray.current.z);
    }
    if (edgesOk) yCenter = (yEdge[0] + yEdge[1]) / 2;

    mesh.position.set(ixFinal, yCenter, z);
    mesh.scale.setScalar(requiredHeight);
  });

}

function Layer({ src, z, fill }: LayerDef) {
  const texture = useTexture(src);
  // Hallazgo 7 (color más claro que el original, confirmado comparando
  // contra master-background.webp — sí existe un master real, no fue
  // necesario reportar su ausencia): causa raíz real, no un ajuste de
  // tono — THREE.TextureLoader (y useTexture de drei, que lo usa tal
  // cual, sin tocar colorSpace) deja Texture.colorSpace en su default de
  // constructor, NoColorSpace (verificado en node_modules/three/src/
  // textures/Texture.js), tratando estos 6 PNG/WEBP fotográficos como
  // datos YA lineales. El renderer les aplica igual la codificación sRGB
  // de salida — un "doble gamma" que aclara y desatura sistemáticamente
  // cualquier textura de color a la que le falte esta línea (bug clásico
  // de Three.js, no exclusivo de este proyecto). meshBasicMaterial ya usa
  // toneMapped={false} más abajo (correcto, evita el tone-mapping ACES
  // del renderer), pero eso no cubre color space — son 2 pasos distintos
  // del pipeline. Fix real: declarar explícitamente que es una textura de
  // color, no un mapa de datos.
  /* eslint-disable-next-line react-hooks/immutability -- texture (three.js) es un
     objeto imperativo del grafo de escena de R3F, no estado de React; asignar
     colorSpace tras cargarla es el patrón oficial de la librería (mismo criterio ya
     aplicado a `camera` en CameraRig.tsx). */
  texture.colorSpace = THREE.SRGBColorSpace;
  const meshRef = useRef<THREE.Mesh>(null);
  usePlanePlacement(meshRef, z);

  return (
    <mesh ref={meshRef} renderOrder={fill ? -1 : 0}>
      <planeGeometry args={[IMAGE_ASPECT, 1]} />
      <meshBasicMaterial map={texture} transparent={!fill} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Plano de extensión (ver EXT_PAD_U): opaco, registrado con las capas. */
function FillExtension({ z }: { z: number }) {
  const master = useTexture(tmcAssets.masterBackground);
  const built = useMemo(() => buildExtensionTexture(master.image as HTMLImageElement), [master]);
  useEffect(
    () => () => {
      built.texture.dispose();
      built.geometry.dispose();
    },
    [built]
  );
  const meshRef = useRef<THREE.Mesh>(null);
  usePlanePlacement(meshRef, z);
  return (
    <mesh ref={meshRef} geometry={built.geometry} renderOrder={-2}>
      <meshBasicMaterial map={built.texture} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export function SceneLayers() {
  return (
    <group>
      <FillExtension z={-45} />
      {LAYERS.map((layer) => (
        <Layer key={layer.src} {...layer} />
      ))}
    </group>
  );
}
