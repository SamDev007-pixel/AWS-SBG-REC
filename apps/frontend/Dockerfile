# ── Stage 1: Dependencies and Build stage ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

# Copy workspace and frontend package files
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/

# Install workspace dependencies
RUN npm ci

# Copy frontend source code
COPY apps/frontend ./apps/frontend

# Build Next.js in standalone mode
WORKDIR /app/apps/frontend
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ── Stage 2: Production runtime stage ─────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server from builder
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "apps/frontend/server.js"]
