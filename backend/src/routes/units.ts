import { Router, Response } from 'express'
import { getDB } from '../utils/database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDB()
  const { propertyId } = req.query
  const units = db.prepare('SELECT * FROM units WHERE property_id = ?').all(propertyId)
  res.json(units)
})

export default router

