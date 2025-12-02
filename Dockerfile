# Rodistaa Backend - Production Dockerfile
# Multi-stage build for optimized production image

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:18-alpine AS dependencies

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/app-shared/package.json ./packages/app-shared/
COPY packages/acs/package.json ./packages/acs/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Builder
# ============================================
FROM node:18-alpine AS builder

RUN npm install -g pnpm@8

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages

# Copy source code
COPY . .

# Build all packages
RUN pnpm --filter @rodistaa/app-shared build
RUN pnpm --filter @rodistaa/acs build
RUN pnpm --filter @rodistaa/backend build

# ============================================
# Stage 3: Production
# ============================================
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy built artifacts
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/app-shared/dist ./packages/app-shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/packages/acs/dist ./packages/acs/dist

# Copy ACS rules
COPY --chown=nodejs:nodejs acs_rules_top25.yaml ./

# Copy node_modules from builder stage (includes all dependencies)
# This avoids workspace protocol issues in production stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages/app-shared/node_modules ./packages/app-shared/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/packages/acs/node_modules ./packages/acs/node_modules

# Note: We copy node_modules from builder instead of running pnpm install
# because workspace: protocol references won't resolve in isolation

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "packages/backend/dist/index.js"]

