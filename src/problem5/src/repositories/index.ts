import type { Repository } from 'typeorm';
import { DatabaseService } from '../database/connection';
import { User, Book, Order, OrderItem } from '../entities';

/**
 * Repository factory that provides pre-configured TypeORM repositories
 */
class RepositoryFactory {
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = DatabaseService.getInstance();
  }

  get userRepository(): Repository<User> {
    return this.databaseService.getDataSource().getRepository(User);
  }

  get bookRepository(): Repository<Book> {
    return this.databaseService.getDataSource().getRepository(Book);
  }

  get orderRepository(): Repository<Order> {
    return this.databaseService.getDataSource().getRepository(Order);
  }

  get orderItemRepository(): Repository<OrderItem> {
    return this.databaseService.getDataSource().getRepository(OrderItem);
  }
}

// Export singleton instance
const repositoryFactory = new RepositoryFactory();

// Export individual repositories for direct import
export const userRepository = repositoryFactory.userRepository;
export const bookRepository = repositoryFactory.bookRepository;
export const orderRepository = repositoryFactory.orderRepository;
export const orderItemRepository = repositoryFactory.orderItemRepository;

// Also export the factory for cases where you might want all repositories
export { repositoryFactory };
