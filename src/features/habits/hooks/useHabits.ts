import { useCallback, useEffect, useState } from 'react'
import { habitService } from '../services/habitService'
import type { CreateHabitPayload, TodayDashboard, TodayHabit } from '../types/habit.types'

export function useHabits() {
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await habitService.getToday()
      setDashboard(data)
      setError(null)
    } catch {
      setError('Não foi possível carregar seus hábitos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleHabit = useCallback(async (habitId: string) => {
    setDashboard((current) => (current ? applyToggle(current, habitId) : current))

    try {
      const isCompleted = await habitService.toggleLog(habitId)
      setDashboard((current) => (current ? applyToggle(current, habitId, isCompleted) : current))
    } catch {
      setDashboard((current) => (current ? applyToggle(current, habitId) : current))
    }
  }, [])

  const createHabit = useCallback(
    async (payload: CreateHabitPayload) => {
      await habitService.create(payload)
      await refresh()
    },
    [refresh],
  )

  return { dashboard, isLoading, error, toggleHabit, createHabit, refresh }
}

function applyToggle(dashboard: TodayDashboard, habitId: string, forcedValue?: boolean): TodayDashboard {
  return {
    ...dashboard,
    habits: dashboard.habits.map((item: TodayHabit) =>
      item.habit.id === habitId ? { ...item, isCompleted: forcedValue ?? !item.isCompleted } : item,
    ),
  }
}
