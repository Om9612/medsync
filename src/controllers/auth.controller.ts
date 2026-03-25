// ─────────────────────────────────────────────────────────────
//  FILE PATH: medsync/src/controllers/auth.controller.ts
//  REPLACE your existing auth.controller.ts with this file
// ─────────────────────────────────────────────────────────────
import { Request, Response } from 'express';
import bcrypt                from 'bcryptjs';
import jwt                   from 'jsonwebtoken';
import { v4 as uuidv4 }      from 'uuid';
import { readDb, writeDb }   from '../db/database';

const JWT_SECRET  = process.env.JWT_SECRET || 'medsync_dev_secret_change_in_prod';
const JWT_EXPIRES = '7d';

function makeToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
function safeUser(u: any) {
  const { passwordHash, ...rest } = u;
  return rest;
}

// ── POST /api/auth/register ───────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body || {};

    if (!name  || !String(name).trim()) {
      res.status(400).json({ success: false, error: 'Name is required' }); return;
    }
    if (!email || !String(email).includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email is required' }); return;
    }
    if (!password || String(password).length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' }); return;
    }

    const db         = readDb();
    const cleanEmail = String(email).toLowerCase().trim();

    if (db.users.find((u: any) => u.email === cleanEmail)) {
      res.status(409).json({ success: false, error: 'An account with this email already exists' }); return;
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = {
      id: uuidv4(), name: String(name).trim(),
      email: cleanEmail, passwordHash,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    writeDb(db);

    const token = makeToken({ userId: user.id, email: user.email, name: user.name });
    res.status(201).json({ success: true, token, user: safeUser(user) });
  } catch (err: any) {
    console.error('[register]', err.message);
    res.status(500).json({ success: false, error: 'Registration failed: ' + err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' }); return;
    }

    const db   = readDb();
    const user = db.users.find((u: any) => u.email === String(email).toLowerCase().trim());

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' }); return;
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' }); return;
    }

    const token = makeToken({ userId: user.id, email: user.email, name: user.name });
    res.json({ success: true, token, user: safeUser(user) });
  } catch (err: any) {
    console.error('[login]', err.message);
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
export const getMe = (req: Request, res: Response): void => {
  try {
    const jwtUser = (req as any).user;
    if (!jwtUser) {
      res.status(401).json({ success: false, error: 'Not authenticated' }); return;
    }
    const db   = readDb();
    const user = db.users.find((u: any) => u.id === jwtUser.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' }); return;
    }
    res.json({ success: true, user: safeUser(user) });
  } catch (err: any) {
    console.error('[getMe]', err.message);
    res.status(500).json({ success: false, error: 'Could not fetch user' });
  }
};