import 'reflect-metadata'; // Required for TypeORM decorators
import { App } from './app';

async function bootstrap(): Promise<void> {
  try {
    console.log('🚀 Starting Bookstore API...');

    // TODO: Initialize database connection
    console.log('📦 Database connection will be initialized here');

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
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
