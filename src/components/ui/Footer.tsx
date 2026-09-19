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
  socialChannels: { id: string; label: string; href?: string }[];
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
        {blocks.map(({ section, short }) => {
          const text = (
            <>
              <span className="tmcFooter__heading">{short}</span>
              <span className="tmcFooter__hint">{section.framing}</span>
            </>
          );
          if (section.id !== "social") {
            return (
              <button
                key={section.id}
                type="button"
                className="tmcFooter__block"
                onClick={() => setOpenId(section.id)}
              >
                {text}
              </button>
            );
          }
          // Prompt maestro sección 6.2: "el bloque SOCIAL usa íconos de
          // marca... en vez de solo texto". Los íconos son destinos directos
          // (sin abrir el overlay), y un <a> no puede ir dentro de un <button>:
          // el bloque pasa a ser un contenedor con el mismo estilo, el texto
          // sigue siendo el <button> que abre el overlay (acceso por teclado) y
          // los íconos quedan como hermanos. El click en cualquier otra parte
          // del bloque sigue abriendo el overlay, como antes.
          return (
            <div
              key={section.id}
              className="tmcFooter__block"
              onClick={() => setOpenId(section.id)}
            >
              <button type="button" className="tmcFooter__open">
                {text}
              </button>
              <span className="tmcFooter__socialIcons">
                {socialChannels.map((channel) => {
                  const icon = <SocialIcon channelId={channel.id} />;
                  // Solo hay enlace cuando social-links.md trae un destino
                  // válido (ver tmcContentSource.ts); con placeholders el ícono
                  // queda sin enlace ni navegación. El mailto: ya viene completo
                  // del archivo.
                  if (!channel.href) return <span key={channel.id} className="tmcFooter__socialIcon">{icon}</span>;
                  return (
                    <a
                      key={channel.id}
                      className="tmcFooter__socialIcon"
                      href={channel.href}
                      aria-label={channel.label}
                      onClick={(e) => e.stopPropagation()}
                      {...(channel.href.startsWith("mailto:")
                        ? {}
                        : { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {icon}
                    </a>
                  );
                })}
              </span>
            </div>
          );
        })}
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
