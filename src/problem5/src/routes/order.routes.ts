import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const orderController = new OrderController();

/**
 * @route   POST /orders
 * @desc    Place a new order
 * @access  Private (requires authentication)
 */
router.post('/', authenticateToken, orderController.placeOrder.bind(orderController));

/**
 * @route   GET /orders
 * @desc    Get user's orders
 * @access  Private (requires authentication)
 */
router.get('/', authenticateToken, orderController.getUserOrders.bind(orderController));

/**
 * @route   GET /orders/:orderId
 * @desc    Get order by ID
 * @access  Private (requires authentication)
 */
router.get('/:orderId', authenticateToken, orderController.getOrderById.bind(orderController));

export default router;
