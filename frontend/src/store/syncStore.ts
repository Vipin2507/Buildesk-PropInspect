import { create } from 'zustand'
import type { SyncStatus, PendingChange } from '@/types'
import {
  getPending,
  removePending,
  clearAllPending,
  addPending,
  saveProperty,
  saveUnits,
  saveInspection,
} from '@/utils/db'
import { syncAPI, propertiesAPI, inspectionsAPI } from '@/utils/api'

interface SyncStore {
  isOnline:      boolean
  status:        SyncStatus
  pendingCount:  number
  lastSyncedAt:  number | null

  setOnline:         (v: boolean) => void
  refreshPendingCount: () => Promise<void>
  queueChange:       (change: Omit<PendingChange, 'id' | 'timestamp' | 'retries'>) => Promise<void>
  sync:              () => Promise<{ synced: number; errors: number }>
  pullFromServer:    () => Promise<void>
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  isOnline:     navigator.onLine,
  status:       'idle',
  pendingCount: 0,
  lastSyncedAt: null,

  setOnline: (v) => {
    set({ isOnline: v })
    if (v) get().sync()
  },

  refreshPendingCount: async () => {
    const p = await getPending()
    set({ pendingCount: p.length })
  },

  queueChange: async (change) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    const full: PendingChange = { ...change, id, timestamp: Date.now(), retries: 0 }
    await addPending(full)
    await get().refreshPendingCount()
  },

  sync: async () => {
    const { isOnline } = get()
    if (!isOnline) return { synced: 0, errors: 0 }

    set({ status: 'syncing' })
    const pending = await getPending()
    let synced = 0, errors = 0

    for (const change of pending) {
      try {
        await syncAPI.push([change])
        await removePending(change.id)
        synced++
      } catch {
        errors++
        if (change.retries >= 3) await removePending(change.id)
      }
    }

    // Pull latest from server
    try { await get().pullFromServer() } catch { /* continue */ }

    await get().refreshPendingCount()
    set({ status: errors > 0 ? 'error' : 'idle', lastSyncedAt: Date.now() })
    return { synced, errors }
  },

  pullFromServer: async () => {
    const since = Number(localStorage.getItem('pi_last_pull') || 0)
    const res = await syncAPI.pull(since)
    const { properties, units, inspections } = res.data

    for (const p of properties ?? []) await saveProperty(p)
    if ((units ?? []).length) await saveUnits(units)
    for (const ins of inspections ?? []) await saveInspection(ins)

    localStorage.setItem('pi_last_pull', String(Date.now()))
  },
}))

// Wire up window online/offline events once
if (typeof window !== 'undefined') {
  window.addEventListener('online',  () => useSyncStore.getState().setOnline(true))
  window.addEventListener('offline', () => useSyncStore.getState().setOnline(false))
}
