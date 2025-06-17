import express from 'express';
import { 
  getUserFavorites, 
  addToFavorites, 
  removeFromFavorites,
  checkFavoriteStatus
} from '../controllers/favoritesController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateRequest, favoriteSchema } from '../middlewares/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getUserFavorites);
router.post('/', validateRequest(favoriteSchema), addToFavorites);
router.get('/status/:productId', checkFavoriteStatus);
router.delete('/:productId', removeFromFavorites);

export default router;
