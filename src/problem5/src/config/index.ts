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
  jwt: {
    secret: process.env['JWT_SECRET'] || 'fallback-secret-key',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret-key',
    accessTokenExpiry: process.env['JWT_ACCESS_TOKEN_EXPIRY'] || '15m',
    refreshTokenExpiry: process.env['JWT_REFRESH_TOKEN_EXPIRY'] || '7d',
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
if (config.server.nodeEnv === 'production') {
  if (config.jwt.secret === 'fallback-secret-key') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  if (config.jwt.refreshSecret === 'fallback-refresh-secret-key') {
    throw new Error('JWT_REFRESH_SECRET must be set in production environment');
  }
}
