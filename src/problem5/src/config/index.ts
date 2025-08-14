import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env['PORT'] || '3000', 10),
    nodeEnv: process.env['NODE_ENV'] || 'development',
  },
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    username: process.env['DB_USERNAME'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'password',
    database: process.env['DB_DATABASE'] || 'bookstore_db',
  },
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'] || undefined,
  },
  jwt: {
    secret: process.env['JWT_SECRET'] || 'fallback-secret-key',
    expiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
  },
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },
  inventory: {
    lockTimeout: parseInt(process.env['INVENTORY_LOCK_TIMEOUT'] || '30000', 10), // 30 seconds
  },
} as const;

// Validation
if (config.server.nodeEnv === 'production' && config.jwt.secret === 'fallback-secret-key') {
  throw new Error('JWT_SECRET must be set in production environment');
}
