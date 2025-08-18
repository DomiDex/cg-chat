# Multi-stage Docker build for Hono API

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/convex/package.json ./packages/convex/
COPY packages/@cg/types/package.json ./packages/@cg/types/
COPY packages/@cg/utils/package.json ./packages/@cg/utils/
COPY packages/@cg/config/package.json ./packages/@cg/config/
COPY packages/@cg/convex-client/package.json ./packages/@cg/convex-client/
COPY pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY . .

# Build the application
WORKDIR /app/apps/api
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/api/package.json ./
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Set environment
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]