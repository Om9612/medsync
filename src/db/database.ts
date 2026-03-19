import fs   from 'node:fs';
import path from 'node:path';
import { Database } from '../types';

// Path to our JSON "database" file
const DB_PATH = path.join(__dirname, '../../data/db.json');

// Default empty database structure
const DEFAULT_DB: Database = {
medicines: [],
history:   [],
};

// READ: load db.json from disk into memory
export function readDb(): Database {
if (!fs.existsSync(DB_PATH)) {
    // First run — create the file
    writeDb(DEFAULT_DB);
    return DEFAULT_DB;
}
const raw = fs.readFileSync(DB_PATH, 'utf-8');
return JSON.parse(raw) as Database;
}

// WRITE: save updated data back to disk
export function writeDb(data: Database): void {
const dir = path.dirname(DB_PATH);
  // Ensure /data/ folder exists
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  // Pretty-print with 2-space indent for readability
fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
/* ---- FUTURE MONGODB SWAP ----
import mongoose from 'mongoose';
export async function connectDb() {
await mongoose.connect(process.env.MONGO_URI!);
}
The controllers won't change — only this file.
---------------------------------*/