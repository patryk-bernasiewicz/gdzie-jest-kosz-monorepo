#!/bin/sh

# Read secrets from files and set as environment variables
if [ -f "/run/secrets/clerk_secret_key" ]; then
  export CLERK_SECRET_KEY=$(cat /run/secrets/clerk_secret_key)
fi

if [ -f "/run/secrets/database_url" ]; then
  export DATABASE_URL=$(cat /run/secrets/database_url)
fi

# Execute the main application command
exec node apps/api/dist/main.js
