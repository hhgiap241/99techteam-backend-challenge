import 'reflect-metadata'; // Required for TypeORM decorators
import { App } from './app';
import { DatabaseService } from './database/connection';

async function bootstrap(): Promise<void> {
  try {
    console.log('🚀 Starting Bookstore API...');

    // Initialize database connection
    const database = DatabaseService.getInstance();
    await database.connect();

    // TODO: Initialize Redis connection  
    console.log('🔴 Redis connection will be initialized here');

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
    await database.disconnect();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  try {
    const database = DatabaseService.getInstance();
    await database.disconnect();
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
