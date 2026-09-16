"use client";

// Bloque 1 (MVP) — Canvas R3F único y persistente (Master Handoff sección
// 5.1/9.2, CERRADO). Se monta una sola vez; cambiar de hotspot mueve la
// cámara, no reinicia la escena. Iluminación vía Environment (HDRI) sobre
// InstancedMesh no aplica aquí (no hay geometría repetitiva), pero se deja
// preparado frameloop="demand" + invalidate para fases de performance
// posteriores (sección 10) sin resolverlo del todo en este bloque MVP.

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { SceneLayers } from "./SceneLayers";
import { TmcLogo } from "./TmcLogo";

// Cambio de alcance (páginas de unidad ya no montan el mundo 3D — ver
// HomeWorldGate.tsx, que solo monta WorldExperience/WorldCanvas cuando
// pathname === "/"): este Canvas ya solo existe en home.
// <Hotspots /> (las 4 insignias) YA NO vive aquí dentro (rediseño de
// arquitectura: cero interacción de mouse sobre objetos 3D confirmado, así
// que pasaron a ser overlay HTML puro fuera del Canvas — ver
// WorldExperience.tsx y Hotspots.tsx). Solo el aro (TmcLogo) sigue siendo
// 3D real.
export function WorldCanvas() {
  return (
    <Canvas
      className="worldCanvas"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 6, 62], fov: 42, near: 0.1, far: 500 }}
    >
      <color attach="background" args={["#060B18"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[30, 40, 20]} intensity={1.1} color="#E8CE8F" />
      <Suspense fallback={null}>
        <Environment preset="sunset" environmentIntensity={0.6} />
        <SceneLayers />
        <TmcLogo />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
