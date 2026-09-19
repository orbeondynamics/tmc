"use client";

// Panel de overlay institucional compartido — usado por Header (5 overlays,
// sección 15) y Footer (About Us / Contact / Social / Culture, sección 22-26).
// Antes duplicado inline en cada componente; se extrae aquí para no repetir
// el markup/CSS y para soportar cuerpo multi-párrafo (OverlaySection.body[]).
//
// Accesibilidad (bug real detectado en QA de teclado): al abrir, el foco se
// quedaba en el botón del nav de fondo — Tab recorría el resto del header en
// vez de entrar al diálogo, y Escape no cerraba nada. Un role="dialog" debe
// recibir el foco al abrir y atraparlo mientras esté abierto (WAI-ARIA
// Dialog Pattern).

import { useEffect, useRef } from "react";
import type { OverlaySection } from "@/config/tmcContent";
import { socialChannels as fallbackSocialChannels } from "@/config/tmcContent";
import { SocialIcon } from "./SocialIcon";

interface OverlayProps {
  section: OverlaySection;
  onClose: () => void;
  /** Solo el overlay de Social lista los canales (sección 24). */
  showSocialChannels?: boolean;
  /** Canales a listar cuando showSocialChannels=true — viene de footer.md (Footer.tsx). */
  socialChannels?: readonly { id: string; label: string }[];
}

export function Overlay({
  section,
  onClose,
  showSocialChannels = false,
  socialChannels = fallbackSocialChannels,
}: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="tmcOverlay" role="presentation" data-lenis-prevent>
      {/* Fase 2 (Puntos 2 y 4): .tmcOverlay__frame es el contenedor de
          tamaño/diálogo — hermano-padre del control de cierre y del panel
          visual (.tmcOverlay__panel, que lleva mask-image y recortaría
          cualquier cosa fuera de su caja). Así el botón puede vivir fuera
          del bounding box del panel sin perder foco/trampa de Tab. */}
      <div
        ref={panelRef}
        className="tmcOverlay__frame"
        role="dialog"
        aria-modal="true"
        aria-label={section.label}
      >
        {/* Hallazgo 17/18 (Grupo C): antes el botón de cierre vivía DENTRO
            del mismo contenedor con overflow-y:auto que el contenido — al
            scrollear un overlay largo, el control para cerrar/volver
            desaparecía de la vista. Ahora es hermano del área scrolleable,
            no su hijo, así que .tmcOverlay__panel ya no scrollea (el
            scroll vive en .tmcOverlay__scroll) y el botón queda fijo
            arriba a la izquierda siempre, con o sin scroll. */}
        <button
          ref={closeRef}
          type="button"
          className="tmcOverlay__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="tmcOverlay__panel">
          <div className="tmcOverlay__scroll">
            <p className="tmcOverlay__eyebrow">{section.label}</p>
            <h2 className="tmcOverlay__title">{section.framing}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="tmcOverlay__body">
                {paragraph}
              </p>
            ))}
            {showSocialChannels && (
              <ul className="tmcOverlay__channels">
                {socialChannels.map((channel) => (
                  <li key={channel.id} className="tmcOverlay__channel">
                    <SocialIcon channelId={channel.id} />
                    {channel.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
