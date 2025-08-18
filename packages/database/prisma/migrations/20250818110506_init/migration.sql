-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'AGENT', 'DEVELOPER', 'SUPPORT');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'BOUNCED', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "extensions" (
    "name" TEXT NOT NULL,

    CONSTRAINT "extensions_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationExpiry" TIMESTAMP(3),
    "phone" TEXT,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "customerId" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "subscriptionValidUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActive" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceId" TEXT,
    "location" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "refreshExpiresAt" TIMESTAMP(3) NOT NULL,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rateLimit" INTEGER NOT NULL DEFAULT 100,
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "headers" JSONB,
    "signature" TEXT,
    "status" "WebhookStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "processedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" TIMESTAMP(3),

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_queue" (
    "id" TEXT NOT NULL,
    "to" TEXT[],
    "cc" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bcc" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subject" TEXT NOT NULL,
    "html" TEXT,
    "text" TEXT,
    "template" TEXT,
    "templateData" JSONB,
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "messageId" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "value" JSONB,
    "rules" JSONB,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "userIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'string',
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationToken_key" ON "users"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_customerId_key" ON "users"("customerId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_customerId_idx" ON "users"("customerId");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_refreshToken_idx" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hashedKey_key" ON "api_keys"("hashedKey");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_hashedKey_idx" ON "api_keys"("hashedKey");

-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "rate_limits_identifier_idx" ON "rate_limits"("identifier");

-- CreateIndex
CREATE INDEX "rate_limits_windowEnd_idx" ON "rate_limits"("windowEnd");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limits_identifier_endpoint_windowStart_key" ON "rate_limits"("identifier", "endpoint", "windowStart");

-- CreateIndex
CREATE INDEX "webhook_events_source_eventType_idx" ON "webhook_events"("source", "eventType");

-- CreateIndex
CREATE INDEX "webhook_events_status_idx" ON "webhook_events"("status");

-- CreateIndex
CREATE INDEX "webhook_events_receivedAt_idx" ON "webhook_events"("receivedAt");

-- CreateIndex
CREATE INDEX "email_queue_status_idx" ON "email_queue"("status");

-- CreateIndex
CREATE INDEX "email_queue_scheduledFor_idx" ON "email_queue"("scheduledFor");

-- CreateIndex
CREATE INDEX "email_queue_to_idx" ON "email_queue"("to");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_key_idx" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_enabled_idx" ON "feature_flags"("enabled");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
