// src/routes/auth.routes.ts
import { Router }              from 'express';
import rateLimit               from 'express-rate-limit';
import { register, login, getMe } from '../controllers/auth.controller';
import { requireAuth }            from '../middleware/auth.middleware';

const router = Router();

const meRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 /me requests per window
});

router.post('/register', register);             // POST /api/auth/register
router.post('/login',    login);                // POST /api/auth/login
router.get('/me',        meRateLimiter, requireAuth, getMe); // GET  /api/auth/me

export default router;