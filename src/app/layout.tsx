import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { WorldExperience } from "@/components/world/WorldExperience";
import { seoDescriptions } from "@/config/tmcContent";
import { getSiteContent } from "@/lib/content/tmcContentSource";
import "./globals.css";

// Tipografía — Master Handoff sección 3 (CERRADO): display serif editorial
// tipo Didot/Canela/Cormorant; UI sans contenida tipo Helvetica Neue/Avenir/Manrope.
const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const uiFont = Manrope({
  variable: "--font-ui",
  subsets: ["latin"],
});

// Mismo placeholder de dominio ya usado en sitemap.ts/robots.ts — no hay
// dominio de producción aprobado en el proyecto; se lee de
// NEXT_PUBLIC_SITE_URL para no fabricar uno.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tmc-world.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TMC World",
  description: seoDescriptions.tmc,
  alternates: { canonical: "/" },
  openGraph: {
    title: "TMC World",
    description: seoDescriptions.tmc,
    url: "/",
    siteName: "TMC World",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Contenido leído server-side desde content/tmc-world/*.md (fuente
  // principal — ver src/lib/content/tmcContentSource.ts) y pasado como props
  // hacia el árbol cliente (WorldExperience → Header/Footer/paneles). Se
  // llama dentro del render (no a nivel de módulo) para que cada request en
  // desarrollo relea los .md — así una edición se refleja sin reiniciar el
  // servidor, y ningún componente necesita tocarse.
  const siteContent = getSiteContent();

  // JSON-LD (evolución sección 30+, Organization) — únicamente descripciones
  // ya aprobadas (Master Handoff sección 11.1 / seoDescriptions). Sin
  // dominio, dirección, teléfono ni redes sociales inventadas: esos datos no
  // existen como aprobados en el proyecto, así que se omiten en vez de
  // fabricarse.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TMC",
    description: seoDescriptions.tmc,
    subOrganization: siteContent.operatingUnits.map((unit) => ({
      "@type": "Organization",
      name: unit.name,
      description: seoDescriptions[unit.id as keyof typeof seoDescriptions],
    })),
  };

  return (
    <html lang="en" className={`${displayFont.variable} ${uiFont.variable}`}>
      <body>
        {children}
        {/* Único Canvas R3F persistente (sección 5.1, CERRADO): vive en el layout raíz
            para no reiniciarse al navegar entre "/", "/luxury", "/transport", etc. */}
        <WorldExperience siteContent={siteContent} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
