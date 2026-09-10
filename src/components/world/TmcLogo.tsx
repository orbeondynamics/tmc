"use client";

// TMC World — Logo TMC 3D + aro dorado (prompt maestro sección 7, CERRADO;
// Master Handoff sección 12/22). El GLB fuente solo tiene posición (sin
// normales) — se calculan aquí para que el material metálico responda a la
// luz correctamente. El GLB fuente puede estar en negro; el material dorado
// se aplica en tiempo de ejecución (sección 12.1).
//
// LOGO CONFIG — controles numéricos obligatorios (prompt maestro sección 7,
// CERRADO, valores exactos): LOGO_SIZE, LOGO_THICKNESS, LOGO_ROTATION,
// LOGO_ROTATION_SPEED, GOLD_COLOR, RING_OUTER, RING_INNER. Todos reales:
// cambiarlos cambia el render, no son solo documentación.
//
// El aro es un objeto independiente ("Círculo — Objeto independiente; no
// modificar") — un TorusGeometry propio; no se ve afectado por
// LOGO_THICKNESS. TMC y aro comparten el mismo group y rotan juntos
// ("El aro y el TMC deben girar juntos").
//
// Calibración ring/wordmark (Fase 3, corrige un bug real de esta misma
// evolución): la referencia obligatoria docs/reference/tmc-logo-3d-final.html
// usa LOGO_SIZE=545 como ancho objetivo del wordmark Y usa RING_OUTER=340/
// RING_INNER=300 como RADIOS ABSOLUTOS en ese mismo sistema de unidades
// (ring.radius = (340+300)/2 = 320, ring.tube = (340-300)/2 = 20) — es decir
// diámetro exterior del aro = 680, un 25% más ancho que el wordmark de 545,
// suficiente para rodearlo con margen. La implementación anterior dividía
// además entre 2 (tratando 340/545 como fracción de LOGO_SIZE/2 en vez de
// LOGO_SIZE completo), lo que dejaba el aro con la MITAD del radio correcto
// — se veía solapado con las letras en vez de rodeándolas. Corregido abajo:
// se reescala la proporción 340:545 directamente contra el LOGO_SIZE real
// de esta escena (sin la división extra por 2).

import { useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { tmcAssets } from "@/config/tmcAssets";
import { useAspectCorrectionFactor } from "@/lib/world/useAspectCorrection";

// ---------- LOGO CONFIG (prompt maestro sección 7, CERRADO) ----------
export const GOLD_COLOR = 0xc9a24b;
/** Ancho objetivo del TMC en unidades de mundo (equivalente calibrado al 545 de referencia).
 * Corrección Fase 3 (prompt maestro sección 7): el valor anterior (30) hacía que el
 * logo ocupara ~46% del ancho del viewport en el hero — la referencia aprobada indica
 * ~15%. Reducido ~40% (30 → 12) como punto de partida indicado por el V3; el aro se
 * reescala automáticamente vía RING_SCALE, sin tocar RING_OUTER/RING_INNER. */
export const LOGO_SIZE = 12;
/** 1.0 más delgado, 2.0 grueso, 3.0 más grueso que 2.0 — solo afecta profundidad (Z). */
export const LOGO_THICKNESS = 2.0;
/** Grosor "natural" de referencia del GLB fuente — LOGO_THICKNESS se mide contra este. */
const BASELINE_THICKNESS = 2.0;
/** Eje de rotación — 'x' | 'y' | 'z' (spec CERRADO). Esta escena solo anima Y. */
export const LOGO_ROTATION: "x" | "y" | "z" = "y";
/** Velocidad de rotación continua, rad/s (spec CERRADO — igual a la referencia). */
export const LOGO_ROTATION_SPEED = 0.8;
/** Radios absolutos del aro en el sistema de referencia (LOGO_SIZE=545). */
export const RING_OUTER = 340;
export const RING_INNER = 300;
const RING_REFERENCE_LOGO_SIZE = 545;

const SOURCE_WIDTH_UNITS = 1763.9; // ancho real del GLB fuente en sus propias unidades
const BASE_UNIFORM_SCALE = LOGO_SIZE / SOURCE_WIDTH_UNITS;

// Reescala los radios absolutos de referencia (340/300 sobre un wordmark de
// 545) al LOGO_SIZE real de esta escena — misma proporción, no una fracción
// extra de LOGO_SIZE/2.
const RING_SCALE = LOGO_SIZE / RING_REFERENCE_LOGO_SIZE;
const RING_OUTER_RADIUS = RING_OUTER * RING_SCALE;
const RING_INNER_RADIUS = RING_INNER * RING_SCALE;
const RING_CENTERLINE = (RING_OUTER_RADIUS + RING_INNER_RADIUS) / 2;
const RING_TUBE_RADIUS = (RING_OUTER_RADIUS - RING_INNER_RADIUS) / 2;

/**
 * Material dorado con margen de seguridad emissive (referencia
 * tmc-logo-3d-final.html, líneas ~3934-3944): sin esto, bajo la iluminación
 * más modesta de la escena completa del mundo (WorldCanvas.tsx — no se
 * toca, sección 7 prohíbe modificar iluminación/HDRI), el oro se percibía
 * apagado/oliva en vez de dorado vivo. El emissive no reemplaza la luz de
 * la escena, solo garantiza que el tono dorado se lea incluso en las zonas
 * con menos luz directa/ambiente.
 */
function useGoldMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: GOLD_COLOR,
        metalness: 0.72,
        roughness: 0.3,
        emissive: 0x2e2208,
        emissiveIntensity: 0.22,
        envMapIntensity: 1.1,
      }),
    []
  );
}

/** Posición por defecto del centro del logo — compartida con HotspotArcs.tsx
 * (prompt maestro sección 6.2: arcos dorados que conectan los hotspots al
 * centro) para que el arco apunte exactamente al mismo punto que el logo. */
export const LOGO_POSITION: [number, number, number] = [0, 7, 2];

export function TmcLogo({ position = LOGO_POSITION }: { position?: [number, number, number] }) {
  const { scene } = useGLTF(tmcAssets.logo3d);
  const groupRef = useRef<THREE.Group>(null);
  const aspectFactor = useAspectCorrectionFactor();
  const goldMaterial = useGoldMaterial();

  const [uniformScale, thicknessScale] = useMemo(() => {
    const scale = BASE_UNIFORM_SCALE * aspectFactor;
    return [scale, scale * (LOGO_THICKNESS / BASELINE_THICKNESS)];
  }, [aspectFactor]);

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry.computeVertexNormals();
        mesh.material = goldMaterial;
      }
    });
  }, [scene, goldMaterial]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // LOGO_ROTATION fija el eje ('y'); la velocidad viene de LOGO_ROTATION_SPEED.
      groupRef.current.rotation[LOGO_ROTATION] += LOGO_ROTATION_SPEED * delta;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group scale={[uniformScale, uniformScale, thicknessScale]}>
        <primitive object={scene} />
      </group>
      {/* TorusGeometry por defecto queda en el plano XY (cara hacia +Z) —
          exactamente de frente a la cámara, igual que el TMC — sin rotación
          propia adicional: gira junto con el group padre. */}
      <mesh material={goldMaterial}>
        <torusGeometry args={[RING_CENTERLINE, RING_TUBE_RADIUS, 24, 96]} />
      </mesh>
    </group>
  );
}

useGLTF.preload(tmcAssets.logo3d);
