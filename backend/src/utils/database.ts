import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH ?? './data/propinspect.db'

// Ensure data directory exists
const dir = path.dirname(DB_PATH)
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

let _db: Database.Database | null = null

export function getDB(): Database.Database {
  if (_db) return _db
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  runMigrations(_db)
  return _db
}

function runMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS properties (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      location         TEXT NOT NULL DEFAULT '',
      floors           INTEGER NOT NULL DEFAULT 1,
      units_per_floor  INTEGER NOT NULL DEFAULT 1,
      unit_prefix      TEXT NOT NULL DEFAULT '',
      start_number     INTEGER NOT NULL DEFAULT 101,
      owner_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at       TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS units (
      id           TEXT PRIMARY KEY,
      property_id  TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      unit_number  TEXT NOT NULL,
      floor        INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);

    CREATE TABLE IF NOT EXISTS inspections (
      id             TEXT PRIMARY KEY,
      unit_id        TEXT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      property_id    TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      items          TEXT NOT NULL DEFAULT '[]',
      inspector_name TEXT NOT NULL DEFAULT '',
      last_updated   TEXT NOT NULL DEFAULT (datetime('now')),
      synced_at      TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_inspections_unit     ON inspections(unit_id);
    CREATE INDEX IF NOT EXISTS idx_inspections_property ON inspections(property_id);
  `)
}
