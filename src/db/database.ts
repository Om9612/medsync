// src/db/database.ts  — updated to support users
import fs   from 'fs';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../data/db.json');

const EMPTY_DB = {
  medicines: [] as any[],
  history:   [] as any[],
  users:     [] as any[],
};

export function readDb(): typeof EMPTY_DB {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDb(EMPTY_DB);
      return { ...EMPTY_DB };
    }

    const raw = fs.readFileSync(DB_PATH, 'utf-8').trim();

    if (!raw) {
      writeDb(EMPTY_DB);
      return { ...EMPTY_DB };
    }

    const data = JSON.parse(raw);

    // Ensure all arrays exist (handles old db.json without users)
    if (!Array.isArray(data.medicines)) data.medicines = [];
    if (!Array.isArray(data.history))   data.history   = [];
    if (!Array.isArray(data.users))     data.users     = [];

    return data;
  } catch (err) {
    console.error('[DB] db.json corrupted, resetting:', err);
    writeDb(EMPTY_DB);
    return { ...EMPTY_DB };
  }
}

export function writeDb(data: typeof EMPTY_DB): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Write failed:', err);
    throw err;
  }
}