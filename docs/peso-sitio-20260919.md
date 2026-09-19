# Peso real del sitio — medición del 2026-09-19

Estado medido: commit `13c2e2c` (build de producción). **Solo medición: no se optimizó ni se modificó ningún asset ni configuración.**

## Resultado

| Página | Peso transferido (primera visita, sin caché) | Objetivo < 4 MB |
|---|---:|---|
| Home `/` | **2.884 MiB = 3.025 MB** | **Cumplido** |
| `/luxury` | **0.370 MiB = 0.388 MB** | **Cumplido** |
| Recorrido completo Home → clic en Luxury → `/luxury` (misma sesión, sin caché) | **3.053 MiB = 3.201 MB** (Home 2.884 MiB + 172.2 KiB) | **Cumplido** |

Ninguna página supera 4 MB (4 000 000 bytes), por lo que no hay archivos que optimizar según el criterio.

## Metodología

- **Build:** `npm run build` + `npm run start -- -p 3001` (Next.js 16.3.4, Turbopack, servidor de producción con compresión gzip activa por defecto).
- **Navegador:** Microsoft Edge automatizado con Playwright; protocolo CDP `Network.enable` + `Network.setCacheDisabled(true)`, **contexto nuevo por medición** (sin caché, cookies ni storage) = primera visita real, incluida la intro cinemática (su póster se descarga).
- **Qué se cuenta:** bytes recibidos por la red por petición (`encodedDataLength` de `Network.loadingFinished`: cuerpo comprimido tal como viaja + cabeceras de respuesta). Se excluyen las URLs `data:`. El tamaño descomprimido (`decodedBodySize`, Resource Timing) se muestra aparte.
- **Hasta cuándo:** navegación con `networkidle`, espera de interactividad (Home: el `<canvas>` del mundo 3D existe; `/luxury`: el panel de contenido existe) y 6 s adicionales para capturar recursos diferidos (GLB, HDRI, texturas tras Suspense).
- **Viewports:** 1920×1080 y 375×667. Las cifras son idénticas entre ambos (27 y 13 peticiones), así que no hay recursos que dependan del viewport.
- **Reproducibilidad:** 2 corridas completas, Home 2.884 / 2.885 MiB y `/luxury` 0.370 MiB en ambas (variación < 0.1%).
- **Límites:** medición en `localhost` (los tiempos son solo orientativos: Home idle ≈ 2.7 s, interactivo ≈ 4.2–4.5 s; `/luxury` ≈ 1.0 s; no representan una red real). No incluye una CDN ni compresión/HTTP2 de un host real.

## Home `/` — 1920×1080 (idéntico en 375×667)

| Categoría | Archivos | KiB | % |
|---|---:|---:|---:|
| Otros (HDRI, ver nota) | 1 | 1366.3 | 46.3% |
| Imágenes | 13 | 804.4 | 27.2% |
| JavaScript | 8 | 453.8 | 15.4% |
| GLB (modelo 3D) | 1 | 253.6 | 8.6% |
| Fuentes | 2 | 61.5 | 2.1% |
| HTML | 1 | 9.1 | 0.3% |
| CSS | 1 | 5.1 | 0.2% |
| **Total** | **27** | **2953.7** | **100%** |

| KiB transferidos | KiB descomprimidos | Tipo | Archivo |
|---:|---:|---|---|
| 1366.3 | n/d | Otros | `https://raw.githubusercontent.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hd…` |
| 315.7 | 1122.9 | JS | `/_next/static/chunks/198zdube-39u4.js` |
| 253.6 | 458.2 | GLB | `/assets/tmc-world/tmc-logo-3d.glb` |
| 138.2 | 138.0 | Imagenes | `/assets/tmc-world-master-background.webp` |
| 138.2 | 138.0 | Imagenes | `/assets/tmc-world/master-background.webp` |
| 116.3 | 116.0 | Imagenes | `/assets/tmc-world/sky-clouds.webp` |
| 80.3 | 80.0 | Imagenes | `/assets/tmc-world/terrace-pool-furniture.webp` |
| 78.7 | 78.5 | Imagenes | `/assets/tmc-world/islands-vegetation.webp` |
| 70.3 | 223.6 | JS | `/_next/static/chunks/1j_9b-l0n6u-t.js` |
| 54.0 | 53.7 | Imagenes | `/assets/tmc-world/bay-water.webp` |
| 44.6 | 44.4 | Imagenes | `/assets/tmc-world/miami-skyline.webp` |
| 43.5 | 158.4 | JS | `/_next/static/chunks/3ewp08ebnb49j.js` |
| 37.2 | 36.9 | Fuentes | `/_next/static/media/01e4147cff8141ee-s.p.3huc2loe0ie8a.woff2` |
| 30.0 | 29.5 | Imagenes | `/_next/image?url=%2Fassets%2Ftmc-world%2Ftmc-project-office.png&w=256&q=75` |
| 29.9 | 29.5 | Imagenes | `/_next/image?url=%2Fassets%2Ftmc-world%2Ftmc-transport.png&w=256&q=75` |
| 29.7 | 29.2 | Imagenes | `/_next/image?url=%2Fassets%2Ftmc-world%2Ftmc-cleaners.png&w=256&q=75` |
| 28.7 | 28.3 | Imagenes | `/_next/image?url=%2Fassets%2Ftmc-world%2Ftmc-luxury.png&w=256&q=75` |
| 25.6 | 25.3 | Imagenes | `/favicon.ico?favicon.2vob68tjqpejf.ico` |
| 24.3 | 24.0 | Fuentes | `/_next/static/media/a343f882a40d2cc9-s.p.1sj6eobyi31rd.woff2` |
| 10.2 | 9.9 | Imagenes | `/assets/tmc-world/person.webp` |
| 9.1 | n/d | HTML | `/` |
| 8.7 | 31.2 | JS | `/_next/static/chunks/11jq0c2_zavac.js` |
| 5.2 | 18.4 | JS | `/_next/static/chunks/1i3pucgugz-hp.js` |
| 5.1 | 22.4 | CSS | `/_next/static/chunks/1szr6sj_fn1wh.css` |
| 4.1 | 9.5 | JS | `/_next/static/chunks/turbopack-3a8ttb6fo_p2y.js` |
| 3.8 | 9.3 | JS | `/_next/static/chunks/3ho2y5a5waa7c.js` |
| 2.5 | 6.0 | JS | `/_next/static/chunks/0wj1_j3zgckxg.js` |

## `/luxury` — 1920×1080 (idéntico en 375×667)

| Categoría | Archivos | KiB | % |
|---|---:|---:|---:|
| Imágenes | 2 | 163.9 | 43.3% |
| JavaScript | 7 | 138.1 | 36.4% |
| Fuentes | 2 | 61.5 | 16.2% |
| HTML | 1 | 10.3 | 2.7% |
| CSS | 1 | 5.1 | 1.3% |
| **Total** | **13** | **378.9** | **100%** |

| KiB transferidos | KiB descomprimidos | Tipo | Archivo |
|---:|---:|---|---|
| 138.2 | 138.0 | Imagenes | `/assets/tmc-world/master-background.webp` |
| 70.3 | 223.6 | JS | `/_next/static/chunks/1j_9b-l0n6u-t.js` |
| 43.5 | 158.4 | JS | `/_next/static/chunks/3ewp08ebnb49j.js` |
| 37.2 | 36.9 | Fuentes | `/_next/static/media/01e4147cff8141ee-s.p.3huc2loe0ie8a.woff2` |
| 25.6 | 25.3 | Imagenes | `/favicon.ico?favicon.2vob68tjqpejf.ico` |
| 24.3 | 24.0 | Fuentes | `/_next/static/media/a343f882a40d2cc9-s.p.1sj6eobyi31rd.woff2` |
| 10.3 | n/d | HTML | `/luxury` |
| 8.7 | 31.2 | JS | `/_next/static/chunks/11jq0c2_zavac.js` |
| 5.2 | 18.4 | JS | `/_next/static/chunks/1i3pucgugz-hp.js` |
| 5.1 | 22.4 | CSS | `/_next/static/chunks/1szr6sj_fn1wh.css` |
| 4.1 | 9.5 | JS | `/_next/static/chunks/turbopack-3a8ttb6fo_p2y.js` |
| 3.8 | 9.3 | JS | `/_next/static/chunks/3ho2y5a5waa7c.js` |
| 2.5 | 6.0 | JS | `/_next/static/chunks/0wj1_j3zgckxg.js` |

## Recorrido Home → `/luxury` (misma sesión, sin caché)

Con la caché deshabilitada (método de la medición), al navegar desde Home (con "Skip Intro") a `/luxury` se vuelven a descargar `master-background.webp` 138.2 KiB (ya cargado en Home) y `favicon.ico` 25.6 KiB, más la carga RSC de la ruta 8.4 KiB = **+172.2 KiB**. Con caché normal del navegador, esa navegación reutilizaría los archivos ya descargados: 172.2 KiB es un techo, no el costo típico.

## Observaciones (sin actuar sobre ellas)

- **El archivo más pesado de Home no está alojado en el proyecto:** el mapa de entorno HDRI (`venice_sunset_1k.hdr`, 1366.3 KiB, 46.3% del total) lo descarga `Environment preset="sunset"` de `drei` desde `raw.githubusercontent.com` (repositorio pmndrs/drei-assets), no desde el propio sitio. Es una dependencia de red externa en la primera visita.
- `master-background.webp` se descarga **dos veces** en Home (138.2 KiB cada una) porque la intro usa `/assets/tmc-world-master-background.webp` y la escena 3D usa `/assets/tmc-world/master-background.webp`: dos rutas distintas del mismo tipo de imagen.
- El JavaScript de Home es 453.8 KiB comprimidos, de los cuales el mayor es un chunk de 315.7 KiB (1122.9 KiB descomprimidos).
- Los cuatro logos de las unidades pasan por `/_next/image` a 256 px (≈ 29 KiB cada uno, ≈ 118 KiB en total).
