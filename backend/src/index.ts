import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { hash } from 'bcryptjs'
import { getDB } from './utils/database'
import authRoutes from './routes/auth'
import propertiesRoutes from './routes/properties'
import unitsRoutes from './routes/units'
import inspectionsRoutes from './routes/inspections'
import syncRoutes from './routes/sync'

const app = express()
const port = process.env.PORT || 4000

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}))
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertiesRoutes)
app.use('/api/units', unitsRoutes)
app.use('/api/inspections', inspectionsRoutes)
app.use('/api/sync', syncRoutes)

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/dist')
  app.use(express.static(frontendBuildPath))

  // Fallback to index.html for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'))
  })
}

// Health check
app.get('/health', (req, res) => res.json({ ok: true }))

// Debug info
app.get('/debug', (req, res) => {
  res.json({
    backend: 'running',
    cors: 'enabled',
    port,
    timestamp: new Date().toISOString(),
  })
})

// Auto-seed demo user on startup (survives Render ephemeral disk wipes)
async function seedDemoUser() {
  try {
    const db = getDB()
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@propinspect.in')
    if (!existing) {
      const hashedPwd = await hash('demo1234', 10)
      const now = new Date().toISOString()
      db.prepare('INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)')
        .run('demo-user-001', 'Demo User', 'demo@propinspect.in', hashedPwd, now)
      console.log('✓ Demo user seeded (demo@propinspect.in / demo1234)')
    }
  } catch (err) {
    console.error('⚠ Failed to seed demo user:', err)
  }
}

seedDemoUser().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Backend running at http://localhost:${port}`)
  })
})
