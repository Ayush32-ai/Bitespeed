#!/bin/sh

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy --skip-generate || true

# Start the application
echo "Starting application..."
npm start
