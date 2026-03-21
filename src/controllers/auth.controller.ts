// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt                from 'bcryptjs';
import jwt                   from 'jsonwebtoken';
import { v4 as uuidv4 }      from 'uuid';
import { readDb, writeDb }   from '../db/database';

const JWT_SECRET  = process.env.JWT_SECRET || 'medsync_secret_fallback';
const JWT_EXPIRES = '7d';

function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function safeUser(user: any) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// ── POST /api/auth/register ───────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate
    if (!name || !String(name).trim()) {
      res.status(400).json({ success: false, error: 'Name is required' });
      return;
    }
    if (!email || !String(email).includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email is required' });
      return;
    }
    if (!password || String(password).length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      return;
    }

    const db = readDb();
    if (!Array.isArray(db.users)) db.users = [];

    // Duplicate email check
    const already = db.users.find(
      (u: any) => u.email === String(email).toLowerCase().trim()
    );
    if (already) {
      res.status(409).json({ success: false, error: 'An account with this email already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(String(password), 10);

    const newUser = {
      id:           uuidv4(),
      name:         String(name).trim(),
      email:        String(email).toLowerCase().trim(),
      passwordHash,
      createdAt:    new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDb(db);

    const token = signToken({ userId: newUser.id, email: newUser.email, name: newUser.name });

    res.status(201).json({ success: true, token, user: safeUser(newUser) });
  } catch (err) {
    console.error('[register error]', err);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const db = readDb();
    if (!Array.isArray(db.users)) db.users = [];

    const user = db.users.find(
      (u: any) => u.email === String(email).toLowerCase().trim()
    );

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    console.error('[login error]', err);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
export const getMe = (req: Request, res: Response): void => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }
    const db   = readDb();
    const found = (db.users || []).find((u: any) => u.id === user.userId);
    if (!found) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    res.json({ success: true, user: safeUser(found) });
  } catch (err) {
    console.error('[getMe error]', err);
    res.status(500).json({ success: false, error: 'Could not fetch user' });
  }
};