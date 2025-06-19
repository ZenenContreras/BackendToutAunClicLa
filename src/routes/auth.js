import express from 'express';
import { register, login, getProfile, verifyEmail, resendVerification, checkVerificationStatus } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateRequest, userRegisterSchema, userLoginSchema, verificationCodeSchema, resendVerificationSchema } from '../middlewares/validation.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/register',authRateLimiter, validateRequest(userRegisterSchema), register);
router.post('/login', authRateLimiter, validateRequest(userLoginSchema), login);
router.post('/verify-email', authRateLimiter,  validateRequest(verificationCodeSchema), verifyEmail);
router.post('/resend-verification', authRateLimiter,  validateRequest(resendVerificationSchema), resendVerification);
router.get('/verification-status', authRateLimiter, checkVerificationStatus);

// Protected routes
router.get('/profile', authMiddleware, getProfile);

export default router;
