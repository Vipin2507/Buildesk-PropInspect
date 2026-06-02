import { useState, useEffect, useCallback } from 'react'
import type { Unit, UnitWithProgress } from '@/types'
import { TOTAL_ITEMS } from '@/utils/checklist'
import { getUnitsByProperty, getInspection } from '@/utils/db'

export function useUnits(propertyId: string | null) {
  const [units, setUnits] = useState<UnitWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    const raw: Unit[] = await getUnitsByProperty(propertyId)
    const withProgress: UnitWithProgress[] = await Promise.all(
      raw
        .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true }))
        .map(async (u) => {
          const ins = await getInspection(u.id)
          const done = ins ? ins.items.filter((it) => it.done).length : 0
          const pct = Math.round((done / TOTAL_ITEMS) * 100)
          const status =
            done === TOTAL_ITEMS && done > 0
              ? 'complete'
              : done > 0
              ? 'partial'
              : 'empty'
          return { ...u, doneCnt: done, totalItems: TOTAL_ITEMS, pct, status }
        })
    )
    setUnits(withProgress)
    setLoading(false)
  }, [propertyId])

  useEffect(() => { load() }, [load])

  return { units, loading, reload: load }
}
