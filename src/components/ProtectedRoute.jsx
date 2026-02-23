import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PinLockScreen from './PinLockScreen'

function ProtectedRoute() {
  const { user, loading, pinLocked } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-pink-200" />
          <p className="font-['Poppins'] text-sm text-pink-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (pinLocked) {
    return <PinLockScreen />
  }

  return <Outlet />
}

export default ProtectedRoute
