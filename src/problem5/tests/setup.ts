import 'reflect-metadata';
import { TestDatabaseService } from './test-database';

jest.mock('../src/database/connection', () => ({
  ...jest.requireActual('../src/database/connection'),
  DatabaseService: {
    getInstance: () => TestDatabaseService.getInstance()
  }
}));

beforeAll(async () => {
  const database = TestDatabaseService.getInstance();
  await database.connect();

  console.log('🧪 Test database connected to container');
});

afterAll(async () => {
  // Clean up database connection
  const database = TestDatabaseService.getInstance();
  await database.disconnect();

  console.log('🧪 Test database disconnected from container');
});

beforeEach(() => {
  // Silence console output during tests
  console.log = jest.fn();
  console.error = jest.fn();
});
