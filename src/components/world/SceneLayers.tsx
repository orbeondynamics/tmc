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
// Corrección (mismo criterio de siempre — mecanismo continuo, función del
// aspect ratio real, sin breakpoint): keepInViewU, opcional por capa, declara
// el rango horizontal normalizado [0,1] del sujeto que esa capa NUNCA debe
// dejar fuera de cuadro (con un pequeño margen de seguridad). Cada frame se
// calcula cuánta fracción del ancho de la imagen entra en la ventana visible
// actual (depende de distancia/FOV/aspect, igual que el resto de este
// archivo) y, SOLO si el centrado por defecto (50%) dejaría ese rango fuera,
// se calcula el desplazamiento horizontal MÍNIMO necesario para incluirlo
// completo — nunca más de lo necesario. En aspects donde el centrado por
// defecto ya alcanza a cubrir el rango (todo lo validado en 1366/1440/1920),
// el desplazamiento calculado es exactamente 0 — cero cambio de composición
// ahí, confirmado con captura. Solo se aplica a las 2 capas cuyo sujeto vive
// lejos del centro (terraza/piscina/mobiliario y persona); el resto de capas
// (cielo, skyline, agua, islas) no lo necesita y no se toca.

import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { tmcAssets } from "@/config/tmcAssets";

const IMAGE_ASPECT = 1672 / 941;
const SUBJECT_SAFETY_MARGIN_U = 0.03;
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
const COVERAGE_MARGIN = 1.15;

interface LayerDef {
  src: string;
  z: number;
  /** Rango horizontal normalizado [uMin, uMax] (0=borde izquierdo de la
   * imagen, 1=borde derecho) del sujeto que esta capa debe mantener siempre
   * visible — medido por análisis real del canal alfa del asset, no a ojo.
   * Omitido en capas sin un sujeto excéntrico que proteger. */
  keepInViewU?: [number, number];
}

// Persona (person.webp): bounding box real del canal alfa, x = [0.0730,
// 0.2273] del ancho de imagen (1672px) — medido con canvas.getImageData,
// no estimado visualmente.
const PERSON_U: [number, number] = [0.073, 0.2273];

const LAYERS: LayerDef[] = [
  { src: tmcAssets.layers.skyClouds, z: -40 },
  { src: tmcAssets.layers.miamiSkyline, z: -30 },
  { src: tmcAssets.layers.bayWater, z: -20 },
  { src: tmcAssets.layers.islandsVegetation, z: -12 },
  // Mismo rango que la persona (no el suyo propio, que cubre casi todo el
  // ancho, 0%-99.9%): lo que debe protegerse aquí es específicamente la
  // franja de terraza/piscina INMEDIATA a la persona, para que ambas capas
  // se desplacen juntas y no se vean desalineadas entre sí.
  { src: tmcAssets.layers.terracePoolFurniture, z: -6, keepInViewU: PERSON_U },
  { src: tmcAssets.layers.person, z: -2, keepInViewU: PERSON_U },
];

function Layer({ src, z, keepInViewU }: LayerDef) {
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

    // Desplazamiento horizontal mínimo (ver comentario de archivo arriba):
    // por defecto la ventana visible queda centrada en u=0.5 (mesh.position.x
    // = ix, sin desplazar — comportamiento idéntico al anterior). Si el
    // sujeto declarado en keepInViewU no entra completo ahí, se recentra la
    // ventana en el punto más cercano a 0.5 que sí lo incluye.
    let ixFinal = ix;
    if (keepInViewU) {
      const halfFracVisible = visibleWidth / (2 * planeWidth);
      const uMin = keepInViewU[0] - SUBJECT_SAFETY_MARGIN_U;
      const uMax = keepInViewU[1] + SUBJECT_SAFETY_MARGIN_U;
      // uCenter debe satisfacer uCenter-half<=uMin y uCenter+half>=uMax —
      // es decir uCenter en [uMax-half, uMin+half]. Si ese rango es vacío
      // (ventana visible más angosta que el propio sujeto+margen — no ocurre
      // con los assets actuales en ningún ancho de escritorio razonable),
      // se cae a centrar en el sujeto como mejor esfuerzo.
      const uCenterLow = uMax - halfFracVisible;
      const uCenterHigh = uMin + halfFracVisible;
      const uCenter =
        uCenterLow <= uCenterHigh
          ? THREE.MathUtils.clamp(0.5, uCenterLow, uCenterHigh)
          : (uMin + uMax) / 2;
      ixFinal = ix + (0.5 - uCenter) * planeWidth;
    }

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
