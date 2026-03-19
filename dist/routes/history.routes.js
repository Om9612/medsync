"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../db/database");
const router = (0, express_1.Router)();
// GET /api/history?status=taken&date=2025-01-01
router.get('/', (req, res) => {
    const db = (0, database_1.readDb)();
    let history = db.history;
    if (req.query.status)
        history = history.filter(h => h.status === req.query.status);
    if (req.query.date) {
        const d = req.query.date;
        history = history.filter(h => h.takenAt.startsWith(d));
    }
    res.json({ success: true, data: history });
});
exports.default = router;
