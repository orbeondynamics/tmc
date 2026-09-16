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

  // Extraído (antes vivía solo en el onClick del logo): el nuevo enlace de
  // texto "← Back to TMC" (Bug 5, página de unidad) necesita EXACTAMENTE el
  // mismo comportamiento que el logo — no un atajo aparte que pueda
  // desincronizarse si uno de los dos cambia en el futuro. Fuera de home
  // (páginas de unidad) useWorld() degrada a no-ops (WorldContext.tsx), así
  // que navigateToWaypoint/setActiveWaypointId ahí no hacen nada real — el
  // efecto práctico es equivalente a un router.push("/") simple, pero se
  // mantiene la llamada completa para que el comportamiento sea IDÉNTICO
  // si algún día esto se usa también dentro del mundo 3D.
  function goHome() {
    navigateToWaypoint({
      waypoint: heroWaypoint,
      lenisRef,
      onComplete: () => setActiveWaypointId("hero"),
    });
    // Ver comentario en Hotspots.tsx: marca esta navegación como interna
    // antes del push. Sin scroll:false — se usa también desde una página
    // de unidad (Header vive ahí también, ver StaticUnitPage.tsx), que no
    // es parte del mundo 3D y sí necesita el reset de scroll normal de
    // Next.js al volver a home.
    pendingRouteRef.current = "/";
    router.push("/");
  }

  return (
    <>
      <header className="tmcHeader">
        <div className="tmcHeader__brand">
          <button type="button" className="tmcHeader__home" aria-label="TMC World — Home" onClick={goHome}>
            TMC
          </button>
          {/* Bug 5: "no hay forma clara de volver a home" desde una unidad —
              el logo YA navegaba a "/" (confirmado arriba, sin cambios), pero
              no se leía como un control de navegación. Este enlace de texto
              coexiste con el logo (las 2 formas pedidas), solo en páginas de
              unidad (pathname !== "/" — en home ya estamos ahí, no aplica). */}
          {pathname !== "/" && (
            <button type="button" className="tmcHeader__backLink" onClick={goHome}>
              ← Back to TMC
            </button>
          )}
        </div>
        {/* navGroup + 2 <nav> (en vez de un solo <nav> con los 5): en
            desktop, .tmcHeader__nav pasa a display:contents y ambos
            grupos se aplanan en .tmcHeader__navGroup — visualmente
            IDÉNTICO a los 5 en una sola fila centrada de siempre (mismo
            DOM order, mismo texto). En mobile (≤430px), .tmcHeader__nav
            recupera su propia caja (display:flex) para que cada grupo
            tenga un ancho independiente — la reestructuración mobile del
            header (logo+3 arriba, 2 en su fila, botón en la suya) necesita
            que el ancho de "3 items" no comparta track con el de "2 items",
            algo que un solo <nav> compartido no permite (ver globals.css). */}
        <div className="tmcHeader__navGroup">
          <nav className="tmcHeader__nav tmcHeader__nav--primary" aria-label="TMC — navegación corporativa">
            {headerOverlays.slice(0, 3).map((item) => (
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
          <nav className="tmcHeader__nav tmcHeader__nav--secondary" aria-label="TMC — navegación corporativa (continuación)">
            {headerOverlays.slice(3).map((item) => (
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
        </div>
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
