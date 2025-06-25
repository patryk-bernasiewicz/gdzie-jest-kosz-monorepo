#!/bin/bash

# Check if .env file exists
if [ ! -f ".env.prod" ]; then
    echo "Error: .env.prod file not found in current directory!" >&2
    exit 1
fi

echo "Loading environment variables from .env.prod file..."
set -a
source .env.prod
set +a

cd apps/api
pnpm prisma db push
cd ../..

docker-compose -f docker-compose.prod.yml up -d --pull always