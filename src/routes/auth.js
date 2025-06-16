const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');
const { validateRequest, userRegisterSchema, userLoginSchema } = require('../middlewares/validation');
const { authRateLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, validateRequest(userRegisterSchema), register);
router.post('/login', authRateLimiter, validateRequest(userLoginSchema), login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
