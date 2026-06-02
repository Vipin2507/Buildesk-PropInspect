import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { getDB } from '../utils/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

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
        } else {
          const id = uuid()
          db.prepare('INSERT INTO inspections (id, unit_id, property_id, items, inspector_name, last_updated, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .run(id, unitId, propertyId, JSON.stringify(items), inspectorName, now, now)
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

  res.json({ properties, inspections, units: [] })
})

export default router

