import express, { type Request, type Response, type NextFunction, type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { DatabaseService } from './database/connection';
import { RedisService } from './services/redis.service';

// Import routes
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import orderRoutes from './routes/order.routes';

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: config.server.nodeEnv === 'production'
        ? ['https://yourdomain.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging in development
    if (config.server.nodeEnv === 'development') {
      this.app.use((req: Request, _res: Response, next: NextFunction) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (_req: Request, res: Response) => {
      try {
        const database = DatabaseService.getInstance();
        const redis = RedisService.getInstance();

        const [dbHealth, redisHealth] = await Promise.all([
          database.getHealthStatus(),
          redis.getHealthStatus(),
        ]);

        res.status(200).json({
          status: 'OK',
          timestamp: new Date().toISOString(),
          service: 'Bookstore API',
          version: '1.0.0',
          environment: config.server.nodeEnv,
          database: dbHealth,
          redis: redisHealth,
        });
      } catch (_error) {
        res.status(500).json({
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          service: 'Bookstore API',
          version: '1.0.0',
          environment: config.server.nodeEnv,
          database: { status: 'unhealthy' },
          redis: { status: 'unhealthy' },
        });
      }
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/books', bookRoutes);
    this.app.use('/api/orders', orderRoutes);

    // API info endpoint
    this.app.get('/api', (_req: Request, res: Response) => {
      res.status(200).json({
        message: 'Bookstore API is running!',
        version: '1.0.0',
        endpoints: [
          'GET /health - Health check',
          'POST /api/auth/register - Register user',
          'POST /api/auth/login - Login user',
          'POST /api/auth/refresh - Refresh token',
          'GET /api/auth/profile - Get user profile',
          'GET /api/books - List books with filters',
          'GET /api/books/:id - Get book details',
          'POST /api/books - Create book (Admin only)',
          'PUT /api/books/:id - Update book (Admin only)',
          'DELETE /api/books/:id - Delete book (Admin only)',
          'POST /api/orders - Place order (Auth required)',
          'GET /api/orders - Get user orders (Auth required)',
          'GET /api/orders/:id - Get order by ID (Auth required)',
        ],
      });
    });

    // 404 handler
    this.app.use('*', (_req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        message: 'The requested endpoint does not exist',
      });
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Global Error:', error);

      // Don't leak error details in production
      const isDevelopment = config.server.nodeEnv === 'development';

      res.status(500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'Something went wrong',
        ...(isDevelopment && { stack: error.stack }),
      });
    });
  }

  public listen(): void {
    this.app.listen(config.server.port, () => {
      console.log(`🚀 Bookstore API server running on port ${config.server.port}`);
      console.log(`📚 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${config.server.port}/health`);
    });
  }
}
