// ─────────────────────────────────────────────────────────────
//  FILE PATH: medsync/src/middleware/auth.middleware.ts
//  CREATE this file if it doesn't exist, or REPLACE it
// ─────────────────────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'medsync_dev_secret_change_in_prod';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token — please log in' });
      return;
    }
    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Session expired — please log in again' });
  }
}