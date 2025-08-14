import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { IsPositive, Min } from 'class-validator';
import { Order } from './order.entity';
import { Book } from './book.entity';

@Entity('order_items')
@Index(['orderId'])
@Index(['bookId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'uuid' })
  bookId: string;

  @Column({ type: 'int' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsPositive({ message: 'Unit price must be positive' })
  unitPrice: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Book, (book) => book.orderItems)
  @JoinColumn({ name: 'bookId' })
  book: Book;

  // Virtual properties
  get totalPrice(): number {
    return Number(this.unitPrice) * this.quantity;
  }
}
