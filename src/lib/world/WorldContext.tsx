"use client";

// Bloque 1 (MVP) — estado compartido del mundo (Master Handoff sección 9.4,
// CERRADO): progreso de scroll, hotspot activo, referencia a Lenis para que
// scroll y navegación directa converjan en la misma fuente (sección 6).
// El progreso de cámara (0..1) vive en un ref mutable, no en useState, porque
// cambia en cada frame — "nada que cambie 60 veces por segundo debe vivir en
// useState" (sección 9.4).
//
// El waypoint inicial se deriva de la ruta actual (usePathname) — el Canvas
// es único y persistente en el layout raíz (sección 5.1, CERRADO), así que
// esto se resuelve una sola vez por carga real de página, no por navegación
// interna (los clicks en hotspots navegan sin remontar, ver Hotspots.tsx).
//
// `introComplete` se resuelve una sola vez, en el inicializador perezoso de
// useState (se ejecuta durante el render, nunca en un efecto).

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { waypoints } from "./waypoints";
import { pathToWaypointId } from "./pathToWaypointId";

const INTRO_SESSION_KEY = "tmc-world-intro-seen";

function computeInitialIntroComplete(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(INTRO_SESSION_KEY) === "1") return true;
  } catch {
    /* sessionStorage no disponible — se ignora, no bloquea la experiencia */
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
  return false;
}

export interface ProgressRef {
  /** Progreso continuo [0,1] a lo largo de la curva de cámara. */
  t: number;
}

interface WorldContextValue {
  progressRef: React.MutableRefObject<ProgressRef>;
  lenisRef: React.MutableRefObject<Lenis | null>;
  /** Waypoint con el que arrancó esta carga de página (deep link). Solo para el salto inicial. */
  initialWaypointId: string;
  activeWaypointId: string;
  setActiveWaypointId: (id: string) => void;
  /** Ruta que un click interno (hotspot, logo Home, PRIVATE INQUIRY) acaba de
   * empujar con router.push — ScrollDriver la compara contra usePathname()
   * para distinguir "este cambio de ruta ya lo maneja el click" (scroll
   * animado + setActiveWaypointId en su propio onComplete) de un cambio de
   * ruta EXTERNO (atrás/adelante del navegador, editar la URL a mano): ese
   * caso no pasa por ningún handler propio y por eso quedaba desincronizado
   * (bug real: back button dejaba el panel de una unidad mostrado con la URL
   * ya en "/"). Ver ScrollDriver en WorldExperience.tsx. */
  pendingRouteRef: React.MutableRefObject<string | null>;
  introComplete: boolean;
  setIntroComplete: (v: boolean) => void;
  /** Panel de narrativa Home (HomeContentPanel) — colapsado por defecto; el
   * botón PRIVATE INQUIRY del header lo expande desde fuera del componente. */
  homePanelOpen: boolean;
  setHomePanelOpen: (v: boolean) => void;
}

const WorldContext = createContext<WorldContextValue | null>(null);

// Fuera de WorldProvider (páginas de unidad, estáticas — cambio de alcance:
// ya no montan el mundo 3D) — degrada a no-ops seguros en vez de lanzar, para
// que Header.tsx funcione sin cambios dentro y fuera del mundo 3D. El logo
// Home / PRIVATE INQUIRY siguen navegando bien (router.push no depende de
// esto); lo único que se pierde ahí afuera es la animación de cámara, que no
// tiene sentido sin mundo 3D montado.
const NOOP_REF: React.MutableRefObject<null> = { current: null };
function noop() {}
const DEGRADED_CONTEXT: WorldContextValue = {
  progressRef: { current: { t: 0 } },
  lenisRef: NOOP_REF,
  initialWaypointId: "hero",
  activeWaypointId: "hero",
  setActiveWaypointId: noop,
  pendingRouteRef: NOOP_REF,
  introComplete: true,
  setIntroComplete: noop,
  homePanelOpen: false,
  setHomePanelOpen: noop,
};

export function WorldProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [initialWaypointId] = useState(() => pathToWaypointId(pathname));
  const initial = waypoints.find((w) => w.id === initialWaypointId) ?? waypoints[0];
  const progressRef = useRef<ProgressRef>({ t: initial.scrollProgress });
  const lenisRef = useRef<Lenis | null>(null);
  const [activeWaypointId, setActiveWaypointId] = useState(initialWaypointId);
  const [introComplete, setIntroComplete] = useState(computeInitialIntroComplete);
  // Cambio de alcance (páginas de unidad ya no montan el mundo 3D): PRIVATE
  // INQUIRY desde una de esas páginas no puede abrir el panel in-place (no
  // hay panel ahí) — navega a home con ?inquiry=1 (ver Header.tsx). El valor
  // inicial de homePanelOpen se calcula acá (inicializador perezoso, no un
  // setState dentro de un efecto — regla react-hooks/set-state-in-effect);
  // el efecto de abajo solo se encarga de los efectos secundarios reales
  // (limpiar la URL, hacer scroll), no de setear este estado.
  const [homePanelOpen, setHomePanelOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("inquiry") === "1";
  });
  const pendingRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!homePanelOpen) return;
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("inquiry") !== "1") return;
    // Limpia el parámetro sin agregar una entrada nueva al historial — mismo
    // timing que el click in-place ya usaba para el scroll.
    window.history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => {
      document.getElementById("private-inquiry")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WorldContext.Provider
      value={{
        progressRef,
        lenisRef,
        initialWaypointId,
        activeWaypointId,
        setActiveWaypointId,
        pendingRouteRef,
        introComplete,
        setIntroComplete,
        homePanelOpen,
        setHomePanelOpen,
      }}
    >
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld() {
  const ctx = useContext(WorldContext);
  return ctx ?? DEGRADED_CONTEXT;
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
  } catch {
    /* sessionStorage no disponible — no bloquea la experiencia */
  }
}
