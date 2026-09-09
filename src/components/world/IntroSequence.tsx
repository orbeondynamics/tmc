"use client";

// Bloque 1 (MVP) — intro cinematográfica 0–15s (Master Handoff sección 7,
// CERRADO). Durante la intro el scroll no controla la cámara (sección 6).
// Skip Intro discreto abajo a la derecha + memoria de sesión (sessionStorage,
// sección 7.2). `introComplete` ya llega resuelto desde WorldContext (ver
// computeInitialIntroComplete) — si ya era `true` al montar, este componente
// no renderiza nada ni arranca el timeline.

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useWorld, markIntroSeen } from "@/lib/world/WorldContext";

export function IntroSequence() {
  const { introComplete, setIntroComplete } = useWorld();
  const rootRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (introComplete) return;

      const tl = gsap.timeline({ onComplete: finishIntro });
      timelineRef.current = tl;

      // 0–2s: stillness
      tl.set(posterRef.current, { opacity: 1 });
      // 2–5s: world breathes — el poster se disuelve y revela el Canvas vivo detrás
      tl.to(posterRef.current, { opacity: 0, duration: 3, ease: "power1.inOut" }, 2);
      // 5–8s: TMC emerges
      tl.fromTo(
        wordmarkRef.current,
        { opacity: 0, scale: 0.85, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: 3, ease: "power2.out" },
        5
      );
      // 8–10s: transformation (micro-rotación/escala)
      tl.to(wordmarkRef.current, { rotateY: 8, scale: 1.05, duration: 1, ease: "power1.inOut" }, 8);
      tl.to(wordmarkRef.current, { rotateY: 0, scale: 1, duration: 1, ease: "power1.inOut" }, 9);
      // 10–12s: pausa deliberada — el reveal de marca en este beat era "THE
      // MONEY COMPANY" (Master Handoff sección 7.1, ya corregido por la
      // Regla de Marca Pública, sección 2.1 del prompt maestro). El wordmark
      // "TMC" ya cumple ese reveal desde el beat anterior (5–8s); repetir
      // "TMC" aquí debajo del propio wordmark leía como una duplicación
      // visual, así que este beat se deja como silencio antes de la promesa.
      // 12–15s: YOUR WORLD. HANDLED.
      tl.fromTo(
        taglineRef.current?.querySelector(".intro__line--promise") ?? null,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 3, ease: "power1.out" },
        12
      );
      // 15s+: EXPLORE
      tl.fromTo(exploreRef.current, { opacity: 0 }, { opacity: 1, duration: 1 }, 15);
      tl.to(rootRef.current, { opacity: 0, duration: 1.2, pointerEvents: "none" }, 17.5);
    },
    { dependencies: [introComplete], scope: rootRef }
  );

  function finishIntro() {
    markIntroSeen();
    setIntroComplete(true);
  }

  function handleSkip() {
    timelineRef.current?.kill();
    if (rootRef.current) {
      rootRef.current.style.opacity = "0";
      rootRef.current.style.pointerEvents = "none";
    }
    finishIntro();
  }

  if (introComplete) return null;

  return (
    <div ref={rootRef} className="introRoot">
      <div
        ref={posterRef}
        className="introPoster"
        style={{ backgroundImage: "url(/assets/tmc-world-master-background.webp)" }}
      />
      <div className="introContent">
        <div ref={wordmarkRef} className="intro__wordmark">TMC</div>
        <div ref={taglineRef} className="intro__tagline">
          <div className="intro__line intro__line--promise">YOUR WORLD. HANDLED.</div>
        </div>
        <div ref={exploreRef} className="intro__explore">EXPLORE ↓</div>
      </div>
      <button type="button" className="skipIntro" onClick={handleSkip}>
        Skip Intro
      </button>
    </div>
  );
}
