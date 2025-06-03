# --- BUILDER STAGE ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Copy source code
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Generate Prisma client and build app
RUN npx prisma generate
RUN npm run build

# --- RUNTIME STAGE ---
FROM node:18-alpine AS runtime

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built app and prisma from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Change ownership to app user
RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

ENV NODE_ENV=production
EXPOSE 3220

CMD ["node", "dist/main"] 