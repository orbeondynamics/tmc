"use client";

// Home — narrativa completa (evolución §8, Master §4.1 "Estructura
// conceptual del website"). Mismo patrón que UnitContentPanel: aparece
// superpuesto sobre el mundo persistente sin remontar el Canvas, solo
// mientras el waypoint activo es "hero" (ruta "/"). Copy recibido como prop
// desde WorldExperience — resuelto server-side en layout.tsx a partir de
// content/tmc-world/home.md (fuente principal; Miami y Private Inquiry no
// tienen archivo propio entre los 11 entregados, así que esas dos piezas
// siguen viniendo del fallback de src/config/tmcContent.ts).
// Hero/TMC Concept se resuelve con la propia escena 3D (waypoint hero); las
// 4 unidades tienen su propio UnitContentPanel por ruta.

import { useWorld } from "@/lib/world/WorldContext";
import type { HomeNarrativeSection } from "@/config/tmcContent";
import { PrivateInquiryForm } from "./PrivateInquiryForm";

interface HomeContentPanelProps {
  sections: HomeNarrativeSection[];
  standard: { eyebrow: string; values: string[] };
  miami: { eyebrow: string; title: string; body: string[] };
  privateInquiry: { eyebrow: string; title: string; body: string[]; flow: string[]; submitLabel: string };
}

export function HomeContentPanel({ sections, standard, miami, privateInquiry }: HomeContentPanelProps) {
  // Colapsado por defecto: el panel abierto cubría los marcadores TMC
  // Luxury/TMC Cleaners (cuadrante izquierdo) — bug real detectado en QA
  // visual. Además, un panel denso siempre abierto encima del hero 3D lee
  // como dashboard, no como sitio cinematográfico (evolución §14, punto
  // 192). Se revela bajo acción explícita del visitante — o desde el botón
  // PRIVATE INQUIRY del header (por eso el estado vive en WorldContext y no
  // localmente: Header necesita poder abrirlo desde fuera de este componente).
  const { activeWaypointId, homePanelOpen, setHomePanelOpen } = useWorld();

  if (activeWaypointId !== "hero") return null;

  if (!homePanelOpen) {
    return (
      <button
        type="button"
        className="homePanel__tab"
        onClick={() => setHomePanelOpen(true)}
        aria-expanded={false}
        aria-label="Discover TMC"
      >
        <span>DISCOVER TMC</span>
        <span className="homePanel__tabIcon" aria-hidden="true">
          ↓
        </span>
      </button>
    );
  }

  return (
    <aside className="homePanel" aria-label="TMC World">
      <button
        type="button"
        className="homePanel__close"
        onClick={() => setHomePanelOpen(false)}
        aria-label="Cerrar"
      >
        ×
      </button>
      <div className="homePanel__scroll" data-lenis-prevent>
        {sections.map((section) => (
          <section key={section.id} className="homePanel__section">
            <p className="homePanel__eyebrow">{section.eyebrow}</p>
            {section.title && <h2 className="homePanel__title">{section.title}</h2>}
            {section.body.map((paragraph) => (
              <p key={paragraph} className="homePanel__body">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section className="homePanel__section">
          <p className="homePanel__eyebrow">{standard.eyebrow}</p>
          <ul className="homePanel__standard">
            {standard.values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </section>

        <section className="homePanel__section">
          <p className="homePanel__eyebrow">{miami.eyebrow}</p>
          <h2 className="homePanel__title">{miami.title}</h2>
          {miami.body.map((paragraph) => (
            <p key={paragraph} className="homePanel__body">
              {paragraph}
            </p>
          ))}
        </section>

        <section className="homePanel__section homePanel__section--inquiry" id="private-inquiry">
          <p className="homePanel__eyebrow">{privateInquiry.eyebrow}</p>
          <h2 className="homePanel__title">{privateInquiry.title}</h2>
          {privateInquiry.body.map((paragraph) => (
            <p key={paragraph} className="homePanel__body">
              {paragraph}
            </p>
          ))}
          <ol className="homePanel__flow">
            {privateInquiry.flow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <PrivateInquiryForm submitLabel={privateInquiry.submitLabel} />
        </section>
      </div>
    </aside>
  );
}
