# Multi-stage build for production optimization
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY ./src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling and netcat for database connectivity check
RUN apk add --no-cache dumb-init netcat-openbsd

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bookstore -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies + migration tools
RUN npm ci --only=production && \
    npm install typeorm ts-node tsconfig-paths && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=bookstore:nodejs /app/dist ./dist

# Copy additional files needed for migrations and seeding
COPY --from=builder --chown=bookstore:nodejs /app/src ./src
COPY --chown=bookstore:nodejs tsconfig.json ./
COPY --chown=bookstore:nodejs orm.config.ts ./

# Copy startup script
COPY --chown=bookstore:nodejs scripts/docker-entrypoint.sh ./scripts/
RUN chmod +x ./scripts/docker-entrypoint.sh

# Copy environment file template
COPY --chown=bookstore:nodejs .env.example ./.env.example

# Create logs directory
RUN mkdir -p logs && chown bookstore:nodejs logs

# Switch to non-root user
USER bookstore

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly and run our startup script
ENTRYPOINT ["dumb-init", "--", "./scripts/docker-entrypoint.sh"]

# Start the application
CMD ["node", "dist/server.js"]
