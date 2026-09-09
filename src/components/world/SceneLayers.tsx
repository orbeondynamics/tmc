"use client";

// TMC World — Master Miami en 2.5D por capas (Master Handoff sección 8,
// CERRADO). Los 6 assets comparten exactamente el mismo encuadre/relación de
// aspecto (1672x941), por lo que se apilan como planos alineados a distintas
// profundidades Z — la técnica clásica de parallax cutout.
//
// Corrección de esta evolución: el tamaño de cada plano ya NO es un ancho
// fijo en unidades de mundo. Se calcula en función del frustum real de la
// cámara (fov + aspect ratio del viewport actual) a la distancia de esa capa,
// con un margen de cobertura — así el fondo llena el viewport dinámicamente
// en cualquier proporción (desktop ancho, mobile angosto) sin deformarse
// (el plano siempre conserva el aspect ratio real de la imagen, 1672:941) y
// sin dejar bordes vacíos al recorrer los distintos waypoints de cámara.

import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { tmcAssets } from "@/config/tmcAssets";

const IMAGE_ASPECT = 1672 / 941;
// Distancia de referencia cámara→capa: se usa el waypoint "hero" (Z=62), el
// más alejado de los 5 waypoints — dimensionar para el caso más lejano
// garantiza cobertura también en los waypoints más cercanos.
const REFERENCE_CAMERA_Z = 62;
// Margen extra sobre el frustum calculado — absorbe el paneo lateral (X/Y)
// de los demás waypoints, que no están perfectamente centrados en el eje Z.
const COVERAGE_MARGIN = 2.0;

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

  const [planeWidth, planeHeight] = useMemo(() => {
    const aspect = size.width / size.height;
    const fovDeg = camera instanceof THREE.PerspectiveCamera ? camera.fov : 42;
    const vFovRad = (fovDeg * Math.PI) / 180;
    const distance = REFERENCE_CAMERA_Z - z;
    const visibleHeight = 2 * distance * Math.tan(vFovRad / 2);
    const visibleWidth = visibleHeight * aspect;
    // "cover": el plano excede el frustum visible en ambas dimensiones,
    // preservando siempre el aspect ratio real de la imagen.
    const width = Math.max(
      visibleWidth * COVERAGE_MARGIN,
      visibleHeight * COVERAGE_MARGIN * IMAGE_ASPECT
    );
    return [width, width / IMAGE_ASPECT];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, z]);

  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
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
