import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  requestPasswordReset
} from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { signUpSchema, signInSchema } from '../validation';
import { authenticateToken } from '../middleware/auth';
import { sensitiveEndpointLimiter } from '../middleware/rateLimiter';
import { z } from 'zod';

const router = Router();

const resetPasswordSchema = z.object({
  email: z.string().trim().email('Valid email is required')
});

router.post(
  '/signup',
  sensitiveEndpointLimiter,
  validateBody(signUpSchema),
  registerUser
);

router.post(
  '/login',
  sensitiveEndpointLimiter,
  validateBody(signInSchema),
  loginUser
);

router.post(
  '/reset-password',
  sensitiveEndpointLimiter,
  validateBody(resetPasswordSchema),
  requestPasswordReset
);

router.get('/me', authenticateToken, getCurrentUser);

export default router;
