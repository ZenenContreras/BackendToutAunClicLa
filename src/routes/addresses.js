const express = require('express');
const { 
  getUserAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress 
} = require('../controllers/addressController');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest, addressSchema } = require('../middlewares/validation');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', getUserAddresses);
router.post('/', validateRequest(addressSchema), createAddress);
router.put('/:id', validateRequest(addressSchema), updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
