import express   from 'express';
import cors      from 'cors';
import path      from 'node:path';
import 'dotenv/config';

import medicineRoutes from './routes/medicine.routes';
import historyRoutes  from './routes/history.routes';

const app  = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());                           // allow all origins (dev)
app.use(express.json());                   // parse JSON bodies
app.use(express.static(path.join(        // serve frontend
__dirname, '../public'
)));

// --- API Routes ---
app.use('/api/medicines', medicineRoutes);
app.use('/api/history',   historyRoutes);

// --- Health check ---
app.get('/api/health', (_, res) => {
res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- Fallback: serve index.html for all other routes ---
app.get('/:path(*)', (_, res) =>
  res.sendFile(path.join(__dirname, '../public/index.html'))
);

app.listen(PORT, () =>
console.log(`MedSync running → http://localhost:${PORT}`)
);