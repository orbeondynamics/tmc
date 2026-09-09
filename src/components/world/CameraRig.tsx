"use client";

// Bloque 1 (MVP) — cámara cinematográfica (Master Handoff sección 6, CERRADO):
// PerspectiveCamera, sin OrbitControls, controlada por código, trayectoria
// CatmullRomCurve3 a través de hero + 4 waypoints, target/orientación
// interpolado por una curva separada de la de posición, con damping.
// El progreso (0..1) vive en un ref (WorldContext) y lo anima Lenis/GSAP —
// nunca pasa por useState, para no re-renderizar 60 veces por segundo.
//
// R3F muta el objeto `camera` de three.js imperativamente dentro de
// useFrame por diseño (es el patrón oficial de la librería, no estado de
// React) — se deshabilita puntualmente la regla react-hooks/immutability,
// que asume inmutabilidad de todo lo devuelto por un hook y no distingue
// el grafo de escena imperativo de three.js.

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { waypoints } from "@/lib/world/waypoints";
import { useWorld } from "@/lib/world/WorldContext";

const DAMPING = 4.5; // mayor = respuesta más rápida/menos inercia

export function CameraRig() {
  const { camera } = useThree();
  const { progressRef } = useWorld();
  const dampedT = useRef<number | null>(null);

  const { positionCurve, targetCurve, fovStops } = useMemo(() => {
    const positions = waypoints.map((w) => new THREE.Vector3(...w.position));
    const targets = waypoints.map((w) => new THREE.Vector3(...w.target));
    return {
      positionCurve: new THREE.CatmullRomCurve3(positions, false, "catmullrom", 0.5),
      targetCurve: new THREE.CatmullRomCurve3(targets, false, "catmullrom", 0.5),
      fovStops: waypoints.map((w) => ({ t: w.scrollProgress, fov: w.fov })),
    };
  }, []);

  /* eslint-disable react-hooks/immutability -- three.js `camera` es un objeto imperativo
     del grafo de escena de R3F (no estado de React); mutarlo dentro de useFrame es el
     patrón oficial de la librería para animar cámara/objetos cuadro a cuadro. */
  useFrame((_, delta) => {
    if (dampedT.current === null) dampedT.current = progressRef.current.t;
    const goal = THREE.MathUtils.clamp(progressRef.current.t, 0, 1);
    const smoothing = 1 - Math.exp(-DAMPING * delta);
    dampedT.current = THREE.MathUtils.lerp(dampedT.current, goal, smoothing);
    const t = dampedT.current;

    const pos = positionCurve.getPointAt(t);
    const target = targetCurve.getPointAt(t);
    camera.position.copy(pos);
    camera.lookAt(target);

    if (camera instanceof THREE.PerspectiveCamera) {
      const fov = interpolateFov(fovStops, t);
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}

function interpolateFov(stops: { t: number; fov: number }[], t: number): number {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.t && t <= b.t) {
      const localT = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
      return THREE.MathUtils.lerp(a.fov, b.fov, localT);
    }
  }
  return stops[stops.length - 1].fov;
}
