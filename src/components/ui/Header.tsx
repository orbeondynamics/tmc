"use client";

// Bloque 1 (MVP) — header corporativo (Master Handoff sección 5.3, CERRADO).
// Los 5 elementos abren overlays/paneles; NO son waypoints y NO usan
// navegación espacial de cámara. El logo Home pequeño (5.4) vuelve a "/".
// Copy recibido como prop desde WorldExperience — resuelto server-side en
// layout.tsx a partir de content/tmc-world/our-*.md (fuente principal), con
// fallback a src/config/tmcContent.ts si un archivo falta.

import { useState } from "react";
import { useRouter } from "next/navigation";
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
            // interna antes del push.
            pendingRouteRef.current = "/";
            router.push("/", { scroll: false });
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
            navigateToWaypoint({
              waypoint: heroWaypoint,
              lenisRef,
              onComplete: () => setActiveWaypointId("hero"),
            });
            pendingRouteRef.current = "/";
            router.push("/", { scroll: false });
            setHomePanelOpen(true);
            // El panel de Home (HomeContentPanel) tarda un frame en montar
            // tras abrirse — se espera antes de desplazar el scroll interno
            // del panel hasta la sección Private Inquiry.
            requestAnimationFrame(() => {
              document
                .getElementById("private-inquiry")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        >
          PRIVATE INQUIRY
        </button>
      </header>

      {active && <Overlay section={active} onClose={() => setOpenId(null)} />}
    </>
  );
}
