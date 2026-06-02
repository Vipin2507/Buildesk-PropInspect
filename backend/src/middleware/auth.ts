import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export interface AuthRequest extends Request {
  userId?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' })
  }

  const token = auth.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}
