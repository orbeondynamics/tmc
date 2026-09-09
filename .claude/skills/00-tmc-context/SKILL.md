---
name: 00-tmc-context
description: Contexto de marca, arquitectura y reglas cerradas del proyecto TMC World (holding TMC — The Money Company). Úsala SIEMPRE que se trabaje en este repo: antes de tocar routing, cámara, scroll, hotspots, header/footer, paleta de colores, tipografía, nombres de unidades de negocio, o cualquier decisión que pueda ya estar cerrada. También úsala antes de generar o reemplazar assets (logo, Master Miami, imágenes). Si una tarea contradice algo listado aquí como CERRADO, detente y pregunta antes de implementar.
---

# TMC World — Contexto de continuidad

Este proyecto tiene un Repositorio Maestro en:

`docs/TMC_World_Master_Handoff.md`

Este archivo es la fuente de verdad completa y vigente del proyecto.

El Master Handoff no utiliza una versión numérica en su nombre. Javi conserva las versiones históricas por separado cuando sea necesario. Claude Code debe trabajar siempre contra el archivo activo `TMC_World_Master_Handoff.md`.

Esta skill es un resumen operativo para no tener que releer todo el Master Handoff en cada sesión. Cuando se necesite detalle, contexto histórico o una decisión específica, abrir el Master Handoff.

---

# Regla de autoridad

1. Las decisiones marcadas CERRADA en el Master Handoff son baseline obligatorio. Claude Code no puede modificarlas ni reabrirlas de forma autónoma. Si detecta una limitación técnica, contradicción o mejora que requiera cambiar una decisión cerrada, debe detenerse, explicarla y solicitar aprobación antes de implementar el cambio.

2. Alcance de V1 — definitivo, no bloqueado: las unidades a construir en routing/hotspots son:
   - TMC Luxury — Property Management
   - TMC Transport
   - TMC Cleaners
   - TMC Project Office

   Esta es una decisión de alcance confirmada por Javi, no una suposición.

   TMC Luxury Membership y Goldens.tmc quedan diferidas para revisión futura. No son bloqueadores de V1 y no deben incorporarse a routing, hotspots ni arquitectura V1 sin nueva instrucción explícita.

3. No crear variantes paralelas de un asset o decisión ya aprobado.

4. Hacer git commit al cerrar cada fase significativa o conjunto coherente de actividades, previa validación. Antes de cada commit revisar git status y git diff.

5. Claude Code puede leer el Master Handoff, detectar inconsistencias y generar propuestas de actualización o Gate Reports, pero no puede modificar directamente el Master Handoff. Toda modificación debe revisarse y aprobarse antes de incorporarse.

6. No sobreconstruir. TMC World V1 es un website premium e inmersivo. No convertirlo en plataforma SaaS, CRM, portal de cliente, sistema de workflow o plataforma operativa.

7. ALTEREA (AEGIS, Kairos, PM, Tracker, Athena, etc.) son marcos de apoyo. No son una autoridad paralela y no pueden modificar ni justificar el cambio de una decisión CERRADA.

8. ChatGPT puede dirigir estrategia, arquitectura, contenido y análisis del proyecto a través de Javi, pero no puede saltarse una decisión CERRADA. Cualquier cambio de baseline requiere aprobación explícita.

---

# Identidad del proyecto

- Marca madre: TMC — The Money Company
- Producto digital: TMC World
- Naturaleza: experiencia web cinematográfica/inmersiva basada en un mundo 3D vivo con React Three Fiber.
- No es un scroll sobre video.
- No es una colección de landing pages independientes.
- El mundo debe sentirse como una experiencia única y continua.

Promesa: **Your world. Handled.**

Posicionamiento: **A private ecosystem for the way you live.**

El sitio no debe gritar lujo. Debe asumirlo mediante restricción, calidad, claridad, discreción, movimiento controlado y experiencia cinematográfica.

Evitar infografía corporativa genérica, exceso de iconos, exceso de efectos, estética tecnológica genérica e interfaces recargadas.

---

# Paleta y tipografía — CERRADO

| Token | Valor |
|---|---|
| Navy primario | `#0B1832` |
| Navy profundo / negro | `#060B18` |
| Dorado | `#C9A24B` |
| Dorado claro | `#E8CE8F` |
| Acento cálido | Ámbar muy sutil, uso puntual |
| Display | Serif editorial tipo Didot / Canela / Cormorant |
| UI | Sans contenida tipo Helvetica Neue / Avenir / Manrope |
| Fotografía | Fotorrealista, cinematográfica, editorial |
| Bordes | 1px hairline dorado, discreto |

---

# Arquitectura técnica — CERRADO

## Mundo
- Un único `<Canvas>` R3F persistente.
- Un único mundo 3D.
- Las cuatro áreas principales forman parte del mismo mundo.

## Routing
Modelo **Hybrid B**.

Rutas:
```text
/
/luxury
/transport
/cleaners
/project-office
```

Todas cargan el mismo mundo 3D. Una ruta directa lleva la cámara al waypoint correspondiente. Un hotspot inicia transición de cámara, actualización de URL y llegada al área correspondiente.

## Header
Overlays 2D sobre el mundo:
- OUR PURPOSE
- OUR VISION
- OUR PROMISE
- OUR VALUES
- OUR CLIENTS

No son waypoints espaciales.

## Logos
Existen **dos instancias distintas del logo TMC** y no deben confundirse:

1. **Logo Home** — pequeño, discreto, persistente en la esquina superior izquierda; funciona como Home y vuelve a `/`. No debe competir con el logo TMC 3D principal del escenario.
2. **Logo TMC 3D principal** — elemento 3D del escenario/hero. Está sujeto a la especificación numérica de la sección **Logo TMC 3D — CERRADO** (`LOGO_SIZE`, `LOGO_THICKNESS`, `LOGO_ROTATION`, `LOGO_ROTATION_SPEED`).

El logo Home y el logo 3D principal son objetos diferentes. La especificación `LOGO_SIZE = 545` no se aplica automáticamente al logo Home.

# Footer — CERRADO

El footer se divide en cuatro áreas, al mismo nivel vertical y centradas entre sí:

1. extrema izquierda — ABOUT US
2. centro izquierda — CONTACT
3. centro derecha — SOCIAL: Instagram, TikTok, Facebook y Email
4. extrema derecha — THE TMC CULTURE + texto de cultura

Social y Email serán enlaces reales y abrirán fuera de TMC World.

---

# Hotspots — CERRADO

Los hotspots son **3D projected clickable markers** vinculados a los waypoints de cámara.

No implementar hotspots como zonas invisibles dependientes de rangos de scroll.

---

# Cámara — CERRADO

- `PerspectiveCamera`
- Sin `OrbitControls`
- Controlada por código
- Trayectoria mediante `CatmullRomCurve3`
- Curva de posición independiente de la orientación/target cuando sea necesario
- Damping y movimiento cinematográfico
- Waypoints definidos para hero + cuatro áreas V1

---

# Scroll y animación — CERRADO

Usar:
- Lenis
- GSAP
- ScrollTrigger
- @gsap/react

Debe existir un único progreso compartido entre scroll, GSAP, cámara y transiciones relevantes.

No utilizar `scroll-world`. Corresponde a un pipeline de video/pre-renderizado y fue descartado para TMC World.

---

# Assets y composición — CERRADO

Debe existir un **Master Miami** como escena principal.

Tratamiento: **2.5D por capas**

Capas conceptuales:
- sky
- clouds
- skyline
- bay / water
- terrace / vegetation
- person

Las capas deben integrarse visualmente como una sola escena cinematográfica, no como collage.

La persona debe conservar tratamiento fotorrealista basado en el Master Miami aprobado.

Los assets originales deben conservarse como fuentes. La implementación debe permitir reemplazar posteriormente un asset sin cambiar la arquitectura o lógica del sitio.

---

# Performance — CERRADO

Presupuesto inicial objetivo: **< 3–4 MB antes de la interacción.**

KTX2 / Draco: optimización posterior, no requisito inicial.

La calidad gráfica se selecciona automáticamente según dispositivo/GPU/capacidad disponible. No crear inicialmente un toggle manual de calidad.

Considerar InstancedMesh, HDRI/iluminación baked cuando corresponda, `frameloop="demand"` cuando sea compatible, `invalidate`, control de peso de assets y reducción progresiva según dispositivo.

---

# WebGL y fallback — CERRADO

Debe existir:
- detección de WebGL
- tratamiento de `prefers-reduced-motion`
- fallback HTML semántico
- contenido accesible sin WebGL
- SEO básico independiente del render 3D

---

# Intro — CERRADO

Storyboard:
```text
0–2s   Stillness
2–5s   World breathes
5–8s   TMC emerges
8–10s  Transformation
10–12s THE MONEY COMPANY
12–15s YOUR WORLD. HANDLED.
15s+   EXPLORE
```

Debe existir Skip Intro en lower-right, pequeño, discreto y accesible. La sesión debe recordar que el usuario ya vio la intro para evitar repetirla innecesariamente.

---

# Las 4 unidades de negocio de V1 — CERRADO

| Unidad | Mensaje |
|---|---|
| TMC Luxury | **Your property. Our responsibility.** — Property Management |
| TMC Transport | **Your destination. Our expertise.** |
| TMC Cleaners | **Immaculate spaces for a better life.** |
| TMC Project Office | **Turning opportunities into execution.** |

Estas cuatro unidades constituyen el alcance V1.

---

# Diferido para revisión futura

## TMC Luxury Membership
Relacionado con autos, yates, artistas y luxury lifestyle. Queda fuera de V1. No incorporarlo sin instrucción explícita.

## Goldens.tmc
Posible elemento futuro del ecosistema. Queda fuera de V1. No incorporarlo sin instrucción explícita.

---

# Logo TMC 3D — CERRADO

Debe conservar color dorado premium, interacción metálica/HDRI, silueta frontal aprobada, posición, composición y orientación inicial.

```text
GOLD_COLOR = 0xC9A24B
```

Variables numéricas obligatorias:
```text
LOGO_SIZE
LOGO_THICKNESS
LOGO_ROTATION
LOGO_ROTATION_SPEED
```

Valores de referencia:
```text
LOGO_SIZE = 545
LOGO_THICKNESS = 2.0
RING_OUTER = 340
RING_INNER = 300
```

`LOGO_THICKNESS` debe ser un control numérico real y modificable. Los valores 1.0, 2.0 y 3.0 deben producir diferencias visuales claramente perceptibles en el volumen.

La modificación de `LOGO_THICKNESS` afecta profundidad, no X, Y, silueta frontal, escala X/Y ni composición.

No modificar cámara, FOV, perspectiva, background, iluminación, HDRI, composición ni posición inicial.

No crear un nuevo GLB si puede resolverse correctamente mediante geometría o procesamiento sobre el asset existente.

El asset debe permanecer reemplazable mediante una ruta centralizada.

---

# Arquitectura de código — CERRADO

Separar responsabilidades entre servidor y cliente.

## Server
- `app/layout.tsx`
- `app/page.tsx`
- route pages
- `generateMetadata`
- sitemap
- robots
- semantic fallback

## Client
- `WorldExperience`
- `WorldCanvas`
- `CameraRig`
- `IntroSequence`
- `HotspotOverlay`
- `HotspotRail`
- WebGL detection
- reduced-motion
- Lenis
- GSAP
- interacciones WebGL

---

# SEO — CERRADO

Debe existir estructura SEO por ruta.

JSON-LD:
- TMC Organization
- entidades relacionadas de las cuatro unidades V1

Descripciones base:

### TMC
“A private ecosystem that manages the complexities around the way you live.”

### TMC Luxury
“Private property management for high-value residences and estates.”

### TMC Transport
“Private mobility across ground, marine and aviation services.”

### TMC Cleaners
“Private home and property care for luxury residences and short-term rentals.”

### TMC Project Office
“Projects, investments and advisory focused on turning opportunities into execution.”

---

# Prohibiciones críticas

No:
- usar `scroll-world`
- convertir el proyecto en video scroll
- crear múltiples Canvas para cada unidad
- usar OrbitControls
- crear rutas espaciales independientes para overlays corporativos
- crear hotspots invisibles basados únicamente en rangos de scroll
- incorporar TMC Luxury Membership en V1
- incorporar Goldens.tmc en V1
- crear plataformas SaaS o portales en V1
- crear variantes paralelas innecesarias
- cambiar decisiones CERRADAS sin aprobación
- inventar información de negocio
- asumir información no confirmada

---

# Protocolo de sesión

Al comenzar una sesión de implementación:
1. Leer esta skill.
2. Abrir `docs/TMC_World_Master_Handoff.md`.
3. Revisar el último Gate Report disponible.
4. Ejecutar `git status`.
5. Confirmar qué fase/actividad se va a trabajar.
6. Verificar si existe alguna decisión CERRADA relacionada.
7. Implementar únicamente lo autorizado.

---

# Protocolo de implementación

Flujo obligatorio:

**Implementar → Validar → Gate Report → Revisar/Aprobar → Actualizar Master Handoff si corresponde → Git commit**

Antes de cerrar una fase:
- TypeScript sin errores
- ESLint sin errores relevantes
- build exitoso
- revisar `git status`
- revisar `git diff`
- verificar comportamiento visual cuando corresponda

---

# Gate Report

Cada fase significativa debe terminar con un Gate Report que indique:
- fase
- actividad(es)
- objetivo
- archivos modificados
- dependencias instaladas
- cambios realizados
- decisiones respetadas
- validaciones ejecutadas
- resultados
- errores
- riesgos
- pendientes
- siguiente paso recomendado

El Gate Report no sustituye al Master Handoff.

---

# Regla final

**No asumir.  
No inventar.  
No reabrir decisiones cerradas.  
No sobreconstruir.  
No crear variantes innecesarias.  
Implementar exactamente el alcance aprobado.  
Validar antes de cerrar.**

Si una decisión nueva es necesaria y no está definida en esta skill ni en el Master Handoff:

**DETENERSE → EXPLICAR → SOLICITAR APROBACIÓN.**
