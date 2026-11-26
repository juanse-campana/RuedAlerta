# Instrucciones globales del repositorio

Estas instrucciones aplican a todas las aplicaciones de `apps/` y a la documentación, sujetas a instrucciones de mayor prioridad y a archivos más específicos cuando existan.

## Contexto

- Leer `ARCHITECTURE.md` y la documentación relevante de `docs/` antes de cambiar comportamiento o alcance. Para cambios de datos consultar `docs/decisiones-diseno-datos.md`, `docs/diseno-base-datos.md` y `docs/diagrama-entidad-relacion.md`.
- Mantener las decisiones no confirmadas como pendientes; no inventar tecnologías, integraciones o capacidades verificadas.
- La solución contempla múltiples usuarios y nodos; preservar el aislamiento de datos y permisos.
- No presentar la integración con ECU 911 como operativa sin evidencia ni prometer entrega de alertas o disponibilidad de ubicación.

## Trabajo y verificación

- Preservar cambios existentes y limitar las modificaciones a lo solicitado.
- Separar responsabilidades entre backend, frontend, configuración del broker y nodo; no crear un broker propio sin decisión explícita.
- Proteger credenciales, coordenadas, contactos y fotografías; no versionar secretos. El backend debe comprobar identidad y propiedad también al acceder directamente a archivos.
- Preservar el UUID estable de eventos, la deduplicación y la confirmación de aplicación posterior al almacenamiento; un acuse del broker no demuestra persistencia.
- Los eventos no tienen TTL; al eliminarlos deben borrarse sus intentos y mantenerse las marcas mínimas mientras puedan aceptarse reenvíos. Las solicitudes de ubicación se conservan hasta eliminación por el usuario.
- Mantener el historial nodo-vehículo al reasignar; no completar el cambio sin sincronización y sin resolver la transición concurrente.
- Los avisos SMS del nodo y el correo del backend dependen de servicios distintos; no afirmar entrega ni conectividad celular garantizadas. La lista local de contactos puede estar desactualizada mientras el nodo está desconectado.
- El inicio de sesión usa JWT de acceso y token de renovación con registro por sesión en PostgreSQL; no asumir que revocar la renovación invalida inmediatamente el JWT ya emitido. El diseño sigue siendo propuesto, no implementado.
- Añadir o ejecutar verificaciones proporcionales cuando existan; indicar explícitamente las que no se ejecutaron.
- Mantener documentación y enlaces coherentes al cambiar estructura o contratos.
- No hacer commits sin solicitud explícita; cuando se soliciten, usar Conventional Commits sin atribución de IA.
- Consultar `.agents/skills/` y el inventario del entorno para las habilidades aplicables; seguir sus instrucciones cuando estén disponibles.
