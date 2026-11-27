# Instrucciones del frontend

Estas instrucciones complementan el `AGENTS.md` de la raíz y aplican a `apps/frontend/`. Consulta también `ARCHITECTURE.md` y `SECURITY.md` de la raíz.

- Este componente utiliza Next.js con App Router y TypeScript. Mantén las decisiones de interfaz y despliegue que aún no se hayan acordado como pendientes.
- Mantén la lógica de negocio y la autorización del lado del backend; no confíes en restricciones visuales como control de acceso.
- No expongas credenciales, datos de ubicación o información de usuarios en código cliente, registros o archivos versionados.
- Conserva la separación entre el frontend, el backend y el broker; no asumas que exista una API o integración MQTT ya implementada.
- Para cambios de código, ejecuta las verificaciones aplicables y comunica cualquier limitación. Consulta `package.json` para los comandos disponibles.
- Las notas sobre habilidades del frontend se mantienen en `docs/skills/`. Comprueba el inventario del entorno antes de usar una skill; un documento en esa carpeta no garantiza su instalación o descubrimiento automático.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
