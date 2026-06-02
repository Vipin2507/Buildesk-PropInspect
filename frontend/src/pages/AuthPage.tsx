import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Building2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Input, Button } from '@/components/UI'

type Tab = 'login' | 'register'

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('login')
  const { login, register, loading } = useAuthStore()
  const navigate = useNavigate()

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  // Register form
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '' })
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(loginForm.email, loginForm.password)
      navigate('/properties')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Invalid credentials')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!regForm.name.trim()) errs.name = 'Required'
    if (!regForm.email.trim()) errs.email = 'Required'
    if (regForm.password.length < 8) errs.password = 'Min 8 characters'
    setRegErrors(errs)
    if (Object.keys(errs).length) return

    try {
      await register(regForm.name, regForm.email, regForm.password)
      navigate('/properties')
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] to-[#1e3270] p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-slide-up">
        {/* Logo area at top of card */}
        <div className="flex flex-col items-center text-center mb-8">
          <Building2 className="w-8 h-8 text-[#2563EB] mb-2 animate-pulse" />
          <div className="flex items-center justify-center gap-1">
            <span className="text-[#1E3A8A] font-bold text-2xl">Buildesk</span>
            <span className="text-[#2563EB] font-bold text-2xl">PropInspect</span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Property Handover Inspection</p>
        </div>

        <div>
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 pb-3 text-sm font-semibold transition-all border-b-2 ${
                  tab === t 
                    ? 'border-[#2563EB] text-[#2563EB]' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                focusRingColor="primary"
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                focusRingColor="primary"
                required
              />
              <Button type="submit" size="lg" loading={loading} className="w-full mt-6 bg-[#2563EB] hover:bg-[#1D4ED8]">
                Sign in →
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full name"
                placeholder="Vipin Sharma"
                value={regForm.name}
                onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
                error={regErrors.name}
                focusRingColor="primary"
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={regForm.email}
                onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                error={regErrors.email}
                focusRingColor="primary"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={regForm.password}
                onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                error={regErrors.password}
                focusRingColor="primary"
              />
              <Button type="submit" size="lg" loading={loading} className="w-full mt-6 bg-[#2563EB] hover:bg-[#1D4ED8]">
                Create account →
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
