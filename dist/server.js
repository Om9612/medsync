"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_path_1 = __importDefault(require("node:path"));
require("dotenv/config");
const medicine_routes_1 = __importDefault(require("./routes/medicine.routes"));
const history_routes_1 = __importDefault(require("./routes/history.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// --- Middleware ---
app.use((0, cors_1.default)()); // allow all origins (dev)
app.use(express_1.default.json()); // parse JSON bodies
app.use(express_1.default.static(node_path_1.default.join(// serve frontend
__dirname, '../public')));
// --- API Routes ---
app.use('/api/medicines', medicine_routes_1.default);
app.use('/api/history', history_routes_1.default);
// --- Health check ---
app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
// --- Fallback: serve index.html for all other routes ---
app.get('/:path(*)', (_, res) => res.sendFile(node_path_1.default.join(__dirname, '../public/index.html')));
app.listen(PORT, () => console.log(`MedSync running → http://localhost:${PORT}`));
