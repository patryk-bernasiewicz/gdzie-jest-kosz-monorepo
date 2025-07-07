#!/bin/bash

cd $(dirname $0)/..

# Check if .env file exists
if [ ! -f ".env.prod" ]; then
    echo "Error: .env.prod file not found in current directory!" >&2
    exit 1
fi

echo "Loading environment variables from .env.prod file..."
set -a
source .env.prod
set +a

# Read the app version from package.json and export it as APP_VERSION
APP_VERSION=$(node -p "require('./package.json').version")
export APP_VERSION
echo "App version from package.json: $APP_VERSION"

cd apps/api
pnpm prisma db push
cd ../..

echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d --pull always

echo "Deployment finished."