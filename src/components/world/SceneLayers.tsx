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

import { useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { tmcAssets } from "@/config/tmcAssets";

const IMAGE_ASPECT = 1672 / 941;
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
}

const LAYERS: LayerDef[] = [
  { src: tmcAssets.layers.skyClouds, z: -40 },
  { src: tmcAssets.layers.miamiSkyline, z: -30 },
  { src: tmcAssets.layers.bayWater, z: -20 },
  { src: tmcAssets.layers.islandsVegetation, z: -12 },
  { src: tmcAssets.layers.terracePoolFurniture, z: -6 },
  { src: tmcAssets.layers.person, z: -2 },
];

function Layer({ src, z }: LayerDef) {
  const texture = useTexture(src);
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

    mesh.position.set(ix, iy, z);
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
