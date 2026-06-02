import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Building2, RefreshCw, Wifi, WifiOff, LogOut, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'
import { Spinner } from './UI'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { isOnline, status, pendingCount, sync, lastSyncedAt } = useSyncStore()
  const navigate = useNavigate()
  const [showUser, setShowUser] = useState(false)

  const handleSync = async () => {
    if (!isOnline) { toast.error('No internet connection'); return }
    const result = await sync()
    if (result.synced > 0)
      toast.success(`Synced ${result.synced} change${result.synced > 1 ? 's' : ''}`)
    else
      toast.success('Already up to date')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 bg-[#1E3A8A] border-b border-[#1E3A8A]/10 h-14 px-4 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <Link to="/properties" className="flex items-center gap-2 no-underline">
        <Building2 className="w-5 h-5 text-[#2563EB]" />
        <span className="text-white font-bold text-lg">Buildesk</span>
        <span className="text-[#2563EB] font-bold text-lg">PropInspect</span>
      </Link>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Connectivity badge */}
        <div className={clsx(
          'hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border',
          isOnline 
            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border-red-500/30'
        )}>
          {isOnline
            ? <Wifi size={12} />
            : <WifiOff size={12} />
          }
          {isOnline ? 'Online' : 'Offline'}
          {pendingCount > 0 && (
            <span className="bg-[#2563EB] text-white rounded-full px-2 py-0.5 text-[10px] font-bold ml-1">
              {pendingCount}
            </span>
          )}
        </div>

        {/* Sync button */}
        <button
          onClick={handleSync}
          disabled={status === 'syncing' || !isOnline}
          title={lastSyncedAt ? `Last synced ${new Date(lastSyncedAt).toLocaleTimeString()}` : 'Sync with server'}
          className={clsx(
            'flex items-center justify-center w-8 h-8 rounded-full transition-all',
            isOnline
              ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
              : 'bg-[#2563EB]/40 text-white/50 cursor-not-allowed'
          )}
        >
          {status === 'syncing'
            ? <Spinner size={14} />
            : <RefreshCw size={14} />
          }
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-6 h-6 bg-[#2563EB] rounded-full flex items-center justify-center">
              <User size={13} className="text-white" />
            </div>
            <span className="text-xs font-medium text-white hidden sm:inline max-w-[100px] truncate">
              {user?.name ?? 'Account'}
            </span>
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
