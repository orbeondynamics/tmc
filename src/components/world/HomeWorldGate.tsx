"use client";

// Cambio de alcance mayor (decidido por el dueño del proyecto): las 4
// páginas de unidad dejan de ser parte de la escena 3D — ahora son páginas
// estáticas normales (ver StaticUnitPage.tsx), sin cámara, sin logo 3D, sin
// hotspots. Solo el home ("/") conserva la experiencia 3D completa.
//
// `next/dynamic(..., { ssr: false })` en vez de un simple `if (pathname ===
// "/")` alrededor de <WorldExperience>: un `if` evita MONTAR el mundo 3D en
// rutas de unidad, pero el JS de WorldExperience (y transitivamente Three.js,
// R3F, drei, GSAP, Lenis) igual se DESCARGARÍA para esas rutas, porque
// layout.tsx es compartido por todas — el objetivo explícito de este cambio
// (aligerar la carga en celular) requiere que ese código ni siquiera se
// pida ahí. `dynamic` con `ssr:false` crea un chunk aparte que el navegador
// solo pide cuando este componente realmente renderiza <WorldExperience>.
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { SiteContent } from "@/lib/content/SiteContent";

const WorldExperience = dynamic(
  () => import("./WorldExperience").then((m) => m.WorldExperience),
  { ssr: false }
);

export function HomeWorldGate({ siteContent }: { siteContent: SiteContent }) {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <WorldExperience siteContent={siteContent} />;
}
