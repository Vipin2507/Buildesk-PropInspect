import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import AuthPage from '@/pages/AuthPage'
import PropertiesPage from '@/pages/PropertiesPage'
import UnitsPage from '@/pages/UnitsPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'
import { useSyncStore } from '@/store/syncStore'

export default function App() {
  const { token, loadMe } = useAuthStore()
  const { refreshPendingCount } = useSyncStore()

  useEffect(() => {
    if (token) {
      loadMe()
      refreshPendingCount()
    }
  }, [token])

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/properties" element={
        <ProtectedRoute><PropertiesPage /></ProtectedRoute>
      } />
      <Route path="/properties/:propertyId" element={
        <ProtectedRoute><UnitsPage /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={token ? '/properties' : '/login'} replace />} />
    </Routes>
  )
}
