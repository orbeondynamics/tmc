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
import { TmcLogo, LOGO_POSITION } from "./TmcLogo";
import { useWorld } from "@/lib/world/WorldContext";

// Cambio de alcance (páginas de unidad ya no montan el mundo 3D — ver
// HomeWorldGate.tsx, que solo monta WorldExperience/WorldCanvas cuando
// pathname === "/"): este Canvas ya solo existe en home.
// <Hotspots /> (las 4 insignias) YA NO vive aquí dentro (rediseño de
// arquitectura: cero interacción de mouse sobre objetos 3D confirmado, así
// que pasaron a ser overlay HTML puro fuera del Canvas — ver
// WorldExperience.tsx y Hotspots.tsx). Solo el aro (TmcLogo) sigue siendo
// 3D real.
//
// HERO_RING_POSITION (Grupo A, hallazgo del aro desalineado del centro del
// hub): posición 3D ESTÁTICA y determinista, aprobada explícitamente por el
// dueño del proyecto — NO es LOGO_POSITION (esa constante de TmcLogo.tsx
// sigue CERRADA, intacta, sin tocar) sino el valor que se le pasa a
// TmcLogo vía su prop `position` en este caso de uso específico (home).
// Cálculo: LOGO_POSITION=[0,7,2] no cae sobre el eje óptico de la cámara
// "hero" (position=[0,6,62], target=[0,-2,-10]) — proyecta a y=33.3%, no
// al 50% pedido. Cualquier punto SOBRE ese eje óptico proyecta al centro
// exacto por construcción geométrica (es una recta, no requiere mover
// cámara/FOV/target, que quedan intactos); se eligió el punto de esa
// recta a distancia = REFERENCE_LOGO_DISTANCE (60, la misma constante que
// ya usa TmcLogo.tsx para su compensación de escala por distancia) — la
// única distancia que da compensación de escala neutra en hero (ratio
// 0.9999, imperceptible). Verificado con three.js antes de implementar:
// proyecta exacto a (50.000%, 50.000%) en 1920×1080, 1280×800 y 375×667.
// Efecto secundario conocido y aprobado por el equipo (matemáticamente
// inevitable: un único punto estático no puede estar sobre el eje óptico
// de 5 cámaras distintas a la vez): en los 4 waypoints de unidad
// (Luxury/Transport/Cleaners/Project Office) el aro se desplaza 317-490px
// en pantalla respecto a antes — aceptado porque la navegación a la
// página estática de la unidad es inmediata al completar el vuelo de
// cámara (confirmado en navigateToWaypoint.ts/Hotspots.tsx: sin dwell),
// no un estado de reposo visible. NO es tracking dinámico ni recalculado
// por frame — un solo array estático, misma filosofía que el resto del
// Grupo A (home CSS, cd3881e).
//
// Corrección de regresión (tarea "análisis técnico — aro en waypoints",
// aprobada por el equipo con evidencia empírica vía CDP screencast, sin
// pop/flicker perceptible): HERO_RING_POSITION nunca debió aplicarse fuera
// de Hero — antes de esta constante, el aro SIEMPRE estuvo en LOGO_POSITION
// (confirmado con git log: ese valor nunca cambió) en los 4 waypoints, por
// ser el mismo objeto 3D persistente visto desde distintos ángulos de
// cámara. Se restaura ese comportamiento original ahí, conmutando por
// activeWaypointId — el mismo valor que Hotspots.tsx ya escribe, en el
// mismo tick síncrono que router.push, al completar el vuelo (sin dwell).
// Dos posiciones fijas, no tracking dinámico ni interpolación por frame.
const HERO_RING_POSITION: [number, number, number] = [0, -0.625892, 2.366976];

export function WorldCanvas() {
  const { activeWaypointId } = useWorld();
  const ringPosition = activeWaypointId === "hero" ? HERO_RING_POSITION : LOGO_POSITION;

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
        <TmcLogo position={ringPosition} />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
