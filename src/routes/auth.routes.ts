// ─────────────────────────────────────────────────────────────
//  FILE PATH: medsync/src/routes/auth.routes.ts
//  REPLACE your existing auth.routes.ts with this file
// ─────────────────────────────────────────────────────────────
import { Router }                  from 'express';
import { register, login, getMe }  from '../controllers/auth.controller';
import { requireAuth }             from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);           // POST /api/auth/register
router.post('/login',    login);              // POST /api/auth/login
router.get( '/me',       requireAuth, getMe); // GET  /api/auth/me

export default router;