#!/bin/bash

echo "Loading environment variables from .env.prod file..."
set -a
source .env.prod
set +a

export CACHE_BUST=$(date +%s)

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is empty!"
  exit 1
fi

BACKEND_TAG="ghcr.io/patryk-bernasiewicz/gjk-backend:DEV-0.0.2-PROD"
DASHBOARD_TAG="ghcr.io/patryk-bernasiewicz/gjk-dashboard:DEV-0.0.2-PROD"

docker image prune -a --filter "until=1m" --force

echo "Removing old images with the same tag..."
docker rmi -f ghcr.io/patryk-bernasiewicz/gjk-backend:DEV-0.0.2-PROD 2>/dev/null || true
docker rmi -f ghcr.io/patryk-bernasiewicz/gjk-dashboard:DEV-0.0.2-PROD 2>/dev/null || true

echo "Building multi-platform backend image for linux/amd64 and linux/arm64..."
docker buildx build \
  --no-cache \
  --progress=plain \
  --platform linux/amd64,linux/arm64 \
  --target backend \
  --build-arg CACHE_BUST="$CACHE_BUST" \
  --build-arg DATABASE_URL="${DATABASE_URL}" \
  --build-arg CLERK_SECRET_KEY="${CLERK_SECRET_KEY}" \
  --build-arg CLERK_PUBLISHABLE_KEY="${CLERK_PUBLISHABLE_KEY}" \
  -t "${BACKEND_TAG}" \
  --push \
  .

echo "Building multi-platform dashboard image for linux/amd64 and linux/arm64..."
docker buildx build \
  --no-cache \
  --progress=plain \
  --platform linux/amd64,linux/arm64 \
  --target dashboard \
  --build-arg CACHE_BUST="$CACHE_BUST" \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY="${VITE_CLERK_PUBLISHABLE_KEY}" \
  --build-arg VITE_BACKEND_URL="${VITE_BACKEND_URL}" \
  -t "${DASHBOARD_TAG}" \
  --push \
  .

echo "Multi-platform build and push completed!"
echo "Backend image: ${BACKEND_TAG}"
echo "Dashboard image: ${DASHBOARD_TAG}"