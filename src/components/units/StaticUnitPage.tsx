// Server Component — plantilla ÚNICA y compartida para las 4 páginas de
// unidad (cambio de alcance mayor, decidido por el dueño del proyecto: estas
// rutas dejan de ser parte del mundo 3D). Lo único que cambia entre
// /luxury, /transport, /cleaners, /project-office es el `unitId` — nunca el
// comportamiento ni la estructura (esa era justo la brecha de arquitectura
// diagnosticada antes de este cambio: cada ruta llamaba al mismo
// TmcWorldPage, pero el contenido real vivía en un overlay 3D con su propio
// ciclo de vida por ruta).
//
// Header y Footer son los mismos componentes ya aprobados (con las
// correcciones de tamaño/contraste de texto ya implementadas) — useWorld()
// dentro de Header degrada a no-ops fuera de WorldProvider (ver
// WorldContext.tsx), así que funcionan sin cambios aquí.

import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content/tmcContentSource";
import { tmcAssets } from "@/config/tmcAssets";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { UnitPanelContent } from "./UnitPanelContent";

export function StaticUnitPage({ unitId }: { unitId: string }) {
  const siteContent = getSiteContent();
  const unit = siteContent.operatingUnits.find((u) => u.id === unitId);
  if (!unit) notFound();

  return (
    <div className="staticUnitPage">
      <div
        className="staticUnitPage__background"
        style={{ backgroundImage: `url(${tmcAssets.masterBackground})` }}
        aria-hidden="true"
      />
      <div className="staticUnitPage__chrome">
        <Header overlays={siteContent.headerOverlays} />
        <Footer
          aboutUs={siteContent.aboutUsContent}
          contact={siteContent.contactContent}
          social={siteContent.socialContent}
          culture={siteContent.cultureContent}
          socialChannels={siteContent.socialChannels}
        />
      </div>
      <main className="staticUnitPanel" aria-label={unit.name}>
        <div className="staticUnitPanel__scroll">
          <UnitPanelContent unit={unit} />
        </div>
      </main>
    </div>
  );
}
