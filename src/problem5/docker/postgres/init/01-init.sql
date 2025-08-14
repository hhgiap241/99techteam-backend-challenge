#!/bin/bash
set -e

# Create extensions if they don't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable UUID extension for generating UUIDs
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Enable pg_stat_statements for query performance monitoring
    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
    
    -- Create indexes for better performance (will be managed by TypeORM migrations)
    -- This is just for initial setup
EOSQL

echo "PostgreSQL initialization completed successfully!"
