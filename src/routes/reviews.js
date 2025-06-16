const express = require('express');
const { 
  getProductReviews, 
  createReview, 
  updateReview, 
  deleteReview 
} = require('../controllers/reviewController');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest, reviewSchema } = require('../middlewares/validation');

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', authMiddleware, validateRequest(reviewSchema), createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
