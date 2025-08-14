import { DataSource } from 'typeorm';
import { config } from '@config/index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.server.nodeEnv === 'development', // Auto-sync in development only
  logging: config.server.nodeEnv === 'development' ? ['query', 'error'] : ['error'],
  entities: [
    // Entity files will be added here
    'src/models/**/*.entity.{ts,js}',
  ],
  migrations: [
    'src/database/migrations/**/*.{ts,js}',
  ],
  subscribers: [
    'src/database/subscribers/**/*.{ts,js}',
  ],
  // Connection pool settings
  extra: {
    max: 20, // Maximum connections in pool
    min: 5,  // Minimum connections in pool
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 10000, // Connection timeout 10s
  },
  // SSL configuration for production
  ssl: config.server.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() { }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      console.log('🔗 Connecting to PostgreSQL database...');

      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      // Test the connection
      await AppDataSource.query('SELECT NOW()');

      console.log('✅ Database connected successfully');
      console.log(`📊 Database: ${config.database.database}@${config.database.host}:${config.database.port}`);

    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('🔌 Database disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from database:', error);
      throw error;
    }
  }

  public getDataSource(): DataSource {
    if (!AppDataSource.isInitialized) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return AppDataSource;
  }

  public async runMigrations(): Promise<void> {
    try {
      console.log('🔄 Running database migrations...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  public async getHealthStatus(): Promise<{
    status: string;
    database: string;
    migrations: number;
    uptime: string;
  }> {
    try {
      // Test basic query
      const result = await AppDataSource.query('SELECT NOW() as current_time');

      // Get migration count (showMigrations returns boolean, not array)
      const hasPendingMigrations = await AppDataSource.showMigrations();

      return {
        status: 'healthy',
        database: config.database.database,
        migrations: hasPendingMigrations ? 1 : 0, // Simple indicator
        uptime: result[0]?.current_time || 'unknown',
      };
    } catch (_error) {
      return {
        status: 'unhealthy',
        database: config.database.database,
        migrations: 0,
        uptime: 'unavailable',
      };
    }
  }
}
