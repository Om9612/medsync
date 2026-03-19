"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeMedicine = exports.deleteMedicine = exports.updateMedicine = exports.createMedicine = exports.getMedicines = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../db/database");
// GET /api/medicines — return all active medicines
const getMedicines = (req, res) => {
    const db = (0, database_1.readDb)();
    const medicines = db.medicines.filter(m => m.active);
    res.json({ success: true, data: medicines });
};
exports.getMedicines = getMedicines;
// POST /api/medicines — add new medicine
const createMedicine = (req, res) => {
    const { name, dosage, times, emoji, color, notes } = req.body;
    // Validate required fields
    if (!name || !dosage || !times?.length) {
        return res.status(400).json({
            success: false,
            error: 'name, dosage, and at least one time are required'
        });
    }
    const db = (0, database_1.readDb)();
    const newMed = {
        id: (0, uuid_1.v4)(),
        name,
        dosage,
        times,
        emoji: emoji || '💊',
        color: color || 'rgba(0,229,255,0.12)',
        notes: notes || '',
        streak: 0,
        active: true,
        createdAt: new Date().toISOString(),
    };
    db.medicines.push(newMed);
    (0, database_1.writeDb)(db);
    res.status(201).json({ success: true, data: newMed });
};
exports.createMedicine = createMedicine;
// PUT /api/medicines/:id — update a medicine
const updateMedicine = (req, res) => {
    const db = (0, database_1.readDb)();
    const idx = db.medicines.findIndex(m => m.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ success: false, error: 'Not found' });
    // Merge existing fields with new ones (partial update)
    db.medicines[idx] = { ...db.medicines[idx], ...req.body };
    (0, database_1.writeDb)(db);
    res.json({ success: true, data: db.medicines[idx] });
};
exports.updateMedicine = updateMedicine;
// DELETE /api/medicines/:id — soft delete (keeps history)
const deleteMedicine = (req, res) => {
    const db = (0, database_1.readDb)();
    const idx = db.medicines.findIndex(m => m.id === req.params.id);
    if (idx === -1)
        return res.status(404).json({ success: false, error: 'Not found' });
    db.medicines[idx].active = false; // soft delete
    (0, database_1.writeDb)(db);
    res.json({ success: true, message: 'Medicine removed' });
};
exports.deleteMedicine = deleteMedicine;
// POST /api/medicines/:id/take — mark dose taken
const takeMedicine = (req, res) => {
    const db = (0, database_1.readDb)();
    const med = db.medicines.find(m => m.id === req.params.id);
    if (!med)
        return res.status(404).json({ success: false, error: 'Not found' });
    const now = new Date();
    const entry = {
        id: (0, uuid_1.v4)(),
        medicineId: med.id,
        medicineName: med.name,
        dose: med.dosage,
        scheduledTime: req.body.scheduledTime || now.toTimeString().slice(0, 5),
        takenAt: now.toISOString(),
        status: 'taken',
    };
    // Increment streak
    med.streak = (med.streak || 0) + 1;
    db.history.unshift(entry); // newest first
    (0, database_1.writeDb)(db);
    res.json({ success: true, data: entry });
};
exports.takeMedicine = takeMedicine;
