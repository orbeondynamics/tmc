// Server Component — shell del fallback semántico/SEO (Master Handoff
// sección 10, CERRADO). Siempre presente en el HTML servido. Copy
// exclusivamente aprobado (sección 4/18) — sin inventar.

export function StaticHero() {
  return (
    <section aria-label="TMC World">
      {/* Public Brand Rule (prompt maestro sección 2.1, CERRADO): la marca
          pública es "TMC" — "The Money Company" no aparece en ningún
          contenido visible del sitio, sin excepción (el reveal cinematográfico
          de IntroSequence que antes citaba esta regla como excepción ya no
          existe — ver IntroSequence.tsx, corregido en la misma fase). */}
      <p className="tmcFallback__eyebrow">TMC</p>
      <h1>TMC World</h1>
      <p>A private ecosystem for the way you live.</p>
      <p>Your world. Handled.</p>
    </section>
  );
}
