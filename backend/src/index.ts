import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
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
app.use(express.json())
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

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

app.listen(port, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`)
})
