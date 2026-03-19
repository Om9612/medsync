"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDb = readDb;
exports.writeDb = writeDb;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// Path to our JSON "database" file
const DB_PATH = node_path_1.default.join(__dirname, '../../data/db.json');
// Default empty database structure
const DEFAULT_DB = {
    medicines: [],
    history: [],
};
// READ: load db.json from disk into memory
function readDb() {
    if (!node_fs_1.default.existsSync(DB_PATH)) {
        // First run — create the file
        writeDb(DEFAULT_DB);
        return DEFAULT_DB;
    }
    const raw = node_fs_1.default.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
}
// WRITE: save updated data back to disk
function writeDb(data) {
    const dir = node_path_1.default.dirname(DB_PATH);
    // Ensure /data/ folder exists
    if (!node_fs_1.default.existsSync(dir))
        node_fs_1.default.mkdirSync(dir, { recursive: true });
    // Pretty-print with 2-space indent for readability
    node_fs_1.default.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
/* ---- FUTURE MONGODB SWAP ----
import mongoose from 'mongoose';
export async function connectDb() {
await mongoose.connect(process.env.MONGO_URI!);
}
The controllers won't change — only this file.
---------------------------------*/ 
