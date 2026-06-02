import React from 'react'
import { clsx } from 'clsx'

// ─── Button ──────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...rest }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]'
  const variants = {
    primary:   'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB]',
    secondary: 'bg-white text-[#1E3A8A] border border-[#1E3A8A] hover:bg-primary-light focus:ring-[#1E3A8A]',
    ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  }
  const sizes = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-sm px-5 py-2.5' }
  return (
    <button disabled={disabled || loading} className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  focusRingColor?: 'primary' | 'accent'
}
export function Input({ label, error, className, focusRingColor = 'accent', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>}
      <input
        className={clsx(
          'w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition-all bg-white text-slate-900',
          'border-slate-200',
          focusRingColor === 'primary'
            ? 'focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20'
            : 'focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'slate'
export function Badge({ color = 'slate', children }: { color?: BadgeColor; children: React.ReactNode }) {
  const colors: Record<BadgeColor, string> = {
    primary: 'bg-blue-100 text-[#2563EB]',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error:   'bg-red-100 text-red-700',
    slate:   'bg-slate-100 text-slate-600',
  }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', colors[color])}>
      {children}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ pct, color = 'accent' }: { pct: number; color?: 'accent' | 'success' | 'error' }) {
  const colors = { accent: 'bg-[#2563EB]', success: 'bg-green-500', error: 'bg-red-500' }
  return (
    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={clsx('h-full rounded-full progress-fill', colors[color])}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={clsx('animate-spin-fast text-[#2563EB]', className)}
      width={size} height={size} viewBox="0 0 24 24" fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
}
export function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={clsx('bg-white rounded-2xl w-full shadow-2xl animate-slide-up', maxWidth)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#1E3A8A] text-white rounded-t-2xl">
          <h2 className="text-base font-bold flex items-center gap-2">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }: {
  icon: string; title: string; subtitle?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mb-4 max-w-xs">{subtitle}</p>}
      {action}
    </div>
  )
}
