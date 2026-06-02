# PropInspect 🏗️

A comprehensive full-stack property handover inspection management application with **offline-first capabilities**, real-time synchronization, and a detailed 69-item inspection checklist.

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Offline-First Sync](#offline-first-sync)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## 🎯 Overview

PropInspect is designed for property managers, inspectors, and handover coordinators to efficiently manage property inspections. The application follows an **offline-first architecture**, allowing inspectors to work seamlessly even without internet connectivity. All changes are automatically synchronized with the server when connection is restored.

### Key Use Cases

- **Property Handovers**: Document the condition of properties during handover
- **Inspections**: Perform detailed 69-item checklists per unit
- **Remarks**: Add detailed remarks for each inspection item
- **Offline Work**: Continue inspections without internet
- **Real-time Sync**: Automatic synchronization when online

## ✨ Features

### Core Features

✅ **Multi-Property Management**: Manage multiple properties with dynamic unit generation  
✅ **Unit Organization**: Auto-generate units by floor and units per floor  
✅ **69-Item Checklist**: 11 organized sections covering all inspection aspects  
✅ **Per-Item Remarks**: Add detailed notes for each inspection item  
✅ **Progress Tracking**: Visual progress bars for completion metrics  
✅ **Offline-First**: Work offline with automatic sync when online  
✅ **User Authentication**: Secure JWT-based authentication  
✅ **Role-Based Access**: Protected routes and user sessions

### Technical Features

✅ **Real-time Online/Offline Detection**: Automatic connectivity monitoring  
✅ **Pending Queue Management**: Track and retry unsynchronized changes  
✅ **IndexedDB Storage**: Fast local data persistence  
✅ **SQLite Backend**: Reliable server-side storage with WAL mode  
✅ **Password Hashing**: Secure bcryptjs with cost 10  
✅ **Rate Limiting**: Express rate-limit middleware  
✅ **CORS Protection**: Cross-origin security configured  
✅ **Input Validation**: Zod schema validation

### UI/UX Features

✅ **Responsive Design**: Mobile-first Tailwind CSS styling  
✅ **Real-time Status Bar**: Online/offline indicator with sync button  
✅ **Toast Notifications**: React Hot Toast for user feedback  
✅ **Loading States**: Spinners and disabled states during operations  
✅ **Empty States**: Helpful messages when no data exists  
✅ **Modal Dialogs**: Forms for property creation and inspections  
✅ **Dark Mode Ready**: CSS variables for theme switching

## 🛠️ Tech Stack

### Frontend

| Technology              | Purpose                 |
| ----------------------- | ----------------------- |
| **React 18.3**          | UI framework            |
| **TypeScript 5.5**      | Type safety             |
| **Vite 5.4**            | Build tool & dev server |
| **TailwindCSS 3.4**     | Styling                 |
| **React Router v6**     | Client-side routing     |
| **Zustand 4.5**         | State management        |
| **Axios 1.7**           | HTTP client             |
| **IndexedDB (idb)**     | Local persistence       |
| **React Hot Toast 2.4** | Notifications           |
| **Lucide React 0.427**  | Icons                   |

### Backend

| Technology                 | Purpose               |
| -------------------------- | --------------------- |
| **Express 4.19**           | Web framework         |
| **TypeScript 5.5**         | Type safety           |
| **SQLite3 9.6**            | Database              |
| **bcryptjs 2.4**           | Password hashing      |
| **JWT 9.0**                | Authentication        |
| **Zod 3.23**               | Input validation      |
| **CORS 2.8**               | Cross-origin requests |
| **Helmet 7.1**             | Security headers      |
| **Express-rate-limit 7.3** | Rate limiting         |

### Developer Tools

| Tool        | Version | Purpose                            |
| ----------- | ------- | ---------------------------------- |
| **tsx**     | 4.16    | TypeScript executor & file watcher |
| **tsc**     | 5.5     | TypeScript compiler                |
| **Node.js** | 20+     | Runtime environment                |

## 🏗️ Architecture

### Offline-First Pattern

```
┌─────────────────────────────────────────────┐
│            Frontend (React + Zustand)        │
│  ┌──────────────────────────────────────┐   │
│  │  IndexedDB (Local State Storage)     │   │
│  │  • Properties, Units, Inspections    │   │
│  │  • Pending Changes Queue             │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
            ↓ (HTTP Proxy)
┌─────────────────────────────────────────────┐
│         Backend (Express + SQLite)          │
│  ┌──────────────────────────────────────┐   │
│  │  SQLite Database                     │   │
│  │  • Users, Properties, Units          │   │
│  │  • Inspections, Sync History         │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Data Flow

1. **Write Operation (Offline)**:
   - Data written to IndexedDB immediately
   - Change queued in pending sync
   - UI updates optimistically

2. **Sync Trigger**:
   - Manual sync button (Navbar)
   - Automatic on connection restore
   - Window message events

3. **Push Phase**:
   - Pending changes sent to `/sync/push`
   - Server processes and persists
   - Successfully synced items cleared

4. **Pull Phase**:
   - Server changes fetched from `/sync/pull`
   - IndexedDB updated with latest data
   - Local state merged with server

## 📁 Project Structure

```
PropInspect/
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── UI.tsx                # Reusable UI components
│   │   │   ├── Navbar.tsx            # Top navigation bar
│   │   │   ├── OfflineBanner.tsx     # Connectivity status
│   │   │   ├── AddPropertyModal.tsx  # Property creation form
│   │   │   ├── InspectionDialog.tsx  # 69-item checklist UI
│   │   │   └── ProtectedRoute.tsx    # Auth guard wrapper
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx          # Login/Register
│   │   │   ├── PropertiesPage.tsx    # Property list
│   │   │   └── UnitsPage.tsx         # Unit grid by floor
│   │   ├── hooks/
│   │   │   ├── useProperties.ts      # Property data fetching
│   │   │   ├── useUnits.ts           # Unit data management
│   │   │   └── useInspection.ts      # Inspection CRUD
│   │   ├── store/
│   │   │   ├── authStore.ts          # Auth state (Zustand)
│   │   │   └── syncStore.ts          # Sync & online status
│   │   ├── utils/
│   │   │   ├── api.ts                # Axios API client
│   │   │   ├── db.ts                 # IndexedDB operations
│   │   │   └── checklist.ts          # 69-item checklist definition
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx                   # Route configuration
│   │   ├── main.tsx                  # React entry point
│   │   ├── index.css                 # Global styles
│   │   └── index.html                # HTML template
│   ├── public/
│   │   └── manifest.json             # PWA manifest
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.js            # Tailwind configuration
│   ├── postcss.config.js             # PostCSS plugins
│   └── package.json                  # Dependencies
│
├── backend/                           # Express + SQLite application
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts               # Login, register, /me
│   │   │   ├── properties.ts         # CRUD operations
│   │   │   ├── units.ts              # Unit listing
│   │   │   ├── inspections.ts        # Inspection operations
│   │   │   └── sync.ts               # /push and /pull endpoints
│   │   ├── middleware/
│   │   │   └── auth.ts               # JWT verification
│   │   ├── utils/
│   │   │   └── database.ts           # SQLite setup & migrations
│   │   ├── index.ts                  # Express server entry
│   │   └── seed.ts                   # Demo user initialization
│   ├── data/
│   │   └── propinspect.db            # SQLite database file
│   ├── tsconfig.json                 # TypeScript config
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example env template
│   └── package.json                  # Dependencies
│
└── README.md                          # This file
```

## 📦 Installation

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 9.0 or higher
- **SQLite3** (optional, comes with better-sqlite3)
- **Git** (optional, for cloning)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd PropInspect
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd ../backend
npm install
```

### Step 4: Setup Environment Variables

**Backend (.env)**:

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values (or use defaults)
# PORT=4000
# JWT_SECRET=dev-secret (change in production)
# DB_PATH=./data/propinspect.db
```

### Step 5: Initialize Database

The database is created automatically on first backend start. Demo user is seeded via:

```bash
cd backend
npm run seed
```

**Demo Credentials**:

- Email: `demo@propinspect.in`
- Password: `demo1234`

### Step 6: Start Development Servers

**Terminal 1 - Backend**:

```bash
cd backend
npm run dev
# Backend running at http://localhost:4000
```

**Terminal 2 - Frontend**:

```bash
cd frontend
npm run dev
# Frontend running at http://localhost:5173
```

### Step 7: Access Application

Open browser and navigate to: **http://localhost:5173**

## 🚀 Usage

### Logging In

1. Navigate to http://localhost:5173
2. Use demo credentials or register new account
3. Password must be 8+ characters for registration

### Creating a Property

1. Click **"Add property"** button
2. Fill in:
   - **Property Name**: e.g., "Greenwood Apartments"
   - **Location**: e.g., "123 Main St, New York"
   - **Floors**: Number of floors (e.g., 5)
   - **Units Per Floor**: e.g., 4
   - **Unit Prefix**: Optional (e.g., "A" generates A101, A102, etc.)
   - **Start Number**: Starting unit number (e.g., 101)
3. Preview shows unit generation
4. Click **"Create"**

### Inspecting a Unit

1. From Properties list, click a property
2. Click on a unit card
3. **Inspection Dialog** opens with 69-item checklist
4. For each item:
   - Toggle checkbox to mark complete
   - Click "Add Remark" to add detailed notes
5. **Progress bar** shows completion percentage
6. Click **"Save"** when done

### Syncing Changes

- **Manual Sync**: Click sync icon in Navbar when online
- **Automatic Sync**: Triggered when connection is restored
- **Offline Banner**: Shows when disconnected
- **Pending Count**: Badge shows unsynchronized changes

## 📡 API Documentation

### Base URL

```
http://localhost:4000/api
```

### Authentication

All endpoints (except `/auth/register`) require JWT token:

```
Authorization: Bearer <token>
```

### Endpoints

#### 🔐 Authentication (`/auth`)

**POST `/auth/login`**

```json
{
  "email": "demo@propinspect.in",
  "password": "demo1234"
}
```

Response: `{ user, token }`

**POST `/auth/register`**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

Response: `{ user, token }`

**GET `/auth/me`**
Response: `{ id, name, email, created_at }`

---

#### 🏢 Properties (`/properties`)

**GET `/properties`**
Lists all properties for authenticated user.
Response: `Property[]`

**POST `/properties`**
Creates property with auto-generated units.

```json
{
  "name": "Building A",
  "location": "Downtown",
  "floors": 3,
  "unitsPerFloor": 4,
  "unitPrefix": "A",
  "startNumber": 101
}
```

Response: `Property` (units generated on backend)

**DELETE `/properties/:id`**
Deletes property and cascades to units/inspections.
Response: `{ success: true }`

---

#### 📋 Units (`/units`)

**GET `/units?propertyId=<id>`**
Lists all units for a property.
Response: `Unit[]`

Fields per unit:

- `id`: UUID
- `propertyId`: Parent property
- `unitNumber`: e.g., "A101"
- `floor`: Floor number
- `createdAt`: ISO timestamp

---

#### ✅ Inspections (`/inspections`)

**GET `/inspections/:unitId`**
Get inspection for specific unit.
Response: `Inspection` (items parsed from JSON)

**POST `/inspections`**
Create or update inspection.

```json
{
  "unitId": "<unit-id>",
  "propertyId": "<property-id>",
  "inspectorName": "John Doe",
  "items": [
    { "id": "item-1", "done": true, "remark": "OK" },
    { "id": "item-2", "done": false, "remark": "" }
  ]
}
```

Response: `{ success: true }`

**GET `/inspections?propertyId=<id>`**
List all inspections for property.
Response: `Inspection[]`

---

#### 🔄 Sync (`/sync`)

**POST `/sync/push`**
Push pending changes to server.

```json
{
  "changes": [
    {
      "type": "upsert_inspection",
      "payload": { "unitId", "items", "inspectorName", "propertyId" }
    }
  ]
}
```

Response: `{ synced: number }`

**GET `/sync/pull?since=<timestamp>`**
Pull server changes since timestamp.
Response: `{ properties: [], inspections: [], units: [] }`

---

#### 💚 Health Check

**GET `/health`**
Response: `{ ok: true }`

**GET `/debug`**
Response: `{ backend, cors, port, timestamp }`

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL (bcrypt hash),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)
```

### Properties Table

```sql
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  floors INTEGER DEFAULT 1,
  units_per_floor INTEGER DEFAULT 1,
  unit_prefix TEXT DEFAULT '',
  start_number INTEGER DEFAULT 101,
  owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

### Units Table

```sql
CREATE TABLE units (
  id TEXT PRIMARY KEY,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
)
-- Index: idx_units_property on property_id
```

### Inspections Table

```sql
CREATE TABLE inspections (
  id TEXT PRIMARY KEY,
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  items TEXT NOT NULL (JSON array),
  inspector_name TEXT DEFAULT '',
  last_updated TEXT NOT NULL,
  synced_at TEXT (NULL until synced)
)
-- Indexes: idx_inspections_unit, idx_inspections_property
```

### Pragmas

```sql
PRAGMA journal_mode = WAL  -- Write-Ahead Logging for concurrency
PRAGMA foreign_keys = ON   -- Enforce referential integrity
```

## 🔁 Offline-First Sync

### How It Works

1. **Write Locally**
   - All changes write to IndexedDB first
   - Change queued in `pendingSync` store
   - UI updates immediately (optimistic)

2. **Detect Connectivity**
   - Window `online`/`offline` events
   - Zustand syncStore tracks `isOnline`
   - Navbar shows status indicator

3. **Sync Trigger**
   - Manual: Click sync button
   - Automatic: On connection restore
   - Interval: Every 30 seconds if online

4. **Push Phase** (`/sync/push`)
   - Send queued changes
   - Server processes and stores
   - Mark items as synced

5. **Pull Phase** (`/sync/pull`)
   - Fetch server changes since last sync
   - Merge with local IndexedDB
   - Update UI with latest data

### Example Change Object

```typescript
{
  type: 'upsert_inspection',
  payload: {
    unitId: 'unit-123',
    propertyId: 'prop-456',
    inspectorName: 'John',
    items: [
      { id: 'item-1', done: true, remark: 'All good' },
      { id: 'item-2', done: false, remark: '' }
    ]
  }
}
```

### Conflict Resolution

- **Last-write-wins**: Server timestamp used
- **No merge conflicts**: Inspection is single-writer per unit
- **Idempotent**: Duplicate syncs are safe

## ⚙️ Configuration

### Frontend Environment

**vite.config.ts** - API proxy:

```typescript
server: {
  proxy: {
    '/api': { target: 'http://localhost:4000', changeOrigin: true }
  }
}
```

### Backend Environment

**.env file**:

```
PORT=4000
JWT_SECRET=dev-secret-change-in-production
DB_PATH=./data/propinspect.db
```

### TypeScript Paths

Both frontend and backend use path aliases:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Tailwind Configuration

- **Color scheme**: Blue gradient primary
- **Responsive**: Mobile-first
- **Plugins**: None (core utilities only)

## 🐛 Troubleshooting

### Issue: Can't login

**Solution**:

1. Verify backend running: `curl http://localhost:4000/health`
2. Check demo user: `sqlite3 backend/data/propinspect.db "SELECT email FROM users;"`
3. Clear browser localStorage: F12 → Application → Local Storage → Clear

### Issue: Changes not syncing

**Checks**:

1. Check network tab (F12) for `/sync/push` requests
2. Verify online status (Navbar indicator)
3. Check browser console for errors
4. Backend logs should show sync requests

### Issue: "Invalid token" errors

**Solutions**:

1. Token expired: Re-login
2. Backend restarted: Re-login to get new token
3. Wrong JWT_SECRET: Check `.env` and restart backend

### Issue: IndexedDB errors

**Solutions**:

1. Clear IndexedDB: F12 → Application → IndexedDB → propinspect → Delete
2. Clear localStorage too: F12 → Storage → Local Storage
3. Reload page after clearing

### Issue: Database locked

**Cause**: SQLite WAL mode conflict
**Solution**: Stop all servers, delete `propinspect.db-wal` and `-shm` files, restart

### Issue: Port already in use

**Solutions**:

```bash
# Find process using port 4000
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Change PORT in .env
PORT=5000
```

### Issue: Module not found errors

**Solutions**:

1. Reinstall dependencies: `rm -rf node_modules && npm install`
2. Clear TypeScript cache: `rm -rf dist`
3. Rebuild: `npm run build`

## 🔧 Development

### Scripts

**Frontend**:

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
```

**Backend**:

```bash
npm run dev      # Start with tsx watch (hot reload)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled build
npm run seed     # Seed demo user
```

### Adding New Inspection Items

Edit `frontend/src/utils/checklist.ts`:

```typescript
export const CHECKLIST_SECTIONS = [
  {
    section: "New Section",
    items: [{ id: "item-x", label: "New item label" }],
  },
];
```

### Adding New API Endpoint

1. Create route in `backend/src/routes/`
2. Import in `backend/src/index.ts`
3. Add to `frontend/src/utils/api.ts`
4. Create hook if needed in `frontend/src/hooks/`

### Database Migrations

Edit `backend/src/utils/database.ts` `runMigrations()` function:

```typescript
db.exec(`
  CREATE TABLE IF NOT EXISTS new_table (
    id TEXT PRIMARY KEY,
    ...
  )
`);
```

### Deployment Checklist

- [ ] Set `JWT_SECRET` to strong value
- [ ] Set `NODE_ENV=production`
- [ ] Use managed database (MongoDB Atlas, PostgreSQL)
- [ ] Enable HTTPS
- [ ] Setup rate limiting values
- [ ] Add logging/monitoring
- [ ] Test offline sync thoroughly

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/inspection-photos

# Make changes
git add .
git commit -m "Add photo capture to inspections"

# Push and create PR
git push origin feature/inspection-photos
```

## 📄 License

MIT License - See LICENSE file for details

## 👥 Contributing

Contributions welcome! Please:

1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📞 Support

### Getting Help

1. Check [Troubleshooting](#troubleshooting) section
2. Review browser console errors (F12)
3. Check backend logs in terminal
4. Search closed GitHub issues

### Reporting Bugs

Include:

- Steps to reproduce
- Expected vs actual behavior
- Browser/Node version
- Error messages from console
- Screenshots if applicable

---

**Last Updated**: June 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
