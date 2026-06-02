import { useState, useEffect, useCallback } from 'react'
import type { Inspection, CheckItem } from '@/types'
import { buildEmptyItems, TOTAL_ITEMS } from '@/utils/checklist'
import { getInspection, saveInspection } from '@/utils/db'
import { useSyncStore } from '@/store/syncStore'
import { useAuthStore } from '@/store/authStore'

export function useInspection(unitId: string | null, propertyId: string | null) {
  const user = useAuthStore((s) => s.user)
  const queueChange = useSyncStore((s) => s.queueChange)

  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [items, setItems] = useState<CheckItem[]>(buildEmptyItems())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!unitId) return
    setLoading(true)
    const existing = await getInspection(unitId)
    if (existing) {
      setInspection(existing)
      // Merge stored items with template (handles new items added later)
      const merged = buildEmptyItems().map((blank, i) => existing.items[i] ?? blank)
      setItems(merged)
    } else {
      setInspection(null)
      setItems(buildEmptyItems())
    }
    setLoading(false)
  }, [unitId])

  useEffect(() => { load() }, [load])

  const toggleItem = useCallback((index: number) => {
    setItems((prev) =>
      prev.map((it) => (it.index === index ? { ...it, done: !it.done } : it))
    )
  }, [])

  const setRemark = useCallback((index: number, remark: string) => {
    setItems((prev) =>
      prev.map((it) => (it.index === index ? { ...it, remark } : it))
    )
  }, [])

  const save = useCallback(async () => {
    if (!unitId || !propertyId) return
    setSaving(true)
    const now = new Date().toISOString()
    const ins: Inspection = {
      id: unitId, // 1-to-1 with unit
      unitId,
      propertyId,
      items,
      inspectorName: user?.name ?? 'Unknown',
      lastUpdated: now,
    }
    await saveInspection(ins)
    await queueChange({ type: 'upsert_inspection', payload: ins })
    setInspection(ins)
    setSaving(false)
    return ins
  }, [unitId, propertyId, items, user, queueChange])

  const doneCnt = items.filter((it) => it.done).length
  const pct = Math.round((doneCnt / TOTAL_ITEMS) * 100)

  return { inspection, items, loading, saving, doneCnt, pct, toggleItem, setRemark, save }
}
