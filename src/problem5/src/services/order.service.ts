import { AppDataSource, DatabaseService } from '../database/connection';
import type { Order, OrderItem, Book } from '../entities';
import { Book as BookEntity } from '../entities/book.entity';
import { User as UserEntity } from '../entities/user.entity';
import { Order as OrderEntity } from '../entities/order.entity';
import { OrderItem as OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from '../enums';

export interface PlaceOrderRequest {
  userId: string;
  items: Array<{
    bookId: string;
    quantity: number;
  }>;
}

export interface OrderSummary {
  order: Order;
  orderItems: OrderItem[];
  totalAmount: number;
  message: string;
}

export class OrderPlacementError extends Error {
  constructor(message: string, public code: 'INSUFFICIENT_STOCK' | 'BOOK_NOT_FOUND' | 'USER_NOT_FOUND' | 'DATABASE_ERROR' | 'VALIDATION_ERROR') {
    super(message);
    this.name = 'OrderPlacementError';
  }
}

/**
 * Place an order with PostgreSQL pessimistic locking for concurrency control
 */
export async function placeOrder(orderRequest: PlaceOrderRequest): Promise<OrderSummary> {
  // Get DataSource for transaction
  const dataSource = AppDataSource;
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Validate user exists
    const user = await queryRunner.manager.findOne(UserEntity, { where: { id: orderRequest.userId } });
    if (!user) {
      throw new OrderPlacementError('User not found', 'USER_NOT_FOUND');
    }

    // 2. Validate items and lock books for update
    const orderItems: Array<{ book: Book; quantity: number }> = [];
    let totalAmount = 0;

    for (const item of orderRequest.items) {
      // Validate quantity
      if (item.quantity <= 0) {
        throw new OrderPlacementError(`Invalid quantity for book ${item.bookId}`, 'VALIDATION_ERROR');
      }

      // Lock the book row for update (SELECT ... FOR UPDATE)
      const book = await queryRunner.manager
        .createQueryBuilder(BookEntity, 'book')
        .where('book.id = :id', { id: item.bookId })
        .setLock('pessimistic_write') // This creates SELECT ... FOR UPDATE
        .getOne();

      if (!book) {
        throw new OrderPlacementError(`Book not found: ${item.bookId}`, 'BOOK_NOT_FOUND');
      }

      // Check stock availability (this is guaranteed to be the latest value due to lock)
      if (book.stockQuantity < item.quantity) {
        throw new OrderPlacementError(
          `Insufficient stock for "${book.title}". Available: ${book.stockQuantity}, Requested: ${item.quantity}`,
          'INSUFFICIENT_STOCK'
        );
      }

      orderItems.push({ book, quantity: item.quantity });
      totalAmount += book.price * item.quantity;
    }

    // 3. Create order
    const order = queryRunner.manager.create(OrderEntity, {
      user,
      status: OrderStatus.PROCESSING,
      totalAmount
    });

    const savedOrder = await queryRunner.manager.save(order);

    // 4. Create order items and update stock atomically
    const savedOrderItems: OrderItem[] = [];

    for (const { book, quantity } of orderItems) {
      // Create order item
      const orderItem = queryRunner.manager.create(OrderItemEntity, {
        order: savedOrder,
        book,
        quantity,
        unitPrice: book.price,
        totalPrice: book.price * quantity
      });

      const savedOrderItem = await queryRunner.manager.save(orderItem);
      savedOrderItems.push(savedOrderItem as OrderItem);

      // Update book stock atomically (still within the locked transaction)
      book.stockQuantity -= quantity;
      await queryRunner.manager.save(book);

      console.log(`✅ Successfully reduced stock for "${book.title}" by ${quantity}. New stock: ${book.stockQuantity}`);
    }

    // 5. Update order status to delivered
    (savedOrder as Order).status = OrderStatus.DELIVERED;
    const finalOrder = await queryRunner.manager.save(savedOrder);

    // 6. Commit transaction (releases all locks)
    await queryRunner.commitTransaction();

    console.log(`🎉 Order ${(finalOrder as Order).id} placed successfully for user ${user.email}. Total: $${totalAmount}`);

    return {
      order: finalOrder as Order,
      orderItems: savedOrderItems,
      totalAmount,
      message: 'Order placed successfully!'
    };

  } catch (error) {
    // Rollback transaction (releases all locks)
    await queryRunner.rollbackTransaction();
    console.error('❌ Order placement failed:', error);

    // If it's already our custom error, re-throw it
    if (error instanceof OrderPlacementError) {
      throw error;
    }

    // Handle unexpected database errors
    throw new OrderPlacementError('Failed to place order due to database error', 'DATABASE_ERROR');

  } finally {
    // Release the query runner connection
    await queryRunner.release();
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  const orderRepository = DatabaseService.getInstance().getDataSource().getRepository(OrderEntity);

  return orderRepository.find({
    where: { user: { id: userId } },
    relations: ['orderItems', 'orderItems.book'],
    order: { createdAt: 'DESC' }
  });
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const orderRepository = DatabaseService.getInstance().getDataSource().getRepository(OrderEntity);

  return orderRepository.findOne({
    where: { id: orderId },
    relations: ['user', 'orderItems', 'orderItems.book']
  });
}
