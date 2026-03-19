// Medicine object stored in the database
export interface Medicine {
  id:        string;       // UUID — unique identifier
  name:      string;       // e.g. "Metformin"
  dosage:    string;       // e.g. "500mg twice daily"
  times:     string[];     // ["08:00", "20:00"] — 24h format
  emoji:     string;       // UI icon e.g. "💊"
  color:     string;       // CSS color for card
  notes:     string;       // Optional instructions
  streak:    number;       // Consecutive days taken
  active:    boolean;      // Soft delete flag
  createdAt: string;       // ISO timestamp
}

// One dose event in history log
export interface HistoryEntry {
id:            string;
medicineId:    string;
medicineName:  string;
dose:          string;
  scheduledTime: string;   // "08:00"
  takenAt:       string;   // ISO timestamp when marked taken
status:        'taken' | 'missed';
}

// What gets stored in db.json
export interface Database {
medicines: Medicine[];
history:   HistoryEntry[];
}

// Request body for POST /api/medicines
export interface CreateMedicineDto {
name:   string;
dosage: string;
times:  string[];
emoji?: string;
color?: string;
notes?: string;
}
// Standard API response shape
export interface ApiResponse<T> {
success: boolean;
data?:   T;
error?:  string;
message?: string;
}