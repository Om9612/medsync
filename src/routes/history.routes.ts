import { Router }  from 'express';
import { readDb }  from '../db/database';

const router = Router();

// GET /api/history?status=taken&date=2025-01-01
router.get('/', (req, res) => {
  const db     = readDb();
  let history  = db.history;

  if (req.query.status)
    history = history.filter(h => h.status === req.query.status);

  if (req.query.date) {
    const d = req.query.date as string;
    history = history.filter(h => h.takenAt.startsWith(d));
  }

  res.json({ success: true, data: history });
});

export default router;