import { bookRepository } from '../repositories';
import type { Book } from '../entities';
import type { BookCategory } from '../enums';

export interface CreateBookData {
  title: string;
  author: string;
  price: number;
  category: BookCategory;
  stockQuantity?: number;
  description?: string;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  price?: number;
  category?: BookCategory;
  stockQuantity?: number;
  description?: string;
}

export interface BookFilters {
  category?: BookCategory;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedBooks {
  books: Book[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a new book
 */
export async function createBook(bookData: CreateBookData): Promise<Book> {
  const book = bookRepository.create({
    title: bookData.title,
    author: bookData.author,
    price: bookData.price,
    category: bookData.category,
    stockQuantity: bookData.stockQuantity || 0,
    description: bookData.description || ''
  });

  return bookRepository.save(book);
}

/**
 * Get all books with filters and pagination
 */
export async function getBooks(filters: BookFilters): Promise<PaginatedBooks> {
  const queryBuilder = bookRepository.createQueryBuilder('book');

  if (filters.category) {
    queryBuilder.andWhere('book.category = :category', { category: filters.category });
  }

  if (filters.author) {
    queryBuilder.andWhere('book.author ILIKE :author', { author: `%${filters.author}%` });
  }

  if (filters.minPrice !== undefined) {
    queryBuilder.andWhere('book.price >= :minPrice', { minPrice: filters.minPrice });
  }

  if (filters.maxPrice !== undefined) {
    queryBuilder.andWhere('book.price <= :maxPrice', { maxPrice: filters.maxPrice });
  }

  if (filters.inStock === true) {
    queryBuilder.andWhere('book.stockQuantity > 0');
  }

  // Pagination
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 10));
  const offset = (page - 1) * limit;

  queryBuilder.skip(offset).take(limit);

  // Order by creation date (newest first)
  queryBuilder.orderBy('book.createdAt', 'DESC');

  const [books, total] = await queryBuilder.getManyAndCount();

  return {
    books,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get a book by ID
 */
export async function getBookById(id: string): Promise<Book | null> {
  return bookRepository.findOne({ where: { id } });
}

/**
 * Update a book
 */
export async function updateBook(id: string, updateData: UpdateBookData): Promise<Book | null> {
  const book = await bookRepository.findOne({ where: { id } });

  if (!book) {
    return null;
  }

  // Update fields
  Object.assign(book, updateData);

  return bookRepository.save(book);
}

/**
 * Delete a book
 */
export async function deleteBook(id: string): Promise<boolean> {
  const book = await bookRepository.findOne({ where: { id } });

  if (!book) {
    return false;
  }

  await bookRepository.remove(book);
  return true;
}

/**
 * Check if a book exists by ID
 */
export async function bookExists(id: string): Promise<boolean> {
  const count = await bookRepository.count({ where: { id } });
  return count > 0;
}

/**
 * Get books by category
 */
export async function getBooksByCategory(category: BookCategory): Promise<Book[]> {
  return bookRepository.find({
    where: { category },
    order: { createdAt: 'DESC' }
  });
}

/**
 * Get books with low stock (for inventory management)
 */
export async function getBooksWithLowStock(threshold: number = 5): Promise<Book[]> {
  return bookRepository
    .createQueryBuilder('book')
    .where('book.stockQuantity <= :threshold', { threshold })
    .orderBy('book.stockQuantity', 'ASC')
    .getMany();
}

/**
 * Update book stock quantity
 */
export async function updateBookStock(id: string, newStock: number): Promise<Book | null> {
  const book = await bookRepository.findOne({ where: { id } });

  if (!book) {
    return null;
  }

  book.stockQuantity = Math.max(0, newStock);
  return bookRepository.save(book);
}

/**
 * Decrease book stock (for order processing)
 */
export async function decreaseBookStock(id: string, quantity: number): Promise<Book | null> {
  const book = await bookRepository.findOne({ where: { id } });

  if (!book || book.stockQuantity < quantity) {
    return null;
  }

  book.stockQuantity -= quantity;
  return bookRepository.save(book);
}
