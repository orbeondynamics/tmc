"use client";

// TMC World — logo oficial de una operating unit (Master Handoff sección 11,
// CERRADO). Los 4 PNG (tmc-luxury.png, tmc-transport.png, tmc-cleaners.png,
// tmc-project-office.png) son archivos reales entregados en
// public/assets/tmc-world/ — se usan tal cual, sin recolorear ni aplicar
// filtros sobre la imagen. El estado hover/activo se resuelve en el
// contenedor (glow + escala), nunca modificando los píxeles del PNG.
//
// Corrige el reemplazo anterior de esta tarea (OperatingUnitMark.tsx, un
// marcador de texto+aro): esa sustitución fue un error — los 4 logos oficiales
// sí existen en el repo y deben usarse directamente.
//
// Tagline (prompt maestro sección 6.2, calibrado sobre tmc-website-base.png):
// cada insignia lleva su tagline de una sola línea debajo — texto ya
// aprobado (hotspot.message en hotspots.config.ts), no copy nuevo. El PNG
// oficial no se toca; el tagline es un elemento HTML aparte, no se hornea
// en la imagen.

import { forwardRef } from "react";
import Image from "next/image";
import { tmcAssets } from "@/config/tmcAssets";

type OperatingUnitId = keyof typeof tmcAssets.operatingUnitLogos;

interface OperatingUnitLogoProps {
  unitId: string;
  label: string;
  tagline: string;
  active?: boolean;
  /** Diámetro inicial en píxeles CSS (primer render/SSR). El tamaño real se
   * mantiene actualizado después vía `frameRef` (ver Hotspots.tsx) — cambia
   * con la distancia real cámara↔logo, que varía continuamente durante el
   * scroll, así que no puede vivir en una prop/estado de React sin
   * re-renderizar 60 veces por segundo (mismo principio que
   * HotspotArcs.tsx aplica a las posiciones de los arcos). */
  diameterPx?: number;
}

export const OperatingUnitLogo = forwardRef<HTMLSpanElement, OperatingUnitLogoProps>(
  function OperatingUnitLogo({ unitId, label, tagline, active = false, diameterPx }, frameRef) {
    const src = tmcAssets.operatingUnitLogos[unitId as OperatingUnitId];
    if (!src) return null;

    const frameStyle = diameterPx ? { width: diameterPx, height: diameterPx } : undefined;

    return (
      <span className={`unitLogo${active ? " unitLogo--active" : ""}`}>
        <span ref={frameRef} className="unitLogo__frame" style={frameStyle}>
          <Image
            src={src}
            alt={label}
            width={144}
            height={144}
            className="unitLogo__img"
            draggable={false}
          />
        </span>
        <span className="unitLogo__tagline">{tagline}</span>
      </span>
    );
  }
);
