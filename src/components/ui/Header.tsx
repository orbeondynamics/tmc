"use client";

// Bloque 1 (MVP) — header corporativo (Master Handoff sección 5.3, CERRADO).
// Los 5 elementos abren overlays/paneles; NO son waypoints y NO usan
// navegación espacial de cámara. El logo Home pequeño (5.4) vuelve a "/".
// Copy recibido como prop desde WorldExperience — resuelto server-side en
// layout.tsx a partir de content/tmc-world/our-*.md (fuente principal), con
// fallback a src/config/tmcContent.ts si un archivo falta.

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { waypoints } from "@/lib/world/waypoints";
import { useWorld } from "@/lib/world/WorldContext";
import { navigateToWaypoint } from "@/lib/world/navigateToWaypoint";
import type { OverlaySection } from "@/config/tmcContent";
import { track } from "@/lib/analytics/track";
import { Overlay } from "./Overlay";

export function Header({ overlays: headerOverlays }: { overlays: OverlaySection[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = headerOverlays.find((item) => item.id === openId) ?? null;
  const router = useRouter();
  const pathname = usePathname();
  const { lenisRef, setActiveWaypointId, setHomePanelOpen, pendingRouteRef } = useWorld();
  const heroWaypoint = waypoints.find((w) => w.id === "hero")!;

  return (
    <>
      <header className="tmcHeader">
        <button
          type="button"
          className="tmcHeader__home"
          aria-label="TMC World — Home"
          onClick={() => {
            navigateToWaypoint({
              waypoint: heroWaypoint,
              lenisRef,
              onComplete: () => setActiveWaypointId("hero"),
            });
            // Ver comentario en Hotspots.tsx: marca esta navegación como
            // interna antes del push. Sin scroll:false — este botón también
            // se usa desde una página de unidad (Header vive ahí también,
            // ver StaticUnitPage.tsx), que no es parte del mundo 3D y sí
            // necesita el reset de scroll normal de Next.js al volver a home.
            pendingRouteRef.current = "/";
            router.push("/");
          }}
        >
          TMC
        </button>
        <nav className="tmcHeader__nav" aria-label="TMC — navegación corporativa">
          {headerOverlays.map((item) => (
            <button
              key={item.id}
              type="button"
              className="tmcHeader__navItem"
              aria-expanded={openId === item.id}
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="tmcHeader__inquiry"
          onClick={() => {
            track({ name: "cta_click", cta: "header_private_inquiry" });
            // Cambio de alcance (páginas de unidad ya no montan el mundo 3D):
            // si ya estamos en home, el mundo está montado y este mismo click
            // puede abrir el panel directo, igual que siempre. Si venimos de
            // una página de unidad no hay WorldProvider real ahí (useWorld()
            // degrada a no-ops) — se navega a home con ?inquiry=1 y el
            // WorldProvider recién montado lo detecta y abre el panel él
            // mismo (ver WorldContext.tsx).
            if (pathname === "/") {
              navigateToWaypoint({
                waypoint: heroWaypoint,
                lenisRef,
                onComplete: () => setActiveWaypointId("hero"),
              });
              pendingRouteRef.current = "/";
              router.push("/");
              setHomePanelOpen(true);
              // El panel de Home (HomeContentPanel) tarda un frame en montar
              // tras abrirse — se espera antes de desplazar el scroll interno
              // del panel hasta la sección Private Inquiry.
              requestAnimationFrame(() => {
                document
                  .getElementById("private-inquiry")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              });
            } else {
              router.push("/?inquiry=1");
            }
          }}
        >
          PRIVATE INQUIRY
        </button>
      </header>

      {active && <Overlay section={active} onClose={() => setOpenId(null)} />}
    </>
  );
}
