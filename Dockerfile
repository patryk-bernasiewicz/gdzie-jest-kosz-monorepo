# Build stage
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /repo

ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_BACKEND_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Copy package manager files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy app and package manifests
COPY apps/api/package.json ./apps/api/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# Copy prisma schema
COPY apps/api/prisma ./apps/api/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the applications
RUN pnpm build

# Backend stage
FROM node:20-alpine AS backend
RUN corepack enable
WORKDIR /api

ARG CLERK_PUBLISHABLE_KEY
ENV CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built app and dependencies
COPY --from=build /repo/package.json /repo/pnpm-lock.yaml /repo/pnpm-workspace.yaml ./
COPY --from=build /repo/apps/api/package.json ./apps/api/
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/generated ./apps/api/generated

# Set ownership and user
RUN chown -R appuser:appgroup /api
USER appuser

EXPOSE 3220
CMD ["node", "apps/api/dist/main.js"]

# Dashboard stage
FROM nginx:alpine AS dashboard
WORKDIR /dashboard

ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_BACKEND_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN adduser -D -H -u 1001 -s /sbin/nologin webuser
RUN mkdir -p /app/www

COPY --from=build /repo/apps/dashboard/dist /app/www
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3223
CMD ["nginx", "-g", "daemon off;"]

