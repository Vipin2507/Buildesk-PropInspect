import { Router, Response } from 'express'
import { getDB, toCamelArray } from '../utils/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { z } from 'zod'
import { broadcast } from '../utils/sse'

const router = Router()

const createPropertySchema = z.object({
  name: z.string().min(1),
  location: z.string().default(''),
  floors: z.number().min(1),
  unitsPerFloor: z.number().min(1),
  unitPrefix: z.string().default(''),
  startNumber: z.number().min(1),
})

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' })
  const db = getDB()
  const props = db.prepare('SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC').all(req.userId)
  res.json(toCamelArray(props))
})

router.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' })
    const data = createPropertySchema.parse(req.body)
    const db = getDB()
    const { v4: uuid } = require('uuid')
    const id = uuid()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO properties (id, name, location, floors, units_per_floor, unit_prefix, start_number, owner_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.location, data.floors, data.unitsPerFloor, data.unitPrefix, data.startNumber, req.userId, now, now)

    // Generate units
    const startOffset = data.startNumber % 100
    const floorOffset = Math.max(0, Math.floor(data.startNumber / 100) - 1)
    for (let f = 1; f <= data.floors; f++) {
      let num = (f + floorOffset) * 100 + startOffset
      for (let u = 1; u <= data.unitsPerFloor; u++) {
        const unitNumber = data.unitPrefix ? `${data.unitPrefix}${num}` : String(num)
        const unitId = uuid()
        db.prepare('INSERT INTO units (id, property_id, unit_number, floor, created_at) VALUES (?, ?, ?, ?, ?)')
          .run(unitId, id, unitNumber, f, now)
        num++
      }
    }

    res.status(201).json({ id, name: data.name, location: data.location, floors: data.floors, unitsPerFloor: data.unitsPerFloor, unitPrefix: data.unitPrefix, startNumber: data.startNumber, ownerId: req.userId, createdAt: now, updatedAt: now })
    // notify clients for this user
    broadcast(req.userId, 'property_upsert', { property: { id, name: data.name, location: data.location, floors: data.floors, unitsPerFloor: data.unitsPerFloor, unitPrefix: data.unitPrefix, startNumber: data.startNumber, ownerId: req.userId, createdAt: now, updatedAt: now } })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  if (!req.userId) return res.status(401).json({ message: 'Unauthorized' })
  const db = getDB()
  db.prepare('DELETE FROM properties WHERE id = ? AND owner_id = ?').run(req.params.id, req.userId)
  broadcast(req.userId, 'property_deleted', { id: req.params.id })
  res.json({ success: true })
})

export default router

