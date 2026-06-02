import { WifiOff } from 'lucide-react'
import { useSyncStore } from '@/store/syncStore'

export default function OfflineBanner() {
  const { isOnline, pendingCount } = useSyncStore()
  if (isOnline) return null
  return (
    <div className="bg-[#1E3A8A] border-b border-[#1E3A8A]/20 px-4 py-3 flex items-center gap-3 text-sm text-white font-medium">
      <WifiOff size={16} className="text-[#3B82F6] flex-shrink-0" />
      <span>
        You're offline. Changes are saved locally
        {pendingCount > 0 && ` — ${pendingCount} change${pendingCount > 1 ? 's' : ''} will sync when connected`}.
      </span>
    </div>
  )
}
