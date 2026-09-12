"use client";

// Bloque 1 (MVP) — Canvas R3F único y persistente (Master Handoff sección
// 5.1/9.2, CERRADO). Se monta una sola vez; cambiar de hotspot mueve la
// cámara, no reinicia la escena. Iluminación vía Environment (HDRI) sobre
// InstancedMesh no aplica aquí (no hay geometría repetitiva), pero se deja
// preparado frameloop="demand" + invalidate para fases de performance
// posteriores (sección 10) sin resolverlo del todo en este bloque MVP.

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { CameraRig } from "./CameraRig";
import { SceneLayers } from "./SceneLayers";
import { TmcLogo } from "./TmcLogo";
import { Hotspots } from "./Hotspots";

export function WorldCanvas() {
  // Simplificación de páginas de unidad (diagnóstico REDTEAM): en home se ve
  // el hub completo (aro central + las 4 insignias, ver Hotspots.tsx para el
  // filtrado de insignias); en una página de unidad (/luxury, /transport,
  // /cleaners, /project-office) el aro central deja de mostrarse del todo —
  // desmontarlo aquí (no un simple "return null" adentro de TmcLogo) también
  // detiene su propio useFrame (rotación + compensación por distancia), que
  // no tiene sentido calcular para algo que no se renderiza.
  const pathname = usePathname();
  const isHome = pathname === "/";

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
        {isHome && <TmcLogo />}
        <Hotspots />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
