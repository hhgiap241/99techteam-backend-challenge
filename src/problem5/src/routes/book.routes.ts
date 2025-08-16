import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();
const bookController = new BookController();

// Public routes (no authentication required)
/**
 * @route   GET /api/books
 * @desc    Get all books with optional filters
 * @access  Public
 * @params  ?category=FICTION&author=tolkien&minPrice=10&maxPrice=50&inStock=true&page=1&limit=10
 */
router.get('/', bookController.getBooks.bind(bookController));

/**
 * @route   GET /api/books/:id
 * @desc    Get book details by ID
 * @access  Public
 */
router.get('/:id', bookController.getBookById.bind(bookController));

// Protected routes (authentication required)
/**
 * @route   POST /api/books
 * @desc    Create a new book
 * @access  Private (Admin only)
 */
router.post('/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  bookController.createBook.bind(bookController)
);

/**
 * @route   PUT /api/books/:id
 * @desc    Update book details
 * @access  Private (Admin only)
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  bookController.updateBook.bind(bookController)
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book
 * @access  Private (Admin only)
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  bookController.deleteBook.bind(bookController)
);

export default router;
