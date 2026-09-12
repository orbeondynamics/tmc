// Fórmula usada por Hotspots.tsx para el diámetro real en píxeles de una
// insignia en el frame actual (antes también por HotspotArcs.tsx, ahora
// eliminado — ver correctedHotspotAnchor.ts): correctedHotspotAnchor.ts
// necesita este radio para saber cuánto hace falta comprimir un anchor para
// que la insignia completa (no solo su punto central) quede fuera de la
// franja del header/footer.
//
// Misma fórmula/constantes que ya usaba Hotspots.tsx (prompt maestro sección
// 6.2: diámetro ≈74% del diámetro del aro) + compensación por distancia real
// de cámara (mismo mecanismo que TmcLogo.tsx, REFERENCE_CAMERA_DISTANCE=60 =
// REFERENCE_LOGO_DISTANCE ahí — misma cámara de referencia, no deben divergir).

import * as THREE from "three";
import { RING_OUTER_RADIUS } from "@/components/world/TmcLogo";

const BADGE_DIAMETER_RATIO = 0.74;
const REFERENCE_CAMERA_DISTANCE = 60; // waypoints.ts hero: position.z=62, logo z=2
const REFERENCE_FOV_DEG = 42; // waypoints.ts hero.fov
const MIN_DISTANCE_COMPENSATION = 0.4;
const MAX_DISTANCE_COMPENSATION = 1.6;

/** Diámetro de insignia en píxeles de pantalla en el waypoint hero, antes de
 * compensación por distancia — depende solo de aspect/viewport, no de cámara. */
export function getInitialBadgeDiameterPx(viewportHeight: number, aspectFactor: number): number {
  const vFovRad = (REFERENCE_FOV_DEG * Math.PI) / 180;
  const visibleHeightAtDistance = 2 * REFERENCE_CAMERA_DISTANCE * Math.tan(vFovRad / 2);
  const pixelsPerWorldUnit = viewportHeight / visibleHeightAtDistance;
  const apparentRingDiameterWorld = RING_OUTER_RADIUS * 2 * aspectFactor;
  return apparentRingDiameterWorld * pixelsPerWorldUnit * BADGE_DIAMETER_RATIO;
}

/** Diámetro real en el frame actual — aplica la misma compensación por
 * distancia cámara↔logo que TmcLogo.tsx, recalculada cada frame porque la
 * distancia cambia continuamente durante el scroll. */
export function getBadgeDiameterPx(
  initialBadgeDiameterPx: number,
  camera: THREE.Camera,
  logoWorldPos: THREE.Vector3
): number {
  const distance = camera.position.distanceTo(logoWorldPos);
  const distanceCompensation = THREE.MathUtils.clamp(
    distance / REFERENCE_CAMERA_DISTANCE,
    MIN_DISTANCE_COMPENSATION,
    MAX_DISTANCE_COMPENSATION
  );
  return initialBadgeDiameterPx * distanceCompensation;
}
