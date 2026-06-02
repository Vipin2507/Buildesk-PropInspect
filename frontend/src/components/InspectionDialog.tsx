import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'
import { CheckSquare, Square, X } from 'lucide-react'
import type { Unit } from '@/types'
import { CHECKLIST_TEMPLATE } from '@/utils/checklist'
import { useInspection } from '@/hooks/useInspection'
import { Button, Spinner } from './UI'

interface Props {
  unit: Unit | null
  propertyName: string
  onClose: () => void
  onSaved: () => void
}

const SECTION_ICONS: Record<string, string> = {
  'Electric Work': '⚡',
  'Plumbing Work': '🚿',
  'Tiling Work': '🔲',
  'Internal Painting Work': '🖌️',
  'Deck / Kitchen Railing Work': '🪟',
  'Aluminium Window': '🏠',
  'Modular Kitchen': '🍳',
  'Fire Fighting Work': '🔥',
  'Cabaling Work': '🔒',
  'Video Door Phone': '📷',
  'Wooden Polishing Work': '🪵',
}

export default function InspectionDialog({ unit, propertyName, onClose, onSaved }: Props) {
  const { items, loading, saving, doneCnt, pct, toggleItem, setRemark, save } =
    useInspection(unit?.id ?? null, unit?.propertyId ?? null)

  const [editingRemarkIdx, setEditingRemarkIdx] = useState<number | null>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!unit) return null

  const handleSave = async () => {
    await save()
    toast.success(`Saved — ${doneCnt}/${items.length} items complete`)
    onSaved()
    onClose()
  }

  const totalItems = items.length
  const pendingCnt = totalItems - doneCnt
  const barColor = pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-200'

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1E3A8A] text-white z-10 rounded-t-2xl border-b border-[#1E3A8A]/10">
          <div className="flex items-start justify-between px-6 py-4">
            <div>
              <h2 className="text-base font-bold">
                Unit <span className="text-[#2563EB] font-bold">{unit.unitNumber}</span> — Inspection
              </h2>
              <p className="text-xs text-white/80 mt-0.5">{propertyName} · Floor {unit.floor}</p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 mt-0.5 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-4 divide-x divide-slate-100 border-t border-[#1E3A8A]/10 bg-white">
            {[
              { label: 'Done',    val: doneCnt,    color: 'text-green-600' },
              { label: 'Pending', val: pendingCnt, color: 'text-[#2563EB]' },
              { label: 'Total',   val: totalItems,  color: 'text-[#1E3A8A]' },
              { label: 'Complete', val: `${pct}%`,  color: pct === 100 ? 'text-green-600' : 'text-[#2563EB]' },
            ].map((s) => (
              <div key={s.label} className="px-4 py-3 text-center">
                <div className={clsx('text-lg font-black leading-none', s.color)}>{s.val}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-200 overflow-hidden">
            <div className="h-full bg-[#2563EB] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto scrollbar-thin px-5 py-4" style={{ maxHeight: '55vh' }}>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size={28} className="text-blue-500" /></div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid gap-3 px-2 mb-1" style={{ gridTemplateColumns: '1fr 56px 1fr' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Work item</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Done</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Remarks</span>
              </div>

              {/* Sections */}
              {(() => {
                let idx = 0
                return CHECKLIST_TEMPLATE.map((section) => (
                  <div key={section.section} className="mb-4">
                    {/* Section label */}
                    <div className="flex items-center gap-2 border-b border-[#1E3A8A]/20 pb-1.5 mb-3 mt-5">
                      <span className="text-sm leading-none">{SECTION_ICONS[section.section] ?? '🔧'}</span>
                      <span className="text-sm font-semibold text-[#1E3A8A] uppercase tracking-wide">{section.section}</span>
                    </div>

                    {section.items.map((itemLabel) => {
                      const i = idx++
                      const item = items[i]
                      if (!item) return null
                      return (
                        <div
                          key={i}
                          className={clsx(
                            'grid gap-3 px-2 py-2 rounded-lg transition-colors items-center',
                            'border-b border-slate-50 last:border-0 hover:bg-slate-50',
                            item.done ? 'bg-blue-50/30' : 'bg-white'
                          )}
                          style={{ gridTemplateColumns: '1fr 56px 1fr' }}
                        >
                          {/* Label */}
                          <span className={clsx('text-sm', item.done ? 'text-slate-400 line-through' : 'text-slate-700')}>
                            {itemLabel}
                          </span>

                          {/* Toggle */}
                          <div className="flex justify-center">
                            <button
                              onClick={() => toggleItem(i)}
                              className={clsx(
                                'check-toggle w-7 h-7 rounded-lg flex items-center justify-center border-2',
                                item.done
                                  ? 'bg-[#2563EB] border-[#2563EB] text-white'
                                  : 'border-slate-300 bg-white hover:border-[#2563EB]/50'
                              )}
                            >
                              {item.done
                                ? (
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : null
                              }
                            </button>
                          </div>

                          {/* Remark */}
                          <div>
                            {editingRemarkIdx === i || item.remark ? (
                              <textarea
                                value={item.remark}
                                onChange={(e) => setRemark(i, e.target.value)}
                                onBlur={() => { if (!item.remark) setEditingRemarkIdx(null) }}
                                placeholder="Add remark..."
                                rows={2}
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 bg-white text-slate-800 placeholder:text-slate-300 resize-none"
                                autoFocus={editingRemarkIdx === i}
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingRemarkIdx(i)}
                                className="text-xs text-[#1E3A8A] underline hover:text-[#2563EB] transition-colors"
                              >
                                Add Remark
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              })()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 rounded-b-2xl px-6 py-4 flex justify-between items-center gap-3">
          <p className="text-xs font-semibold text-slate-500">
            {doneCnt === totalItems
              ? '🎉 All items complete'
              : `${pendingCnt} item${pendingCnt > 1 ? 's' : ''} remaining`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Cancel
            </button>
            <Button
              loading={saving}
              onClick={handleSave}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg px-6 py-2 text-sm"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
