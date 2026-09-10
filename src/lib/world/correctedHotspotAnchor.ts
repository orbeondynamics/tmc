// Corrección compartida entre Hotspots.tsx y HotspotArcs.tsx — ambos
// proyectan los mismos anchors de hotspots.config.ts y deben quedar
// perfectamente sincronizados (los arcos apuntan a donde están los badges).
// Extraído a un helper único para no duplicar la fórmula en dos archivos.
//
// Ajuste responsive mobile (hallazgo de validación Fase 3, prompt maestro
// sección 6.2): con los 4 anchors a 90°/1.0x y badges al 74% del diámetro
// del logo, en mobile (375×812) los 2 badges superiores invadían el header
// (header 151px + footer 123px dejan poco margen vertical). Una reducción
// uniforme de la magnitud radial no sirve: para despejar el header habría
// que reducirla a ~31% del valor actual, y a esa distancia el radio de la
// propia insignia (74% del diámetro del logo ÷ 2) ya es MAYOR que la
// distancia al centro — el badge terminaría superpuesto con el logo,
// cambiando un overlap por otro peor (verificado con medición real: logo en
// pantalla Y=270.6px, header termina en Y=151px, radio de insignia=49px).
//
// Solución: comprimir SOLO el offset Y del anchor respecto al centro del
// logo, dejando X exactamente como ya lo maneja aspectFactor. Como X ya
// aporta ~5.3 unidades de distancia al centro por sí solo en mobile (10.59 ×
// aspectFactor 0.5), la distancia total al centro (√(X²+Y²)) nunca cae por
// debajo del radio de la insignia aunque Y se comprima mucho. La insignia en
// sí (ancho/alto CSS) no se toca — sigue siendo un círculo perfecto, solo
// cambia dónde se ubica su centro.
//
// Activo solo por debajo de 720px de ancho — mismo breakpoint que ya usa
// globals.css para el resto de ajustes mobile-only — así que desktop y
// tablet (768px+) quedan exactamente como estaban.

const MOBILE_BREAKPOINT_WIDTH = 720;
/** Derivado de la geometría real medida en mobile (375×812): se necesita
 * reducir el offset Y a ~31% para despejar el header con margen; 0.3 dado
 * un pequeño margen extra de seguridad. */
const MOBILE_Y_OFFSET_FACTOR = 0.3;

export function getCorrectedHotspotAnchor(
  anchor: [number, number, number],
  aspectFactor: number,
  viewportWidth: number,
  logoY: number
): [number, number, number] {
  const [ax, ay, az] = anchor;
  const isMobileBreakpoint = viewportWidth < MOBILE_BREAKPOINT_WIDTH;
  const correctedY = isMobileBreakpoint ? logoY + (ay - logoY) * MOBILE_Y_OFFSET_FACTOR : ay;
  return [ax * aspectFactor, correctedY, az];
}
