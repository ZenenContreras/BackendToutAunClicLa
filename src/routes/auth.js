import express from 'express';
import { register, login, getProfile, verifyEmail, resendVerification, checkVerificationStatus } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateRequest, userRegisterSchema, userLoginSchema, verificationCodeSchema, resendVerificationSchema } from '../middlewares/validation.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes - Temporarily disable rate limiter for testing
router.post('/register', validateRequest(userRegisterSchema), register);
router.post('/login', validateRequest(userLoginSchema), login);
router.post('/verify-email', validateRequest(verificationCodeSchema), verifyEmail);
router.post('/resend-verification', validateRequest(resendVerificationSchema), resendVerification);
router.get('/verification-status', checkVerificationStatus);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

export default router;
