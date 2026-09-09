# TMC WORLD — MASTER EXECUTION PROMPT FOR CLAUDE CODE
## FINAL V3 — DEFINITIVO, AUTOCONTENIDO, POR FASES

Este documento reemplaza a `TMC_World_Prompt_Claude_Code_Final.md` (V1) y a
`TMC_World_Prompt_Claude_Code_FINAL_v2.md` (V2). Es el resultado de auditar
los 12 documentos originales del proyecto (incluyendo
`TMC_World_MVP_Definition_ClaudeAI.md` y
`TMC_World_Arquitectura_MVP_ClaudeAI.md`, que definen explícitamente el rol
de "Claude AI" de producir este mismo paquete) contra el código real del
repositorio, para que Claude Code no necesite acceder a ninguno de esos 12
documentos — todo lo normativo que contenían ya está integrado aquí o en
`docs/TMC_World_Master_Handoff.md`.

Corrige las asunciones falsas de V1: (1) acceso a documentación externa
fuera de este paquete, (2) repositorio git con historial previo, (3)
conflicto de marca sin resolver en el storyboard de intro. Añade sobre V2:
(4) lista explícita de lo que V1 NO construye, (5) el CTA/formulario
"Private Inquiry" como requisito de validación, (6) clasificación P0/P1/P2
para hallazgos nuevos, (7) gobernanza de contenido/claims/privacidad, (8)
criterio de aceptación reforzado para `LOGO_THICKNESS`.

Esta revisión añade, a partir de defectos **confirmados por auditoría
visual** sobre una entrega real de Claude Code (no solo riesgos
históricos): (9) requisito explícito de background/mundo responsive al
viewport, (10) `TMC WEBSITE Base` como referencia de distribución/
proporciones sin convertir la experiencia en landing genérica, (11)
criterio anti-pixelación explícito en la optimización de assets, (12)
referencia visual obligatoria para el logo 3D (`tmc-logo-3d-final.html`)
sin alterar la especificación numérica ya cerrada, (13) prohibición
explícita de modificar los 4 logos de unidades operativas, (14)
referenciabilidad/reemplazabilidad generalizada a todos los assets, no
solo el logo, (15) prohibición explícita de que los overlays (TMC Luxury
y demás) se vean como dashboard/panel administrativo/modal genérico.

**Corrección posterior sobre el punto (10):** el archivo de referencia
inicial usado para `TMC WEBSITE Base` era incorrecto (era una captura de
una entrega previa de Claude Code, no un mockup de diseño). Se reemplazó
por `docs/reference/tmc-website-base.png`, el mockup correcto, y la
Sección 6.2 se reescribió con el detalle exacto de layout que contiene
(tratamiento de hotspots como insignias ícono+nombre+tagline conectadas
por arcos al logo central, distribución de header/footer) — excluyendo
explícitamente el texto de esa imagen que contradice la Sección 2.1
(muestra "THE MONEY COMPANY") o que no está en el copy aprobado. La regla
de marca de la Sección 2.1 no se reabre por esta imagen.

---

## 0. OBJETIVO OBLIGATORIO

Tu tarea NO es ejecutar una lista de tareas independientes.

Tu tarea es tomar el proyecto TMC World completo (código + documentación,
ambos entregados dentro de este mismo paquete) y entregar **TMC World V1
como una experiencia única, coherente y lista para producción**, ejecutada
en las 8 fases descritas en la Sección 3, con un Gate Report al cierre de
cada una.

No trabajes fase por fase de forma aislada sin mirar el conjunto. No
optimices un área rompiendo otra. No declares una fase completa solo
porque el build pasa — la Sección 10 (validación) es obligatoria en cada
fase que tenga impacto visual o funcional.

---

## 1. FUENTE DE VERDAD — SOLO LO QUE VIAJA EN ESTE PAQUETE

No asumas acceso a Project Knowledge de Claude.ai, a los documentos .docx
originales, ni a ninguna fuente externa. Todo lo que necesitas está dentro
del paquete que recibes:

| Prioridad | Archivo | Rol |
|---|---|---|
| 1 (máxima autoridad) | `docs/TMC_World_Master_Handoff.md` | Fuente de verdad principal. Decisiones marcadas CERRADA son baseline obligatorio. |
| 2 | `.claude/skills/00-tmc-context/SKILL.md` | Resumen operativo del Master Handoff, para no releerlo completo en cada sesión. Debe estar alineado con el Master Handoff; si detectas una diferencia entre ambos, el Master Handoff gana y debes reportarlo. |
| 3 | `TMC_World_Prompt_Claude_Code_FINAL_v3.md`, **en la raíz del proyecto, dentro de este mismo paquete** (no solo como adjunto de chat) | Plan de ejecución vigente. Sustituye cualquier prompt anterior. |
| 4 | `content/tmc-world/*.md` | Copy aprobado, fuente de contenido del sitio. |
| 5 | `public/assets/tmc-world/*` | Assets aprobados. No reemplazar sin justificación. |
| 6 | `docs/reference/tmc-website-base.png` | **Referencia visual** de distribución, jerarquía y proporciones de UI (`TMC WEBSITE Base`). No es fuente de copy ni de reglas de marca — ver Sección 6.2. |
| 7 | `docs/reference/tmc-logo-3d-final.html` | **Referencia visual** de la apariencia aprobada del logo 3D (dorado, volumen, aro). No es la especificación técnica — ver Sección 7. |

**Este documento (`TMC_World_Prompt_Claude_Code_FINAL_v3.md`) viaja
físicamente dentro del snapshot, en la raíz del proyecto, junto a
`package.json`.** Esto es intencional, no accidental — corrige el
incidente de una ejecución anterior en la que el adjunto de chat de este
mismo archivo desapareció tras un reset de sesión. Consecuencia práctica:

- **Si el adjunto de chat de este `.md` o del zip ya no está disponible,
  pero el archivo existe en la raíz del proyecto que ya tienes extraído
  en disco, eso NO es un bloqueo.** El archivo en disco es la fuente de
  verdad vigente — sigue trabajando con él, no te detengas solo por no
  tener el adjunto de chat.
- **Lo que sí sigue siendo un bloqueo real** (ver Sección 4): que el
  directorio de trabajo muestre indicios de no ser una extracción íntegra
  de este paquete — por ejemplo, si falta alguno de los 7 archivos de
  esta tabla, o si `.git` ya existe con historial que no se originó en
  tus propios commits de Fase 0 en adelante de esta misma ejecución. Eso
  sí exige detenerse y pedir el snapshot de nuevo, aunque el `.md` esté
  presente.

Los archivos 6 y 7 son referencias de imagen/HTML, no código a ejecutar ni a
copiar. Si alguno de los dos no está presente en el paquete que recibes,
detente y repórtalo en el Gate Report de Fase 0 — no continúes las Fases
3/4 que dependen de ellos (mundo/logo, header/footer/overlays) inventando
su contenido a partir de la descripción textual de este documento.

No existen 12 documentos externos que leer. Si en algún comentario del
código encuentras referencias a documentos que no están en este paquete
(`Base_conocimiento_ALTEREA`, `Creacion_de_GPT`, etc.), trátalos como
contexto histórico no disponible — no los necesitas para ejecutar V1, y no
debes inventar su contenido.

Si el Master Handoff y el código actual se contradicen en algo que **no**
está resuelto explícitamente en este documento, detente y pregunta. No
asumas, no decidas por tu cuenta.

---

## 2. DECISIONES NUEVAS QUE SUSTITUYEN AL MASTER HANDOFF (aprobadas por Javi, 9 sept 2026)

El Master Handoff sigue siendo la fuente de verdad principal, pero las dos
correcciones siguientes fueron aprobadas explícitamente y tienen prioridad
sobre el texto actual del Master Handoff en esos puntos exactos:

### 2.1 Regla de marca pública — CORRECCIÓN

La marca pública vigente de cara al usuario es **TMC**. El nombre
histórico **"The Money Company"** no debe aparecer en ningún contenido
visible: copy, UI, navegación, overlays, intro, footer, SEO, metadata,
JSON-LD, ni comunicación de cara al cliente. Puede existir únicamente como
referencia histórica/documental interna (comentarios de código, este
Master Handoff), nunca en algo que el usuario final vea o lea.

Esto corrige dos puntos específicos del Master Handoff que aún dicen lo
contrario y deben actualizarse como parte de la Fase 1:

- Sección 4 ("Contenido maestro aprobado"), fila `TMC → THE MONEY COMPANY`
  → cambiar a `TMC → A PRIVATE ECOSYSTEM FOR THE WAY YOU LIVE` (reutilizar
  el positioning ya aprobado en la misma tabla) o dejar la celda vacía si
  no aplica un segundo copy ahí.
- Sección 7.1 (storyboard de intro), fila `10–12s → THE MONEY COMPANY` →
  cambiar a `10–12s → TMC`.

Y dos puntos específicos del código, también en Fase 1:

- `src/components/world/IntroSequence.tsx`: el nodo
  `<div className="intro__line--company">THE MONEY COMPANY</div>` (línea
  ~92) y su comentario `// 10–12s: THE MONEY COMPANY` (línea ~45) deben
  actualizarse a `TMC` — evalúa si en ese bloque del timeline el wordmark
  `TMC` (línea ~90) ya cumple esta función y el nodo `--company` debe
  eliminarse en vez de solo cambiar su texto, para no duplicar "TMC" dos
  veces seguidas en el mismo momento del intro. Usa criterio visual, no
  elimines nada sin revisar cómo se ve.
- `src/components/fallback/StaticHero.tsx`: el comentario que dice que el
  reveal de "The Money Company" en `IntroSequence` es una excepción
  aprobada de la regla de marca pública queda obsoleto. Actualízalo para
  reflejar que ya no existe esa excepción.

Este es un cambio pequeño y de bajo riesgo técnico, pero es una decisión
de marca — trátalo como tal: un solo cambio coherente en documentación y
código a la vez, no una excusa para tocar nada más del intro.

### 2.2 Alcance de las 4 unidades — SIN CAMBIOS, SOLO CONFIRMACIÓN

El Master Handoff (secciones 27–30) ya resuelve esto y no requiere ninguna
decisión nueva: **TMC Luxury = Private Property Management**, TMC
Transport, TMC Cleaners, TMC Project Office. TMC Luxury Membership y
Goldens.tmc quedan fuera de V1 y no bloquean nada. El código actual
(`hotspots.config.ts`, `content/tmc-world/luxury.md`) ya implementa
correctamente esta versión. No hay trabajo pendiente aquí — se documenta
solo para que no se reabra por error.

---

## 2.3 Lo que TMC World V1 explícitamente NO construye

Ya definido en el Master Handoff y en la Arquitectura MVP; se repite aquí
como lista de control directa, no de memoria:

- CMS, API de contenido, base de datos.
- CDN externo o storage externo para assets.
- Plataforma de gestión de assets, manifest complejo, versionado avanzado.
- Portal de clientes, CRM, SaaS, workflows operativos.
- Private Client Portal, Property Management Platform, Vendor
  Intelligence, AI Decision Support, Client-Owned Asset Support, Project
  Office Workspace, Unified CRM, Reporting Layer — estas son capacidades
  futuras documentadas; no son parte del launch público.
- TMC Luxury Membership, Goldens.tmc, o cualquier unidad nueva.
- Migración de `content/tmc-world/` a JSON/CMS/API.
- Toggle manual de calidad gráfica.
- Batería extensa de tests automatizados — validación funcional/visual
  dirigida (Sección 9/10) es suficiente; no construir infraestructura de
  testing como entregable de V1.

Si durante la ejecución identificas una mejora que no está en el alcance
de las fases de la Sección 3, clasifícala así antes de tocar nada:

- **P0** — imprescindible para entregar V1 tal como está definido aquí.
- **P1** — alto valor, bajo riesgo, impacto directo en calidad visual o
  funcional; puede ejecutarse dentro de la fase correspondiente.
- **P2** — mejora futura / V2. Se documenta en el Gate Report. **No se
  implementa.**

No conviertas una preferencia de implementación en bloqueador, y no
conviertas un P2 en trabajo de V1 por iniciativa propia.

---

## 3. ESTRUCTURA DE EJECUCIÓN — 8 FASES CON GATE REPORT

No ejecutes todo en una sola corrida. Cierra cada fase con validación y un
Gate Report (formato en Sección 10) antes de continuar a la siguiente.
Haz `git commit` al cerrar cada fase (ver Sección 4 sobre git).

| Fase | Nombre | Contenido |
|---|---|---|
| 0 | Setup & Auditoría | `git init` + commit baseline; `npm install`; correr `tsc`/`eslint`/`build` sobre el estado actual tal cual (aunque falle) para tener una línea base real; leer Master Handoff + skill; confirmar que no hay más desviaciones de marca además de las ya identificadas en la Sección 2.1 (grep de "money company" en todo el repo). |
| 1 | Corrección de marca | Aplicar la Sección 2.1 completa: 2 ediciones en Master Handoff, 2 en código. Validar visualmente el intro después del cambio. |
| 2 | Optimización de assets | Ver Sección 5. Sin tocar composición ni calidad visual aprobada. |
| 3 | Mundo / cámara / hotspots | Verificar y corregir contra la lista de "problemas visuales conocidos" (Sección 6), incluyendo background responsive (6.1), tratamiento visual de hotspots como insignias ícono+nombre+tagline (6.2), logos de unidad sin modificar (6.2), y la especificación + referencia visual del logo 3D (Sección 7). |
| 4 | Header / footer / overlays | Overlays corporativos (OUR PURPOSE/VISION/PROMISE/VALUES/CLIENTS) integrados al mundo, no como dashboard (6.3); distribución de header/footer guiada por `TMC WEBSITE Base` (6.2, sin su copy); footer de 4 zonas con íconos sociales; wiring de `content/tmc-world/*.md`. |
| 5 | Responsive / accesibilidad / fallback | Desktop/tablet/mobile, detección WebGL, `prefers-reduced-motion`, `StaticHero` sin JS/WebGL. |
| 6 | SEO / JSON-LD | Metadata por ruta, JSON-LD por unidad — ya limpio de marca histórica hoy; solo confirmar que sigue así tras las fases anteriores. |
| 7 | Validación de sistema y cierre | Checklist completo de la Sección 9. Gate Report final + commit de cierre. |

Si una fase revela que otra fase ya cerrada se rompió, corrígela antes de
avanzar — no acumules deuda entre fases.

**Pausa obligatoria entre fases (esto no quedó suficientemente explícito
en versiones previas y se incumplió una vez — corregido aquí):** al cerrar
cada fase con su Gate Report y commit, **detente y espera confirmación
antes de iniciar la siguiente fase.** No continúes automáticamente de
Fase 3 a Fase 4, ni encadenes las 8 fases en una sola corrida sin pausa.

**El silencio no es aprobación.** Solo un mensaje explícito de Javi en el
chat autoriza avanzar a la siguiente fase — el mero hecho de que la
sesión siga activa, de que no haya objeción inmediata, o de que puedas
técnicamente seguir ejecutando comandos, no cuenta como confirmación. Si
trabajas en un modo genuinamente no interactivo donde no puedes esperar
una respuesta en vivo, dilo explícitamente al inicio del Gate Report ("no
se puede pausar en este modo, requiere confirmación antes de Fase N+1")
en vez de asumir aprobación implícita y seguir.

**Criterio de "confirmado visualmente" (aplica a partir de Fase 3):** una
fase con impacto visual no se declara cerrada solo porque el código
compila o porque tú (Claude Code) describes el resultado como correcto en
texto. El criterio real es la captura de pantalla — si no puedes generar
o adjuntar una captura real del navegador para que se revise, marca la
fase como "pendiente de validación visual humana" en el Gate Report en
vez de "confirmado" o "completo".

---

## 4. GIT — EL ZIP ES EL SNAPSHOT, NO HAY HISTORIAL PREVIO

No existe `.git` en este paquete. No asumas historial previo que
preservar. En la Fase 0:

1. `git init` en la raíz del proyecto.
2. Un primer commit con el estado exacto tal como llegó el paquete, antes
   de cualquier cambio tuyo — este es el punto de restauración.
3. A partir de ahí, un commit al cierre de cada fase (Sección 3), con
   mensaje que identifique la fase y un resumen de qué cambió.
4. No hagas push remoto — no hay remoto configurado y no está autorizado.

**Cuándo detenerse por el snapshot (leer junto con la Sección 1):**
detente por completo, no continúes ejecutando fases, y pide que se te
entregue de nuevo el paquete si se cumple **cualquiera** de esto:

- Falta alguno de los 7 archivos listados en la Sección 1 en el
  directorio de trabajo actual.
- El directorio ya tiene `.git` con commits que no reconoces como propios
  de esta misma ejecución (empezando por tu commit de Fase 0) — no
  asumas que un historial preexistente es "el mismo proyecto de sesiones
  anteriores tuyas" sin poder verificarlo; esto ya ocurrió una vez y no
  se debe repetir.

**Lo que NO es motivo para detenerse:** que el adjunto de chat del zip o
de este `.md` haya dejado de estar disponible tras un reset de sesión,
siempre que el archivo `TMC_World_Prompt_Claude_Code_FINAL_v3.md` y los 6
archivos restantes de la Sección 1 sigan presentes en el directorio de
trabajo — su presencia física en el proyecto ya extraído es prueba
suficiente de que forman parte del snapshot entregado. No trates la
ausencia del adjunto de chat como equivalente a "el zip no está
disponible": son cosas distintas.

Trabajar sobre una base no verificada no es una forma válida de avanzar
más rápido — es la forma más segura de tener que rehacer trabajo después.

---

## 5. OPTIMIZACIÓN DE ASSETS — CRITERIO DE ACEPTACIÓN DE FASE 2

Estado actual verificado: la carga inicial real (las 6 capas del mundo en
`SceneLayers.tsx` + el GLB activo del logo) pesa aproximadamente **3.3 MB**
— dentro del presupuesto CERRADO de <3–4 MB, pero sin margen. El archivo
más pesado de esa carga inicial es `sky-clouds.png` (~1.3 MB, PNG sin
comprimir). Los 4 PNG de unidades operativas (`tmc-luxury.png`, etc., ~1.2
MB cada uno) NO forman parte de esta carga inicial — se sirven vía
`next/image` a 144×144, que ya los optimiza automáticamente en tiempo de
build/request; no requieren la misma urgencia. `tmc-logo-3d-original.glb`
es un archivo fuente/backup — confirma que no se importa en ningún
componente (hoy no se importa; mantenlo así).

Objetivo de Fase 2:

- Convertir `sky-clouds.png` (y evalúa el resto de las 6 capas) a
  WebP/AVIF con compresión sin pérdida perceptible, para dejar margen real
  bajo el presupuesto de 3–4 MB en vez de estar al límite.
- No reducir resolución ni recortar composición sin necesidad — el
  objetivo es peso de archivo, no calidad visual.
- Validar visualmente después de cada conversión (Playwright/Chromium
  headless, capturas en los waypoints principales) para confirmar que no
  hay artefactos de compresión perceptibles.
- Reportar en el Gate Report de Fase 2 el peso antes/después de cada
  asset tocado.

**Criterio anti-pixelación explícito (defecto confirmado activo en la
implementación auditada — el skyline y el fondo se han visto pixelados
respecto a la calidad fuente):**

- El peso es una restricción secundaria a la calidad perceptual, no al
  revés — no reducir agresivamente resolución/calidad solo para cumplir
  el presupuesto de 3–4 MB.
- No hacer upscaling de ningún asset — usar la resolución real disponible
  en la fuente.
- La resolución servida debe corresponder al tamaño real de renderizado
  en pantalla (considerando densidad de píxeles del dispositivo), ni por
  debajo (pixelación) ni innecesariamente por encima (peso desperdiciado).
- Si un asset se ve pixelado en cualquier viewport probado (Sección 6.1),
  esa capa no está optimizada correctamente — es un defecto, no un
  trade-off aceptable del presupuesto de carga.

---

## 6. PROBLEMAS VISUALES CONOCIDOS A INSPECCIONAR EN FASE 3

Estos ya no son solo riesgos históricos: una auditoría visual sobre una
entrega real (`localhost:3000` y `/luxury`) confirmó que varios siguen
presentes hoy. Trátalos como defectos activos a corregir, no como lista
de verificación opcional:

- Logo TMC central con escala incorrecta o sin la presentación física de
  anillo dorado correcta. **Confirmado activo**: el logo se ha visto
  renderizando como texto plano superpuesto/espejado ("DMT" en vez de
  "TMC" legible), en color oliva/bronce en vez de dorado `#C9A24B`, sin
  lectura clara de volumen 3D — ver Sección 7.
- Logo sin rotación, o rotación implementada incorrectamente (debe ser en
  runtime, sección 7, nunca horneada en el asset).
- Círculo con apariencia artificial en vez de anillo físico intencional.
- Composición de cámara/fondo pobre; skyline aplanado o mal proporcionado.
- Recorte o distorsión de imágenes.
- **Background no responsive al viewport. Confirmado activo** — ver
  Sección 6.1.
- Calidad de imagen degradada/pixelada en las capas del mundo (skyline,
  sky/clouds). **Confirmado activo** — ver Sección 6.1 y Sección 5.
- Tipografía de header/footer débil; contraste insuficiente.
- Logos de unidades operativas visualmente subordinados al punto de ser
  ilegibles, o modificados respecto al archivo oficial — ver Sección 6.2.
- Overlays de unidades (TMC Luxury y las demás) con apariencia de
  dashboard/panel administrativo/modal genérico en vez de integrarse al
  mundo cinematográfico. **Confirmado activo** — ver Sección 6.3.
- Footer con apariencia de barra superpuesta sobre la escena en vez de
  sentirse integrado al mundo (mismo espíritu que 6.3, aplicado al
  footer). **Confirmado activo.**
- Cualquier UI/badge de desarrollo visible accidentalmente en la
  experiencia final. **Confirmado activo**: un círculo/badge pequeño
  (marcador de accesibilidad o herramienta de desarrollo, visible como
  "N" en la esquina inferior izquierda) aparece en producción — debe
  identificarse su origen (extensión del navegador vs. algo del propio
  código) y, si viene del código, eliminarse.

### 6.1 Background / mundo visual — debe ser responsive, no estático

Requisito explícito, no implícito en "responsive" general:

- El background/mundo visual (las capas de `SceneLayers.tsx`) debe
  adaptarse dinámicamente al tamaño y aspect ratio real del viewport del
  navegador en todo momento, incluyendo al redimensionar la ventana en
  vivo — no solo en la carga inicial.
- No debe quedar estático, en blanco/negro, deformado, con cropping
  incorrecto, ni pixelado al cambiar tamaño o proporción de ventana.
- Debe conservar la composición aprobada (parallax por capas, Sección 8)
  y la calidad visual de cada capa.
- No es aceptable una pantalla en negro/vacía mientras el mundo carga sin
  ningún feedback — si hay un estado de carga, debe ser intencional y
  breve, nunca un fallo silencioso que parezca la página rota.
- **Solución proporcional al problema**: no introduzcas una arquitectura
  nueva de manejo de viewport — el cálculo por frustum de cámara que ya
  existe en `SceneLayers.tsx` es la base correcta; el defecto a corregir
  es que ese cálculo no se está aplicando o actualizando correctamente en
  todos los tamaños/eventos de resize, no que el enfoque esté mal.
- **Criterio de aceptación**: validar visualmente (Playwright/Chromium)
  en al menos 3 anchos de viewport representativos de desktop, tablet y
  mobile, y confirmar ausencia de deformación, cropping incorrecto,
  pixelación o composición rota en cada uno.

### 6.2 TMC WEBSITE Base — referencia de distribución y tratamiento de hotspots, NUNCA de copy ni de marca

`docs/reference/tmc-website-base.png` (ver Sección 1) es la referencia
visual aprobada para distribución, jerarquía y proporciones. **Regla
explícita de prioridad**: si algún texto visible en esta imagen entra en
conflicto con la Sección 2.1 (regla de marca) o con el copy aprobado en
`content/tmc-world/*.md` / Master Handoff, el texto de la imagen **se
ignora**. Esta imagen nunca es fuente de copy ni de reglas de marca, solo
de layout. En particular:

- El círculo central de la imagen muestra el texto "THE MONEY COMPANY"
  bajo "TMC". **No usar ese texto.** El logo 3D central mantiene su
  especificación de la Sección 7 (dorado, aro, rotación) y, si se muestra
  texto de apoyo bajo el logo en el home, debe ser el copy ya aprobado
  ("Your world. Handled." / "A private ecosystem for the way you live."),
  nunca el nombre histórico.
- El tagline superior derecha de la imagen ("A BETTER LIFE. A BRIGHTER
  TOMORROW.") no está en el copy aprobado — no lo repliques. Si el header
  lleva un elemento en esa posición, usa el CTA "Private Inquiry" ya
  establecido (Sección 8), no un tagline nuevo.
- Los taglines laterales del hero ("A LIFE WELL MANAGED" / "TIME IS THE
  ULTIMATE LUXURY") sí corresponden a copy aprobado del Master Handoff —
  úsalos, pero con la redacción exacta ya aprobada, no la paráfrasis de la
  imagen (ej. el cierre correcto es "ONE COMPANY. MULTIPLE CAPABILITIES.
  ONE STANDARD.", no "MULTIPLE CAPABILITIES. ONE COMPANY.").

Lo que sí debe tomarse de la imagen como guía de **layout y tratamiento
visual** (esto es lo valioso y lo que faltaba especificar):

- **Header**: logo TMC pequeño a la izquierda, los 5 items de navegación
  centrados con separadores verticales delgados (OUR PURPOSE | OUR VISION
  | OUR PROMISE | OUR VALUES | OUR CLIENTS), y el espacio superior derecho
  reservado para el CTA "Private Inquiry" (no para un tagline).
- **Hero — tratamiento de hotspots**: los 4 hotspots de unidad se
  presentan como insignias circulares (badge), cada una con: el **logo
  PNG oficial de la unidad** como marca central de la insignia
  (`tmc-luxury.png`, `tmc-transport.png`, `tmc-cleaners.png`,
  `tmc-project-office.png` — el mismo archivo real, no un ícono de línea
  nuevo dibujado a mano; ver la aclaración más abajo en esta misma
  sección sobre por qué no se crean íconos nuevos), el nombre de la
  unidad en dos líneas, y su tagline de una sola línea debajo — usando el
  copy ya aprobado por unidad (`label`, `positioning`, `message` que ya
  existen en `hotspots.config.ts`, no texto nuevo).

  **Regla explícita, sin excepción**: usar únicamente los logos PNG
  oficiales de las cuatro unidades. No crear ni agregar íconos
  independientes de casa, avión, hoja, gráfico ni ninguna otra
  iconografía para sustituir o complementar esos logos — ni como
  reemplazo ni como elemento adicional junto al logo oficial.

  Las 4 insignias se
  distribuyen en los cuadrantes alrededor del logo 3D central (coherente
  con los `anchor` ya definidos en `hotspots.config.ts`) y se conectan al
  centro mediante arcos dorados delgados como motivo decorativo — esto es
  tratamiento visual del hotspot ya existente, no una arquitectura nueva:
  siguen siendo 3D projected clickable markers (Sección 8), solo con esta
  composición de ícono+nombre+tagline en vez de una etiqueta simple o un
  círculo vacío.

  **Proporciones exactas (medidas sobre la referencia, defecto confirmado
  por captura real — actualmente los 4 hotspots están amontonados y
  diminutos junto al centro):**
  - Diámetro de cada insignia ≈ 74% del diámetro del logo 3D central (en
    la referencia son casi del mismo tamaño, no un elemento secundario
    pequeño). El diámetro de insignia objetivo es proporcional al
    `LOGO_SIZE` real corregido (Sección 7), no un valor fijo pequeño
    independiente.
  - Distancia del centro del logo al centro de cada insignia ≈ 1.0x el
    diámetro del logo central (debe haber aire real entre el borde del
    logo y el borde de cada insignia, conectado por el arco — no deben
    tocarse ni superponerse).
  - Si al implementar esto el conjunto (logo + 4 insignias + arcos) no
    cabe con margen dentro del hero en algún viewport, reduce el
    conjunto completo proporcionalmente — nunca solo el logo o solo las
    insignias por separado, la relación 74%/1.0x entre ellos se mantiene.
- **Footer**: mantiene las 4 zonas ya establecidas (Sección 8); el bloque
  SOCIAL usa íconos de marca (Instagram/TikTok/Facebook/sobre de email)
  en vez de solo texto — aplica esto si el footer actual usa únicamente
  texto para esos enlaces.

Esto **no** significa convertir TMC World en una copia de esa referencia
ni en una landing page convencional — el lenguaje visual final sigue
siendo premium + cinematic + editorial + immersive 3D. Usa la imagen para
calibrar proporciones, jerarquía y el tratamiento de cada hotspot, nunca
para su texto.

Los 4 logos de unidades operativas deben usarse **exactamente** como los
archivos oficiales entregados en `public/assets/tmc-world/`
(`tmc-luxury.png`, `tmc-transport.png`, `tmc-cleaners.png`,
`tmc-project-office.png`) — no redibujar, recolorear, deformar, recortar,
reinterpretar ni sustituir por versiones generadas (incluyendo los íconos
de línea que se ven en la imagen de referencia: si el archivo oficial no
tiene ese ícono, no se agrega uno nuevo — el ícono es un elemento del
mockup conceptual, el logo oficial del PNG es el que se usa). Pueden
escalarse proporcionalmente para el layout, conservando su relación de
aspecto e identidad gráfica intactas.

### 6.3 Overlays de unidades — integrados al mundo, no dashboard

TMC Luxury y los demás overlays de unidad operativa (Sección 12 del brief
original / contenido en `content/tmc-world/*.md`) no deben verse ni
comportarse como:

- panel administrativo o dashboard;
- aplicación SaaS;
- modal genérico tipo caja flotante sin relación con la escena;
- plantilla corporativa genérica.

Deben sentirse como parte del mundo: premium, cinematográficos,
editoriales, sofisticados, discretos — con transición y encuadre
coherentes con la cámara y el fondo, no como una superposición
desconectada de la experiencia 3D. Si la implementación actual muestra el
contenido de unidad como un panel lateral fijo o una caja modal
desconectada visualmente del mundo detrás, es el defecto a corregir en
esta fase — sin rediseñar la arquitectura de overlays (siguen siendo
overlays 2D sobre el Canvas, Sección 8), sino su tratamiento visual.

---

## 7. LOGO 3D TMC — ESPECIFICACIÓN NUMÉRICA (CERRADO, SIN CAMBIOS)

Asset activo: `public/assets/tmc-world/tmc-logo-3d.glb` (único que debe
cargarse en runtime — ver Sección 5). Backup/fuente:
`tmc-logo-3d-original.glb` (no se carga en la app).

```
GOLD_COLOR = 0xC9A24B
LOGO_SIZE = ver corrección abajo — NO es 545 en el código real
LOGO_THICKNESS = 2.0
LOGO_ROTATION = 'y'
LOGO_ROTATION_SPEED = 0.8
RING_OUTER = 340
RING_INNER = 300
```

**Aclaración crítica sobre el sistema de unidades de `LOGO_SIZE` (verificado
directamente en `TmcLogo.tsx`, no asumido):** `545` es un número que solo
existe en `tmc-logo-3d-final.html` (unidades tipo pixel/CSS de esa
referencia visual). En la escena real de Three.js, el código traduce ese
mismo tamaño a **unidades de mundo** mediante una calibración propia — el
valor real de `LOGO_SIZE` en `TmcLogo.tsx` **no es 545**. `545` sigue
existiendo en el código únicamente como `RING_REFERENCE_LOGO_SIZE`, una
constante fija que se usa solo para calcular la proporción del aro
(`RING_SCALE = LOGO_SIZE / 545`) — **no la cambies**, cambiarla rompe el
cálculo del aro sin necesidad.

**Corrección real a aplicar**: toma el valor actual de `LOGO_SIZE` que
encuentres en `TmcLogo.tsx` en el momento de ejecutar esta fase (no
asumas cuál es — verifícalo leyendo el archivo) y redúcelo
proporcionalmente en la misma proporción medida sobre capturas reales:
**~40% del valor actual** (equivalente a la corrección 545→220 calculada
sobre la referencia, aplicada al sistema de unidades real del código, no
al número de la referencia). Ejemplo: si el valor actual es 30, el punto
de partida es ~12; si es otro número, aplica la misma proporción (×0.4)
a ese número, no a 545 ni a 220 directamente — esos dos números son de
sistemas de unidades distintos al de tu código real.

**Este valor no es definitivo hasta confirmarse visualmente**, igual que
antes: aplica la reducción, toma captura real en al menos un viewport, y
si el logo no queda razonablemente cerca de ~15% del ancho del viewport,
ajusta el valor dentro de esta misma Fase 3 hasta que la proporción
visual coincida — documenta en el Gate Report el valor final usado y
el valor de partida que tenía el código antes de tu cambio. `RING_OUTER`,
`RING_INNER`, `GOLD_COLOR`, `LOGO_THICKNESS`, `LOGO_ROTATION` y
`LOGO_ROTATION_SPEED` siguen cerrados sin cambios. El aro se reescala
automáticamente con `LOGO_SIZE` por el cálculo `RING_SCALE` ya existente
en el código — no necesitas tocar `RING_OUTER`/`RING_INNER` para que el
aro se reduzca junto con el resto.

`LOGO_THICKNESS` debe ser un control numérico real: 1.0, 2.0 y 3.0 deben
producir diferencias de volumen claramente perceptibles, afectando solo
profundidad — no X/Y, silueta frontal, escala ni composición. No modificar
cámara, FOV, iluminación, HDRI ni posición inicial. No generar un nuevo
GLB si el ajuste puede resolverse con geometría/procesamiento sobre el
asset existente.

**Criterio de aceptación explícito (falla histórica documentada):** en
iteraciones previas de este proyecto, el valor numérico de
`LOGO_THICKNESS` cambiaba pero el volumen visual apenas variaba —
`THICKNESS` no puede resolverse con `scale` uniforme. La prueba de
aceptación es visual, no numérica: capturar el logo en 1.0, 2.0 y 3.0 y
confirmar por inspección (Playwright/Chromium) que la diferencia de
volumen es evidente entre los tres. Si el número cambió pero el resultado
visual se ve casi igual, la tarea NO está terminada.

Recuerda: hay **dos** instancias distintas del logo TMC y no deben
confundirse — el logo Home (pequeño, esquina superior izquierda,
persistente, funciona como link a `/`) y el logo 3D principal del
escenario (sujeto a esta especificación numérica). La corrección de
`LOGO_SIZE` de esta sección no se aplica automáticamente al logo Home.

### 7.1 Referencia visual obligatoria — `tmc-logo-3d-final.html`

`docs/reference/tmc-logo-3d-final.html` (ver Sección 1) es la referencia
visual aprobada de cómo debe leerse el logo terminado: dorado metálico
`#C9A24B`, volumen físico real, rotación visible sobre el eje Y, y un aro
circular independiente que forma parte de la composición aprobada — no un
círculo artificial plano ni un elemento 2D falso.

**Jerarquía explícita entre el HTML y los valores numéricos**: el HTML es
referencia visual (cómo se debe ver el resultado). Los valores numéricos
de este documento (`GOLD_COLOR`, `LOGO_SIZE` corregido según Sección 7,
`LOGO_THICKNESS = 2.0`, `LOGO_ROTATION = 'y'`, `LOGO_ROTATION_SPEED =
0.8`, `RING_OUTER = 340`, `RING_INNER = 300`) son la especificación
técnica y tienen prioridad sobre cualquier valor que puedas inferir del
HTML por interpretación propia. Si el HTML sugiriera visualmente un valor
distinto, los números de esta sección ganan — usa el HTML solo para
calibrar la intención visual (dorado, volumen, aro, rotación, proporción
interna letras/aro), no para extraer medidas. **Nota importante sobre
unidades**: el HTML usa `LOGO_SIZE = 545` en su propio sistema de
unidades (pixel/CSS de esa página standalone) — ese número **no es
directamente trasplantable** al código real, que usa un sistema de
unidades de mundo distinto (ver la aclaración completa en Sección 7). No
copies "545" literalmente al código.

**Defecto confirmado activo a corregir en Fase 3**: en la implementación
auditada, el logo se renderiza en algunos casos como texto plano
superpuesto (letras "TMC"/"DMT" espejadas o mal ordenadas, sin volumen
legible), en un tono oliva/bronce en vez de dorado, y sin que el aro se
lea como elemento independiente, **y además ocupa ~37% del ancho del
viewport tanto en home como en rutas de unidad, cuando la referencia
aprobada indica ~15%** — ver la corrección de `LOGO_SIZE` en la Sección 7
(nota: el número a corregir en el código real no es "545", verifica el
valor actual en `TmcLogo.tsx`). El resultado final debe coincidir con la
intención visual del HTML de referencia (TMC legible, dorado, con
volumen y aro reales) y con la
proporción de tamaño de `TMC WEBSITE Base` — no una aproximación plana ni
sobredimensionada.

---

## 8. ARQUITECTURA, RUTAS, CÁMARA, SCROLL, HOTSPOTS, FOOTER, INTRO (CERRADO, SIN CAMBIOS)

Todo lo siguiente ya está resuelto en el Master Handoff y ya implementado
correctamente en el código actual — se documenta aquí para que Claude Code
no lo reabra, no para que lo reconstruya:

- Un único `<Canvas>` R3F persistente, un único mundo 3D.
- Routing Hybrid B: `/`, `/luxury`, `/transport`, `/cleaners`,
  `/project-office` — todas cargan el mismo mundo y transicionan cámara al
  waypoint correspondiente. Ruta directa = cámara va al waypoint. Click en
  hotspot = transición de cámara + actualización de URL + mismo contexto
  de mundo.
- Cámara: `PerspectiveCamera`, sin `OrbitControls`, trayectoria
  `CatmullRomCurve3`, curva de orientación separada cuando corresponda,
  damping.
- Scroll: Lenis + GSAP/ScrollTrigger + `@gsap/react`, un único progreso
  compartido entre scroll/GSAP/cámara. No usar `scroll-world` (pipeline de
  video pre-renderizado) — evaluado y descartado.
- Hotspots: 3D projected clickable markers, parte espacial del mundo, no
  botones HTML flotantes genéricos.
- Header: overlays 2D (OUR PURPOSE/VISION/PROMISE/VALUES/CLIENTS) sobre el
  mundo, no waypoints espaciales.
- Footer, 4 zonas: extrema izq. ABOUT US · centro-izq. CONTACT ·
  centro-der. SOCIAL (Instagram, TikTok, Facebook, Email) · extrema der.
  THE TMC CULTURE. Enlaces externos configurables, no inventar
  destinos reales si no están dados.
- Intro: storyboard de la Sección 2.1 (ya corregido), Skip Intro discreto
  en esquina inferior derecha, recordado en `sessionStorage`.
- Assets: Master Miami 2.5D por capas (sky/clouds, skyline, bay/water,
  islands/vegetation, terrace, person) — una sola escena cinematográfica,
  no un collage.
- **Private Inquiry**: el bloque CONTACT del footer tiene como CTA
  primario "PRIVATE INQUIRY" ("Tell us what matters. We'll help
  determine what comes next."), con el flujo aprobado You Connect → We
  Understand → We Connect the Right Capabilities → We Move Forward. Ya
  existe implementación (`PrivateInquiryForm.tsx`, tracking en
  `lib/analytics/track.ts`, copy en `content/tmc-world/footer.md`) — no
  es una funcionalidad nueva a construir, es un componente crítico a
  **verificar** en la Fase 4 y la Fase 7: el formulario debe funcionar
  end-to-end (envío, feedback al usuario, tracking), sin necesidad de
  backend/CRM propio — un servicio de formulario simple (ej. envío por
  email o endpoint ligero) es suficiente para V1; no construir un CRM
  para esto (ver Sección 2.3).

### 8.1 Assets — referenciabilidad y reemplazabilidad generalizada

Esta regla ya existía para el logo 3D (Sección 7: "asset reemplazable
mediante ruta centralizada") y para el registro de assets en
`src/config/tmcAssets.ts` — aquí queda generalizada explícitamente a
**todos** los assets visuales del mundo, no solo el logo:

- Todo componente debe consumir la referencia/ruta del asset (imágenes,
  logos, modelos 3D) desde el registro centralizado existente
  (`tmcAssets.ts` u homólogo), nunca una ruta hardcodeada dentro del
  componente.
- Si más adelante se reemplaza un archivo de asset conservando el mismo
  nombre/ruta, la aplicación debe seguir funcionando sin tocar los
  componentes que lo consumen.
- Esto es un principio de desacoplamiento, no una autorización para
  construir infraestructura: sigue sin implementarse en V1 ningún CMS,
  API, base de datos, CDN/storage externo, manifest complejo ni sistema
  de versionado/cache (ya establecido en Sección 2.3) — el único
  objetivo es evitar hardcoding y facilitar sustituciones futuras de
  archivo, no gestionar assets dinámicamente.

### Gobernanza de contenido (aplica a todas las fases con copy/SEO)

- Preservar nombres y descriptores exactos de las unidades ya aprobados.
- No introducir claims no sustentados ni servicios no aprobados.
- No exponer información privada de clientes, residencias o activos
  específicos sin permiso explícito.
- Campos de contacto/legal quedan configurables (placeholders) hasta
  aprobación final — no inventar direcciones, teléfonos o redes que no
  estén ya en el proyecto.
- SEO: ancla geográfica Miami/South Florida, sin keyword stuffing.

---

## 9. TECNOLOGÍA — SIN CAMBIOS SIN JUSTIFICACIÓN

```
Next.js 16.3.4
React 19.2.8
Three.js ^0.185.1
React Three Fiber ^9.7.0
Drei ^10.7.8
GSAP ^3.15.0
Lenis
@gsap/react
```

No introducir librerías competidoras para problemas que este stack ya
resuelve.

Archivos nuevos (si alguno resulta estrictamente necesario): nomenclatura
sin espacios, preferentemente con guiones bajos o camelCase consistente
con el resto del repo — no reproducir nombres con espacios o paréntesis
como los que existen en el historial documental del proyecto (ej. evitar
patrones tipo `archivo (1).glb`).

---

## 10. VALIDACIÓN — OBLIGATORIA AL CIERRE DE CADA FASE CON IMPACTO VISUAL/FUNCIONAL

### Funcional
`/`, `/luxury`, `/transport`, `/cleaners`, `/project-office`, navegación
por hotspot, navegación directa por ruta, logo Home, overlays de header,
footer, formulario Private Inquiry (envío + feedback + tracking), intro,
Skip Intro, comportamiento responsive.

No construir una batería extensa de tests automatizados — validación
funcional dirigida (checklist de arriba, ejecutada en navegador) es
suficiente para V1.

### Técnico
TypeScript, ESLint, build de producción, generación de rutas, carga de
assets, sin imports rotos, sin assets faltantes, sin errores en runtime,
sin UI de debug accidental.

### Visual
Inspección de la composición completa contra la Sección 6 — no declarar
algo terminado solo porque el build pasa. Validar en navegador
(Playwright/Chromium headless), no solo por revisión de código.

Checklist específico obligatorio (además del checklist general de
Sección 6), a validar con capturas reales, no por lectura de código:

- Background/mundo sin estático, sin deformación, sin cropping incorrecto
  y sin pixelación en al menos 3 anchos de viewport (6.1).
- Logo 3D principal dorado, con volumen y aro visibles, coincidente con
  la referencia `tmc-logo-3d-final.html` (7.1) — sin texto plano
  superpuesto ni color incorrecto.
- Los 4 hotspots se leen como insignias ícono+nombre+tagline conectadas
  al logo central, no como etiquetas planas o círculos vacíos (6.2).
- Distribución de header/footer coherente con `TMC WEBSITE Base` (6.2),
  sin haberse convertido en landing genérica.
- Los 4 logos de unidad renderizan exactamente igual a los archivos
  fuente en `public/assets/tmc-world/` (6.2).
- Ningún texto de la imagen `tmc-website-base.png` que contradiga la
  Sección 2.1 o el copy aprobado aparece en el sitio — en particular, no
  aparece "THE MONEY COMPANY" ni el tagline "A BETTER LIFE. A BRIGHTER
  TOMORROW." (6.2).
- Overlays de unidad (TMC Luxury y demás) integrados visualmente al
  mundo, sin apariencia de dashboard/modal genérico (6.3).
- Footer integrado a la escena, sin verse como una barra sólida
  superpuesta encima del mundo (Sección 6).

---

## 11. GATE REPORT — FORMATO OBLIGATORIO AL CIERRE DE CADA FASE

- Fase / actividades cubiertas
- Objetivo de la fase
- Archivos modificados
- Dependencias instaladas (si alguna)
- Cambios realizados (resumen)
- Decisiones respetadas (qué CERRADO se mantuvo)
- Validaciones ejecutadas (tsc / eslint / build / visual) y resultado
- Errores encontrados y cómo se resolvieron
- Riesgos abiertos
- Pendientes
- Commit de git generado (hash o referencia)
- Siguiente paso recomendado

El Gate Report no reemplaza al Master Handoff. Si una fase detecta que el
Master Handoff necesita actualizarse (más allá de la Sección 2.1 ya
aprobada), Claude Code puede **proponer** el cambio en el Gate Report, pero
no debe editarlo directamente sin aprobación — excepto los dos cambios de
la Sección 2.1, que ya están aprobados y deben aplicarse directamente en
Fase 1.

---

## 12. DEFINICIÓN DE HECHO (V1 DONE)

TMC World V1 está terminado solo cuando:

- Es un solo sitio coherente; las 4 unidades funcionan como áreas de un
  mismo mundo.
- La arquitectura aprobada (Sección 8) se respeta sin excepción.
- La regla de marca pública (Sección 2.1) se cumple en todo el sitio, sin
  ninguna aparición de "The Money Company" en contenido visible.
- Navegación, cámara, intro, Skip Intro, header, overlays, footer, rutas
  y el formulario Private Inquiry (envío + tracking) funcionan.
- Comportamiento responsive y fallback (WebGL/reduced-motion/semántico)
  existen y funcionan.
- SEO/JSON-LD son correctos y siguen sin exponer la marca histórica.
- El peso de la carga inicial del mundo está optimizado (Sección 5),
  dentro de presupuesto con margen real, no al límite.
- TypeScript pasa, ESLint pasa (o solo quedan warnings pre-existentes
  documentados), build de producción pasa.
- No queda UI de desarrollo/debug visible accidentalmente.
- El resultado visual cumple la dirección premium/cinematográfica/
  editorial aprobada — juzgado como composición completa, no
  componente por componente.
- El background/mundo es responsive al viewport (6.1), sin pixelación
  (5), el logo 3D coincide con la referencia visual (7.1), los 4 logos de
  unidad están sin modificar (6.2), la distribución sigue `TMC WEBSITE
  Base` (6.2), los overlays no se ven como dashboard/modal genérico
  (6.3), y el footer no se ve como una barra superpuesta (Sección 6) —
  los seis defectos confirmados por auditoría visual quedaron corregidos,
  no solo documentados.
- Existe un commit de git por cada fase y un Gate Report por cada una.

El entregable es el WEBSITE completo, no un reporte, no una colección de
componentes, no cuatro mini-sitios independientes.

---

## 13. REPORTE FINAL AL TERMINAR TODAS LAS FASES

1. **Estado:** COMPLETO / BLOQUEADO
2. **Qué se entregó:** resumen breve
3. **Rutas verificadas:** lista
4. **Validación técnica:** TypeScript / ESLint / Build
5. **Validación visual:** resultado breve
6. **Optimización de assets:** peso antes/después de la carga inicial
7. **Corrección de marca (Sección 2.1):** confirmación de que se aplicó
8. **Defectos confirmados por auditoría visual (Sección 6.1–6.3, 7.1):**
   confirmación puntual de cada uno — background responsive, logo 3D
   contra referencia, logos de unidad intactos, distribución contra `TMC
   WEBSITE Base`, overlays no-dashboard
9. **Problemas conocidos:** solo si queda alguno
10. **Commits de git generados:** lista por fase
11. **Cualquier decisión que requiera aprobación humana:** solo si es
    genuinamente inevitable

No declares completado un requisito crítico que no esté realmente
funcionando.

**Regla explícita sobre el estado "COMPLETO" (violada una vez en una
ejecución previa — no repetir):** el estado del punto 1 solo puede ser
"COMPLETO" si **todos** los ítems de la Sección 12 (Definición de Hecho)
están realmente cumplidos, sin excepción — incluyendo que no quede
pixelación visible en ninguna capa del mundo. Si algo de la Sección 12
queda pendiente (por ejemplo, un asset fuente de baja resolución que no
se puede corregir sin reemplazar el archivo), el estado correcto es
"INCOMPLETO — pendiente: [detalle]", nunca "COMPLETO" con una salvedad
mencionada más abajo. Documentar el pendiente honestamente está bien;
llamarlo "completo" no lo está.
