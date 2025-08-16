import { TestDatabaseService } from '../test-database';
import { User as UserEntity } from '../../src/entities/user.entity';
import { Book as BookEntity } from '../../src/entities/book.entity';
import type { User } from '../../src/entities/user.entity';
import type { Book } from '../../src/entities/book.entity';
import { UserRole, BookCategory } from '../../src/enums';
import { hashPassword } from '../../src/utils/password.util';

/**
 * Create a test user
 */
export async function createTestUser(overrides: Partial<User> = {}): Promise<User> {
  const userRepository = TestDatabaseService.getInstance().getDataSource().getRepository(UserEntity);

  const defaultUser = {
    email: `test.user.${Date.now()}@example.com`,
    password: await hashPassword('Password123!'),
    name: 'Test User',
    role: UserRole.CUSTOMER,
    ...overrides
  };

  const user = userRepository.create(defaultUser);
  return await userRepository.save(user);
}

/**
 * Create a test book
 */
export async function createTestBook(overrides: Partial<Book> = {}): Promise<Book> {
  const bookRepository = TestDatabaseService.getInstance().getDataSource().getRepository(BookEntity);

  const defaultBook = {
    title: `Test Book ${Date.now()}`,
    author: 'Test Author',
    description: 'This is a test book for unit testing purposes.',
    category: BookCategory.FICTION,
    price: 19.99,
    stockQuantity: 10,
    ...overrides
  };

  const book = bookRepository.create(defaultBook);
  return await bookRepository.save(book);
}

/**
 * Clean up test data from database
 */
export async function cleanDatabase(): Promise<void> {
  const dataSource = TestDatabaseService.getInstance().getDataSource();

  // Delete in reverse order of dependencies  
  await dataSource.query('DELETE FROM order_items');
  await dataSource.query('DELETE FROM orders');
  await dataSource.query('DELETE FROM books');
  await dataSource.query('DELETE FROM users');

  console.log('🧹 Test database cleaned');
}