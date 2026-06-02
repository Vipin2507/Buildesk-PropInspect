import { Router, Response } from 'express'
import { hash, compare } from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { getDB, toCamel } from '../utils/database'
import { generateToken, AuthRequest, authMiddleware } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const db = getDB()
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user.id)
    res.json({
      user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at },
      token,
    })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
})

router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body)
    const db = getDB()
    
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const hashedPwd = await hash(password, 10)
    const id = uuid()
    const now = new Date().toISOString()
    
    db.prepare('INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, email, hashedPwd, now)

    const token = generateToken(id)
    res.status(201).json({
      user: { id, name, email, createdAt: now },
      token,
    })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = getDB()
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.userId) as any
  res.json(toCamel(user))
})

export default router

