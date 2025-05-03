# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies required for building
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Install dependencies with cache optimization
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copy necessary files
COPY next.config.js .
COPY tsconfig.json .
COPY prisma ./prisma
COPY public ./public
COPY src ./src

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && \
    # Clean npm cache
    npm cache clean --force && \
    # Add non-root user for security
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    # Set correct permissions
    chown -R nextjs:nodejs /app

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js .
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production server
CMD ["npm", "start"] 