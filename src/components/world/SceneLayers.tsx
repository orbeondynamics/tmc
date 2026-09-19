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
//     intacto. Es continuo con el caso anterior. Cuando la ventana es tan
//     angosta que no puede tocar ambos a la vez, se centra equidistante de
//     los bordes internos de los dos sujetos (regla simétrica llevada al
//     límite, sin agregar ninguna prioridad entre ellos).
// Al ser el mismo centro para todas las capas quedan registradas entre sí
// (antes terraza/persona iban ~49px desplazadas del resto, dejando ver el
// fondo #060B18 por los cortes de las capas inferiores).
//
import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
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
}

// Sujetos protegidos, rango horizontal normalizado [0,1] de la imagen
// (0=borde izquierdo), medidos con el canal alfa real de los assets:
// persona (person.webp) y lámpara+palmera derechas (terrace-pool-furniture.webp
// / islands-vegetation.webp).
const LEFT_SUBJECT_U: [number, number] = [0.073, 0.2285];
const RIGHT_SUBJECT_U: [number, number] = [0.933, 1.0];

const LAYERS: LayerDef[] = [
  { src: tmcAssets.layers.skyClouds, z: -40 },
  { src: tmcAssets.layers.miamiSkyline, z: -30 },
  { src: tmcAssets.layers.bayWater, z: -20 },
  { src: tmcAssets.layers.islandsVegetation, z: -12 },
  { src: tmcAssets.layers.terracePoolFurniture, z: -6 },
  { src: tmcAssets.layers.person, z: -2 },
];

/** Centro horizontal (u, 0..1) de la ventana visible sobre la imagen.
 * halfFrac = mitad de la fracción del ancho de imagen que entra en pantalla
 * (depende solo del aspect y COVERAGE_MARGIN, no del scroll). Ver cabecera. */
export function windowCenterU(halfFrac: number): number {
  const [a1, a2] = LEFT_SUBJECT_U;
  const [b1, b2] = RIGHT_SUBJECT_U;
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

function Layer({ src, z }: LayerDef) {
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
  const { camera, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const forward = useRef(new THREE.Vector3());

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
    const uCenter = windowCenterU(halfFracVisible);
    const ixFinal = ix + (0.5 - uCenter) * planeWidth;

    mesh.position.set(ixFinal, iy, z);
    mesh.scale.setScalar(requiredHeight);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[IMAGE_ASPECT, 1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export function SceneLayers() {
  return (
    <group>
      {LAYERS.map((layer) => (
        <Layer key={layer.src} {...layer} />
      ))}
    </group>
  );
}
