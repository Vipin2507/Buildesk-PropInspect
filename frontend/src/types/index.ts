// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
}

// ─── Property ────────────────────────────────────────────────────────────────
export interface Property {
  id: string
  name: string
  location: string
  floors: number
  unitsPerFloor: number
  unitPrefix: string
  startNumber: number
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface PropertyWithStats extends Property {
  totalUnits: number
  completeUnits: number
  partialUnits: number
  completionPct: number
}

// ─── Unit ────────────────────────────────────────────────────────────────────
export interface Unit {
  id: string
  propertyId: string
  unitNumber: string
  floor: number
  createdAt: string
}

export interface UnitWithProgress extends Unit {
  doneCnt: number
  totalItems: number
  pct: number
  status: 'complete' | 'partial' | 'empty'
}

// ─── Inspection ──────────────────────────────────────────────────────────────
export interface CheckItem {
  index: number
  done: boolean
  remark: string
  images?: string[]   // base64 data URLs
}

export interface Inspection {
  id: string
  unitId: string
  propertyId: string
  items: CheckItem[]
  inspectorName: string
  lastUpdated: string
  syncedAt?: string
}

// ─── Checklist template ──────────────────────────────────────────────────────
export interface ChecklistSection {
  section: string
  items: string[]
}

// ─── Sync ────────────────────────────────────────────────────────────────────
export type SyncStatus = 'idle' | 'syncing' | 'error'

export interface PendingChange {
  id: string
  type: 'upsert_inspection' | 'create_property' | 'create_unit'
  payload: unknown
  timestamp: number
  retries: number
}
