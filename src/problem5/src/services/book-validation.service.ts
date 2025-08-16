import { BookCategory } from '../enums';

export interface CreateBookValidation {
  title: string;
  author: string;
  price: number;
  category: BookCategory;
  stockQuantity?: number;
  description?: string;
}

export interface UpdateBookValidation {
  title?: string;
  author?: string;
  price?: number;
  category?: BookCategory;
  stockQuantity?: number;
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate book creation data
 */
export function validateCreateBook(data: unknown): ValidationResult {
  const errors: string[] = [];
  const bookData = data as Record<string, unknown>;

  // Required fields
  if (!bookData['title'] || typeof bookData['title'] !== 'string' || !(bookData['title'] as string).trim()) {
    errors.push('Title is required');
  }

  if (!bookData['author'] || typeof bookData['author'] !== 'string' || !(bookData['author'] as string).trim()) {
    errors.push('Author is required');
  }

  if (!bookData['price']) {
    errors.push('Price is required');
  } else {
    const price = Number(bookData['price']);
    if (Number.isNaN(price) || price <= 0) {
      errors.push('Price must be a positive number');
    }
  }

  if (!bookData['category']) {
    errors.push('Category is required');
  } else if (!Object.values(BookCategory).includes(bookData['category'] as BookCategory)) {
    errors.push(`Invalid category. Must be one of: ${Object.values(BookCategory).join(', ')}`);
  }

  // Optional fields validation
  if (bookData['stockQuantity'] !== undefined) {
    const stock = Number(bookData['stockQuantity']);
    if (Number.isNaN(stock) || stock < 0) {
      errors.push('Stock quantity must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate book update data
 */
export function validateUpdateBook(data: unknown): ValidationResult {
  const errors: string[] = [];
  const bookData = data as Record<string, unknown>;

  // Only validate fields that are provided
  if (bookData['title'] !== undefined) {
    if (typeof bookData['title'] !== 'string' || !(bookData['title'] as string).trim()) {
      errors.push('Title cannot be empty');
    }
  }

  if (bookData['author'] !== undefined) {
    if (typeof bookData['author'] !== 'string' || !(bookData['author'] as string).trim()) {
      errors.push('Author cannot be empty');
    }
  }

  if (bookData['price'] !== undefined) {
    const price = Number(bookData['price']);
    if (Number.isNaN(price) || price <= 0) {
      errors.push('Price must be a positive number');
    }
  }

  if (bookData['category'] !== undefined && !Object.values(BookCategory).includes(bookData['category'] as BookCategory)) {
    errors.push(`Invalid category. Must be one of: ${Object.values(BookCategory).join(', ')}`);
  }

  if (bookData['stockQuantity'] !== undefined) {
    const stock = Number(bookData['stockQuantity']);
    if (Number.isNaN(stock) || stock < 0) {
      errors.push('Stock quantity must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate query filters
 */
export function validateBookFilters(query: unknown): ValidationResult {
  const errors: string[] = [];
  const filters = query as Record<string, unknown>;

  if (filters['category'] && !Object.values(BookCategory).includes(filters['category'] as BookCategory)) {
    errors.push(`Invalid category filter. Must be one of: ${Object.values(BookCategory).join(', ')}`);
  }

  if (filters['minPrice']) {
    const minPrice = Number(filters['minPrice']);
    if (Number.isNaN(minPrice) || minPrice < 0) {
      errors.push('Minimum price must be a non-negative number');
    }
  }

  if (filters['maxPrice']) {
    const maxPrice = Number(filters['maxPrice']);
    if (Number.isNaN(maxPrice) || maxPrice < 0) {
      errors.push('Maximum price must be a non-negative number');
    }
  }

  if (filters['minPrice'] && filters['maxPrice']) {
    const minPrice = Number(filters['minPrice']);
    const maxPrice = Number(filters['maxPrice']);
    if (!Number.isNaN(minPrice) && !Number.isNaN(maxPrice) && minPrice > maxPrice) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
  }

  if (filters['page']) {
    const page = Number(filters['page']);
    if (Number.isNaN(page) || page < 1) {
      errors.push('Page must be a positive number');
    }
  }

  if (filters['limit']) {
    const limit = Number(filters['limit']);
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('Limit must be a number between 1 and 100');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
