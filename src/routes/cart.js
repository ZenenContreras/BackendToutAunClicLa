const express = require('express');
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest, cartItemSchema } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getCart);
router.post('/items', validateRequest(cartItemSchema), addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
