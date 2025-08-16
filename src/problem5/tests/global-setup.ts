import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

export default async function globalSetup() {
  console.log('🐳 Starting PostgreSQL test container...');

  // Start PostgreSQL container
  const container = await new PostgreSqlContainer('postgres:15-alpine')
    .withDatabase('bookstore_test')
    .withUsername('test_user')
    .withPassword('test_password')
    .withExposedPorts(5432)
    .start();

  // Store container connection details globally
  const host = container.getHost();
  const port = container.getMappedPort(5432);
  const database = container.getDatabase();
  const username = container.getUsername();
  const password = container.getPassword();

  // Set environment variables for the test database
  process.env['NODE_ENV'] = 'test';
  process.env['TEST_DB_HOST'] = host;
  process.env['TEST_DB_PORT'] = port.toString();
  process.env['TEST_DB_USERNAME'] = username;
  process.env['TEST_DB_PASSWORD'] = password;
  process.env['TEST_DB_NAME'] = database;
  process.env['JWT_SECRET'] = 'test-secret';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret';

  console.log(`🐳 PostgreSQL container started at ${host}:${port}`);

  // Create test DataSource and run migrations
  const testDataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    synchronize: true, // Auto-create tables for tests
    logging: false,
    entities: [
      'src/entities/**/*.entity.{ts,js}',
    ],
    migrations: [
      'src/database/migrations/**/*.{ts,js}',
    ],
  });

  await testDataSource.initialize();
  console.log('🐳 Test database initialized and synced');
  await testDataSource.destroy();

  // Store container reference for cleanup
  (global as any).__TEST_CONTAINER__ = container;
}
