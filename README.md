# RuedAlerta

RuedAlerta es un proyecto IoT sin fines de lucro para bicicletas y motocicletas. Busca detectar movimiento no autorizado, impactos y caídas, permitir solicitar la ubicación del vehículo y gestionar alertas. Se encuentra en fase de definición y sus capacidades aún no están implementadas ni verificadas.

## Documentación

- [Problemática y alcance](docs/problem-statement.md)
- [Casos de uso](docs/casos-de-uso.md)
- [Requisitos IEEE](docs/requisitos-ieee830.md)
- [Decisiones para el diseño de datos](docs/decisiones-diseno-datos.md)
- [Diseño propuesto de base de datos](docs/diseno-base-datos.md)
- [Diagrama entidad-relación](docs/diagrama-entidad-relacion.md)
- [Escenarios de prueba](docs/escenarios-de-prueba.md)
- [Modelo inicial de amenazas](docs/RuedAlerta-threat-model.md)
- [Arquitectura global](ARCHITECTURE.md)
- [Instrucciones globales para agentes](AGENTS.md)
- [Directorio compartido de habilidades](.agents/skills/)
- [Política de seguridad](SECURITY.md)

## Estructura inicial

`apps/` agrupa los componentes previstos: backend, frontend, broker y nodo. El frontend contiene un proyecto Next.js inicial; los demás componentes aún no están implementados. El método de despliegue está pendiente de elección.

El proyecto contempla instalaciones autogestionadas en infraestructura local o cloud; los servicios, el hardware y la conectividad pueden tener costos. La integración con ECU 911 es un objetivo sujeto a validación, no una funcionalidad disponible ni una garantía de respuesta de emergencia.

## Tecnologías seleccionadas

- Backend: **NestJS con TypeScript**.
- Frontend: **Next.js**.
- Base de datos: **PostgreSQL**.
- Broker MQTT: **Eclipse Mosquitto**.

Next.js está inicializado en `apps/frontend/`; el backend, el broker y la base de datos aún no están implementados en el repositorio.

## Ejecutar el frontend inicial

El único componente inicializado es la plantilla de Next.js. Para ejecutarla en desarrollo se necesitan Node.js y pnpm; se ha usado Node.js 22.23.1 y pnpm 10.32.1 en este proyecto. Desde la raíz del repositorio:

```bash
cd apps/frontend
pnpm install --frozen-lockfile
pnpm dev
```

Abre la dirección local indicada en la terminal; verás la plantilla inicial de Next.js, no la interfaz funcional de RuedAlerta. Para detener el servidor, usa `Ctrl+C`. Los comandos `pnpm lint` y `pnpm build` están disponibles en ese directorio. El backend, el broker y la base de datos aún requieren implementación y configuración.

## Estado

Se están refinando requisitos, casos de uso y escenarios de prueba. Las tecnologías restantes, el despliegue completo y la licencia aún están por definir. Los escenarios de prueba son propuestas y todavía no se han ejecutado.
