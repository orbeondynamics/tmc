// Server Component — fallback semántico/SEO de las 4 unidades V1 (Master
// Handoff secciones 2, 4, 10, 18). Siempre presente en el HTML servido,
// independiente de si el Canvas 3D llega a montar.

import { hotspots } from "@/lib/world/hotspots.config";

export function HotspotSection() {
  return (
    <nav aria-label="TMC World — líneas de negocio" className="hotspotFallbackNav">
      <ul>
        {hotspots.map((hotspot) => (
          <li key={hotspot.id}>
            <a href={hotspot.route}>
              <strong>{hotspot.label}</strong>
              <span> — {hotspot.positioning}. {hotspot.message}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
