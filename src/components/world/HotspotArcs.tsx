"use client";

// Arcos dorados delgados que conectan cada hotspot al logo central — motivo
// decorativo del tratamiento visual de hotspots (prompt maestro sección 6.2,
// calibrado sobre docs/reference/tmc-website-base.png: "se conectan al
// centro mediante arcos dorados delgados como motivo decorativo"). Esto es
// tratamiento visual sobre los hotspots ya existentes (siguen siendo 3D
// projected clickable markers, Master Handoff sección 8) — no una
// arquitectura nueva, y no dibuja nada que no exista ya como copy/anchor
// aprobado (usa las mismas anclas de hotspots.config.ts que Hotspots.tsx).
//
// Implementación: un overlay SVG a pantalla completa dentro del Canvas
// (drei Html fullscreen), puramente decorativo (pointer-events: none, no
// intercepta clicks). Las posiciones se proyectan de mundo 3D → pantalla en
// cada frame vía camera.project() y se escriben directo en los atributos
// `d` del <path> por ref — sin pasar por estado de React, para no generar
// un render de React 60 veces por segundo (mismo principio que
// WorldContext.tsx aplica al progreso de scroll).

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { hotspots } from "@/lib/world/hotspots.config";
import { useAspectCorrectionFactor } from "@/lib/world/useAspectCorrection";
import { LOGO_POSITION } from "./TmcLogo";

/** Cuánto se curva cada arco, como fracción de la distancia centro↔hotspot. */
const ARC_BOW = 0.12;

export function HotspotArcs() {
  const { camera, size } = useThree();
  const aspectFactor = useAspectCorrectionFactor();
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const centerWorld = useRef(new THREE.Vector3());
  const hotspotWorld = useRef(new THREE.Vector3());

  function projectToScreen(v: THREE.Vector3): [number, number] {
    v.project(camera);
    return [((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height];
  }

  useFrame(() => {
    centerWorld.current.set(...LOGO_POSITION);
    const [cx, cy] = projectToScreen(centerWorld.current);

    hotspots.forEach((hotspot, i) => {
      const [ax, ay, az] = hotspot.anchor;
      hotspotWorld.current.set(ax * aspectFactor, ay, az);
      const [hx, hy] = projectToScreen(hotspotWorld.current);

      const midX = (cx + hx) / 2;
      const midY = (cy + hy) / 2;
      const dx = hx - cx;
      const dy = hy - cy;
      const dist = Math.hypot(dx, dy) || 1;
      // Normal perpendicular a la línea centro→hotspot, para un arco suave
      // (no una línea recta) — el signo alterna por índice para que los 4
      // arcos se abran hacia afuera del centro en vez de cruzarse entre sí.
      const nx = -dy / dist;
      const ny = dx / dist;
      const bow = dist * ARC_BOW * (ax < 0 ? -1 : 1);
      const ctrlX = midX + nx * bow;
      const ctrlY = midY + ny * bow;

      const path = pathRefs.current[i];
      if (path) path.setAttribute("d", `M ${cx} ${cy} Q ${ctrlX} ${ctrlY} ${hx} ${hy}`);
    });
  });

  return (
    <Html fullscreen zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        {hotspots.map((hotspot, i) => (
          <path
            key={hotspot.id}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            fill="none"
            stroke="rgba(232, 206, 143, 0.75)"
            strokeWidth={1.5}
          />
        ))}
      </svg>
    </Html>
  );
}
