# TMC World — Ejecución local independiente

Este proyecto es una aplicación Next.js + React + React Three Fiber estándar.
Funciona fuera de Claude Code con las herramientas normales de Node.js — no
depende de Claude Code, Claude Desktop ni de ningún servicio de Anthropic
para instalarse, compilarse o ejecutarse.

## Requisitos

- Node.js 20 o superior (verificado en este equipo con Node v24.15.0 / npm 11.12.1)
- Windows, macOS o Linux — sin dependencias nativas adicionales

## Instalación

Desde la raíz del proyecto (`tmc-world/`):

```bash
npm install
```

## Desarrollo (hot reload, Turbopack)

```bash
npm run dev
```

Abre `http://localhost:3000` en el navegador. Los cambios en el código se
reflejan automáticamente (Fast Refresh).

## Build de producción

```bash
npm run build
```

Compila TypeScript, genera las páginas estáticas (`/`, `/luxury`,
`/transport`, `/cleaners`, `/project-office`, `/sitemap.xml`, `/robots.txt`)
y produce el bundle optimizado en `.next/`.

## Producción local

Después de `npm run build`:

```bash
npm run start
```

Sirve el build de producción en `http://localhost:3000` (usa
`PORT=3100 npm run start` en macOS/Linux, o `set PORT=3100 && npm run start`
en `cmd.exe` de Windows, si el puerto 3000 ya está en uso).

## Lint

```bash
npm run lint
```

## Variables de entorno opcionales

| Variable | Uso | Por defecto |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Dominio absoluto usado en `sitemap.xml` y `robots.txt` | `https://tmc-world.example.com` (placeholder — reemplazar cuando exista el dominio real de producción) |

## Estructura relevante

```
src/app/            rutas (App Router): /, /luxury, /transport, /cleaners, /project-office
src/components/      componentes UI (header, footer, overlays) y del mundo 3D (Canvas, cámara, logo, hotspots)
src/config/          registro central de contenido y de rutas de assets
src/lib/             lógica de mundo/cámara/scroll, y el loader de contenido Markdown (preparado, aún no integrado)
public/assets/       assets originales
public/assets/tmc-world/  copias con nombres estables, listas para servirse
content/tmc-world/   capa de contenido editable en Markdown (ver content/tmc-world/README.md)
docs/                Master Handoff — fuente de verdad de arquitectura y decisiones
```

## Notas

- El proyecto no requiere base de datos ni backend propio.
- No hay claves de API ni credenciales configuradas — nada que proteger en
  `.env` para ejecutar localmente.
- Windows: ver `start-local.bat` en la raíz para un arranque de un solo doble
  clic (ejecuta `npm install` solo si falta `node_modules`, luego `npm run dev`).
