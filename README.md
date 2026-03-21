# 💊 MedSync — Smart Medicine Reminder App

> A full-stack medicine reminder application built with **Node.js + Express + TypeScript** on the backend and **HTML + CSS + TypeScript** on the frontend. Get browser notifications and audio alarms at the exact time your medicine is due.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the App](#-running-the-app)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Common Errors & Fixes](#-common-errors--fixes)
- [Deployment](#-deployment)
- [Upgrading to MongoDB](#-upgrading-to-mongodb)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| ➕ Add Medicine | Name, dosage, emoji icon, colour theme, notes |
| ⏰ Multiple Reminders | Set several daily times per medicine (e.g. 8 AM and 8 PM) |
| ✅ Mark as Taken | Track individual dose slots, card turns green when all done |
| 🔔 Browser Notifications | Native push alerts at scheduled times |
| 🔊 Audio Alarm | Web Audio API beep when it is time for a dose |
| 📜 History Log | Full record of every dose with Taken / Missed status |
| 🔍 History Filters | Filter by All / Taken / Missed / Today |
| 🔥 Streak Tracking | Consecutive days taken counter per medicine |
| 📊 Dashboard Stats | Total medicines, taken today, pending, best streak |
| ✏️ Edit & Delete | Full CRUD — soft delete preserves history |
| 💾 JSON Database | Zero-config file-based storage, swap to MongoDB later |

---

## 🛠 Tech Stack

### Backend
- **Runtime** — Node.js v18+
- **Framework** — Express.js v5
- **Language** — TypeScript
- **Database** — JSON file (`data/db.json`) → MongoDB-ready
- **Key packages** — `uuid`, `cors`, `dotenv`

### Frontend
- **Markup** — HTML5
- **Styles** — CSS3 (custom properties, grid, flexbox, animations)
- **Logic** — TypeScript (compiled to JS)
- **Fonts** — Syne + DM Sans (Google Fonts)
- **Notifications** — Web Notification API + Web Audio API

---

## 📁 Project Structure

```
medsync/
├── src/                          # Backend TypeScript source
│   ├── server.ts                 # Express app entry point
│   ├── types/
│   │   └── index.ts              # Shared TypeScript interfaces
│   ├── db/
│   │   └── database.ts           # JSON read/write layer
│   ├── routes/
│   │   ├── medicine.routes.ts    # /api/medicines router
│   │   └── history.routes.ts     # /api/history router
│   └── controllers/
│       ├── medicine.controller.ts
│       └── history.controller.ts
├── public/                       # Frontend static files
│   └── index.html                # Complete single-file frontend
├── data/
│   └── db.json                   # JSON database (auto-created)
├── dist/                         # Compiled JS output (auto-generated)
├── .env                          # Environment variables
├── tsconfig.json                 # TypeScript configuration
├── package.json
└── README.md
```

---

## ✅ Prerequisites

Make sure you have these installed before starting:

| Tool | Version | Check |
|---|---|---|
| Node.js | v18 or higher | `node --version` |
| npm | v9 or higher | `npm --version` |
| Git | Any | `git --version` |

---

## 🚀 Installation

### Step 1 — Clone or create the project

```bash
# Clone from GitHub (if hosted)
git clone https://github.com/your-username/medsync.git
cd medsync

# OR create from scratch
mkdir medsync && cd medsync
npm init -y
```

### Step 2 — Install dependencies

```bash
# Production dependencies
npm install express cors dotenv uuid

# Development dependencies
npm install -D typescript ts-node nodemon \
  @types/express @types/node @types/cors @types/uuid
```

### Step 3 — Initialise TypeScript

```bash
npx tsc --init
```

### Step 4 — Create required folders

```bash
mkdir src public data
mkdir src/routes src/controllers src/db src/types
```

### Step 5 — Create the `.env` file

```bash
# Create .env in the project root
echo PORT=3000 > .env
echo NODE_ENV=development >> .env
```

### Step 6 — Create the database file

```bash
echo {"medicines":[],"history":[]} > data/db.json
```

### Step 7 — Configure `package.json` scripts

Open `package.json` and update the `scripts` section:

```json
{
  "scripts": {
    "dev":   "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Step 8 — Configure `tsconfig.json`

Replace the contents of `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "public", "dist"]
}
```

---

## ▶️ Running the App

### Development mode (auto-restarts on file save)

```bash
npm run dev
```

You should see:

```
MedSync running → http://localhost:3000
```

### Production mode

```bash
# Compile TypeScript to JavaScript
npm run build

# Start compiled server
npm start
```

### Open in browser

```
http://localhost:3000
```

---

## 📡 API Reference

Base URL: `http://localhost:3000/api`

### Health Check

```
GET /health
```

Response:
```json
{ "status": "ok", "time": "2025-01-01T08:00:00.000Z" }
```

---

### Medicines

#### Get all medicines
```
GET /medicines
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Metformin",
      "dosage": "500mg",
      "times": ["08:00", "20:00"],
      "emoji": "💊",
      "color": "rgba(0,229,255,0.12)",
      "notes": "Take after meals",
      "streak": 3,
      "active": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Add a medicine
```
POST /medicines
Content-Type: application/json
```

Request body:
```json
{
  "name": "Metformin",
  "dosage": "500mg",
  "times": ["08:00", "20:00"],
  "emoji": "💊",
  "color": "rgba(0,229,255,0.12)",
  "notes": "Take after meals"
}
```

#### Update a medicine
```
PUT /medicines/:id
Content-Type: application/json
```

#### Delete a medicine (soft delete)
```
DELETE /medicines/:id
```

#### Mark a dose as taken
```
POST /medicines/:id/take
Content-Type: application/json
```

Request body:
```json
{ "scheduledTime": "08:00" }
```

---

### History

#### Get full history
```
GET /history
```

#### Filter by status
```
GET /history?status=taken
GET /history?status=missed
```

#### Filter by date
```
GET /history?date=2025-01-01
```

---

### Testing the API with curl (Windows PowerShell)

```powershell
# Health check
curl http://localhost:3000/api/health

# Add a medicine
Invoke-WebRequest -Uri http://localhost:3000/api/medicines `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Aspirin","dosage":"100mg","times":["09:00","21:00"]}'

# List all medicines
curl http://localhost:3000/api/medicines

# Mark dose taken
Invoke-WebRequest -Uri http://localhost:3000/api/medicines/YOUR_ID/take `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"scheduledTime":"09:00"}'

# View history
curl http://localhost:3000/api/history
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Server port (default: 3000)
PORT=3000

# Environment
NODE_ENV=development

# MongoDB URI (for future upgrade)
# MONGO_URI=mongodb://localhost:27017/medsync
```

---

## 🔧 Common Errors & Fixes

### `SyntaxError: Unexpected end of JSON input`

**Cause:** `data/db.json` is empty or corrupted.

**Fix:**
```bash
# Windows
echo {"medicines":[],"history":[]} > data\db.json

# Mac / Linux
echo '{"medicines":[],"history":[]}' > data/db.json
```

---

### `PathError: Missing parameter name at index 2: /*`

**Cause:** Express 5 requires named wildcards. `/*` is invalid.

**Fix:** In `src/server.ts`, change:
```ts
// ❌ Broken
app.get('*', handler)

// ✅ Fixed
app.get('/*path', handler)
```

---

### `Error: listen EADDRINUSE :::3000`

**Cause:** Port 3000 is already in use by another process.

**Fix:**
```bash
# Option A — use a different port in .env
PORT=3001

# Option B — kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

### Blank screen in browser

**Cause:** `public/index.html` is missing.

**Fix:** Make sure the file exists at `medsync/public/index.html`.
Then hard-refresh: `Ctrl + Shift + R`

---

### Buttons not working / nothing happens on click

**Cause:** Old cached `index.html` is being served.

**Fix:**
1. Replace `public/index.html` with the latest version
2. Hard-refresh: `Ctrl + Shift + R`
3. Check browser console (`F12`) for any red errors

---

## 🌐 Deployment

### Option A — Railway (Recommended, Free tier)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/medsync.git
git push -u origin main

# 2. Go to railway.app
# 3. Click New Project → Deploy from GitHub → select medsync
# 4. Set environment variable: PORT = 3000
# 5. Railway auto-detects Node.js and runs: npm start
```

Your app will be live at: `https://medsync.up.railway.app`

---

### Option B — Render.com (Free, auto-deploy)

Create `render.yaml` in the project root:

```yaml
services:
  - type: web
    name: medsync
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: PORT
        value: 10000
```

Push to GitHub and connect at [render.com](https://render.com).

---

### Option C — Docker

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Create `.dockerignore`:
```
node_modules
dist
data
.env
```

Build and run:
```bash
docker build -t medsync .
docker run -p 3000:3000 -v $(pwd)/data:/app/data medsync
```

---

## 🍃 Upgrading to MongoDB

The database layer is designed to be swappable. Only `src/db/database.ts` needs to change — all controllers stay the same.

### Step 1 — Install Mongoose

```bash
npm install mongoose
npm install -D @types/mongoose
```

### Step 2 — Add `MONGO_URI` to `.env`

```env
MONGO_URI=mongodb://localhost:27017/medsync
```

### Step 3 — Create a Mongoose model

Create `src/models/medicine.model.ts`:

```ts
import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  dosage:    { type: String, required: true },
  times:     [String],
  emoji:     { type: String, default: '💊' },
  color:     String,
  notes:     String,
  streak:    { type: Number, default: 0 },
  active:    { type: Boolean, default: true },
}, { timestamps: true });

export const MedicineModel = mongoose.model('Medicine', MedicineSchema);
```

### Step 4 — Connect in `server.ts`

```ts
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));
```

### Step 5 — Replace `database.ts` calls with Mongoose queries

```ts
// Before (JSON file)
const db = readDb();
const medicines = db.medicines;

// After (MongoDB)
const medicines = await MedicineModel.find({ active: true });
```

Controllers will need `async/await` added — routes stay identical.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Ajay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

Built with ❤️ by **Ajay** · [Report a Bug](https://github.com/your-username/medsync/issues) · [Request a Feature](https://github.com/your-username/medsync/issues)

</div>
