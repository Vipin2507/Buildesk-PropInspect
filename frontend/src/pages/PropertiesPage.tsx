import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, MapPin, Building, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useProperties } from '@/hooks/useProperties'
import { Button, ProgressBar, EmptyState, Spinner } from '@/components/UI'
import AddPropertyModal from '@/components/AddPropertyModal'
import Navbar from '@/components/Navbar'
import OfflineBanner from '@/components/OfflineBanner'
import type { PropertyWithStats } from '@/types'

export default function PropertiesPage() {
  const navigate = useNavigate()
  const { properties, loading, createProperty, deleteProperty } = useProperties()
  const [addOpen, setAddOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Delete this property and all unit inspection data?')) return
    setDeletingId(id)
    await deleteProperty(id)
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <OfflineBanner />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A8A]">My Properties</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? 'Loading...' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus size={16} /> Add property
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size={32} className="text-[#2563EB]" /></div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon="🏗️"
            title="No properties yet"
            subtitle="Add your first property to start tracking handover inspections."
            action={<Button onClick={() => setAddOpen(true)}><Plus size={14} /> Add property</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                deleting={deletingId === p.id}
                onClick={() => navigate(`/properties/${p.id}`)}
                onDelete={(e) => handleDelete(e, p.id)}
              />
            ))}
          </div>
        )}
      </main>

      <AddPropertyModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={createProperty} />
    </div>
  )
}

function PropertyCard({ property: p, onClick, onDelete, deleting }: {
  property: PropertyWithStats
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
  deleting: boolean
}) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md hover:border-[#2563EB]/30 group animate-fade-in relative"
      onClick={onClick}
    >
      {/* Delete button */}
      <button
        onClick={onDelete}
        disabled={deleting}
        className={clsx(
          'absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
          'text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all'
        )}
        title="Delete property"
      >
        {deleting ? <Spinner size={14} /> : <Trash2 size={14} />}
      </button>

      {/* Header strip */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1e4db7] text-white rounded-t-xl px-4 py-3 -mx-5 -mt-5 flex items-center gap-2 mb-4">
        <Building size={18} className="text-[#2563EB]" />
        <h3 className="font-bold text-white text-sm flex-1 truncate">{p.name}</h3>
      </div>

      {/* Location */}
      {p.location && (
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3 ml-0.5">
          <MapPin size={12} className="text-[#2563EB]" />{p.location}
        </div>
      )}

      {/* Stats row */}
      <div className="flex gap-3 text-xs mb-4">
        <StatPill label="Total"    val={p.totalUnits}    color="text-[#2563EB]" />
        <StatPill label="Done"     val={p.completeUnits} color="text-green-600" />
        <StatPill label="Partial"  val={p.partialUnits}  color="text-[#2563EB]" />
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-600 font-medium">Progress</span>
          <span className={clsx('font-bold', p.completionPct === 100 ? 'text-green-600' : 'text-[#2563EB]')}>
            {p.completionPct}%
          </span>
        </div>
        <ProgressBar pct={p.completionPct} color="accent" />
      </div>

      {/* View units link/button */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
        <span className="text-[#1E3A8A] group-hover:text-[#2563EB] font-semibold flex items-center gap-1 transition-colors">
          View units <ChevronRight size={12} className="text-slate-400 group-hover:text-[#2563EB] transition-colors" />
        </span>
      </div>
    </div>
  )
}

function StatPill({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div className="flex flex-col items-center bg-slate-50 rounded-lg px-2.5 py-1.5 flex-1">
      <span className={clsx('font-bold text-sm leading-none', color)}>{val}</span>
      <span className="text-[10px] text-slate-500 mt-0.5">{label}</span>
    </div>
  )
}
