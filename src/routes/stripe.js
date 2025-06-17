import express from 'express';
import { 
  createPaymentIntent, 
  confirmPayment, 
  getPaymentMethods, 
  savePaymentMethod, 
  deletePaymentMethod, 
  handleWebhook 
} from '../controllers/stripeController.js';
import { authMiddleware } from '../middlewares/auth.js';
import Joi from 'joi';
import { validateRequest } from '../middlewares/validation.js';

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

export default router;
