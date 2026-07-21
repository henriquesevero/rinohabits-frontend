import { useCallback, useEffect, useState } from 'react'
import { habitService } from '../services/habitService'
import type { CreateHabitPayload, Habit, TodayDashboard, TodayHabit, UpdateHabitPayload } from '../types/habit.types'

function isIncludedToday(payload: CreateHabitPayload): boolean {
  if (payload.weeklyFrequency !== null) return true
  const day = new Date().getDay()
  const iso = day === 0 ? 7 : day
  return payload.activeWeekdays.includes(iso)
}

async function getTodayWithRetry(): Promise<TodayDashboard> {
  try {
    return await habitService.getToday()
  } catch {
    await new Promise<void>((resolve) => { setTimeout(resolve, 600) })
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

  const refreshSilent = useCallback(async () => {
    try {
      const [data, all] = await Promise.all([getTodayWithRetry(), habitService.listAll()])
      setDashboard(data)
      setAllHabits(all)
    } catch {}
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleHabit = useCallback(async (habitId: string) => {
    setDashboard((current) => (current ? applyToggle(current, habitId) : current))

    try {
      const isCompleted = await habitService.toggleLog(habitId)
      setDashboard((current) => (current ? applyToggle(current, habitId, isCompleted) : current))

      const habit = allHabits.find((h) => h.id === habitId)
      const needsWeekCountSync = habit?.weeklyFrequency !== null && isCompleted
      if (needsWeekCountSync) {
        await refreshSilent()
      }
    } catch {
      setDashboard((current) => (current ? applyToggle(current, habitId) : current))
    }
  }, [allHabits, refreshSilent])

  const createHabit = useCallback(
    async (payload: CreateHabitPayload) => {
      const created = await habitService.create(payload)

      if (isIncludedToday(payload)) {
        setDashboard((current) =>
          current
            ? { ...current, habits: [...current.habits, { habit: created, isCompleted: false, weekCompletions: 0 }] }
            : current,
        )
      }

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

    setAllHabits((current) => {
      const sorted = [...current].sort((a, b) => {
        const ia = idOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER
        const ib = idOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER
        return ia - ib
      })
      return sorted
    })

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

function nextWeekCompletions(item: TodayHabit, isCompleted: boolean): number {
  const current = item.weekCompletions ?? 0
  if (item.habit.weeklyFrequency === null) return current
  return isCompleted ? current + 1 : Math.max(0, current - 1)
}

function hasMetWeeklyQuota(item: TodayHabit): boolean {
  return item.habit.weeklyFrequency !== null && (item.weekCompletions ?? 0) >= item.habit.weeklyFrequency
}

function applyToggle(dashboard: TodayDashboard, habitId: string, forcedValue?: boolean): TodayDashboard {
  const newHabits = dashboard.habits.map((item: TodayHabit) => {
    if (item.habit.id !== habitId) return item
    const newIsCompleted = forcedValue ?? !item.isCompleted
    return { ...item, isCompleted: newIsCompleted, weekCompletions: nextWeekCompletions(item, newIsCompleted) }
  })

  const filtered = newHabits.filter((item) => !hasMetWeeklyQuota(item))

  return { ...dashboard, habits: filtered }
}
