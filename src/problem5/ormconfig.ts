import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

// This is used by TypeORM CLI commands for migrations
export default new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '5432', 10),
  username: process.env['DB_USERNAME'] || 'postgres',
  password: process.env['DB_PASSWORD'] || 'password',
  database: process.env['DB_DATABASE'] || 'bookstore_db',
  entities: ['src/models/**/*.entity.ts'],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/database/subscribers/**/*.ts'],
  logging: false,
  synchronize: false,
});
