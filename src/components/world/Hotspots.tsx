"use client";

// Bloque 1 (MVP) — hotspots como marcadores 3D proyectados y clicables
// (Master Handoff sección 6, CERRADO: "Hotspots: marcadores 3D proyectados
// y clicables"). NO son zonas invisibles por rango de scroll. Click →
// transición de cámara (vía scroll real) + cambio de URL (sección 5.2).

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { hotspots } from "@/lib/world/hotspots.config";
import { waypoints } from "@/lib/world/waypoints";
import { useWorld } from "@/lib/world/WorldContext";
import { navigateToWaypoint } from "@/lib/world/navigateToWaypoint";
import { useAspectCorrectionFactor } from "@/lib/world/useAspectCorrection";
import { getCorrectedHotspotAnchor } from "@/lib/world/correctedHotspotAnchor";
import { useHeaderFooterElements } from "@/lib/world/useHeaderFooterBounds";
import { getInitialBadgeDiameterPx, getBadgeDiameterPx } from "@/lib/world/badgeDiameter";
import { track } from "@/lib/analytics/track";
import { LOGO_POSITION } from "./TmcLogo";
import { OperatingUnitLogo } from "./OperatingUnitLogo";

export function Hotspots() {
  const router = useRouter();
  const { lenisRef, activeWaypointId, setActiveWaypointId } = useWorld();
  const { size, camera } = useThree();
  // Mismo factor que TmcLogo (useAspectCorrection.ts): en mobile portrait el
  // FOV horizontal se reduce mucho más que el vertical, y las anclas X fijas
  // caían fuera del frustum (los 4 marcadores no se veían) — se acercan al
  // centro proporcionalmente en aspects angostos.
  const aspectFactor = useAspectCorrectionFactor();
  const frameRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const groupRefs = useRef<Record<string, THREE.Group | null>>({});
  const logoWorldPos = useRef(new THREE.Vector3(...LOGO_POSITION));
  const anchorScratch = useRef(new THREE.Vector3());
  const { headerRef, footerRef } = useHeaderFooterElements();

  // Diámetro del aro proyectado a píxeles de pantalla en el waypoint hero —
  // usado solo como tamaño inicial antes del primer frame; ver useFrame para
  // el valor real, actualizado continuamente (badgeDiameter.ts).
  const initialBadgeDiameterPx = useMemo(
    () => getInitialBadgeDiameterPx(size.height, aspectFactor),
    [size.height, aspectFactor]
  );

  useFrame(() => {
    // Corrección de causa raíz (diagnóstico "insignias mal posicionadas/
    // gigantes en páginas de unidad"): igual que TmcLogo.tsx, el tamaño de
    // insignia se calculaba contra una distancia de cámara fija (la de
    // hero). Se recalcula aquí cada frame contra la distancia real
    // cámara→logo, aplicada directamente sobre el DOM vía ref (sin pasar por
    // estado de React — mismo principio que HotspotArcs.tsx aplica a las
    // posiciones de los arcos, necesario porque la distancia cambia
    // continuamente durante el scroll, no solo entre waypoints).
    const diameterPx = getBadgeDiameterPx(initialBadgeDiameterPx, camera, logoWorldPos.current);
    for (const el of Object.values(frameRefs.current)) {
      if (el) {
        el.style.width = `${diameterPx}px`;
        el.style.height = `${diameterPx}px`;
      }
    }

    // Reposiciona cada insignia si su anchor fijo se proyecta dentro de la
    // franja real del header/footer (ver correctedHotspotAnchor.ts) — igual
    // que el tamaño arriba, depende de la cámara real de cada frame, no
    // puede vivir en una prop/estado de React. markerRadiusPx usa el
    // diámetro real de ESTE frame (arriba), no el inicial — la insignia
    // completa (no solo su centro) es lo que no debe invadir el header/footer.
    const headerBottomPx = headerRef.current?.getBoundingClientRect().bottom ?? 0;
    const footerTopPx = footerRef.current?.getBoundingClientRect().top ?? size.height;
    for (const hotspot of hotspots) {
      const group = groupRefs.current[hotspot.id];
      if (!group) continue;
      const { position, opacity } = getCorrectedHotspotAnchor({
        anchor: hotspot.anchor,
        aspectFactor,
        logoY: LOGO_POSITION[1],
        camera,
        viewportHeight: size.height,
        headerBottomPx,
        footerTopPx,
        markerRadiusPx: diameterPx / 2,
        scratch: anchorScratch.current,
      });
      group.position.set(...position);
      // Residual tras el piso anti-colisión-con-el-aro (ver
      // correctedHotspotAnchor.ts): la insignia no puede alejarse más del
      // header/footer sin encimarse con el logo, así que se atenúa en vez de
      // quedar a opacidad completa sobre el header/footer — solo ocurre en
      // ese tramo puntual, el resto del tiempo opacity=1.
      const button = buttonRefs.current[hotspot.id];
      if (button) button.style.opacity = String(opacity);
    }
  });

  return (
    <>
      {hotspots.map((hotspot) => {
        const waypoint = waypoints.find((w) => w.id === hotspot.id);
        if (!waypoint) return null;
        const isActive = activeWaypointId === hotspot.id;
        // Posición inicial (primer paint/SSR) sin compresión — useFrame la
        // corrige cada frame contra la cámara real en cuanto arranca el loop.
        const initialAnchor: [number, number, number] = [
          hotspot.anchor[0] * aspectFactor,
          hotspot.anchor[1],
          hotspot.anchor[2],
        ];
        return (
          <group
            key={hotspot.id}
            ref={(el) => {
              groupRefs.current[hotspot.id] = el;
            }}
            position={initialAnchor}
          >
            <Html center occlude={false} zIndexRange={[10, 0]}>
              <button
                type="button"
                className="hotspotMarker"
                ref={(el) => {
                  buttonRefs.current[hotspot.id] = el;
                }}
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
                  ref={(el) => {
                    frameRefs.current[hotspot.id] = el;
                  }}
                  unitId={hotspot.id}
                  label={hotspot.label}
                  tagline={hotspot.message}
                  active={isActive}
                  diameterPx={initialBadgeDiameterPx}
                />
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}
