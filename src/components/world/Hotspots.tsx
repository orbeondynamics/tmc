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
import { computeComposition, getHotspotWorldPosition } from "@/lib/world/hotspotComposition";
import { useHeaderFooterElements } from "@/lib/world/useHeaderFooterBounds";
import { getInitialBadgeDiameterPx, getBadgeDiameterPx } from "@/lib/world/badgeDiameter";
import { track } from "@/lib/analytics/track";
import { LOGO_POSITION } from "./TmcLogo";
import { OperatingUnitLogo } from "./OperatingUnitLogo";

/** Debe coincidir con el `margin-top` de `.unitLogo__tagline` en
 * globals.css — la separación real entre el borde inferior del aro y el
 * tagline, medida en vivo por lo demás (ver taglineClearancePx). */
const TAGLINE_GAP_PX = 6;

export function Hotspots() {
  const router = useRouter();
  const { lenisRef, activeWaypointId, setActiveWaypointId, pendingRouteRef } = useWorld();
  const { size, camera } = useThree();
  // Cambio de alcance (páginas de unidad ya no montan el mundo 3D — ver
  // HomeWorldGate.tsx): este componente solo se renderiza en home, así que
  // ya no hace falta filtrar por ruta — siempre se ven las 4 insignias.
  // Mismo factor que TmcLogo (useAspectCorrection.ts): en mobile portrait el
  // FOV horizontal se reduce mucho más que el vertical, y las anclas X fijas
  // caían fuera del frustum (los 4 marcadores no se veían) — se acercan al
  // centro proporcionalmente en aspects angostos.
  const aspectFactor = useAspectCorrectionFactor();
  const frameRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const groupRefs = useRef<Record<string, THREE.Group | null>>({});
  const logoWorldPos = useRef(new THREE.Vector3(...LOGO_POSITION));
  const compositionScratch = useRef(new THREE.Vector3());
  const unprojectScratchNear = useRef(new THREE.Vector3());
  const unprojectScratchFar = useRef(new THREE.Vector3());
  const warnedInsufficientSpace = useRef(false);
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
    // estado de React, necesario porque la distancia cambia continuamente
    // durante el scroll, no solo entre waypoints).
    const diameterPx = getBadgeDiameterPx(initialBadgeDiameterPx, camera, logoWorldPos.current);
    // Alto real del tagline (el mayor de las 4) medido en vivo cada frame —
    // el tagline vive fuera del flujo, justo debajo del aro (ver
    // globals.css .unitLogo__tagline y el comentario de taglineClearancePx
    // en hotspotComposition.ts): un texto que envuelve a más líneas en
    // ciertos anchos (ej. "Turning opportunities into execution.") no debe
    // poder quedar tapado por el footer, así que el margen contra el
    // footer se mide desde el borde inferior del tagline más largo, no
    // desde el borde del aro. `nextElementSibling` es el tagline: son
    // hermanos directos dentro de .unitLogo (ver OperatingUnitLogo.tsx).
    let maxTaglineHeightPx = 0;
    for (const el of Object.values(frameRefs.current)) {
      if (!el) continue;
      el.style.width = `${diameterPx}px`;
      el.style.height = `${diameterPx}px`;
      const tagline = el.nextElementSibling as HTMLElement | null;
      if (tagline) {
        maxTaglineHeightPx = Math.max(maxTaglineHeightPx, tagline.getBoundingClientRect().height);
      }
    }
    const taglineClearancePx = maxTaglineHeightPx > 0 ? maxTaglineHeightPx + TAGLINE_GAP_PX : 0;

    // Composición de 3 valores (hotspotComposition.ts, reemplaza por
    // completo al sistema anterior de empuje individual): se calcula UNA
    // vez por frame (origen = proyección real del logo + las 2
    // separaciones), no una vez por insignia — las 4 comparten el mismo
    // origen y las mismas separaciones por diseño. markerRadiusPx usa el
    // diámetro real de ESTE frame (arriba), no el inicial.
    const headerBottomPx = headerRef.current?.getBoundingClientRect().bottom ?? 0;
    const footerTopPx = footerRef.current?.getBoundingClientRect().top ?? size.height;
    const markerRadiusPx = diameterPx / 2;
    const composition = computeComposition({
      camera,
      logoPosition: LOGO_POSITION,
      viewportWidth: size.width,
      viewportHeight: size.height,
      headerBottomPx,
      footerTopPx,
      markerRadiusPx,
      taglineClearancePx,
      scratch: compositionScratch.current,
      scratchNear: unprojectScratchNear.current,
      scratchFar: unprojectScratchFar.current,
    });

    if (composition.insufficientVerticalSpace && !warnedInsufficientSpace.current) {
      // Caso extremo genuino (viewport demasiado bajo para header+conjunto+
      // footer sin comprimir sin importar la separación usada) — se reporta
      // explícitamente en vez de forzar una composición con insignias
      // encimadas entre sí. Validado (script de la sesión, 31 combinaciones):
      // aparece únicamente en mobile landscape de poca altura y en ventanas
      // de escritorio muy bajas (~500px de alto o menos) — reportado al
      // dueño del proyecto como caso extremo, no corregido ad hoc.
      warnedInsufficientSpace.current = true;
      console.warn(
        `[Hotspots] Espacio vertical insuficiente en ${size.width}x${size.height} — separacionVertical calculada no alcanza para separar filas sin overlap. Reportar como caso extremo.`
      );
    }

    for (const hotspot of hotspots) {
      const group = groupRefs.current[hotspot.id];
      if (!group) continue;
      const { position } = getHotspotWorldPosition(
        composition,
        hotspot.quadrant,
        camera,
        size.width,
        size.height,
        unprojectScratchNear.current,
        unprojectScratchFar.current
      );
      group.position.set(...position);
      // Ya no hace falta atenuar por opacidad: la composición garantiza,
      // por construcción, que ninguna insignia invade header/footer/aro —
      // no hay residual que disimular (ver hotspotComposition.ts).
      const button = buttonRefs.current[hotspot.id];
      if (button) button.style.opacity = "1";
    }
  });

  return (
    <>
      {hotspots.map((hotspot) => {
        const waypoint = waypoints.find((w) => w.id === hotspot.id);
        if (!waypoint) return null;
        const isActive = activeWaypointId === hotspot.id;
        // Posición inicial (primer paint/SSR): arranca en el logo mismo —
        // useFrame calcula la posición real (composición de 3 valores) en
        // cuanto arranca el loop de render, antes de que el usuario llegue
        // a verlo. Ya no depende de un anchor de mundo fijo (ver
        // hotspotComposition.ts).
        return (
          <group
            key={hotspot.id}
            ref={(el) => {
              groupRefs.current[hotspot.id] = el;
            }}
            position={LOGO_POSITION}
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
                  // Cambio de alcance: la página de destino ya no es parte del
                  // mundo 3D — navegar de inmediato (como antes) cortaría el
                  // vuelo de cámara a medio camino, porque el cambio de ruta
                  // desmonta el mundo entero (ver HomeWorldGate.tsx). El push
                  // se difiere al onComplete del vuelo para conservar la
                  // transición cinematográfica ya aprobada; al llegar, se
                  // cambia a la página estática de esa unidad.
                  navigateToWaypoint({
                    waypoint,
                    lenisRef,
                    onComplete: () => {
                      setActiveWaypointId(hotspot.id);
                      pendingRouteRef.current = hotspot.route;
                      // Sin scroll:false aquí a propósito (a diferencia del
                      // resto de la navegación de este proyecto): el destino
                      // ya no es parte del mundo 3D con scroll continuo, es
                      // una página estática aparte (StaticUnitPage.tsx) — sin
                      // esto, heredaba el scrollY que traía el vuelo de
                      // cámara (bug real: aterrizaba a mitad del panel en vez
                      // de arriba). Next.js debe resetear el scroll como en
                      // cualquier navegación normal.
                      router.push(hotspot.route);
                    },
                  });
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
