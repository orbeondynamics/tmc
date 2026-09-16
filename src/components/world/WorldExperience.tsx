"use client";

// Bloque 1 (MVP) — orquestador cliente principal (Master Handoff sección
// 9.3, CERRADO). Mantiene: Canvas 3D, Lenis + GSAP como único reloj de
// scroll (sección 6.1), intro cinematográfica con scroll bloqueado (sección
// 7), detección WebGL/reduced-motion con fallback semántico (sección 10).
//
// Cambio de alcance: las 4 páginas de unidad dejan de ser parte del mundo
// 3D (ahora son páginas estáticas, ver StaticUnitPage.tsx) — este componente
// ya NO es persistente entre todas las rutas, solo existe en home
// (HomeWorldGate.tsx lo monta/desmonta según la ruta). El Canvas se
// remonta fresco cada vez que se vuelve a "/", lo cual es correcto: no hay
// estado de cámara/scroll que deba sobrevivir una visita a una unidad.

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { WorldProvider, useWorld } from "@/lib/world/WorldContext";
import { waypoints } from "@/lib/world/waypoints";
import { pathToWaypointId } from "@/lib/world/pathToWaypointId";
import { isWebGLAvailable } from "@/lib/world/webgl-detect";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useClientOnlyValue } from "@/hooks/useClientOnlyValue";
import { track } from "@/lib/analytics/track";
import type { SiteContent } from "@/lib/content/SiteContent";
import { WorldCanvas } from "./WorldCanvas";
import { Hotspots } from "./Hotspots";
import { IntroSequence } from "./IntroSequence";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { HomeContentPanel } from "@/components/ui/HomeContentPanel";

gsap.registerPlugin(useGSAP);

const SCROLL_SPACER_VH = 500;

function ScrollDriver() {
  const { progressRef, lenisRef, introComplete, initialWaypointId, setActiveWaypointId, pendingRouteRef } =
    useWorld();
  const pathname = usePathname();

  useEffect(() => {
    // Corrección de causa raíz (defecto REDTEAM, back button dejaba el
    // scroll real desincronizado incluso con el salto de abajo): confirmado
    // con instrumentación que lenis.scrollTo(0,{immediate:true}) SÍ llevaba
    // window.scrollY a 0 al ejecutarse, pero volvía a 900 poco después — el
    // restauro automático de scroll del navegador en popstate (asociado al
    // historial de esta SPA vía history.pushState) se dispara de forma
    // asíncrona y pisa el salto de Lenis. Desactivarlo es la técnica
    // estándar para apps con scroll animado/virtualizado propio (Lenis ya
    // es la única fuente de verdad del scroll, sección 6).
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;

    const onScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
      progressRef.current.t = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
    };
    lenis.on("scroll", onScroll);

    // Entrada directa a una ruta (deep link) → posicionar el scroll real (no
    // solo el ref) en el waypoint correspondiente, sin animación, para que
    // scroll real y progreso converjan desde el primer frame (sección 6).
    const waypoint = waypoints.find((w) => w.id === initialWaypointId);
    if (waypoint && waypoint.scrollProgress > 0 && lenis.limit > 0) {
      lenis.scrollTo(waypoint.scrollProgress * lenis.limit, { immediate: true });
    }

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    let rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (introComplete) lenis.start();
    else lenis.stop();
  }, [introComplete, lenisRef]);

  // Corrección de causa raíz (defecto REDTEAM "la URL no cambia / el panel no
  // corresponde a la unidad correcta"): activeWaypointId solo se actualizaba
  // desde el onComplete del click en un hotspot/logo Home/PRIVATE INQUIRY —
  // un cambio de ruta que NO pasa por esos handlers (botón atrás/adelante del
  // navegador, editar la URL a mano) cambiaba el pathname real pero dejaba
  // activeWaypointId y el scroll real apuntando a la unidad anterior
  // (confirmado: back button dejaba la URL en "/" con el panel de Cleaners
  // todavía montado y la cámara todavía en su waypoint). pendingRouteRef
  // (ver WorldContext.tsx) distingue un cambio de ruta interno — ya
  // manejado por su propio click, con su propia animación — de uno externo,
  // que se sincroniza aquí de inmediato (sin animar, igual que el salto de
  // deep-link inicial arriba).
  const isFirstPathnameRun = useRef(true);
  useEffect(() => {
    if (isFirstPathnameRun.current) {
      isFirstPathnameRun.current = false;
      return;
    }
    if (pendingRouteRef.current === pathname) {
      pendingRouteRef.current = null;
      return;
    }
    pendingRouteRef.current = null;
    const waypointId = pathToWaypointId(pathname);
    setActiveWaypointId(waypointId);
    const lenis = lenisRef.current;
    const waypoint = waypoints.find((w) => w.id === waypointId);
    if (lenis && waypoint) {
      // force:true — Lenis se saltaría este scrollTo si isStopped es true en
      // ese instante (p.ej. justo tras el gesto de "atrás" del navegador).
      lenis.scrollTo(waypoint.scrollProgress * lenis.limit, { immediate: true, force: true });
    }
  }, [pathname, pendingRouteRef, setActiveWaypointId, lenisRef]);

  return <div style={{ height: `${SCROLL_SPACER_VH}vh` }} aria-hidden="true" />;
}

function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    track({ name: "page_view", route: pathname });
  }, [pathname]);
  return null;
}

function ExperienceInner({ siteContent }: { siteContent: SiteContent }) {
  return (
    <>
      <PageViewTracker />
      <ScrollDriver />
      <div className="worldFixedLayer">
        <WorldCanvas />
        {/* Hotspots (las 4 insignias) vive FUERA del Canvas a propósito
            (rediseño de arquitectura, ver Hotspots.tsx): overlay HTML puro
            posicionado por CSS, no un <group>/<Html> 3D. */}
        <Hotspots />
        <Header overlays={siteContent.headerOverlays} />
        <HomeContentPanel
          sections={siteContent.homeNarrativeSections}
          standard={siteContent.tmcStandardContent}
          miami={siteContent.miamiContent}
          privateInquiry={siteContent.privateInquiryContent}
        />
        {/* UnitContentPanel se retiró de aquí (cambio de alcance): con el
            click de un hotspot ahora navegando recién en el onComplete del
            vuelo (ver Hotspots.tsx), activeWaypointId nunca llega a valer el
            id de una unidad mientras seguimos en home — el cambio de ruta a
            la página estática de esa unidad ocurre en el mismo instante. Ese
            panel ya no tenía ningún momento real en el que mostrarse. */}
        <Footer
          aboutUs={siteContent.aboutUsContent}
          contact={siteContent.contactContent}
          social={siteContent.socialContent}
          culture={siteContent.cultureContent}
          socialChannels={siteContent.socialChannels}
        />
        <IntroSequence />
      </div>
    </>
  );
}

export function WorldExperience({ siteContent }: { siteContent: SiteContent }) {
  const prefersReducedMotion = useReducedMotion();
  // Server siempre ve `false` (sin WebGL) → coincide con el fallback semántico ya
  // servido; el cliente resuelve el valor real en su primer render, sin efecto.
  const webglOk = useClientOnlyValue(isWebGLAvailable, false);

  if (!webglOk) return null; // sin WebGL: se mantiene el fallback semántico servido por Next

  return (
    <WorldProvider>
      <div className="worldRoot" data-reduced-motion={prefersReducedMotion ? "true" : "false"}>
        <ExperienceInner siteContent={siteContent} />
      </div>
    </WorldProvider>
  );
}
