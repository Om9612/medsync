import { Request, Response } from 'express';
import { v4 as uuidv4 }     from 'uuid';
import { readDb, writeDb }  from '../db/database';
import { CreateMedicineDto } from '../types';

// GET /api/medicines — return all active medicines
export const getMedicines = (req: Request, res: Response) => {
  const db = readDb();
  const medicines = db.medicines.filter(m => m.active);
  res.json({ success: true, data: medicines });
};

// POST /api/medicines — add new medicine
export const createMedicine = (req: Request, res: Response) => {
  const { name, dosage, times, emoji, color, notes }
    = req.body as CreateMedicineDto;

  // Validate required fields
  if (!name || !dosage || !times?.length) {
    return res.status(400).json({
      success: false,
      error: 'name, dosage, and at least one time are required'
    });
  }

  const db = readDb();
  const newMed = {
    id:        uuidv4(),
    name,
    dosage,
    times,
    emoji:     emoji  || '💊',
    color:     color  || 'rgba(0,229,255,0.12)',
    notes:     notes  || '',
    streak:    0,
    active:    true,
    createdAt: new Date().toISOString(),
  };

  db.medicines.push(newMed);
  writeDb(db);

  res.status(201).json({ success: true, data: newMed });
};

// PUT /api/medicines/:id — update a medicine
export const updateMedicine = (req: Request, res: Response) => {
  const db  = readDb();
  const idx = db.medicines.findIndex(m => m.id === req.params.id);

  if (idx === -1)
    return res.status(404).json({ success: false, error: 'Not found' });

  // Merge existing fields with new ones (partial update)
  db.medicines[idx] = { ...db.medicines[idx], ...req.body };
  writeDb(db);
  res.json({ success: true, data: db.medicines[idx] });
};

// DELETE /api/medicines/:id — soft delete (keeps history)
export const deleteMedicine = (req: Request, res: Response) => {
  const db  = readDb();
  const idx = db.medicines.findIndex(m => m.id === req.params.id);

  if (idx === -1)
    return res.status(404).json({ success: false, error: 'Not found' });

  db.medicines[idx].active = false;  // soft delete
  writeDb(db);
  res.json({ success: true, message: 'Medicine removed' });
};

// POST /api/medicines/:id/take — mark dose taken
export const takeMedicine = (req: Request, res: Response) => {
  const db  = readDb();
  const med = db.medicines.find(m => m.id === req.params.id);

  if (!med)
    return res.status(404).json({ success: false, error: 'Not found' });

  const now   = new Date();
  const entry = {
    id:            uuidv4(),
    medicineId:    med.id,
    medicineName:  med.name,
    dose:          med.dosage,
    scheduledTime: req.body.scheduledTime || now.toTimeString().slice(0, 5),
    takenAt:       now.toISOString(),
    status:        'taken' as const,
  };

  // Increment streak
  med.streak = (med.streak || 0) + 1;
  db.history.unshift(entry);          // newest first
  writeDb(db);

  res.json({ success: true, data: entry });
};