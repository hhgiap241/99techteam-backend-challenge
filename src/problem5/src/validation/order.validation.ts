import type { Request } from 'express';

export interface ValidationError {
  field: string;
  message: string;
}

export interface PlaceOrderValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: {
    userId: string;
    items: Array<{
      bookId: string;
      quantity: number;
    }>;
  } | undefined;
}

export interface GetOrdersValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: {
    userId: string;
  } | undefined;
}

/**
 * Validate place order request
 */
export function validatePlaceOrderRequest(req: Request): PlaceOrderValidationResult {
  const errors: ValidationError[] = [];
  const { items } = req.body;
  const userId = req.user?.id;

  // Validate user ID from token
  if (!userId) {
    errors.push({
      field: 'user',
      message: 'User authentication required'
    });
  }

  // Validate items array
  if (!items) {
    errors.push({
      field: 'items',
      message: 'Items array is required'
    });
  } else if (!Array.isArray(items)) {
    errors.push({
      field: 'items',
      message: 'Items must be an array'
    });
  } else if (items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one item is required'
    });
  } else {
    // Validate each item
    items.forEach((item, index) => {
      if (!item) {
        errors.push({
          field: `items[${index}]`,
          message: 'Item cannot be null or undefined'
        });
        return;
      }

      // Validate bookId
      if (!item.bookId) {
        errors.push({
          field: `items[${index}].bookId`,
          message: 'Book ID is required'
        });
      } else if (typeof item.bookId !== 'string') {
        errors.push({
          field: `items[${index}].bookId`,
          message: 'Book ID must be a string'
        });
      } else if (item.bookId.trim().length === 0) {
        errors.push({
          field: `items[${index}].bookId`,
          message: 'Book ID cannot be empty'
        });
      }

      // Validate quantity
      if (item.quantity === undefined || item.quantity === null) {
        errors.push({
          field: `items[${index}].quantity`,
          message: 'Quantity is required'
        });
      } else if (!Number.isInteger(item.quantity)) {
        errors.push({
          field: `items[${index}].quantity`,
          message: 'Quantity must be an integer'
        });
      } else if (item.quantity <= 0) {
        errors.push({
          field: `items[${index}].quantity`,
          message: 'Quantity must be greater than 0'
        });
      } else if (item.quantity > 100) {
        errors.push({
          field: `items[${index}].quantity`,
          message: 'Quantity cannot exceed 100 per item'
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 && userId ? {
      userId,
      items: items.map((item: { bookId: string; quantity: number }) => ({
        bookId: item.bookId.trim(),
        quantity: parseInt(String(item.quantity), 10)
      }))
    } : undefined
  };
}

/**
 * Validate get user orders request
 */
export function validateGetUserOrdersRequest(req: Request): GetOrdersValidationResult {
  const errors: ValidationError[] = [];
  const userId = req.user?.id;

  // Validate user ID from token
  if (!userId) {
    errors.push({
      field: 'user',
      message: 'User authentication required'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 && userId ? { userId } : undefined
  };
}

/**
 * Validate get order by ID request
 */
export function validateGetOrderByIdRequest(req: Request): { isValid: boolean; errors: ValidationError[]; orderId?: string | undefined } {
  const errors: ValidationError[] = [];
  const { orderId } = req.params;

  // Validate order ID
  if (!orderId) {
    errors.push({
      field: 'orderId',
      message: 'Order ID is required'
    });
  } else if (typeof orderId !== 'string') {
    errors.push({
      field: 'orderId',
      message: 'Order ID must be a string'
    });
  } else if (orderId.trim().length === 0) {
    errors.push({
      field: 'orderId',
      message: 'Order ID cannot be empty'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    orderId: errors.length === 0 && orderId ? orderId.trim() : undefined
  };
}
