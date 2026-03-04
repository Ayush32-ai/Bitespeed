#!/bin/sh

# Set default DATABASE_URL if not provided
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:./dev.db"
  echo "DATABASE_URL not set, using default: $DATABASE_URL"
fi

# Ensure Prisma client is generated
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy --skip-generate || echo "Migrations already applied or no migrations found"

# Start the application
echo "Starting application on port ${PORT:-3000}..."
npm start
