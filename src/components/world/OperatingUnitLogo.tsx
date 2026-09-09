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

import Image from "next/image";
import { tmcAssets } from "@/config/tmcAssets";

type OperatingUnitId = keyof typeof tmcAssets.operatingUnitLogos;

interface OperatingUnitLogoProps {
  unitId: string;
  label: string;
  tagline: string;
  active?: boolean;
}

export function OperatingUnitLogo({ unitId, label, tagline, active = false }: OperatingUnitLogoProps) {
  const src = tmcAssets.operatingUnitLogos[unitId as OperatingUnitId];
  if (!src) return null;

  return (
    <span className={`unitLogo${active ? " unitLogo--active" : ""}`}>
      <span className="unitLogo__frame">
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
