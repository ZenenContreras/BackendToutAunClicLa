import express from 'express';
import { 
  getUserAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress 
} from '../controllers/addressController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateRequest, addressSchema } from '../middlewares/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getUserAddresses);
router.post('/', validateRequest(addressSchema), createAddress);
router.put('/:id', validateRequest(addressSchema), updateAddress);
router.delete('/:id', deleteAddress);

export default router;
