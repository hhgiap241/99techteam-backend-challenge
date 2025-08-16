import 'reflect-metadata';
import dotenv from 'dotenv';
import { DatabaseService } from '../connection';
import { User, Book, Order, OrderItem } from '../../entities';
import { UserRole, BookCategory, OrderStatus } from '../../enums';
import { hashPassword } from '@/utils';

dotenv.config();

async function runSeeds() {
  let databaseService: DatabaseService | null = null;

  try {
    console.log('🌱 Starting database seeding...');

    databaseService = DatabaseService.getInstance();
    await databaseService.connect();

    const dataSource = databaseService.getDataSource();
    console.log('✅ Database connected successfully');

    // Clear existing data (optional - for development)
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.query('TRUNCATE TABLE order_items CASCADE');
    await queryRunner.query('TRUNCATE TABLE orders CASCADE');
    await queryRunner.query('TRUNCATE TABLE books CASCADE');
    await queryRunner.query('TRUNCATE TABLE users CASCADE');
    await queryRunner.release();

    console.log('🗑️ Existing data cleared');

    // Create Users
    const userRepository = dataSource.getRepository(User);
    const hashedPassword = await hashPassword('password123');

    const adminUser = userRepository.create({
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const customer1 = userRepository.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    const customer2 = userRepository.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    const savedUsers = await userRepository.save([adminUser, customer1, customer2]);
    console.log('✅ Users seeded successfully');

    // Create Books
    const bookRepository = dataSource.getRepository(Book);

    const books = bookRepository.create([
      {
        title: 'The Hitchhiker\'s Guide to the Galaxy',
        author: 'Douglas Adams',
        description: 'A hilarious science fiction comedy series about space travel and the meaning of life.',
        category: BookCategory.FICTION,
        price: 12.99,
        stockQuantity: 50,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        description: 'A handbook of agile software craftsmanship with practical coding techniques.',
        category: BookCategory.TECHNOLOGY,
        price: 39.99,
        stockQuantity: 25,
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'Epic science fiction novel set on the desert planet Arrakis.',
        category: BookCategory.FICTION,
        price: 15.99,
        stockQuantity: 30,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas and Andrew Hunt',
        description: 'Your journey to mastery in software development.',
        category: BookCategory.TECHNOLOGY,
        price: 44.99,
        stockQuantity: 20,
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        description: 'A landmark volume in science writing exploring the nature of the universe.',
        category: BookCategory.SCIENCE,
        price: 18.99,
        stockQuantity: 40,
      },
      {
        title: 'The Elegant Universe',
        author: 'Brian Greene',
        description: 'Superstrings, hidden dimensions, and the quest for the ultimate theory.',
        category: BookCategory.SCIENCE,
        price: 22.99,
        stockQuantity: 15,
      },
    ]);

    const savedBooks = await bookRepository.save(books);
    console.log('✅ Books seeded successfully');

    // Create Orders and OrderItems
    const orderRepository = dataSource.getRepository(Order);
    const orderItemRepository = dataSource.getRepository(OrderItem);

    // Reference saved entities
    const savedCustomer1 = savedUsers[1];
    const savedCustomer2 = savedUsers[2];
    const savedHitchhikersGuide = savedBooks[0];
    const savedCleanCode = savedBooks[1];
    const savedDune = savedBooks[2];
    const savedPragmaticProgrammer = savedBooks[3];

    if (!savedCustomer1 || !savedCustomer2 || !savedHitchhikersGuide || !savedCleanCode || !savedDune || !savedPragmaticProgrammer) {
      throw new Error('Required entities not found for creating orders');
    }

    // Order 1: Customer 1 orders 2 books
    const order1 = orderRepository.create({
      userId: savedCustomer1.id,
      status: OrderStatus.PROCESSING,
      totalAmount: 28.98, // 12.99 + 15.99
    });

    const savedOrder1 = await orderRepository.save(order1);

    const order1Items = orderItemRepository.create([
      {
        orderId: savedOrder1.id,
        bookId: savedHitchhikersGuide.id,
        quantity: 1,
        unitPrice: savedHitchhikersGuide.price,
      },
      {
        orderId: savedOrder1.id,
        bookId: savedDune.id,
        quantity: 1,
        unitPrice: savedDune.price,
      },
    ]);

    await orderItemRepository.save(order1Items);

    // Order 2: Customer 2 orders tech books
    const order2 = orderRepository.create({
      userId: savedCustomer2.id,
      status: OrderStatus.DELIVERED,
      totalAmount: 84.98, // 39.99 + 44.99
    });

    const savedOrder2 = await orderRepository.save(order2);

    const order2Items = orderItemRepository.create([
      {
        orderId: savedOrder2.id,
        bookId: savedCleanCode.id,
        quantity: 1,
        unitPrice: savedCleanCode.price,
      },
      {
        orderId: savedOrder2.id,
        bookId: savedPragmaticProgrammer.id,
        quantity: 1,
        unitPrice: savedPragmaticProgrammer.price,
      },
    ]);

    await orderItemRepository.save(order2Items);

    console.log('✅ Orders seeded successfully');
    console.log('\n🎉 All seed data created successfully!');
    console.log(`
Seeded data summary:
- 👥 Users: 3 (1 admin, 2 customers)
- 📚 Books: 6 (across fiction, technology, and science categories)
- 📦 Orders: 2 (1 processing, 1 delivered)
- 📋 Order Items: 4

Admin credentials:
Email: admin@bookstore.com
Password: password123

Customer credentials:
Email: john@example.com / jane@example.com
Password: password123
    `);

  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    // Clean up connection
    if (databaseService) {
      await databaseService.disconnect();
    }
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds };
