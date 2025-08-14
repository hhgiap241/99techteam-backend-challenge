import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserRole } from '../enums';
import { Order } from './order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  // Methods
  public toJSON(): Partial<User> {
    const { password: _password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
