"use client";

// Bloque 1 (MVP) — hotspots como marcadores 3D proyectados y clicables
// (Master Handoff sección 6, CERRADO: "Hotspots: marcadores 3D proyectados
// y clicables"). NO son zonas invisibles por rango de scroll. Click →
// transición de cámara (vía scroll real) + cambio de URL (sección 5.2).

import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { hotspots } from "@/lib/world/hotspots.config";
import { waypoints } from "@/lib/world/waypoints";
import { useWorld } from "@/lib/world/WorldContext";
import { navigateToWaypoint } from "@/lib/world/navigateToWaypoint";
import { useAspectCorrectionFactor } from "@/lib/world/useAspectCorrection";
import { getCorrectedHotspotAnchor } from "@/lib/world/correctedHotspotAnchor";
import { track } from "@/lib/analytics/track";
import { RING_OUTER_RADIUS, LOGO_POSITION } from "./TmcLogo";
import { OperatingUnitLogo } from "./OperatingUnitLogo";

// Proporción exacta del prompt maestro sección 6.2: diámetro de insignia
// ≈74% del diámetro del aro/logo central. Un primer intento (misma fórmula,
// anchors angulares originales) producía overlap entre insignias del mismo
// lado — resuelto redistribuyendo los anchors en hotspots.config.ts a 4
// cuadrantes verdaderos de 90° a radio 1.0x el diámetro del logo (ver
// comentario ahí); con esa geometría, la separación mínima entre insignias
// adyacentes (~21.17 unidades de mundo) excede ampliamente el diámetro de
// insignia (~11.08 unidades), sin necesitar ningún ajuste radial adicional.
const BADGE_DIAMETER_RATIO = 0.74;
/** Waypoint de referencia para el cálculo: "hero" es donde las 4 insignias
 * se ven juntas alrededor del logo — mismo principio que REFERENCE_CAMERA_Z
 * en SceneLayers.tsx. */
const REFERENCE_CAMERA_DISTANCE = 60; // waypoints.ts hero: position.z=62, logo z=2
const REFERENCE_FOV_DEG = 42; // waypoints.ts hero.fov

export function Hotspots() {
  const router = useRouter();
  const { lenisRef, activeWaypointId, setActiveWaypointId } = useWorld();
  const { size } = useThree();
  // Mismo factor que TmcLogo (useAspectCorrection.ts): en mobile portrait el
  // FOV horizontal se reduce mucho más que el vertical, y las anclas X fijas
  // caían fuera del frustum (los 4 marcadores no se veían) — se acercan al
  // centro proporcionalmente en aspects angostos.
  const aspectFactor = useAspectCorrectionFactor();

  // Diámetro del aro proyectado a píxeles de pantalla en el waypoint hero,
  // × 0.74 — el tamaño de insignia escala junto con LOGO_SIZE
  // automáticamente si ese valor vuelve a ajustarse.
  const badgeDiameterPx = useMemo(() => {
    const vFovRad = (REFERENCE_FOV_DEG * Math.PI) / 180;
    const visibleHeightAtDistance = 2 * REFERENCE_CAMERA_DISTANCE * Math.tan(vFovRad / 2);
    const pixelsPerWorldUnit = size.height / visibleHeightAtDistance;
    // El aro mismo se escala por aspectFactor (ver TmcLogo.tsx uniformScale) para
    // compensar aspects angostos — el diámetro aparente debe reflejar eso, no solo
    // el radio nominal, para que la proporción 74% se sostenga también en mobile.
    const apparentRingDiameterWorld = RING_OUTER_RADIUS * 2 * aspectFactor;
    return apparentRingDiameterWorld * pixelsPerWorldUnit * BADGE_DIAMETER_RATIO;
  }, [size.height, aspectFactor]);

  return (
    <>
      {hotspots.map((hotspot) => {
        const waypoint = waypoints.find((w) => w.id === hotspot.id);
        if (!waypoint) return null;
        const isActive = activeWaypointId === hotspot.id;
        const correctedAnchor = getCorrectedHotspotAnchor(
          hotspot.anchor,
          aspectFactor,
          size.width,
          LOGO_POSITION[1]
        );
        return (
          <group key={hotspot.id} position={correctedAnchor}>
            <Html center occlude={false} zIndexRange={[10, 0]}>
              <button
                type="button"
                className="hotspotMarker"
                aria-label={`${hotspot.label} — ${hotspot.positioning}`}
                onClick={() => {
                  track({ name: "hotspot_click", unitId: hotspot.id, route: hotspot.route });
                  navigateToWaypoint({
                    waypoint,
                    lenisRef,
                    onComplete: () => setActiveWaypointId(hotspot.id),
                  });
                  // scroll:false — Next.js no debe resetear el scroll al navegar; el
                  // scroll real (Lenis) es quien conduce la pose de cámara y ya se
                  // está animando hacia el waypoint en la línea de arriba.
                  router.push(hotspot.route, { scroll: false });
                }}
              >
                <OperatingUnitLogo
                  unitId={hotspot.id}
                  label={hotspot.label}
                  tagline={hotspot.message}
                  active={isActive}
                  diameterPx={badgeDiameterPx}
                />
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}
