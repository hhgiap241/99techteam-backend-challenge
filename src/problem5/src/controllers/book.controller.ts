import type { Request, Response } from 'express';
import { validateCreateBook, validateUpdateBook, validateBookFilters } from '../validation/book.validation';
import { createBook, getBooks, getBookById, updateBook, deleteBook } from '../services/book.service';
import type { BookFilters } from '../services/book.service';
import type { BookCategory } from '../enums';

export class BookController {
  // 1. Create a book
  public async createBook(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validation = validateCreateBook(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      const book = await createBook({
        title: req.body.title,
        author: req.body.author,
        price: parseFloat(req.body.price),
        category: req.body.category,
        stockQuantity: req.body.stockQuantity ? parseInt(req.body.stockQuantity) : 0,
        description: req.body.description || ''
      });

      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: book
      });

    } catch (error) {
      console.error('Create book error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create book',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 2. List books with basic filters
  public async getBooks(req: Request, res: Response): Promise<void> {
    try {
      // Validate filters
      const validation = validateBookFilters(req.query);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Invalid filters',
          errors: validation.errors
        });
        return;
      }

      // Get books using service
      const filters: Partial<BookFilters> = {
        inStock: req.query['inStock'] === 'true',
        page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
        limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10
      };

      // Only add properties if they exist
      if (req.query['category']) {
        filters.category = req.query['category'] as BookCategory;
      }
      if (req.query['author']) {
        filters.author = req.query['author'] as string;
      }
      if (req.query['minPrice']) {
        filters.minPrice = parseFloat(req.query['minPrice'] as string);
      }
      if (req.query['maxPrice']) {
        filters.maxPrice = parseFloat(req.query['maxPrice'] as string);
      }

      const result = await getBooks(filters as BookFilters);

      res.json({
        success: true,
        data: result.books,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get books error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch books',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 3. Get book details by ID
  public async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Book ID is required'
        });
        return;
      }

      const book = await getBookById(id);

      if (!book) {
        res.status(404).json({
          success: false,
          message: 'Book not found'
        });
        return;
      }

      res.json({
        success: true,
        data: book
      });

    } catch (error) {
      console.error('Get book error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch book',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 4. Update book details
  public async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Book ID is required'
        });
        return;
      }

      // Validate update data
      const validation = validateUpdateBook(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      // Update book using service
      const updatedBook = await updateBook(id, req.body);

      if (!updatedBook) {
        res.status(404).json({
          success: false,
          message: 'Book not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Book updated successfully',
        data: updatedBook
      });

    } catch (error) {
      console.error('Update book error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update book',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 5. Delete a book
  public async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Book ID is required'
        });
        return;
      }

      const deleted = await deleteBook(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Book not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Book deleted successfully'
      });

    } catch (error) {
      console.error('Delete book error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete book',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
