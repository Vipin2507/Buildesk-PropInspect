import { openDB, type IDBPDatabase } from 'idb'
import type { Property, Unit, Inspection, PendingChange, User } from '@/types'

const DB_NAME = 'propinspect'
const DB_VERSION = 1

export interface PropInspectDB {
  users:       { key: string; value: User }
  properties:  { key: string; value: Property }
  units:        { key: string; value: Unit; indexes: { 'by-property': string } }
  inspections:  { key: string; value: Inspection; indexes: { 'by-unit': string; 'by-property': string } }
  pendingSync:  { key: string; value: PendingChange }
}

let _db: IDBPDatabase<PropInspectDB> | null = null

export async function getDB(): Promise<IDBPDatabase<PropInspectDB>> {
  if (_db) return _db
  _db = await openDB<PropInspectDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users'))
        db.createObjectStore('users', { keyPath: 'id' })

      if (!db.objectStoreNames.contains('properties'))
        db.createObjectStore('properties', { keyPath: 'id' })

      if (!db.objectStoreNames.contains('units')) {
        const us = db.createObjectStore('units', { keyPath: 'id' })
        us.createIndex('by-property', 'propertyId')
      }

      if (!db.objectStoreNames.contains('inspections')) {
        const ins = db.createObjectStore('inspections', { keyPath: 'id' })
        ins.createIndex('by-unit', 'unitId')
        ins.createIndex('by-property', 'propertyId')
      }

      if (!db.objectStoreNames.contains('pendingSync'))
        db.createObjectStore('pendingSync', { keyPath: 'id' })
    },
  })
  return _db
}

// ─── Users ───────────────────────────────────────────────────────────────────
export async function saveUser(user: User) {
  const db = await getDB()
  await db.put('users', user)
}

export async function getUser(id: string) {
  const db = await getDB()
  return db.get('users', id)
}

// ─── Properties ──────────────────────────────────────────────────────────────
export async function saveProperty(p: Property) {
  const db = await getDB()
  await db.put('properties', p)
}

export async function getProperties(ownerId: string): Promise<Property[]> {
  const db = await getDB()
  const all = await db.getAll('properties')
  return all.filter((p) => p.ownerId === ownerId)
}

export async function deletePropertyLocal(id: string) {
  const db = await getDB()
  const tx = db.transaction(['properties', 'units', 'inspections'], 'readwrite')
  await tx.objectStore('properties').delete(id)
  const units = await tx.objectStore('units').index('by-property').getAll(id)
  for (const u of units) {
    await tx.objectStore('units').delete(u.id)
    await tx.objectStore('inspections').delete(u.id)
  }
  await tx.done
}

// ─── Units ────────────────────────────────────────────────────────────────────
export async function saveUnits(units: Unit[]) {
  const db = await getDB()
  const tx = db.transaction('units', 'readwrite')
  for (const u of units) tx.store.put(u)
  await tx.done
}

export async function getUnitsByProperty(propertyId: string): Promise<Unit[]> {
  const db = await getDB()
  return db.getAllFromIndex('units', 'by-property', propertyId)
}

// ─── Inspections ─────────────────────────────────────────────────────────────
export async function saveInspection(ins: Inspection) {
  const db = await getDB()
  await db.put('inspections', ins)
}

export async function getInspection(unitId: string): Promise<Inspection | undefined> {
  const db = await getDB()
  const all = await db.getAllFromIndex('inspections', 'by-unit', unitId)
  return all[0]
}

export async function getInspectionsByProperty(propertyId: string): Promise<Inspection[]> {
  const db = await getDB()
  return db.getAllFromIndex('inspections', 'by-property', propertyId)
}

// ─── Pending sync ─────────────────────────────────────────────────────────────
export async function addPending(change: PendingChange) {
  const db = await getDB()
  await db.put('pendingSync', change)
}

export async function getPending(): Promise<PendingChange[]> {
  const db = await getDB()
  return db.getAll('pendingSync')
}

export async function removePending(id: string) {
  const db = await getDB()
  await db.delete('pendingSync', id)
}

export async function clearAllPending() {
  const db = await getDB()
  await db.clear('pendingSync')
}
