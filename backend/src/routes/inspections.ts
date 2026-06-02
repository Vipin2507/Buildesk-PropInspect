import { Router, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { getDB } from '../utils/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/:unitId', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDB()
  const ins = db.prepare('SELECT * FROM inspections WHERE unit_id = ?').get(req.params.unitId) as any
  if (ins) {
    ins.items = JSON.parse(ins.items)
  }
  res.json(ins)
})

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { unitId, propertyId, items, inspectorName } = req.body
    const db = getDB()
    const now = new Date().toISOString()

    const existing = db.prepare('SELECT id FROM inspections WHERE unit_id = ?').get(unitId) as any
    if (existing) {
      db.prepare('UPDATE inspections SET items = ?, inspector_name = ?, last_updated = ?, synced_at = NULL WHERE unit_id = ?')
        .run(JSON.stringify(items), inspectorName, now, unitId)
    } else {
      const id = uuid()
      db.prepare('INSERT INTO inspections (id, unit_id, property_id, items, inspector_name, last_updated) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, unitId, propertyId, JSON.stringify(items), inspectorName, now)
    }

    res.json({ success: true })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDB()
  const { propertyId } = req.query
  const inspections = db.prepare('SELECT * FROM inspections WHERE property_id = ?').all(propertyId) as any[]
  inspections.forEach(i => { i.items = JSON.parse(i.items) })
  res.json(inspections)
})

export default router

