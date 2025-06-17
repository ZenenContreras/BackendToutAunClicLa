import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateRequest, cartItemSchema } from '../middlewares/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', validateRequest(cartItemSchema), addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeFromCart);
router.delete('/', clearCart);

export default router;
