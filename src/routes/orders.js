const express = require('express');
const { 
  getUserOrders, 
  getOrderById, 
  createOrder, 
  cancelOrder,
  getAllOrders,
  updateOrderStatus 
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const Joi = require('joi');
const { validateRequest } = require('../middlewares/validation');

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

module.exports = router;
