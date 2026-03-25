// ─────────────────────────────────────────────────────────────
//  FILE PATH: medsync/src/server.ts
//  REPLACE your existing src/server.ts with this file
// ─────────────────────────────────────────────────────────────
import express from 'express';
import cors    from 'cors';
import path    from 'path';
import 'dotenv/config';

import authRoutes     from './routes/auth.routes';
import medicineRoutes from './routes/medicine.routes';
import historyRoutes  from './routes/history.routes';

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/history',   historyRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Serve frontend ────────────────────────────────────────────
app.get('/*path', (_req, res) =>
  res.sendFile(path.join(__dirname, '../public/index.html'))
);

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ MedSync running → http://localhost:${PORT}`);
  console.log(`🔐 Auth API        → http://localhost:${PORT}/api/auth`);
  console.log(`💊 Medicines API   → http://localhost:${PORT}/api/medicines`);
  console.log(`📋 Health check    → http://localhost:${PORT}/api/health`);
});