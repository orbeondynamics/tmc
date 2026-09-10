"use client";

// Footer de cuatro bloques (Master Handoff sección 5.5, CERRADO). Cada bloque
// abre su overlay con el contenido completo aprobado. Copy recibido como
// prop desde WorldExperience — resuelto server-side en layout.tsx a partir
// de content/tmc-world/footer.md (fuente principal), con fallback a
// src/config/tmcContent.ts si el archivo falta. URLs de Social todavía no
// definidas (sección 24) — se listan los canales como texto, sin href
// inventado.

import { useState } from "react";
import type { OverlaySection } from "@/config/tmcContent";
import { Overlay } from "./Overlay";
import { SocialIcon } from "./SocialIcon";

interface FooterProps {
  aboutUs: OverlaySection;
  contact: OverlaySection;
  social: OverlaySection;
  culture: OverlaySection;
  socialChannels: { id: string; label: string }[];
}

export function Footer({ aboutUs, contact, social, culture, socialChannels }: FooterProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const blocks: { section: OverlaySection; short: string }[] = [
    { section: aboutUs, short: "About Us" },
    { section: contact, short: "Contact" },
    { section: social, short: "Social" },
    { section: culture, short: "The TMC Culture" },
  ];
  const active = blocks.find((b) => b.section.id === openId)?.section ?? null;

  return (
    <>
      <footer className="tmcFooter">
        {blocks.map(({ section, short }) => (
          <button
            key={section.id}
            type="button"
            className="tmcFooter__block"
            onClick={() => setOpenId(section.id)}
          >
            <span className="tmcFooter__heading">{short}</span>
            <span className="tmcFooter__hint">{section.framing}</span>
            {/* Prompt maestro sección 6.2: "el bloque SOCIAL usa íconos de
                marca... en vez de solo texto" — antes los íconos solo
                aparecían dentro del overlay (tras hacer click); ahora el
                bloque del footer ya los muestra directamente. */}
            {section.id === "social" && (
              <span className="tmcFooter__socialIcons" aria-hidden="true">
                {socialChannels.map((channel) => (
                  <SocialIcon key={channel.id} channelId={channel.id} />
                ))}
              </span>
            )}
          </button>
        ))}
      </footer>

      {active && (
        <Overlay
          section={active}
          onClose={() => setOpenId(null)}
          showSocialChannels={active.id === "social"}
          socialChannels={socialChannels}
        />
      )}
    </>
  );
}
