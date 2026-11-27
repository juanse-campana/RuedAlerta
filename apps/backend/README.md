# RuedAlerta backend

NestJS API for the first vertical slice of RuedAlerta. It implements the local development flow:

`authenticated user -> vehicle -> node -> simulated event -> PostgreSQL -> event list`

## Local setup

1. Start PostgreSQL and Mosquitto from the repository root:

   ```bash
   docker compose up -d
   ```

2. Install backend dependencies and copy the environment file:

   ```bash
   cd apps/backend
   pnpm install
   copy .env.example .env
   pnpm prisma:generate
   pnpm prisma:deploy
   ```

3. Start the API:

   ```bash
   pnpm start:dev
   ```

The API is available at `http://localhost:3001/api`.

## First vertical slice

Register or log in, create a vehicle, attach a node and post an event to `POST /api/nodes/:nodeId/events`. The endpoint requires a bearer access token and verifies ownership through the vehicle relationship. Reusing the same `externalEventId` for a node is idempotent.

The Mosquitto container is present for the next integration step. Anonymous access is intentionally limited to local development and must not be exposed publicly.
