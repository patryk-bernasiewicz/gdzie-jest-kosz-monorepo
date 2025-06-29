#!/bin/bash

cd $(dirname $0)/..

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found in current directory!" >&2
    exit 1
fi

echo "Loading environment variables from .env file..."
set -a
source .env
set +a

cd apps/api
pnpm prisma db push
cd ../..

echo "Pulling latest production images..."
docker-compose -f docker-compose.yml pull

echo "Deploying development stack..."
docker-compose -f docker-compose.yml up -d

echo "Checking service status..."
docker-compose -f docker-compose.yml ps
