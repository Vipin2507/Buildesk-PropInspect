import Database from 'better-sqlite3'
import { hash } from 'bcryptjs'
import path from 'path'
import fs from 'fs'

const DB_PATH = './data/propinspect.db'
const dir = path.dirname(DB_PATH)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const db = new Database(DB_PATH)

async function seed() {
  try {
    // Check if demo user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@propinspect.in')
    if (existing) {
      console.log('✓ Demo user already exists')
      return
    }

    // Create demo user
    const hashedPwd = await hash('demo1234', 10)
    const now = new Date().toISOString()
    db.prepare('INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)')
      .run('demo-user-001', 'Demo User', 'demo@propinspect.in', hashedPwd, now)

    console.log('✓ Demo user created successfully')
    console.log('  Email: demo@propinspect.in')
    console.log('  Password: demo1234')
  } catch (err) {
    console.error('✗ Error seeding database:', err)
  } finally {
    db.close()
  }
}

seed()
