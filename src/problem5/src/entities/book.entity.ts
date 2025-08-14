import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsPositive } from 'class-validator';
import { BookCategory } from '../enums';
import { OrderItem } from './order-item.entity';

@Entity('books')
@Index(['title'])
@Index(['author'])
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Author is required' })
  author: string;

  @Column({ type: 'text' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @Column({
    type: 'enum',
    enum: BookCategory,
    default: BookCategory.FICTION,
  })
  category: BookCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => OrderItem, (orderItem) => orderItem.book)
  orderItems: OrderItem[];

  // Virtual properties
  get isInStock(): boolean {
    return this.stockQuantity > 0;
  }
}
