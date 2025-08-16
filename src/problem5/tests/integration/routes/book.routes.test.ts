import request from 'supertest';
import express from 'express';
import bookRoutes from '../../../src/routes/book.routes';
import * as BookService from '../../../src/services/book.service';
import * as BookValidation from '../../../src/validation/book.validation';
import { BookCategory, UserRole } from '../../../src/enums';
import type { Book } from '../../../src/entities';

// Mock dependencies
jest.mock('../../../src/services/book.service');
jest.mock('../../../src/validation/book.validation');
jest.mock('../../../src/database/connection', () => ({
  DatabaseService: {
    getInstance: jest.fn(),
  },
}));
jest.mock('../../../src/middleware/auth.middleware', () => ({
  authenticateToken: (req: any, _res: any, next: any) => {
    req.user = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    next();
  },
  authorizeRoles: (...roles: string[]) => {
    return (req: any, res: any, next: any) => {
      const user = req.user;
      if (user && roles.includes(user.role)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }
    };
  },
}));

const mockBookService = BookService as jest.Mocked<typeof BookService>;
const mockBookValidation = BookValidation as jest.Mocked<typeof BookValidation>;

describe('Book Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/books', bookRoutes);
    jest.clearAllMocks();
  });

  describe('GET /api/books', () => {
    it('should return paginated books successfully', async () => {
      const fixedDate = new Date('2025-08-16T12:00:00.000Z');
      const mockBooks = [
        {
          id: '1',
          title: 'Test Book 1',
          author: 'Author 1',
          category: BookCategory.FICTION,
          price: 19.99,
          stockQuantity: 10,
          description: 'Test book 1',
          createdAt: fixedDate,
          updatedAt: fixedDate,
          orderItems: [],
          isInStock: true,
        },
        {
          id: '2',
          title: 'Test Book 2',
          author: 'Author 2',
          category: BookCategory.SCIENCE,
          price: 24.99,
          stockQuantity: 5,
          description: 'Test book 2',
          createdAt: fixedDate,
          updatedAt: fixedDate,
          orderItems: [],
          isInStock: true,
        },
      ] as Book[];

      const mockPaginatedResult = {
        books: mockBooks,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockBookValidation.validateBookFilters.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockBookService.getBooks.mockResolvedValue(mockPaginatedResult);

      const response = await request(app)
        .get('/api/books')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            title: 'Test Book 1',
            author: 'Author 1',
            category: 'fiction',
            price: 19.99,
            stockQuantity: 10,
            description: 'Test book 1',
            isInStock: true,
          }),
          expect.objectContaining({
            id: '2',
            title: 'Test Book 2',
            author: 'Author 2',
            category: 'science',
            price: 24.99,
            stockQuantity: 5,
            description: 'Test book 2',
            isInStock: true,
          }),
        ]),
      });
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return book by ID successfully', async () => {
      const mockBook = {
        id: '1',
        title: 'Test Book',
        author: 'Test Author',
        category: BookCategory.FICTION,
        price: 19.99,
        stockQuantity: 10,
        description: 'A great book',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        orderItems: [],
        isInStock: true,
      } as Book;

      mockBookService.getBookById.mockResolvedValue(mockBook);

      const response = await request(app)
        .get('/api/books/1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: '1',
          title: 'Test Book',
          author: 'Test Author',
          category: 'fiction',
          price: 19.99,
          stockQuantity: 10,
          description: 'A great book',
          isDeleted: false,
          isInStock: true,
        }),
      });
    });

    it('should return 404 for non-existent book', async () => {
      mockBookService.getBookById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/books/999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Book not found',
      });
    });
  });

  describe('POST /api/books', () => {
    it('should create book successfully (Admin only)', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        category: BookCategory.FICTION,
        price: 29.99,
        stockQuantity: 15,
        description: 'A fantastic new book',
      };

      const createdBook = {
        id: '1',
        ...bookData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        orderItems: [],
        isInStock: true,
      } as Book;

      mockBookValidation.validateCreateBook.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockBookService.createBook.mockResolvedValue(createdBook);

      const response = await request(app)
        .post('/api/books')
        .send(bookData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Book created successfully',
        data: expect.objectContaining({
          id: '1',
          title: 'New Book',
          author: 'New Author',
          category: 'fiction',
          price: 29.99,
          stockQuantity: 15,
          description: 'A fantastic new book',
          isDeleted: false,
          isInStock: true,
        }),
      });
    });
  });

  describe('PUT /api/books/:id', () => {
    it('should update book successfully (Admin only)', async () => {
      const updateData = {
        title: 'Updated Book Title',
        price: 34.99,
      };

      const updatedBook = {
        id: '1',
        title: 'Updated Book Title',
        author: 'Original Author',
        category: BookCategory.FICTION,
        price: 34.99,
        stockQuantity: 10,
        description: 'Original description',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        orderItems: [],
        isInStock: true,
      } as Book;

      mockBookValidation.validateUpdateBook.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockBookService.updateBook.mockResolvedValue(updatedBook);

      const response = await request(app)
        .put('/api/books/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Book updated successfully',
        data: expect.objectContaining({
          id: '1',
          title: 'Updated Book Title',
          author: 'Original Author',
          category: 'fiction',
          price: 34.99,
          stockQuantity: 10,
          description: 'Original description',
          isDeleted: false,
          isInStock: true,
        }),
      });
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should delete book successfully (Admin only)', async () => {
      mockBookService.deleteBook.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/books/1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Book deleted successfully',
      });
    });

    it('should return 404 for non-existent book', async () => {
      mockBookService.deleteBook.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/books/999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Book not found',
      });
    });
  });
});
