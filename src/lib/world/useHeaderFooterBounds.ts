"use client";

// Referencias en vivo al <header> y <footer> del DOM — usadas por
// hotspotComposition.ts para saber, cada frame, dónde caen esas franjas
// en píxeles de pantalla (ver ese archivo para el porqué). El elemento en sí
// no cambia durante la vida de la página, así que se resuelve una sola vez
// aquí; la medición real (getBoundingClientRect, que sí cambia con
// responsive/scroll) se hace en el llamador dentro de useFrame.

import { useEffect, useRef } from "react";

export function useHeaderFooterElements() {
  const headerRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    headerRef.current = document.querySelector("header");
    footerRef.current = document.querySelector("footer");
  }, []);

  return { headerRef, footerRef };
}
