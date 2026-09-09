// Forma del contenido resuelto server-side (ver tmcContentSource.ts) que se
// pasa como prop desde layout.tsx hacia el árbol cliente. Solo tipos —
// ningún valor en tiempo de ejecución, así que es seguro importarlo tanto
// desde Server Components como desde componentes "use client".

import type { OverlaySection, OperatingUnitContent, HomeNarrativeSection } from "@/config/tmcContent";

export interface SiteContent {
  headerOverlays: OverlaySection[];
  aboutUsContent: OverlaySection;
  contactContent: OverlaySection;
  socialContent: OverlaySection;
  cultureContent: OverlaySection;
  socialChannels: { id: string; label: string }[];
  operatingUnits: OperatingUnitContent[];
  homeNarrativeSections: HomeNarrativeSection[];
  tmcStandardContent: { eyebrow: string; values: string[] };
  miamiContent: { eyebrow: string; title: string; body: string[] };
  privateInquiryContent: {
    eyebrow: string;
    title: string;
    body: string[];
    flow: string[];
    submitLabel: string;
  };
}
