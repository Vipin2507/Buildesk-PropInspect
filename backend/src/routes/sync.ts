import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { getDB } from '../utils/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { broadcast, registerClient } from '../utils/sse'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

const router = Router()

router.post('/push', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { changes } = req.body
    const db = getDB()

    for (const change of changes) {
        if (change.type === 'upsert_inspection') {
          const { items, inspectorName, unitId, propertyId } = change.payload
          const now = new Date().toISOString()
          const existing = db.prepare('SELECT id FROM inspections WHERE unit_id = ?').get(unitId)
          if (existing) {
            db.prepare('UPDATE inspections SET items = ?, inspector_name = ?, last_updated = ?, synced_at = ? WHERE unit_id = ?')
              .run(JSON.stringify(items), inspectorName, now, now, unitId)
            // notify owner
            broadcast(req.userId, 'inspection_updated', { unitId, propertyId, items, inspectorName, lastUpdated: now })
          } else {
            const id = uuid()
            db.prepare('INSERT INTO inspections (id, unit_id, property_id, items, inspector_name, last_updated, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .run(id, unitId, propertyId, JSON.stringify(items), inspectorName, now, now)
            broadcast(req.userId, 'inspection_created', { id, unitId, propertyId, items, inspectorName, lastUpdated: now })
          }
        }

        // Handle properties created or deleted while offline
        if (change.type === 'create_property') {
          const payload = change.payload || {}
          // Delete case
          if (payload.delete && payload.id) {
            db.prepare('DELETE FROM properties WHERE id = ? AND owner_id = ?').run(payload.id, req.userId)
            broadcast(req.userId, 'property_deleted', { id: payload.id })
            continue
          }

          const prop = payload.property
          const units = payload.units || []
          if (prop) {
            const now = new Date().toISOString()
            const exists = db.prepare('SELECT id FROM properties WHERE id = ?').get(prop.id)
            if (exists) {
              db.prepare('UPDATE properties SET name = ?, location = ?, floors = ?, units_per_floor = ?, unit_prefix = ?, start_number = ?, updated_at = ? WHERE id = ?')
                .run(prop.name, prop.location, prop.floors, prop.unitsPerFloor, prop.unitPrefix, prop.startNumber, now, prop.id)
            } else {
              db.prepare('INSERT INTO properties (id, name, location, floors, units_per_floor, unit_prefix, start_number, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
                .run(prop.id, prop.name, prop.location, prop.floors, prop.unitsPerFloor, prop.unitPrefix, prop.startNumber, req.userId, now, now)
            }

            for (const u of units) {
              const ue = db.prepare('SELECT id FROM units WHERE id = ?').get(u.id)
              if (!ue) {
                db.prepare('INSERT INTO units (id, property_id, unit_number, floor, created_at) VALUES (?, ?, ?, ?, ?)')
                  .run(u.id, prop.id, u.unitNumber || u.unit_number || '', u.floor || 1, now)
              }
            }
            // notify owner about property upsert
            broadcast(req.userId, 'property_upsert', { property: prop, units })
          }
        }
    }

    res.json({ synced: changes.length })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/pull', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDB()
  const { since } = req.query
  const timestamp = since ? new Date(Number(since)).toISOString() : '1970-01-01'

  const properties = db.prepare('SELECT * FROM properties WHERE owner_id = ? AND updated_at > ?').all(req.userId, timestamp)
  const inspections = db.prepare(`
    SELECT i.* FROM inspections i
    JOIN properties p ON i.property_id = p.id
    WHERE p.owner_id = ? AND i.last_updated > ?
  `).all(req.userId, timestamp) as any[]

  inspections.forEach(i => { i.items = JSON.parse(i.items) })

  // Fetch units for the returned properties
  let units: any[] = []
  if (properties.length) {
    const ids = properties.map((p: any) => `'${p.id}'`).join(',')
    units = db.prepare(`SELECT * FROM units WHERE property_id IN (${ids})`).all()
  }

  res.json({ properties, inspections, units })
})

// Server-Sent Events stream for real-time updates
router.get('/stream', (req: AuthRequest, res: Response) => {
  // Allow token via query param for EventSource connections
  const qtoken = (req.query.token as string) || ''
  const authHeader = req.headers.authorization || ''
  const token = qtoken || (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '')
  if (!token) return res.status(401).end()
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    const userId = payload.userId
    registerClient(res, userId)
  } catch {
    return res.status(401).end()
  }
})

export default router


