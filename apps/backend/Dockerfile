# ── Stage 1: Build stage ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build essentials for native dependencies if needed
RUN apk add --no-cache libc6-compat openssl

# Copy root workspace and backend package definitions
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies for workspace
RUN npm ci

# Copy backend source code and prisma schema
COPY apps/backend ./apps/backend

# Generate Prisma Client
WORKDIR /app/apps/backend
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# ── Stage 2: Production runtime stage ─────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies (OpenSSL required by Prisma engine)
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=4000

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy root package files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Copy backend artifacts
WORKDIR /app/apps/backend
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma

# Create upload directory with proper permissions
RUN mkdir -p /app/apps/backend/uploads && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

# Run migrations and start production server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
