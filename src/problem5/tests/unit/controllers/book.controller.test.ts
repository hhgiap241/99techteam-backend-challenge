import type { Request, Response } from 'express';
import { BookController } from '../../../src/controllers/book.controller';
import * as BookService from '../../../src/services/book.service';
import * as BookValidation from '../../../src/validation/book.validation';
import type { Book } from '../../../src/entities';
import { BookCategory } from '../../../src/enums';

// Mock dependencies
jest.mock('../../../src/services/book.service');
jest.mock('../../../src/validation/book.validation');

const mockBookService = BookService as jest.Mocked<typeof BookService>;
const mockBookValidation = BookValidation as jest.Mocked<typeof BookValidation>;

describe('BookController', () => {
  let bookController: BookController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    bookController = new BookController();
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getBooks', () => {
    it('should return paginated books successfully', async () => {
      const mockBooks = [
        {
          id: '1',
          title: 'Test Book 1',
          author: 'Author 1',
          category: BookCategory.FICTION,
          price: 19.99,
          stockQuantity: 10,
          description: 'Test book',
          createdAt: new Date(),
          updatedAt: new Date(),
          orderItems: [],
          isInStock: true,
        },
      ] as Book[];
      const mockPaginatedResult = {
        books: mockBooks,
        pagination: {
          limit: 10,
          total: 1,
          page: 1,
          totalPages: 1
        },
      };

      mockBookValidation.validateBookFilters.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockBookService.getBooks.mockResolvedValue(mockPaginatedResult);

      await bookController.getBooks(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPaginatedResult.books,
        pagination: mockPaginatedResult.pagination,
      });
    });

    it('should handle validation errors', async () => {
      mockBookValidation.validateBookFilters.mockReturnValue({
        isValid: false,
        errors: ['Invalid page number'],
      });

      await bookController.getBooks(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid filters',
        errors: ['Invalid page number'],
      });
    });

    it('should handle service errors', async () => {
      mockBookValidation.validateBookFilters.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockBookService.getBooks.mockRejectedValue(new Error('Database error'));

      await bookController.getBooks(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch books',
        error: 'Database error',
      });
    });
  });

  describe('getBookById', () => {
    it('should return book successfully', async () => {
      const mockBook = {
        id: '1',
        title: 'Test Book',
        author: 'Author',
        category: BookCategory.FICTION,
        price: 19.99,
        stockQuantity: 10,
        description: 'Test book',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        orderItems: [],
        isInStock: true,
      } as Book;
      mockRequest.params = { id: '1' };

      mockBookService.getBookById.mockResolvedValue(mockBook);

      await bookController.getBookById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBook,
      });
    });

    it('should handle book not found', async () => {
      mockRequest.params = { id: '999' };

      mockBookService.getBookById.mockResolvedValue(null);

      await bookController.getBookById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Book not found',
      });
    });
  });

  describe('createBook', () => {
    it('should create book successfully', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        category: BookCategory.FICTION,
        price: 19.99,
        stockQuantity: 10,
        description: 'A great book',
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

      mockRequest.body = bookData;
      mockBookValidation.validateCreateBook.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockBookService.createBook.mockResolvedValue(createdBook);

      await bookController.createBook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Book created successfully',
        data: createdBook,
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { title: '' };
      mockBookValidation.validateCreateBook.mockReturnValue({
        isValid: false,
        errors: ['Title is required'],
      });

      await bookController.createBook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: ['Title is required'],
      });
    });
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const updateData = { title: 'Updated Book' };
      const updatedBook = {
        id: '1',
        title: 'Updated Book',
        author: 'Author',
        category: BookCategory.FICTION,
        price: 19.99,
        stockQuantity: 10,
        description: 'Updated book',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        orderItems: [],
        isInStock: true,
      } as Book;

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;

      mockBookValidation.validateUpdateBook.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockBookService.updateBook.mockResolvedValue(updatedBook);

      await bookController.updateBook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Book updated successfully',
        data: updatedBook,
      });
    });

    it('should handle book not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { title: 'Updated' };

      mockBookValidation.validateUpdateBook.mockReturnValue({
        isValid: true,
        errors: [],
      });
      mockBookService.updateBook.mockResolvedValue(null);

      await bookController.updateBook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Book not found',
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { price: -1 };

      mockBookValidation.validateUpdateBook.mockReturnValue({
        isValid: false,
        errors: ['Price must be positive'],
      });

      await bookController.updateBook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: ['Price must be positive'],
      });
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      mockRequest.params = { id: '1' };

      mockBookService.deleteBook.mockResolvedValue(true);

      await bookController.deleteBook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Book deleted successfully',
      });
    });

    it('should handle book not found', async () => {
      mockRequest.params = { id: '999' };

      mockBookService.deleteBook.mockResolvedValue(false);

      await bookController.deleteBook(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Book not found',
      });
    });
  });
});
