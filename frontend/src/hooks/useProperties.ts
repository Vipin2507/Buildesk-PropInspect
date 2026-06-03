import { useState, useEffect, useCallback } from 'react'
import type { Property, PropertyWithStats } from '@/types'
import { TOTAL_ITEMS } from '@/utils/checklist'
import {
  getProperties,
  saveProperty,
  deletePropertyLocal,
  saveUnits,
  getUnitsByProperty,
  getInspectionsByProperty,
} from '@/utils/db'
import { propertiesAPI, unitsAPI } from '@/utils/api'
import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'

export function useProperties() {
  const user = useAuthStore((s) => s.user)
  const { isOnline, queueChange } = useSyncStore()

  const [properties, setProperties] = useState<PropertyWithStats[]>([])
  const [loading, setLoading] = useState(true)

  const computeStats = useCallback(
    async (props: Property[]): Promise<PropertyWithStats[]> => {
      return Promise.all(
        props.map(async (p) => {
          const units = await getUnitsByProperty(p.id)
          const inspections = await getInspectionsByProperty(p.id)
          const insMap = Object.fromEntries(inspections.map((i) => [i.unitId, i]))
          let complete = 0, partial = 0
          for (const u of units) {
            const ins = insMap[u.id]
            if (!ins) continue
            const done = ins.items.filter((it) => it.done).length
            if (done === TOTAL_ITEMS) complete++
            else if (done > 0) partial++
          }
          const total = units.length
          return {
            ...p,
            totalUnits: total,
            completeUnits: complete,
            partialUnits: partial,
            completionPct: total ? Math.round((complete / total) * 100) : 0,
          }
        })
      )
    },
    []
  )

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Always load from IDB first (instant, works offline)
    const local = await getProperties(user.id)
    setProperties(await computeStats(local))
    setLoading(false)

    // If online, sync from server
    if (isOnline) {
      try {
        const res = await propertiesAPI.list()
        const serverProps: Property[] = res.data
        for (const p of serverProps) await saveProperty(p)

        for (const p of serverProps) {
          const unitsRes = await unitsAPI.byProperty(p.id)
          await saveUnits(unitsRes.data)
        }

        const merged = await getProperties(user.id)
        setProperties(await computeStats(merged))
      } catch {
        // Offline or server error — local data is fine
      }
    }
  }, [user, isOnline, computeStats])

  useEffect(() => { load() }, [load])

  const createProperty = useCallback(
    async (data: {
      name: string; location: string; floors: number
      unitsPerFloor: number; unitPrefix: string; startNumber: number
    }) => {
      if (!user) return
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
      const now = new Date().toISOString()
      const prop: Property = { ...data, id, ownerId: user.id, createdAt: now, updatedAt: now }

      // Generate units locally
      const units = []
      const startOffset = data.startNumber % 100
      const floorOffset = Math.max(0, Math.floor(data.startNumber / 100) - 1)
      for (let f = 1; f <= data.floors; f++) {
        let num = (f + floorOffset) * 100 + startOffset
        for (let u = 1; u <= data.unitsPerFloor; u++) {
          const uNum = data.unitPrefix ? `${data.unitPrefix}${num}` : String(num)
          units.push({ id: `unit_${id}_${uNum}`, propertyId: id, unitNumber: uNum, floor: f, createdAt: now })
          num++
        }
      }

      await saveProperty(prop)
      await saveUnits(units)
      await queueChange({ type: 'create_property', payload: { property: prop, units } })

      const merged = await getProperties(user.id)
      setProperties(await computeStats(merged))
      return prop
    },
    [user, queueChange, computeStats]
  )

  const deleteProperty = useCallback(
    async (id: string) => {
      await deletePropertyLocal(id)
      await queueChange({ type: 'create_property', payload: { delete: true, id } })
      setProperties((prev) => prev.filter((p) => p.id !== id))
    },
    [queueChange]
  )

  return { properties, loading, reload: load, createProperty, deleteProperty }
}
