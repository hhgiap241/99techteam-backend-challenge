import { validateCreateBook, validateUpdateBook } from '../../../src/validation/book.validation';
import { BookCategory } from '../../../src/enums';

describe('Book Validation', () => {
  describe('validateCreateBook', () => {
    it('should pass validation for valid book data', () => {
      // Arrange
      const validBookData = {
        title: 'Valid Book Title',
        author: 'John Doe',
        description: 'A great book about something interesting',
        category: BookCategory.FICTION,
        price: 19.99,
        stockQuantity: 10
      };

      // Act
      const result = validateCreateBook(validBookData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing title', () => {
      // Arrange
      const invalidBookData = {
        author: 'John Doe',
        category: BookCategory.FICTION,
        price: 19.99
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should fail validation for empty title', () => {
      // Arrange
      const invalidBookData = {
        title: '',
        author: 'John Doe',
        category: BookCategory.FICTION,
        price: 19.99
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Title'))).toBe(true);
    });

    it('should fail validation for missing author', () => {
      // Arrange
      const invalidBookData = {
        title: 'Valid Title',
        category: BookCategory.FICTION,
        price: 19.99
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Author is required');
    });

    it('should fail validation for empty author', () => {
      // Arrange
      const invalidBookData = {
        title: 'Valid Title',
        author: '',
        category: BookCategory.FICTION,
        price: 19.99
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Author'))).toBe(true);
    });

    it('should fail validation for invalid price (negative)', () => {
      // Arrange
      const invalidBookData = {
        title: 'Valid Title',
        author: 'John Doe',
        category: BookCategory.FICTION,
        price: -10.00
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Price'))).toBe(true);
    });

    it('should fail validation for invalid price (zero)', () => {
      // Arrange
      const invalidBookData = {
        title: 'Valid Title',
        author: 'John Doe',
        category: BookCategory.FICTION,
        price: 0
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Price'))).toBe(true);
    });

    it('should fail validation for missing category', () => {
      // Arrange
      const invalidBookData = {
        title: 'Valid Title',
        author: 'John Doe',
        price: 19.99
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required');
    });

    it('should fail validation for negative stock quantity', () => {
      // Arrange
      const invalidBookData = {
        title: 'Valid Title',
        author: 'John Doe',
        category: BookCategory.FICTION,
        price: 19.99,
        stockQuantity: -5
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Stock quantity'))).toBe(true);
    });

    it('should pass validation with optional fields omitted', () => {
      // Arrange
      const minimalBookData = {
        title: 'Valid Title',
        author: 'John Doe',
        category: BookCategory.FICTION,
        price: 19.99
      };

      // Act
      const result = validateCreateBook(minimalBookData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle multiple validation errors', () => {
      // Arrange
      const invalidBookData = {
        title: '', // Empty title
        author: '', // Empty author
        category: BookCategory.FICTION,
        price: -10.00 // Negative price
      };

      // Act
      const result = validateCreateBook(invalidBookData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateUpdateBook', () => {
    it('should pass validation for valid partial update data', () => {
      // Arrange
      const validUpdateData = {
        title: 'Updated Title',
        price: 25.99
      };

      // Act
      const result = validateUpdateBook(validUpdateData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass validation for empty update data', () => {
      // Arrange
      const emptyUpdateData = {};

      // Act
      const result = validateUpdateBook(emptyUpdateData);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid price in update', () => {
      // Arrange
      const invalidUpdateData = {
        price: -15.00
      };

      // Act
      const result = validateUpdateBook(invalidUpdateData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Price'))).toBe(true);
    });

    it('should fail validation for empty title in update', () => {
      // Arrange
      const invalidUpdateData = {
        title: ''
      };

      // Act
      const result = validateUpdateBook(invalidUpdateData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Title'))).toBe(true);
    });

    it('should fail validation for negative stock in update', () => {
      // Arrange
      const invalidUpdateData = {
        stockQuantity: -3
      };

      // Act
      const result = validateUpdateBook(invalidUpdateData);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('Stock quantity'))).toBe(true);
    });
  });
});
