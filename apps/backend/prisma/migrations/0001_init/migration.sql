CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_DELETION', 'DELETED');
CREATE TYPE "VehicleType" AS ENUM ('BICYCLE', 'MOTORCYCLE');
CREATE TYPE "EventType" AS ENUM ('UNAUTHORIZED_MOVEMENT', 'IMPACT', 'FALL');
CREATE TYPE "EventSource" AS ENUM ('HTTP_SIMULATOR', 'MQTT');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "RefreshSession" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RefreshSession_tokenHash_key" ON "RefreshSession"("tokenHash");
CREATE INDEX "RefreshSession_userId_revokedAt_idx" ON "RefreshSession"("userId", "revokedAt");

CREATE TABLE "Vehicle" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "ownerId" UUID NOT NULL,
  "type" "VehicleType" NOT NULL,
  "alias" TEXT NOT NULL,
  "plate" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Vehicle_ownerId_createdAt_idx" ON "Vehicle"("ownerId", "createdAt");

CREATE TABLE "DeviceNode" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "vehicleId" UUID NOT NULL,
  "externalId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeviceNode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DeviceNode_vehicleId_key" ON "DeviceNode"("vehicleId");
CREATE UNIQUE INDEX "DeviceNode_externalId_key" ON "DeviceNode"("externalId");

CREATE TABLE "Event" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "nodeId" UUID NOT NULL,
  "vehicleId" UUID NOT NULL,
  "externalEventId" TEXT NOT NULL,
  "type" "EventType" NOT NULL,
  "source" "EventSource" NOT NULL DEFAULT 'HTTP_SIMULATOR',
  "occurredAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "latitude" DECIMAL(9,6),
  "longitude" DECIMAL(9,6),
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Event_nodeId_externalEventId_key" ON "Event"("nodeId", "externalEventId");
CREATE INDEX "Event_vehicleId_receivedAt_idx" ON "Event"("vehicleId", "receivedAt");

ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceNode" ADD CONSTRAINT "DeviceNode_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "DeviceNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
