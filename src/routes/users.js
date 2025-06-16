const express = require('express');
const { 
  updateProfile, 
  changePassword, 
  deleteAccount,
  getAllUsers,
  updateUserRole 
} = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const Joi = require('joi');
const { validateRequest } = require('../middlewares/validation');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  phone: Joi.string().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const deleteAccountSchema = Joi.object({
  password: Joi.string().required()
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('customer', 'admin').required()
});

// User routes
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), updateProfile);
router.put('/password', authMiddleware, validateRequest(changePasswordSchema), changePassword);
router.delete('/account', authMiddleware, validateRequest(deleteAccountSchema), deleteAccount);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.put('/:id/role', authMiddleware, adminMiddleware, validateRequest(updateRoleSchema), updateUserRole);

module.exports = router;
