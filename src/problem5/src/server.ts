import 'reflect-metadata'; // Required for TypeORM decorators
import { App } from './app';
import { DatabaseService } from './database/connection';
import { RedisService } from './services/redis.service';

async function bootstrap(): Promise<void> {
  try {
    console.log('🚀 Starting Bookstore API...');

    // Initialize database connection
    const database = DatabaseService.getInstance();
    await database.connect();

    // Initialize Redis connection
    const redis = RedisService.getInstance();
    await redis.connect();

    // Start the Express server
    const app = new App();
    app.listen();

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  try {
    const database = DatabaseService.getInstance();
    const redis = RedisService.getInstance();
    await Promise.all([
      database.disconnect(),
      redis.disconnect(),
    ]);
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  try {
    const database = DatabaseService.getInstance();
    const redis = RedisService.getInstance();
    await Promise.all([
      database.disconnect(),
      redis.disconnect(),
    ]);
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

// Start the server
bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
