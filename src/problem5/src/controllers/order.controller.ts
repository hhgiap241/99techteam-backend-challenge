import type { Request, Response } from 'express';
import * as OrderService from '../services/order.service';
import {
  validatePlaceOrderRequest,
  validateGetUserOrdersRequest,
  validateGetOrderByIdRequest
} from '../validation/order.validation';

export class OrderController {
  /**
   * Place a new order
   */
  async placeOrder(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const validation = validatePlaceOrderRequest(req);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      const validationData = validation.data;
      if (!validationData) {
        res.status(400).json({
          success: false,
          message: 'Invalid request data'
        });
        return;
      }

      const { userId, items } = validationData;

      // Place order
      const orderSummary = await OrderService.placeOrder({ userId, items });

      res.status(201).json({
        success: true,
        message: orderSummary.message,
        data: {
          order: orderSummary.order,
          orderItems: orderSummary.orderItems,
          totalAmount: orderSummary.totalAmount
        }
      });

    } catch (error) {
      console.error('Place order error:', error);

      if (error instanceof OrderService.OrderPlacementError) {
        const statusCode = this.getStatusCodeForOrderError(error.code);
        res.status(statusCode).json({
          success: false,
          message: error.message,
          code: error.code
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to place order',
        error: process.env['NODE_ENV'] === 'development' ? error : undefined
      });
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const validation = validateGetUserOrdersRequest(req);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      const validationData = validation.data;
      if (!validationData) {
        res.status(400).json({
          success: false,
          message: 'Invalid request data'
        });
        return;
      }

      const { userId } = validationData;

      const orders = await OrderService.getUserOrders(userId);

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders,
          count: orders.length
        }
      });

    } catch (error) {
      console.error('Get user orders error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: process.env['NODE_ENV'] === 'development' ? error : undefined
      });
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      // Validate request
      const validation = validateGetOrderByIdRequest(req);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
        return;
      }

      if (!validation.orderId) {
        res.status(400).json({
          success: false,
          message: 'Invalid order ID'
        });
        return;
      }

      const orderId = validation.orderId;

      const order = await OrderService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: { order }
      });

    } catch (error) {
      console.error('Get order by ID error:', error);

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: process.env['NODE_ENV'] === 'development' ? error : undefined
      });
    }
  }

  /**
   * Map OrderPlacementError codes to HTTP status codes
   */
  private getStatusCodeForOrderError(code: string): number {
    switch (code) {
      case 'INSUFFICIENT_STOCK':
        return 409; // Conflict
      case 'BOOK_NOT_FOUND':
      case 'USER_NOT_FOUND':
        return 404; // Not Found
      case 'VALIDATION_ERROR':
        return 400; // Bad Request
      case 'DATABASE_ERROR':
        return 500; // Internal Server Error
      default:
        return 500; // Internal Server Error
    }
  }
}
