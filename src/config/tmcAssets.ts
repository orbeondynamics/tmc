// Registro central de assets — Master Handoff sección 21/25 (CERRADO: "assets
// reemplazables", "originales preservados", "no crear variantes paralelas").
//
// TODOS los componentes deben importar rutas de assets desde aquí — nunca
// escribir "/assets/..." directamente en un componente. Reemplazar un asset
// (ej. sustituir tmc-luxury.png por otro) requiere editar UNA sola línea.
//
// Los archivos originales entregados permanecen intactos en public/assets/
// (tmc-world-*.png, tmc-world-*.glb) — esos SÍ son el respaldo sin tocar.
// Esta carpeta canónica public/assets/tmc-world/ contiene las copias que
// realmente se sirven; las 6 capas de SceneLayers se optimizaron a WebP
// (prompt maestro sección 5, Fase 2: mismo ancho/alto, mismo canal alpha,
// solo compresión — sin recortar composición ni bajar resolución) y las
// .png equivalentes se retiraron de esta carpeta para no dejar duplicados
// muertos; siguen disponibles en el respaldo de public/assets/ si hace
// falta reconvertir con otro ajuste de calidad.

const BASE = "/assets/tmc-world";

export const tmcAssets = {
  layers: {
    skyClouds: `${BASE}/sky-clouds.webp`,
    miamiSkyline: `${BASE}/miami-skyline.webp`,
    bayWater: `${BASE}/bay-water.webp`,
    islandsVegetation: `${BASE}/islands-vegetation.webp`,
    terracePoolFurniture: `${BASE}/terrace-pool-furniture.webp`,
    person: `${BASE}/person.webp`,
  },
  masterBackground: `${BASE}/master-background.webp`,
  logo3d: `${BASE}/tmc-logo-3d.glb`,
  logo3dOriginal: `${BASE}/tmc-logo-3d-original.glb`,
  /**
   * Logos oficiales de las 4 operating units — Master Handoff sección 11
   * (CERRADO). Archivos PNG reales entregados, transparentes, sin modificar
   * (ver OperatingUnitLogo.tsx) — no se rediseñan ni se sustituyen por texto.
   */
  operatingUnitLogos: {
    "tmc-luxury": `${BASE}/tmc-luxury.png`,
    "tmc-transport": `${BASE}/tmc-transport.png`,
    "tmc-cleaners": `${BASE}/tmc-cleaners.png`,
    "tmc-project-office": `${BASE}/tmc-project-office.png`,
  },
} as const;
