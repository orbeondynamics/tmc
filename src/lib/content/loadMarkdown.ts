// Loader de contenido Markdown — content/tmc-world/*.md es la fuente
// PRINCIPAL del contenido editorial del sitio (evolución "BLOQUE INTEGRAL",
// integración de contenido). Server-only (usa `fs`) — nunca se importa desde
// un componente cliente; los componentes cliente reciben este contenido ya
// parseado como props desde un Server Component ancestro (ver
// src/lib/content/tmcContentSource.ts).
//
// Parser propio, sin dependencias nuevas (Master §12.4 aplicado como
// principio general): frontmatter simple (`key: value`) + cuerpo dividido en
// secciones por encabezados `##`/`###`. Suficiente para la estructura real
// de los 11 archivos entregados — no requiere un parser Markdown completo
// (tablas, código, Markdown anidado no se usan en este contenido).
//
// Editar un .md y reconstruir/recargar el dev server basta para que el
// contenido cambie — ningún componente necesita tocarse (esa es la garantía
// que pide el encargo). Si un archivo falta o no puede leerse, se devuelve
// `null` y el llamador cae al fallback de src/config/tmcContent.ts.

import { readFileSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "content", "tmc-world");

/**
 * Lee un archivo de texto plano `ETIQUETA=valor` de content/tmc-world/ (una
 * pareja por línea, sin comillas). Independiente del orden de las líneas y de
 * las mayúsculas de la etiqueta; ignora líneas vacías, sin `=` o que empiecen
 * con `#`. Corta en el PRIMER `=` (los valores pueden contener `=`, p. ej.
 * una URL con query). Si una etiqueta se repite, gana la primera. Devuelve
 * `null` si el archivo no existe o no puede leerse.
 */
export function loadKeyValueFile(fileName: string): Record<string, string> | null {
  let raw: string;
  try {
    raw = readFileSync(join(CONTENT_DIR, fileName), "utf8");
  } catch {
    return null;
  }
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim().toUpperCase();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in out)) out[key] = value;
  }
  return out;
}

/** Bloque de contenido en el orden real del documento — un párrafo o una lista de viñetas. */
export type MdBlock = { type: "paragraph"; text: string } | { type: "bullets"; items: string[] };

export interface MdSubsection {
  heading: string;
  /** Bloques en el orden real del documento (usar para renderizar fielmente). */
  blocks: MdBlock[];
  /** Todos los párrafos, sin bullets — conveniencia para extraer un valor puntual (ej. paragraphs[0]). */
  paragraphs: string[];
  /** Todas las viñetas, sin importar en qué bloque estaban — conveniencia para listas (ej. capabilities). */
  bullets: string[];
}

export interface MdSection {
  heading: string;
  blocks: MdBlock[];
  paragraphs: string[];
  bullets: string[];
  subsections: MdSubsection[];
}

export interface ParsedMarkdown {
  frontmatter: Record<string, string>;
  sections: MdSection[];
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw.trim() };

  const [, frontmatterBlock, body] = match;
  const frontmatter: Record<string, string> = {};
  for (const line of frontmatterBlock.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) frontmatter[key] = value;
  }
  return { frontmatter, body };
}

/** Quita énfasis Markdown (**bold**, *italic*) — el contenido se renderiza como texto plano. */
function stripInlineMarkup(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").trim();
}

function parseBlocks(text: string): MdBlock[] {
  const rawBlocks = text
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const blocks: MdBlock[] = [];
  for (const block of rawBlocks) {
    const lines = block.split(/\r?\n/);
    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
      blocks.push({
        type: "bullets",
        items: lines.map((line) => stripInlineMarkup(line.trim().replace(/^[-*]\s+/, ""))),
      });
    } else {
      blocks.push({ type: "paragraph", text: stripInlineMarkup(block.replace(/\r?\n/g, " ")) });
    }
  }
  return blocks;
}

/**
 * Parsea el cuerpo en secciones por encabezado `##` (nivel principal), cada
 * una con sus propios párrafos/bullets y las subsecciones `###` anidadas en
 * orden. El primer `#` (H1, redundante con el frontmatter) se ignora.
 */
function parseSections(body: string): MdSection[] {
  const lines = body.split(/\r?\n/);
  const sections: MdSection[] = [];
  let currentSection: MdSection | null = null;
  let currentSubsection: MdSubsection | null = null;
  let buffer: string[] = [];

  function flushBuffer() {
    if (buffer.length === 0) return;
    const newBlocks = parseBlocks(buffer.join("\n"));
    const target = currentSubsection ?? currentSection;
    if (target) {
      target.blocks.push(...newBlocks);
      for (const block of newBlocks) {
        if (block.type === "paragraph") target.paragraphs.push(block.text);
        else target.bullets.push(...block.items);
      }
    }
    buffer = [];
  }

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      flushBuffer();
      continue; // H1 ignorado — redundante con el frontmatter
    }
    if (h2) {
      flushBuffer();
      currentSubsection = null;
      currentSection = {
        heading: h2[1].trim(),
        blocks: [],
        paragraphs: [],
        bullets: [],
        subsections: [],
      };
      sections.push(currentSection);
      continue;
    }
    if (h3) {
      flushBuffer();
      currentSubsection = { heading: h3[1].trim(), blocks: [], paragraphs: [], bullets: [] };
      currentSection?.subsections.push(currentSubsection);
      continue;
    }
    buffer.push(line);
  }
  flushBuffer();
  return sections;
}

/**
 * Lee y parsea content/tmc-world/{slug}.md. Devuelve `null` si el archivo no
 * existe o no puede leerse — nunca lanza por archivo faltante.
 */
export function loadContentFile(slug: string): ParsedMarkdown | null {
  try {
    const raw = readFileSync(join(CONTENT_DIR, `${slug}.md`), "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);
    return { frontmatter, sections: parseSections(body) };
  } catch {
    return null;
  }
}

/** Busca una sección (H2) por coincidencia case-insensitive del inicio de su heading. */
export function findSection(doc: ParsedMarkdown, headingStartsWith: string): MdSection | undefined {
  const needle = headingStartsWith.toLowerCase();
  return doc.sections.find((s) => s.heading.toLowerCase().startsWith(needle));
}

/** Busca una subsección (H3) dentro de una sección, por coincidencia case-insensitive. */
export function findSubsection(section: MdSection, headingStartsWith: string): MdSubsection | undefined {
  const needle = headingStartsWith.toLowerCase();
  return section.subsections.find((s) => s.heading.toLowerCase().startsWith(needle));
}

/** Aplana un solo array de bloques (ej. una subsección) a líneas, en orden. */
export function blocksToLines(blocks: MdBlock[]): string[] {
  return blocks.flatMap((block) => (block.type === "paragraph" ? [block.text] : block.items));
}

/**
 * Aplana una sección completa (propia + subsecciones) a una lista de líneas
 * de body, respetando el orden real del documento — un párrafo que aparece
 * después de una lista de viñetas en el .md sigue apareciendo después aquí.
 */
export function flattenSection(section: MdSection): string[] {
  return [
    ...blocksToLines(section.blocks),
    ...section.subsections.flatMap((sub) => blocksToLines(sub.blocks)),
  ];
}
