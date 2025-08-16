import * as BookService from '../../../src/services/book.service';
import { BookCategory } from '../../../src/enums';
import { createTestBook, cleanDatabase } from '../../utils/test-helpers';

describe('BookService', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test Description',
        category: BookCategory.FICTION,
        price: 19.99,
        stockQuantity: 10
      };

      const result = await BookService.createBook(bookData);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(bookData.title);
      expect(result.author).toBe(bookData.author);
      expect(result.price).toBe(bookData.price);
      expect(result.stockQuantity).toBe(bookData.stockQuantity);
    });
  });

  describe('getBooks', () => {
    it('should return empty list when no books exist', async () => {
      const result = await BookService.getBooks({ page: 1, limit: 10 });

      expect(result.books).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('should filter books by author', async () => {
      await createTestBook({ author: 'John Smith' });
      await createTestBook({ author: 'Jane Doe' });
      await createTestBook({ author: 'John Williams' });

      const result = await BookService.getBooks({
        author: 'John',
        page: 1,
        limit: 10
      });

      expect(result.books).toHaveLength(2);
      expect(result.books.every(book => book.author.includes('John'))).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      // Create 5 books
      for (let i = 1; i <= 5; i++) {
        await createTestBook({ title: `Book ${i}` });
      }

      // Test first page
      const page1 = await BookService.getBooks({ page: 1, limit: 2 });
      expect(page1.books).toHaveLength(2);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.totalPages).toBe(3);

      // Test second page
      const page2 = await BookService.getBooks({ page: 2, limit: 2 });
      expect(page2.books).toHaveLength(2);
      expect(page2.pagination.page).toBe(2);

      // Test last page
      const page3 = await BookService.getBooks({ page: 3, limit: 2 });
      expect(page3.books).toHaveLength(1);
      expect(page3.pagination.page).toBe(3);
    });
  });

  describe('getBookById', () => {
    it('should return book when found', async () => {
      const createdBook = await createTestBook({ title: 'Test Book' });

      const result = await BookService.getBookById(createdBook.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(createdBook.id);
      expect(result?.title).toBe('Test Book');
    });

    it('should return null when book not found', async () => {
      const result = await BookService.getBookById('7cee5b9e-a3fb-4a7b-9309-edda2eb411bd');

      expect(result).toBeNull();
    });
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const createdBook = await createTestBook({ title: 'Original Title', price: 10.00 });
      const updateData = { title: 'Updated Title', price: 25.99 };

      const result = await BookService.updateBook(createdBook.id, updateData);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Updated Title');
      expect(result?.price).toBe(25.99);
    });

    it('should update partial fields', async () => {
      const createdBook = await createTestBook({ title: 'Original', stockQuantity: 5 });

      const result = await BookService.updateBook(createdBook.id, { stockQuantity: 15 });

      expect(result?.title).toBe('Original');
      expect(result?.stockQuantity).toBe(15);
    });

    it('should return null when book not found', async () => {
      const result = await BookService.updateBook('7cee5b9e-a3fb-4a7b-9309-edda2eb411bd', { title: 'New Title' });

      expect(result).toBeNull();
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      const createdBook = await createTestBook();

      const result = await BookService.deleteBook(createdBook.id);

      expect(result).toBe(true);

      // Verify book is actually deleted
      const deletedBook = await BookService.getBookById(createdBook.id);
      expect(deletedBook).toBeNull();
    });

    it('should return false when book not found', async () => {
      const result = await BookService.deleteBook('7cee5b9e-a3fb-4a7b-9309-edda2eb411bd');

      expect(result).toBe(false);
    });
  });
});
