"use client";

// Bloque 1 (MVP) — hotspots como marcadores 3D proyectados y clicables
// (Master Handoff sección 6, CERRADO: "Hotspots: marcadores 3D proyectados
// y clicables"). NO son zonas invisibles por rango de scroll. Click →
// transición de cámara (vía scroll real) + cambio de URL (sección 5.2).

import { Html } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { hotspots } from "@/lib/world/hotspots.config";
import { waypoints } from "@/lib/world/waypoints";
import { useWorld } from "@/lib/world/WorldContext";
import { navigateToWaypoint } from "@/lib/world/navigateToWaypoint";
import { useAspectCorrectionFactor } from "@/lib/world/useAspectCorrection";
import { track } from "@/lib/analytics/track";
import { OperatingUnitLogo } from "./OperatingUnitLogo";

export function Hotspots() {
  const router = useRouter();
  const { lenisRef, activeWaypointId, setActiveWaypointId } = useWorld();
  // Mismo factor que TmcLogo (useAspectCorrection.ts): en mobile portrait el
  // FOV horizontal se reduce mucho más que el vertical, y las anclas X fijas
  // caían fuera del frustum (los 4 marcadores no se veían) — se acercan al
  // centro proporcionalmente en aspects angostos.
  const aspectFactor = useAspectCorrectionFactor();

  return (
    <>
      {hotspots.map((hotspot) => {
        const waypoint = waypoints.find((w) => w.id === hotspot.id);
        if (!waypoint) return null;
        const isActive = activeWaypointId === hotspot.id;
        const [ax, ay, az] = hotspot.anchor;
        const correctedAnchor: [number, number, number] = [ax * aspectFactor, ay, az];
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
                />
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}
