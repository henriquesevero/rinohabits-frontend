import { useCallback, useEffect, useState } from 'react'
import { habitService } from '../services/habitService'
import type { CreateHabitPayload, Habit, TodayDashboard, TodayHabit, UpdateHabitPayload } from '../types/habit.types'

function isRequiredToday(activeWeekdays: number[]): boolean {
  const day = new Date().getDay()
  const iso = day === 0 ? 7 : day
  return activeWeekdays.includes(iso)
}

async function getTodayWithRetry(): Promise<TodayDashboard> {
  try {
    return await habitService.getToday()
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return await habitService.getToday()
  }
}

export function useHabits() {
  const [dashboard, setDashboard] = useState<TodayDashboard | null>(null)
  const [allHabits, setAllHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const [data, all] = await Promise.all([getTodayWithRetry(), habitService.listAll()])
      setDashboard(data)
      setAllHabits(all)
      setError(null)
    } catch {
      setError('Não foi possível carregar seus hábitos. Tentando novamente…')
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
      const created = await habitService.create(payload)

      if (isRequiredToday(payload.activeWeekdays)) {
        setDashboard((current) =>
          current
            ? { ...current, habits: [...current.habits, { habit: created, isCompleted: false }] }
            : current,
        )
      }

      // refresh() reconciles with the backend (streak, exact day-boundary) but
      // never clears dashboard on failure, so the optimistic entry above
      // stays visible even if this call fails.
      await refresh()
    },
    [refresh],
  )

  const updateHabit = useCallback(
    async (habitId: string, payload: UpdateHabitPayload) => {
      await habitService.update(habitId, payload)
      await refresh()
    },
    [refresh],
  )

  const deleteHabit = useCallback(
    async (habitId: string) => {
      await habitService.remove(habitId)
      await refresh()
    },
    [refresh],
  )

  const reorderHabits = useCallback(async (reorderedIds: string[]) => {
    const idOrder = new Map(reorderedIds.map((id, i) => [id, i]))

    // Optimistic: reorder allHabits (source of truth for the manage list)
    setAllHabits((current) => {
      const sorted = [...current].sort((a, b) => {
        const ia = idOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER
        const ib = idOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER
        return ia - ib
      })
      return sorted
    })

    // Optimistic: keep dashboard.habits in the same relative order too
    setDashboard((current) => {
      if (!current) return current
      const sorted = [...current.habits].sort((a, b) => {
        const ia = idOrder.get(a.habit.id) ?? Number.MAX_SAFE_INTEGER
        const ib = idOrder.get(b.habit.id) ?? Number.MAX_SAFE_INTEGER
        return ia - ib
      })
      return { ...current, habits: sorted }
    })

    await habitService.reorder(reorderedIds)
  }, [])

  return { dashboard, allHabits, isLoading, error, toggleHabit, createHabit, updateHabit, deleteHabit, reorderHabits, refresh }
}

function applyToggle(dashboard: TodayDashboard, habitId: string, forcedValue?: boolean): TodayDashboard {
  return {
    ...dashboard,
    habits: dashboard.habits.map((item: TodayHabit) =>
      item.habit.id === habitId ? { ...item, isCompleted: forcedValue ?? !item.isCompleted } : item,
    ),
  }
}
