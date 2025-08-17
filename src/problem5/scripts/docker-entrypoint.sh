#!/bin/sh
set -e

echo "🚀 Starting Bookstore API..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Database not ready, waiting..."
  sleep 2
done
echo "✅ Database is ready!"

# Run database migrations
echo "📊 Running database migrations..."
npm run migration:run

# Run database seeding (optional, only if SEED_DATABASE is set to true)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run seed
else
  echo "⏭️  Skipping database seeding"
fi

echo "🎉 Database setup complete!"

# Start the application
echo "🌟 Starting application server..."
exec "$@"
