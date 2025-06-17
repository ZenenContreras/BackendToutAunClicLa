import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  applyCoupon,
  getCartWithCoupon
} from '../controllers/cartController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateRequest, cartItemSchema, couponSchema } from '../middlewares/validation.js';
import { couponRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getCart);
router.get('/with-coupon', getCartWithCoupon);
router.post('/items', validateRequest(cartItemSchema), addToCart);
router.post('/apply-coupon', couponRateLimiter, validateRequest(couponSchema), applyCoupon);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeFromCart);
router.delete('/', clearCart);

export default router;
