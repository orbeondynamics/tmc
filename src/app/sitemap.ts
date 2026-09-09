import type { MetadataRoute } from "next";
import { operatingUnits } from "@/config/tmcContent";

// Dominio de producción: no hay ninguno aprobado/entregado en el proyecto
// (verificado: no existe en Master Handoff ni en el encargo de esta
// evolución) — se lee de NEXT_PUBLIC_SITE_URL para no fabricar uno; el
// placeholder solo evita URLs relativas inválidas en el XML mientras no se
// defina el dominio real.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tmc-world.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", ...operatingUnits.map((unit) => unit.route)];
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
