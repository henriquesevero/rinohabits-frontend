import { useAuthContext } from '../context/AuthContext'
import { HabitForm } from '../features/habits/components/HabitForm'
import { HabitList } from '../features/habits/components/HabitList'
import { useHabits } from '../features/habits/hooks/useHabits'

export function DashboardPage() {
  const { user, logout } = useAuthContext()
  const { dashboard, isLoading, error, toggleHabit, createHabit } = useHabits()

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Olá, {user?.name}</h1>
          {dashboard && (
            <p className="text-xs text-black/50 dark:text-white/50">
              🔥 {dashboard.streak} {dashboard.streak === 1 ? 'dia' : 'dias'} de streak
            </p>
          )}
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-white/30 px-3 py-1.5 text-xs text-black/60 hover:bg-white/20 dark:text-white/60"
        >
          Sair
        </button>
      </div>

      {isLoading && <p className="text-center text-sm text-black/50 dark:text-white/50">Carregando hábitos…</p>}
      {error && <p className="text-center text-sm text-red-500">{error}</p>}

      {dashboard && <HabitList habits={dashboard.habits} onToggle={toggleHabit} />}

      <HabitForm onCreate={createHabit} />
    </div>
  )
}
