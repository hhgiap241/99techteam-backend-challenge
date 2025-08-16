import { DataSource } from 'typeorm';

export class TestDatabaseService {
  private static instance: TestDatabaseService;
  private dataSource: DataSource | null = null;

  private constructor() { }

  public static getInstance(): TestDatabaseService {
    if (!TestDatabaseService.instance) {
      TestDatabaseService.instance = new TestDatabaseService();
    }
    return TestDatabaseService.instance;
  }

  public async connect(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      return;
    }

    // Use test container connection details from environment
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env['TEST_DB_HOST'] || 'localhost',
      port: parseInt(process.env['TEST_DB_PORT'] || '5432'),
      username: process.env['TEST_DB_USERNAME'] || 'test_user',
      password: process.env['TEST_DB_PASSWORD'] || 'test_password',
      database: process.env['TEST_DB_NAME'] || 'bookstore_test',
      synchronize: true,
      logging: false,
      entities: [
        'src/entities/**/*.entity.{ts,js}',
      ],
      migrations: [
        'src/database/migrations/**/*.{ts,js}',
      ],
    });

    await this.dataSource.initialize();
    console.log('🐳 Connected to test database container');
  }

  public async disconnect(): Promise<void> {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
      console.log('🐳 Disconnected from test database container');
    }
  }

  public getDataSource(): DataSource {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('Test database not initialized. Call connect() first.');
    }
    return this.dataSource;
  }
}
