// Fuente PRINCIPAL de contenido del sitio — agrega los 11 Markdown de
// content/tmc-world/ vía el loader (loadMarkdown.ts) hacia las mismas formas
// de datos que ya consumían los componentes (OverlaySection,
// OperatingUnitContent, etc., definidas en src/config/tmcContent.ts).
//
// Server-only (importa `loadMarkdown.ts`, que usa `fs`) — solo se importa
// desde Server Components (layout.tsx, TmcWorldPage, StaticHero,
// HotspotSection, StaticUnitPage). Los componentes cliente (Header, Footer,
// HomeContentPanel) reciben este contenido ya resuelto como props desde
// WorldExperience (home) o directo desde StaticUnitPage (páginas de unidad).
//
// Editar un archivo en content/tmc-world/*.md y recargar basta para que el
// contenido cambie — ningún componente React necesita tocarse. Si un
// archivo o una sección puntual falta, se cae al valor correspondiente de
// tmcContent.ts (fallback por campo, no todo-o-nada).
//
// IMPORTANTE: todo lo de abajo se expone como FUNCIONES, no como constantes
// de módulo. `loadContentFile` lee el .md con `fs.readFileSync` — si el
// resultado se calculara una sola vez al importar el módulo (`export const
// x = loadX()`), Node lo cachearía en memoria y una edición al .md no se
// reflejaría sin reiniciar el servidor de desarrollo. Al exponer funciones y
// llamarlas dentro del render de un Server Component (que Next.js vuelve a
// ejecutar en cada request en dev), el archivo se relee en cada carga.

import {
  loadContentFile,
  findSection,
  findSubsection,
  flattenSection,
  blocksToLines,
  type MdSection,
} from "./loadMarkdown";
import {
  headerOverlays as fallbackHeaderOverlays,
  aboutUsContent as fallbackAboutUs,
  contactContent as fallbackContact,
  socialContent as fallbackSocial,
  cultureContent as fallbackCulture,
  socialChannels as fallbackSocialChannels,
  operatingUnits as fallbackOperatingUnits,
  homeNarrativeSections as fallbackHomeNarrativeSections,
  tmcStandardContent as fallbackTmcStandard,
  miamiContent,
  privateInquiryContent,
  type OverlaySection,
  type OperatingUnitContent,
  type HomeNarrativeSection,
} from "@/config/tmcContent";

function toTitleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => (word.toUpperCase() === "TMC" ? "TMC" : word[0] + word.slice(1).toLowerCase()))
    .join(" ");
}

// ---------- Header overlays (our-purpose.md, our-vision.md, our-promise.md,
// our-values.md, our-clients.md) ----------

const HEADER_FILES: { slug: string; id: string; fallback: OverlaySection }[] = [
  { slug: "our-purpose", id: "purpose", fallback: fallbackHeaderOverlays[0] },
  { slug: "our-vision", id: "vision", fallback: fallbackHeaderOverlays[1] },
  { slug: "our-promise", id: "promise", fallback: fallbackHeaderOverlays[2] },
  { slug: "our-values", id: "values", fallback: fallbackHeaderOverlays[3] },
  { slug: "our-clients", id: "clients", fallback: fallbackHeaderOverlays[4] },
];

function loadOverlayFromFile(slug: string, id: string, fallback: OverlaySection): OverlaySection {
  const doc = loadContentFile(slug);
  if (!doc) return fallback;
  const label = doc.frontmatter.eyebrow ?? fallback.label;
  const framing = doc.frontmatter.title ?? fallback.framing;
  const section = doc.sections[0]; // única sección ## en nuestros 5 archivos de header
  const body = section ? flattenSection(section) : fallback.body;
  return { id, label, framing, body: body.length > 0 ? body : fallback.body };
}

export function getHeaderOverlays(): OverlaySection[] {
  return HEADER_FILES.map(({ slug, id, fallback }) => loadOverlayFromFile(slug, id, fallback));
}

// ---------- Footer (footer.md — 4 secciones ## en un solo archivo) ----------

function splitHeading(heading: string): { label: string; framing: string } {
  const [label, ...rest] = heading.split(" — ");
  return { label: label.trim(), framing: rest.join(" — ").trim() };
}

function loadFooterBlock(
  headingStartsWith: string,
  id: string,
  fallback: OverlaySection
): OverlaySection {
  const doc = loadContentFile("footer");
  const section = doc && findSection(doc, headingStartsWith);
  if (!doc || !section) return fallback;
  const { label, framing } = splitHeading(section.heading);
  const body = flattenSection(section);
  return {
    id,
    label: label || fallback.label,
    framing: framing || fallback.framing,
    body: body.length > 0 ? body : fallback.body,
  };
}

export function getAboutUsContent(): OverlaySection {
  return loadFooterBlock("ABOUT US", "about-us", fallbackAboutUs);
}
export function getContactContent(): OverlaySection {
  return loadFooterBlock("CONTACT", "contact", fallbackContact);
}
export function getSocialContent(): OverlaySection {
  return loadFooterBlock("SOCIAL", "social", fallbackSocial);
}
export function getCultureContent(): OverlaySection {
  return loadFooterBlock("THE TMC CULTURE", "culture", fallbackCulture);
}

export function getSocialChannels(): { id: string; label: string }[] {
  const doc = loadContentFile("footer");
  const section = doc && findSection(doc, "SOCIAL");
  if (!doc || !section || section.bullets.length === 0) return [...fallbackSocialChannels];
  return section.bullets.map((bullet) => {
    const [name] = bullet.split(" — ");
    const label = name.trim();
    return { id: label.toLowerCase(), label };
  });
}

// ---------- Las 4 operating units (luxury.md, transport.md, cleaners.md,
// project-office.md) ----------

const UNIT_FILES: { slug: string; fallback: OperatingUnitContent }[] = [
  { slug: "luxury", fallback: fallbackOperatingUnits[0] },
  { slug: "transport", fallback: fallbackOperatingUnits[1] },
  { slug: "cleaners", fallback: fallbackOperatingUnits[2] },
  { slug: "project-office", fallback: fallbackOperatingUnits[3] },
];

function loadOperatingUnit(slug: string, fallback: OperatingUnitContent): OperatingUnitContent {
  const doc = loadContentFile(slug);
  const section: MdSection | undefined = doc?.sections[0];
  if (!doc || !section) return fallback;

  const name = doc.frontmatter.eyebrow ? toTitleCase(doc.frontmatter.eyebrow) : fallback.name;
  const descriptor = doc.frontmatter.title ?? fallback.descriptor;
  const intro = section.paragraphs[0] ?? fallback.intro;

  const capabilitiesSection = findSubsection(section, "Core Capabilities");
  const capabilities =
    capabilitiesSection && capabilitiesSection.bullets.length > 0
      ? capabilitiesSection.bullets
      : fallback.capabilities;

  const promiseSection = findSubsection(section, "Promise");
  const signature = promiseSection?.paragraphs[0] ?? fallback.signature;
  const supporting = promiseSection?.paragraphs[1]
    ? promiseSection.paragraphs[1].split("·").map((s) => s.trim()).filter(Boolean)
    : fallback.supporting;

  const extra = section.subsections
    .filter((sub) => sub !== capabilitiesSection && sub !== promiseSection)
    .flatMap((sub) => blocksToLines(sub.blocks));

  return {
    id: fallback.id,
    route: fallback.route,
    name,
    descriptor,
    intro,
    capabilities,
    signature,
    supporting,
    extra: extra.length > 0 ? extra : fallback.extra,
  };
}

export function getOperatingUnits(): OperatingUnitContent[] {
  return UNIT_FILES.map(({ slug, fallback }) => loadOperatingUnit(slug, fallback));
}

// ---------- Home (home.md) ----------

function loadHomeNarrativeSections(): HomeNarrativeSection[] {
  const doc = loadContentFile("home");
  if (!doc) return fallbackHomeNarrativeSections;
  const sections = doc.sections.filter(
    (s) => !s.heading.toLowerCase().startsWith("the tmc standard")
  );
  if (sections.length === 0) return fallbackHomeNarrativeSections;
  return sections.map((s) => ({
    id: s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    eyebrow: s.heading.toUpperCase(),
    title: "",
    body: flattenSection(s),
  }));
}

function loadTmcStandard(): { eyebrow: string; values: string[] } {
  const doc = loadContentFile("home");
  const section = doc && findSection(doc, "The TMC Standard");
  if (!doc || !section || section.bullets.length === 0) return fallbackTmcStandard;
  return { eyebrow: section.heading.toUpperCase(), values: section.bullets };
}

export function getHomeNarrativeSections(): HomeNarrativeSection[] {
  return loadHomeNarrativeSections();
}
export function getTmcStandardContent(): { eyebrow: string; values: string[] } {
  return loadTmcStandard();
}

// Miami y Private Inquiry no tienen archivo .md propio entre los 11
// entregados (footer.md menciona Miami de paso dentro de ABOUT US, y el
// flujo de Private Inquiry dentro de CONTACT, pero ninguno es una sección
// dedicada) — se mantiene el fallback de tmcContent.ts para estos dos, sin
// pasar por `fs` (no necesitan releerse en cada request).
export { miamiContent, privateInquiryContent };

/** Agrega todo el contenido del sitio en una sola llamada — usar desde un
 * Server Component (layout.tsx) y pasar el resultado como prop hacia el
 * árbol cliente. */
export function getSiteContent() {
  return {
    headerOverlays: getHeaderOverlays(),
    aboutUsContent: getAboutUsContent(),
    contactContent: getContactContent(),
    socialContent: getSocialContent(),
    cultureContent: getCultureContent(),
    socialChannels: getSocialChannels(),
    operatingUnits: getOperatingUnits(),
    homeNarrativeSections: getHomeNarrativeSections(),
    tmcStandardContent: getTmcStandardContent(),
    miamiContent,
    privateInquiryContent,
  };
}
