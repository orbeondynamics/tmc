# TMC World — content/tmc-world/

Capa de contenido editable, separada de los componentes visuales (evolución
"BLOQUE DE CORRECCIÓN, EVOLUCIÓN Y PREPARACIÓN LOCAL", §12/§160-168).

El Master Handoff (`docs/TMC_World_Master_Handoff.md`) sigue siendo la fuente
de verdad de arquitectura, decisiones CERRADAS y copy ya aprobado. Estos
Markdown son la capa editable de contenido — texto que Javi puede ajustar sin
tocar componentes React.

## Archivos esperados

```
home.md
our-purpose.md
our-vision.md
our-promise.md
our-values.md
our-clients.md
luxury.md
transport.md
cleaners.md
project-office.md
footer.md
```

## Formato esperado

Frontmatter simple (`key: value`, sin YAML anidado) + cuerpo en párrafos
separados por línea en blanco. Ejemplo:

```markdown
---
eyebrow: OUR PURPOSE
title: Why TMC Exists
---

A Life Well Managed.

You have the lifestyle. We handle everything around it.
```

Listas de viñetas (`- item`) se parsean como arreglo de strings.

## Estado

Directorio preparado. El loader (`src/lib/content/loadMarkdown.ts`) ya sabe
leer estos archivos y hacer fallback a `src/config/tmcContent.ts` si un
archivo todavía no existe — el sitio no se rompe mientras se copian.

**Ningún componente consume estos archivos todavía.** La integración
definitiva (reemplazar los componentes UI para que lean desde aquí en vez de
`tmcContent.ts`) está pendiente de confirmación explícita de Javi una vez que
los 11 archivos estén copiados en esta carpeta.
