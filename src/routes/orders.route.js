import express from 'express';
import { 
  getUserOrders, 
  getOrderById, 
  createOrder, 
  cancelOrder,
  getAllOrders,
  updateOrderStatus 
} from '../controllers/orderController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import Joi from 'joi';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = express.Router();

// Validation schemas
const createOrderSchema = Joi.object({
  addressId: Joi.string().uuid().required(),
  paymentMethodId: Joi.string().required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
});

// User routes
router.get('/my-orders', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/', authMiddleware, validateRequest(createOrderSchema), createOrder);
router.put('/:id/cancel', authMiddleware, cancelOrder);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, adminMiddleware, validateRequest(updateOrderStatusSchema), updateOrderStatus);

export default router;
