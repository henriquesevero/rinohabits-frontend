import { useEffect, useRef, useState } from 'react'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { HabitsCompleteConfetti } from '../components/ui/HabitsCompleteConfetti'
import { useAuthContext } from '../context/AuthContext'
import { EditHabitModal } from '../features/habits/components/EditHabitModal'
import { HabitForm } from '../features/habits/components/HabitForm'
import { HabitList } from '../features/habits/components/HabitList'
import { TodayHabitsGrid } from '../features/habits/components/TodayHabitsGrid'
import { useHabits } from '../features/habits/hooks/useHabits'
import { StreakCard } from '../features/stats/components/StreakCard'
import { WeeklyHeatmap } from '../features/stats/components/WeeklyHeatmap'
import { useCalendar } from '../features/stats/hooks/useCalendar'

export function HabitsPage() {
  const { user } = useAuthContext()
  const { dashboard, isLoading, error, toggleHabit, createHabit, updateHabit, deleteHabit } = useHabits()
  const { summary } = useCalendar()
  const [isManaging, setIsManaging] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)
  const [habitToEdit, setHabitToEdit] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const wasAllComplete = useRef(false)

  useEffect(() => {
    if (!dashboard) return
    const total = dashboard.habits.length
    const completed = dashboard.habits.filter((h) => h.isCompleted).length
    const isAllComplete = total > 0 && completed === total
    if (isAllComplete && !wasAllComplete.current) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3500)
    }
    wasAllComplete.current = isAllComplete
  }, [dashboard])

  async function handleToggle(habitId: string) {
    await toggleHabit(habitId)
  }

  function handleEditRequest(habitId: string) {
    setHabitToEdit(habitId)
  }

  function handleDeleteRequest(habitId: string) {
    setHabitToDelete(habitId)
  }

  async function handleDeleteConfirm() {
    if (habitToDelete) {
      await deleteHabit(habitToDelete)
      setHabitToDelete(null)
    }
  }

  const habitToDeleteName = dashboard?.habits.find((h) => h.habit.id === habitToDelete)?.habit.name
  const editingHabit = dashboard?.habits.find((h) => h.habit.id === habitToEdit)?.habit ?? null

  return (
    <>
      <HabitsCompleteConfetti show={showConfetti} />

      <EditHabitModal habit={editingHabit} onSave={updateHabit} onClose={() => setHabitToEdit(null)} />

      <ConfirmModal
        isOpen={habitToDelete !== null}
        title="Excluir hábito"
        description={`Tem certeza que deseja excluir "${habitToDeleteName ?? 'este hábito'}"? Todos os registros deste hábito serão perdidos permanentemente.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setHabitToDelete(null)}
      />

      <div className="flex flex-col gap-4">
        <p className="text-sm text-white/50">Olá, {user?.name} 👋</p>

        <StreakCard
          streak={dashboard?.streak ?? 0}
          activeDays={summary?.activeDays ?? 0}
          perfectDays={summary?.perfectDays ?? 0}
          totalChecks={summary?.totalChecks ?? 0}
        />

        {isLoading && <p className="text-center text-sm text-black/50 dark:text-white/50">Carregando hábitos…</p>}
        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        {dashboard && <TodayHabitsGrid habits={dashboard.habits} onToggle={handleToggle} />}

        <button
          type="button"
          onClick={() => setIsManaging((current) => !current)}
          className="text-xs font-medium text-black/50 underline-offset-2 hover:underline dark:text-white/50"
        >
          {isManaging ? 'Ocultar gerenciamento de hábitos' : 'Gerenciar hábitos'}
        </button>

        {isManaging && (
          <div className="flex flex-col gap-3">
            {dashboard && (
              <HabitList
                habits={dashboard.habits}
                onToggle={handleToggle}
                onEdit={handleEditRequest}
                onDelete={handleDeleteRequest}
              />
            )}
          </div>
        )}

        <div ref={formRef}>
          <HabitForm onCreate={createHabit} formRef={formRef} />
        </div>

        <WeeklyHeatmap />
      </div>
    </>
  )
}
