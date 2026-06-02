import { useState } from 'react'
import toast from 'react-hot-toast'
import { Building2 } from 'lucide-react'
import { Modal, Input, Button } from './UI'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (data: {
    name: string; location: string; floors: number
    unitsPerFloor: number; unitPrefix: string; startNumber: number
  }) => Promise<unknown>
}

const initial = { name: '', location: '', floors: '', unitsPerFloor: '', unitPrefix: '', startNumber: '101' }

export default function AddPropertyModal({ open, onClose, onCreate }: Props) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.floors || Number(form.floors) < 1) errs.floors = 'Min 1'
    if (!form.unitsPerFloor || Number(form.unitsPerFloor) < 1) errs.unitsPerFloor = 'Min 1'
    if (!form.startNumber || Number(form.startNumber) < 1) errs.startNumber = 'Min 1'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await onCreate({
        name: form.name.trim(),
        location: form.location.trim(),
        floors: Number(form.floors),
        unitsPerFloor: Number(form.unitsPerFloor),
        unitPrefix: form.unitPrefix.trim(),
        startNumber: Number(form.startNumber),
      })
      toast.success(`Property created with ${Number(form.floors) * Number(form.unitsPerFloor)} units`)
      setForm(initial)
      setErrors({})
      onClose()
    } catch {
      toast.error('Failed to create property')
    } finally {
      setSaving(false)
    }
  }

  const totalUnits = (Number(form.floors) || 0) * (Number(form.unitsPerFloor) || 0)
  const preview = form.unitPrefix
    ? `${form.unitPrefix}${form.startNumber || 101}`
    : String(form.startNumber || 101)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <>
          <Building2 className="w-5 h-5 text-[#2563EB]" />
          <span>Add new property</span>
        </>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>Create property</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input label="Property name *" placeholder="e.g. Sunrise Residency" value={form.name} onChange={set('name')} error={errors.name} />
          </div>
          <div className="col-span-2">
            <Input label="Location" placeholder="e.g. Bhopal, MP" value={form.location} onChange={set('location')} />
          </div>
          <Input label="Total floors *" type="number" min="1" max="100" placeholder="e.g. 12" value={form.floors} onChange={set('floors')} error={errors.floors} />
          <Input label="Units per floor *" type="number" min="1" max="50" placeholder="e.g. 4" value={form.unitsPerFloor} onChange={set('unitsPerFloor')} error={errors.unitsPerFloor} />
          <Input label="Unit prefix" placeholder="e.g. A, B (optional)" value={form.unitPrefix} onChange={set('unitPrefix')} />
          <Input label="Starting number *" type="number" min="1" value={form.startNumber} onChange={set('startNumber')} error={errors.startNumber} />
        </div>

        {totalUnits > 0 && (
          <div className="bg-[#EFF6FF] border border-[#1E3A8A]/20 rounded-lg px-4 py-3 text-xs text-slate-700 space-y-0.5 animate-fade-in">
            <p className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2563EB]" /> Preview
            </p>
            <p className="text-slate-600">
              <span className="font-semibold text-[#1E3A8A]">{totalUnits} units</span> will be created across <span className="font-semibold text-[#1E3A8A]">{form.floors} floors</span>
            </p>
            <p className="text-slate-600">First unit: <span className="font-semibold text-[#1E3A8A]">{preview}</span></p>
          </div>
        )}
      </div>
    </Modal>
  )
}
