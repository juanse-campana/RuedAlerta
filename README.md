# RuedAlerta

RuedAlerta es un proyecto IoT sin fines de lucro para bicicletas y motocicletas. El primer vertical slice implementa registro, autenticación, vehículos, nodos y eventos simulados persistidos en PostgreSQL y visibles desde el frontend. La detección física, MQTT, SMS, correo y ECU 911 todavía no están integrados ni verificados.

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

## Estructura

`apps/` agrupa backend, frontend, broker y nodo. `apps/backend/` contiene la API NestJS y Prisma; `apps/frontend/` contiene el panel del MVP; `apps/broker/` contiene la configuración local de Mosquitto; el firmware del nodo queda para la siguiente fase.

El proyecto contempla instalaciones autogestionadas en infraestructura local o cloud; los servicios, el hardware y la conectividad pueden tener costos. La integración con ECU 911 es un objetivo sujeto a validación, no una funcionalidad disponible ni una garantía de respuesta de emergencia.

## Tecnologías seleccionadas

- Backend: **NestJS con TypeScript**.
- Frontend: **Next.js**.
- Base de datos: **PostgreSQL**.
- Broker MQTT: **Eclipse Mosquitto**.

El backend usa JWT, sesiones de renovación y autorización por propietario. PostgreSQL y Mosquitto se levantan con Docker Compose para desarrollo local.

## Ejecutar el MVP local

Se necesitan Node.js, pnpm y Docker Desktop con el motor Linux activo. Desde la raíz:

```bash
docker compose up -d

cd apps/backend
pnpm install
copy .env.example .env
pnpm prisma:generate
pnpm prisma:deploy
pnpm start:dev
```

En otra terminal:

```bash
cd apps/frontend
pnpm install
pnpm dev
```

Abre `http://localhost:3000`, crea una cuenta, registra una bicicleta o motocicleta, asocia un nodo simulado y registra un evento. La API queda disponible en `http://localhost:3001/api`. Para detener los procesos, usa `Ctrl+C`; para detener los contenedores, ejecuta `docker compose down`.

## Estado

El vertical slice local está implementado y validado con compilación, lint y pruebas unitarias de autorización e idempotencia. La prueba integrada contra PostgreSQL queda pendiente de ejecutar cuando Docker Desktop esté disponible. Los sensores, MQTT, notificaciones y despliegue remoto siguen fuera de esta primera entrega.
