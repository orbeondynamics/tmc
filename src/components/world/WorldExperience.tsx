"use client";

// Bloque 1 (MVP) — orquestador cliente principal (Master Handoff sección
// 9.3, CERRADO). Mantiene: Canvas único y persistente, Lenis + GSAP como
// único reloj de scroll (sección 6.1), intro cinematográfica con scroll
// bloqueado (sección 7), detección WebGL/reduced-motion con fallback
// semántico (sección 10). Se monta una sola vez en el layout raíz para que
// el Canvas nunca se reinicie al navegar entre rutas (sección 5.1, CERRADO).

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { WorldProvider, useWorld } from "@/lib/world/WorldContext";
import { waypoints } from "@/lib/world/waypoints";
import { isWebGLAvailable } from "@/lib/world/webgl-detect";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useClientOnlyValue } from "@/hooks/useClientOnlyValue";
import { track } from "@/lib/analytics/track";
import type { SiteContent } from "@/lib/content/SiteContent";
import { WorldCanvas } from "./WorldCanvas";
import { IntroSequence } from "./IntroSequence";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { UnitContentPanel } from "@/components/ui/UnitContentPanel";
import { HomeContentPanel } from "@/components/ui/HomeContentPanel";

gsap.registerPlugin(useGSAP);

const SCROLL_SPACER_VH = 500;

function ScrollDriver() {
  const { progressRef, lenisRef, introComplete, initialWaypointId } = useWorld();

  useEffect(() => {
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
        <Header overlays={siteContent.headerOverlays} />
        <HomeContentPanel
          sections={siteContent.homeNarrativeSections}
          standard={siteContent.tmcStandardContent}
          miami={siteContent.miamiContent}
          privateInquiry={siteContent.privateInquiryContent}
        />
        <UnitContentPanel units={siteContent.operatingUnits} />
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
