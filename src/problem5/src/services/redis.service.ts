import { createClient } from 'redis';
import { config } from '@config/index';

type RedisClient = ReturnType<typeof createClient>;

export class RedisService {
  private static instance: RedisService;
  private client: RedisClient | null = null;

  private constructor() { }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async connect(): Promise<void> {
    try {
      console.log('🔗 Connecting to Redis...');

      // Create Redis client
      const clientOptions = {
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        ...(config.redis.password && { password: config.redis.password }),
      };

      this.client = createClient(clientOptions);

      // Set up event listeners
      this.setupEventListeners();

      // Connect to Redis
      if (this.client) {
        await this.client.connect();
        // Test the connection
        await this.client.ping();
      }

      console.log('✅ Redis connected successfully');
      console.log(`🔴 Redis: ${config.redis.host}:${config.redis.port}`);

    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client?.isOpen) {
        await this.client.quit();
        console.log('🔌 Redis disconnected');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from Redis:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on('connect', () => {
      console.log('🔴 Redis client connecting...');
    });

    this.client.on('ready', () => {
      console.log('🟢 Redis client ready');
    });

    this.client.on('error', (error) => {
      console.error('🔴 Redis client error:', error);
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis client reconnecting...');
    });
  }

  public getClient(): RedisClient {
    if (!this.client?.isOpen) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.client;
  }

  public async getHealthStatus(): Promise<{
    status: string;
    host: string;
    port: number;
    connected: boolean;
    memory?: string;
  }> {
    try {
      if (!this.client?.isOpen) {
        return {
          status: 'disconnected',
          host: config.redis.host,
          port: config.redis.port,
          connected: false,
        };
      }

      // Test connection with ping
      const pong = await this.client.ping();

      // Get memory info
      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch?.[1]?.trim();

      const response: {
        status: string;
        host: string;
        port: number;
        connected: boolean;
        memory?: string;
      } = {
        status: pong === 'PONG' ? 'healthy' : 'unhealthy',
        host: config.redis.host,
        port: config.redis.port,
        connected: true,
      };

      if (memory && memory !== 'unknown') {
        response.memory = memory;
      }

      return response;
    } catch (_error) {
      return {
        status: 'unhealthy',
        host: config.redis.host,
        port: config.redis.port,
        connected: false,
      };
    }
  }
}
