const express = require('express');
const { 
  createPaymentIntent, 
  confirmPayment, 
  getPaymentMethods, 
  savePaymentMethod, 
  deletePaymentMethod, 
  handleWebhook 
} = require('../controllers/stripeController');
const { authMiddleware } = require('../middlewares/auth');
const Joi = require('joi');
const { validateRequest } = require('../middlewares/validation');

const router = express.Router();

// Validation schemas
const createPaymentIntentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().optional()
});

const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required(),
  paymentMethodId: Joi.string().required()
});

const savePaymentMethodSchema = Joi.object({
  paymentMethodId: Joi.string().required()
});

// Webhook route (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/payment-intent', authMiddleware, validateRequest(createPaymentIntentSchema), createPaymentIntent);
router.post('/confirm-payment', authMiddleware, validateRequest(confirmPaymentSchema), confirmPayment);
router.get('/payment-methods', authMiddleware, getPaymentMethods);
router.post('/payment-methods', authMiddleware, validateRequest(savePaymentMethodSchema), savePaymentMethod);
router.delete('/payment-methods/:paymentMethodId', authMiddleware, deletePaymentMethod);

module.exports = router;
