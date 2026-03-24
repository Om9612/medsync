<div align="center">

# 💊 MedSync

### Smart Medicine Reminder App

**Never miss a dose again.** MedSync is a full-stack web application that helps you manage daily medicines with scheduled reminders, browser notifications, audio alarms, dose history tracking, and a secure user authentication system.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## ✨ Features

### 🔐 Authentication

| Feature | Details |
|---|---|
| User Registration | Name, email, password with real-time strength meter |
| Secure Login | bcrypt password hashing + JWT sessions (7-day expiry) |
| Protected Routes | All dashboard data requires a valid JWT token |
| Auto Redirect | Unauthenticated users redirected to login instantly |
| Session Persistence | Token stored in `localStorage`, verified on every load |
| Sign Out | Clears token and session, returns to login page |

### 💊 Medicine Management

| Feature | Details |
|---|---|
| Add Medicine | Name, dosage, emoji icon (16 options), colour theme (8 options), notes |
| Multiple Times | Set several daily reminder times per medicine |
| Edit Medicine | Update any field at any time |
| Soft Delete | Removes from dashboard while preserving history |
| Streak Tracking | Consecutive days taken counter per medicine |

### ⏰ Reminders & Notifications

| Feature | Details |
|---|---|
| Browser Notifications | Native push alerts at the exact scheduled time |
| Audio Alarm | Web Audio API triple-beep when dose is due |
| Alarm Checker | Polls every 30 seconds, works across browser tabs |
| Mark as Taken | One click records dose with timestamp |

### 📊 Dashboard & History

| Feature | Details |
|---|---|
| Stats Cards | Total medicines, taken today, pending, best streak |
| Medicine Cards | Visual cards with colour themes, time chips, streak counter |
| Dose History | Full log of every dose taken across all medicines |
| History Filters | Filter by All / Taken / Missed / Today |

---

## 🛠 Tech Stack

### Backend
- **Runtime** — Node.js v18+
- **Framework** — Express.js v5
- **Language** — TypeScript
- **Auth** — JSON Web Tokens (`jsonwebtoken`) + bcrypt (`bcryptjs`)
- **Database** — JSON file `data/db.json` (MongoDB-ready)
- **Other** — `uuid`, `cors`, `dotenv`

### Frontend
- **Markup** — HTML5
- **Styles** — CSS3 (custom properties, grid, flexbox, keyframe animations)
- **Logic** — Vanilla TypeScript compiled to JS
- **Fonts** — Syne (headings) + DM Sans (body) via Google Fonts
- **Browser APIs** — Web Notification API, Web Audio API

---


---

## ✅ Prerequisites

| Tool | Min Version | Check command |
|---|---|---|
| Node.js | v18.0.0 | `node --version` |
| npm | v9.0.0 | `npm --version` |
| Git | Any | `git --version` |

---

## 🚀 Installation & Setup

### Step 1 — Clone or create the project

```bash
# Clone from GitHub
git clone https://github.com/your-username/medsync.git
cd medsync

# OR create from scratch
mkdir medsync && cd medsync
npm init -y
```

### Step 2 — Install all dependencies

```bash
# Core backend + auth packages
npm install express cors dotenv uuid bcryptjs jsonwebtoken

# TypeScript + all type definitions
npm install -D typescript ts-node nodemon \
  @types/express @types/node @types/cors \
  @types/uuid @types/bcryptjs @types/jsonwebtoken
```

### Step 3 — Create folder structure

```bash
# Windows
mkdir src src\controllers src\routes src\middleware src\db src\types
mkdir public data

# Mac / Linux
mkdir -p src/{controllers,routes,middleware,db,types} public data
```

### Step 4 — Create `tsconfig.json`

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

### Step 5 — Create `.env` file

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=medsync_super_secret_key_change_this_in_production
```

> ⚠️ **Never commit `.env` to Git.** Always add it to `.gitignore`.

### Step 6 — Create `data/db.json`

```bash
# Windows
echo {"medicines":[],"history":[],"users":[]} > data\db.json

# Mac / Linux
echo '{"medicines":[],"history":[],"users":[]}' > data/db.json
```

### Step 7 — Update `package.json` scripts

```json
{
  "scripts": {
    "dev":   "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Step 8 — Create `.gitignore`

```
node_modules/
dist/
.env
data/db.json
```

---

## ▶️ Running the App

### Development mode (auto-restarts on file save)

```bash
npm run dev
```

You should see this in the terminal:

```
✅ MedSync running → http://localhost:3000
   Auth API       → http://localhost:3000/api/auth
```

### Production mode

```bash
npm run build    # Compile TypeScript → dist/
npm start        # Run compiled JavaScript
```

### Open in browser

| URL | Description |
|---|---|
| `http://localhost:3000/login.html` | Login and sign-up page |
| `http://localhost:3000/` | Dashboard (redirects to login if not authenticated) |
| `http://localhost:3000/api/health` | Quick backend health check |
| `http://localhost:3000/api/medicines` | Medicines JSON (requires token) |

---

## 🔐 Authentication Flow

```
1. User visits /
   └── Auth guard checks localStorage for JWT
       ├── No token → redirect to /login.html
       └── Token found → verify with GET /api/auth/me
           ├── Invalid/expired → clear token → redirect to /login.html
           └── Valid → load dashboard

2. Register (POST /api/auth/register)
   └── Validate name, email, password (min 6 chars)
       └── Check for duplicate email in db.json
           └── bcrypt.hash(password, 10)
               └── Save user with UUID to db.json
                   └── Sign JWT (7-day expiry)
                       └── Return token + safe user (no passwordHash)
                           └── Save to localStorage → redirect to dashboard

3. Login (POST /api/auth/login)
   └── Look up email in db.json
       └── bcrypt.compare(password, hash)
           ├── No match → 401 "Invalid email or password"
           │   (same message for both cases — prevents email enumeration)
           └── Match → sign JWT → return token → redirect to dashboard

4. Every protected API call
   └── Frontend sends: Authorization: Bearer <token>
       └── requireAuth middleware verifies JWT
           ├── Invalid/expired → 401 → frontend redirects to /login.html
           └── Valid → attach decoded payload to req.user → next()

5. Sign Out
   └── localStorage.removeItem('ms_token')
       └── Redirect to /login.html
```

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api`

Protected routes require the HTTP header:
```
Authorization: Bearer <your_jwt_token>
```

---

### Auth — `/api/auth`

#### POST `/api/auth/register`

Register a new user account.

Request body:
```json
{
  "name":     "vaishnavi kadam",
  "email":    "vaishnavi@example.com",
  "password": "mypassword123"
}
```

Success response `201`:
```json
{
  "success": true,
  "token":   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id":        "550e8400-e29b-41d4-a716-446655440000",
    "name":      "vaishnavi kadam",
    "email":     "vaishnavi@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

Error responses:
```json
{ "success": false, "error": "Name is required" }                         // 400
{ "success": false, "error": "Valid email is required" }                  // 400
{ "success": false, "error": "Password must be at least 6 characters" }  // 400
{ "success": false, "error": "An account with this email already exists" } // 409
```

---

#### POST `/api/auth/login`

Login with existing credentials.

Request body:
```json
{
  "email":    "vaishnavi@example.com",
  "password": "mypassword123"
}
```

Success response `200`: same shape as register response.

Error response `401`:
```json
{ "success": false, "error": "Invalid email or password" }
```

---

#### GET `/api/auth/me` *(protected)*

Returns the currently authenticated user.

```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Medicines — `/api/medicines` *(all protected)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/medicines` | List all active medicines |
| `POST` | `/api/medicines` | Add a new medicine |
| `PUT` | `/api/medicines/:id` | Update a medicine |
| `DELETE` | `/api/medicines/:id` | Soft-delete (sets `active: false`) |
| `POST` | `/api/medicines/:id/take` | Record a dose as taken |

#### Add medicine — request body

```json
{
  "name":   "Metformin",
  "dosage": "500mg",
  "times":  ["08:00", "20:00"],
  "emoji":  "💊",
  "color":  "rgba(0,229,255,0.12)",
  "notes":  "Take after meals"
}
```

#### Medicine object response

```json
{
  "id":        "uuid",
  "name":      "Metformin",
  "dosage":    "500mg",
  "times":     ["08:00", "20:00"],
  "emoji":     "💊",
  "color":     "rgba(0,229,255,0.12)",
  "notes":     "Take after meals",
  "streak":    3,
  "active":    true,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### Mark taken — request body

```json
{ "scheduledTime": "08:00" }
```

---

### History — `/api/history` *(all protected)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/history` | Full dose history |
| `GET` | `/api/history?status=taken` | Only taken doses |
| `GET` | `/api/history?status=missed` | Only missed doses |
| `GET` | `/api/history?date=2025-01-01` | Doses for a specific date |

#### History entry object

```json
{
  "id":            "uuid",
  "medicineId":    "medicine-uuid",
  "medicineName":  "Metformin",
  "emoji":         "💊",
  "dose":          "500mg",
  "scheduledTime": "08:00",
  "takenAt":       "2025-01-01T08:03:22.000Z",
  "status":        "taken"
}
```

---

### Health Check

```
GET /api/health
```
```json
{ "status": "ok", "time": "2025-01-01T08:00:00.000Z" }
```

---

### Testing with PowerShell (Windows)

```powershell
# Health check
curl http://localhost:3000/api/health

# Register new user
Invoke-WebRequest -Uri http://localhost:3000/api/auth/register `
  -Method POST -ContentType "application/json" `
  -Body '{"name":"vaishnavi","email":"vaishnavi@test.com","password":"test123"}'

# Login and save token
$res   = Invoke-WebRequest -Uri http://localhost:3000/api/auth/login `
           -Method POST -ContentType "application/json" `
           -Body '{"email":"vaishnavi@test.com","password":"test123"}'
$token = ($res.Content | ConvertFrom-Json).token

# Add a medicine using token
Invoke-WebRequest -Uri http://localhost:3000/api/medicines `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body '{"name":"Aspirin","dosage":"100mg","times":["09:00"]}'

# Get all medicines
Invoke-WebRequest -Uri http://localhost:3000/api/medicines `
  -Headers @{Authorization="Bearer $token"}

# View history
Invoke-WebRequest -Uri http://localhost:3000/api/history `
  -Headers @{Authorization="Bearer $token"}
```

---

## 🖥 Pages & UI

### `/login.html` — Authentication Page

- Dark glassmorphic card on an animated background
- Background elements: floating pill shapes, ambient colour orbs, subtle grid lines
- Tab switcher between **Sign In** and **Create Account** with slide animation
- **Password strength meter** — 5 levels (Too Weak → Could be stronger → Good → Strong → Very Strong) with colour transitions
- Show / hide password toggle on all password fields
- Inline field validation with animated shake-error messages
- Global alert banner for server-side errors (wrong password, duplicate email)
- **Loading spinner on buttons** prevents double-submit during API call
- **Welcome overlay animation** plays before redirecting to the dashboard
- Automatically redirects to `/` if already logged in with a valid token
- Fully responsive — works on mobile, tablet, and desktop

### `/index.html` — Dashboard App

- **JWT auth guard** runs immediately — redirects to `/login.html` if token missing or expired
- Logged-in user **name + avatar initial** shown in the header
- **Sign Out button** clears session and redirects to login
- Live **clock and date** in the header, updated every second

**Dashboard tab:**
- Stat cards — Total Medicines, Taken Today, Pending Today, Best Streak
- Medicine cards with colour gradients, emoji icons, time chips, streak counter
- Mark Taken button — disables after all doses done, turns card green
- Edit and Delete buttons per card

**Add Medicine tab:**
- Medicine name and dosage fields
- Emoji icon picker (16 options)
- Colour theme picker (8 colours)
- Multiple reminder time slots — add or remove dynamically
- Notes field for instructions

**History tab:**
- Filter buttons — All, Taken, Missed, Today
- Each entry shows medicine name, dose, scheduled time, actual taken time, status badge

**Notifications:**
- Yellow banner prompts user to enable browser notifications
- Audio alarm (Web Audio API) fires at scheduled dose time
- Browser push notification sent at dose time
- All API calls automatically include `Authorization: Bearer <token>`
- On 401 response — token cleared and user redirected to login

---

## ⚙️ Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Port the server listens on |
| `NODE_ENV` | No | `development` | Environment flag |
| `JWT_SECRET` | **Yes** | fallback string | Secret used to sign JWTs — **must change in production** |

---

## 🔧 Common Errors & Fixes

### `Cannot reach server` on login/register page

**Cause:** Backend not running, or a required package is missing causing crash on startup.

**Fix:**
```bash
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
npm run dev
```

---

### `SyntaxError: Unexpected end of JSON input`

**Cause:** `data/db.json` is empty or corrupted.

**Fix:**
```bash
# Windows
echo {"medicines":[],"history":[],"users":[]} > data\db.json

# Mac / Linux
echo '{"medicines":[],"history":[],"users":[]}' > data/db.json
```

---

### `PathError: Missing parameter name at index 2: /*`

**Cause:** Express 5 requires named wildcards. `/*` is not valid.

**Fix:** In `src/server.ts`:
```ts
// ❌ Old
app.get('*', handler)

// ✅ Fixed
app.get('/*path', handler)
```

---

### `Error: Cannot find module 'bcryptjs'`

**Fix:**
```bash
npm install bcryptjs jsonwebtoken
```

---

### `Error: Cannot find module './routes/auth.routes'`

**Cause:** One or more auth files are missing.

**Fix:** Ensure all three files exist:
```
src/controllers/auth.controller.ts
src/routes/auth.routes.ts
src/middleware/auth.middleware.ts
```

---

### `Error: listen EADDRINUSE :::3000`

**Cause:** Port 3000 is already in use.

**Fix:**
```bash
# Find process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change port in .env
PORT=3001
```

---

### Blank screen at `http://localhost:3000`

**Cause:** `public/index.html` does not exist.

**Fix:** Ensure `medsync/public/index.html` exists, then:
```
Ctrl + Shift + R   (hard refresh in browser)
```

---

### Buttons not working (nothing happens on click)

**Cause:** Old cached file served, or JS crashed on load.

**Fix:**
1. Hard refresh: `Ctrl + Shift + R`
2. Open DevTools Console `F12` — check for red errors
3. In console run: `document.querySelector('#btnSave') ? 'NEW FILE' : 'OLD FILE'`
4. If `OLD FILE` — replace `public/index.html` with the latest version

---

### `401 Unauthorized` on all API calls after login

**Cause:** JWT token not being sent in the request header.

**Fix:** Make sure your `apiFetch()` function in `index.html` includes:
```js
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('ms_token'),
}
```

---

## 🌐 Deployment

### Option A — Railway *(Recommended — free tier)*

```bash
# 1. Push to GitHub
git init && git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/medsync.git
git push -u origin main

# 2. Go to railway.app
# 3. New Project → Deploy from GitHub → select medsync repo
# 4. Set environment variables in Railway dashboard:
#    PORT       = 3000
#    JWT_SECRET = your_strong_production_secret_here
# 5. Railway auto-runs: npm install && npm run build && npm start
```

App will be live at `https://medsync-production.up.railway.app`

---

### Option B — Render.com

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
      - key: JWT_SECRET
        value: your_strong_production_secret_here
```

Push to GitHub and connect the repo at [render.com](https://render.com).

---

### Option C — Docker

**`Dockerfile`:**
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

**`.dockerignore`:**
```
node_modules
dist
data
.env
```

**Build and run:**
```bash
docker build -t medsync .
docker run -p 3000:3000 \
  -e JWT_SECRET=your_strong_secret \
  -v $(pwd)/data:/app/data \
  medsync
```

---

## 🍃 Upgrading to MongoDB

The database layer is fully isolated in `src/db/database.ts`. Only that file changes — all controllers, routes, auth middleware and the frontend remain identical.

### Step 1 — Install Mongoose
```bash
npm install mongoose
npm install -D @types/mongoose
```

### Step 2 — Add MongoDB URI to `.env`
```env
MONGO_URI=mongodb://localhost:27017/medsync
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/medsync
```

### Step 3 — Create Mongoose models

**`src/models/user.model.ts`:**
```ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);
```

**`src/models/medicine.model.ts`:**
```ts
import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  dosage: { type: String, required: true },
  times:  [String],
  emoji:  { type: String, default: '💊' },
  color:  String,
  notes:  String,
  streak: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export const MedicineModel = mongoose.model('Medicine', MedicineSchema);
```

**`src/models/history.model.ts`:**
```ts
import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  medicineId:    { type: String, required: true },
  medicineName:  { type: String, required: true },
  emoji:         String,
  dose:          String,
  scheduledTime: String,
  takenAt:       { type: Date, default: Date.now },
  status:        { type: String, enum: ['taken', 'missed'], default: 'taken' },
});

export const HistoryModel = mongoose.model('History', HistorySchema);
```

### Step 4 — Connect in `server.ts`
```ts
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));
```

### Step 5 — Swap `database.ts` calls in controllers

```ts
// Before (JSON file)
const db       = readDb();
const medicines = db.medicines.filter(m => m.active);

// After (MongoDB)
const medicines = await MedicineModel.find({ active: true });
```

> Controllers need `async/await` added to each handler. Routes, middleware, and the entire frontend stay untouched.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make changes and commit
   ```bash
   git commit -m "feat: describe what you added"
   ```
4. Push and open a Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit convention
| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change with no feature/fix |
| `chore:` | Dependencies, config, tooling |

---

## 📄 License

```
MIT License — Copyright (c) 2025 Ajay, Solapur, Maharashtra, India

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">


[⬆ Back to top](#-medsync)

</div>
