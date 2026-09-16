"use client";

// Bloque 1 (MVP) — hotspots del home, ahora overlay HTML puro (rediseño de
// arquitectura logo+insignias, reemplaza por completo al sistema anterior
// de proyección 3D en vivo). Confirmado antes de este cambio: cero
// raycasting/interacción de mouse sobre el logo/aro 3D — toda la
// interacción real del home es scroll de cámara, y las 4 insignias siempre
// fueron overlay HTML (drei <Html>) posicionado por proyección 2D de un
// <group>, nunca meshes. Eso habilita tratar todo como layout de pantalla
// puro: sin <group>/<Html>, sin useFrame, sin screenToWorldAtDepth — las 4
// insignias son <button> absolutamente posicionados por CSS (ver
// .homeBadge en globals.css), hijos de un div fijo (.homeBadgeLayer) que
// vive FUERA del <Canvas> (ver WorldExperience.tsx), no dentro.
//
// Click → sigue disparando el mismo vuelo de cámara (navigateToWaypoint)
// + cambio de URL que antes (sección 5.2) — eso no cambió, solo CÓMO se
// posiciona visualmente el botón en pantalla. Efecto aceptado y conocido:
// durante el vuelo, las insignias YA NO seguirán a la cámara (antes sí,
// por el round-trip a posición de mundo cada frame) — decisión explícita
// del dueño del proyecto, priorizando estabilidad de la composición sobre
// ese detalle cosmético del tránsito.

import { useRouter } from "next/navigation";
import { hotspots } from "@/lib/world/hotspots.config";
import { waypoints } from "@/lib/world/waypoints";
import { useWorld } from "@/lib/world/WorldContext";
import { navigateToWaypoint } from "@/lib/world/navigateToWaypoint";
import { track } from "@/lib/analytics/track";
import { OperatingUnitLogo } from "./OperatingUnitLogo";

export function Hotspots() {
  const router = useRouter();
  const { lenisRef, activeWaypointId, setActiveWaypointId, pendingRouteRef } = useWorld();

  return (
    <div className="homeBadgeLayer">
      {hotspots.map((hotspot) => {
        const waypoint = waypoints.find((w) => w.id === hotspot.id);
        if (!waypoint) return null;
        const isActive = activeWaypointId === hotspot.id;
        const colClass = hotspot.quadrant.col === -1 ? "homeBadge--left" : "homeBadge--right";
        const rowClass = hotspot.quadrant.row === -1 ? "homeBadge--top" : "homeBadge--bottom";

        return (
          <button
            key={hotspot.id}
            type="button"
            className={`homeBadge ${colClass} ${rowClass} hotspotMarker`}
            aria-label={`${hotspot.label} — ${hotspot.positioning}`}
            onClick={() => {
              track({ name: "hotspot_click", unitId: hotspot.id, route: hotspot.route });
              // Cambio de alcance: la página de destino ya no es parte del
              // mundo 3D — navegar de inmediato cortaría el vuelo de
              // cámara a medio camino, porque el cambio de ruta desmonta
              // el mundo entero (ver HomeWorldGate.tsx). El push se
              // difiere al onComplete del vuelo para conservar la
              // transición cinematográfica ya aprobada; al llegar, se
              // cambia a la página estática de esa unidad.
              navigateToWaypoint({
                waypoint,
                lenisRef,
                onComplete: () => {
                  setActiveWaypointId(hotspot.id);
                  pendingRouteRef.current = hotspot.route;
                  // Sin scroll:false aquí a propósito: el destino ya no es
                  // parte del mundo 3D con scroll continuo, es una página
                  // estática aparte (StaticUnitPage.tsx) — Next.js debe
                  // resetear el scroll como en cualquier navegación normal.
                  router.push(hotspot.route);
                },
              });
            }}
          >
            <OperatingUnitLogo unitId={hotspot.id} label={hotspot.label} tagline={hotspot.message} active={isActive} />
          </button>
        );
      })}
    </div>
  );
}
