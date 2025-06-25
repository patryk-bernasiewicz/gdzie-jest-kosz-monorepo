# Build
FROM node:20-alpine AS build
RUN corepack enable

WORKDIR /repo

ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_BACKEND_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Api prod
FROM node:20-alpine AS backend
RUN corepack enable

WORKDIR /api

ARG CLERK_PUBLISHABLE_KEY
ENV CLERK_PUBLISHABLE_KEY=${CLERK_PUBLISHABLE_KEY}

COPY --from=build /repo/package.json /repo/pnpm-lock.yaml /repo/pnpm-workspace.yaml ./
COPY --from=build /repo/apps/api/package.json ./apps/api/
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/generated ./apps/api/generated

EXPOSE 3220

CMD ["node", "apps/api/dist/main.js"]

# Dashboard prod
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
