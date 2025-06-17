import express from 'express';
import { 
  getProductReviews, 
  createReview, 
  updateReview, 
  deleteReview 
} from '../controllers/reviewController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateRequest, reviewSchema } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', authMiddleware, validateRequest(reviewSchema), createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

export default router;
