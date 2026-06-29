import { LockScreen } from '../features/auth/components/LockScreen'
import { useAuthContext } from '../context/AuthContext'
import { DashboardPage } from '../pages/DashboardPage'

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-black/50 dark:text-white/50">
        Carregando…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LockScreen />
  }

  return <DashboardPage />
}
