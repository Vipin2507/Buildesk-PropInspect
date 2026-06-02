import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2 } from 'lucide-react'
import { clsx } from 'clsx'
import { getProperties, getUnitsByProperty } from '@/utils/db'
import { useUnits } from '@/hooks/useUnits'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/Navbar'
import OfflineBanner from '@/components/OfflineBanner'
import InspectionDialog from '@/components/InspectionDialog'
import { Spinner, ProgressBar } from '@/components/UI'
import type { Property, Unit } from '@/types'

export default function UnitsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [property, setProperty] = useState<Property | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const { units, loading, reload } = useUnits(propertyId ?? null)

  // Load property details from IDB
  useEffect(() => {
    if (!user || !propertyId) return
    getProperties(user.id).then((props) => {
      setProperty(props.find((p) => p.id === propertyId) ?? null)
    })
  }, [propertyId, user])

  const completeCount = units.filter((u) => u.status === 'complete').length
  const partialCount  = units.filter((u) => u.status === 'partial').length
  const pct = units.length ? Math.round((completeCount / units.length) * 100) : 0

  // Group by floor
  const floors = [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <OfflineBanner />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/properties')}
          className="flex items-center gap-1.5 text-sm text-[#1E3A8A] hover:text-[#2563EB] mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={14} /> Back to properties
        </button>

        {/* Property header card */}
        {property && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="bg-gradient-to-br from-[#1E3A8A] to-[#1e3270] rounded-lg p-3 flex-shrink-0">
                <Building2 size={24} className="text-[#2563EB]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-[#1E3A8A]">{property.name}</h1>
                {property.location && <p className="text-sm text-slate-500 mt-1">📍 {property.location}</p>}
                <div className="mt-4 space-y-2 max-w-md">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 font-medium">Handover Progress</span>
                    <span className={clsx('font-bold', pct === 100 ? 'text-green-600' : 'text-[#2563EB]')}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct} color={pct === 100 ? 'success' : 'accent'} />
                </div>
              </div>
              <div className="flex gap-6 sm:flex-col text-center sm:text-right">
                <Stat label="Total"   val={units.length}   color="text-[#2563EB]" />
                <Stat label="Done"    val={completeCount}  color="text-green-600" />
                <Stat label="Partial" val={partialCount}   color="text-[#2563EB]" />
              </div>
            </div>
          </div>
        )}

        {/* Units grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size={32} className="text-[#2563EB]" /></div>
        ) : (
          <div className="space-y-6">
            {floors.map((floor) => {
              const floorUnits = units.filter((u) => u.floor === floor)
              return (
                <div key={floor}>
                  <h3 className="bg-[#EFF6FF] border-l-4 border-[#1E3A8A] text-[#1E3A8A] font-semibold text-sm uppercase tracking-wide px-3 py-2 rounded-r mb-4">
                    Floor {floor}
                  </h3>
                  <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                    {floorUnits.map((u) => (
                      <UnitCard
                        key={u.id}
                        unit={u}
                        onClick={() => setSelectedUnit({ id: u.id, propertyId: u.propertyId, unitNumber: u.unitNumber, floor: u.floor, createdAt: u.createdAt })}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Inspection dialog */}
      <InspectionDialog
        unit={selectedUnit}
        propertyName={property?.name ?? ''}
        onClose={() => setSelectedUnit(null)}
        onSaved={reload}
      />
    </div>
  )
}

function Stat({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div>
      <div className={clsx('text-2xl font-bold leading-none', color)}>{val}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
    </div>
  )
}

function UnitCard({ unit, onClick }: { unit: ReturnType<typeof useUnits>['units'][0]; onClick: () => void }) {
  const { status, unitNumber, pct } = unit
  const colors = {
    complete: { bg: 'bg-blue-50 border-[#2563EB]/40 hover:border-[#2563EB]/60 hover:shadow-md', num: 'text-[#1E3A8A]', dot: 'bg-green-600', bar: 'bg-[#2563EB]' },
    partial:  { bg: 'bg-blue-50 border-[#2563EB]/40 hover:border-[#2563EB]/60 hover:shadow-md', num: 'text-[#1E3A8A]', dot: 'bg-[#2563EB]', bar: 'bg-[#2563EB]' },
    empty:    { bg: 'bg-white border border-slate-200 hover:border-[#2563EB]/50 hover:shadow-md', num: 'text-[#1E3A8A]',  dot: 'bg-slate-300',  bar: 'bg-slate-200' },
  }
  const c = colors[status]

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative border rounded-xl p-4 text-center cursor-pointer transition-all duration-150',
        'hover:shadow-md hover:-translate-y-0.5 active:scale-95',
        c.bg
      )}
    >
      {/* Status dot */}
      <div className={clsx('absolute top-2.5 right-2.5 w-2 h-2 rounded-full', c.dot)} />

      <div className={clsx('text-lg font-bold leading-tight', c.num)}>{unitNumber}</div>
      <div className="text-xs text-slate-500 mt-1 font-semibold">{pct}%</div>
      <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all duration-500', c.bar)} style={{ width: `${pct}%` }} />
      </div>
    </button>
  )
}
