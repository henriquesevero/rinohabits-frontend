import { apiClient } from '../../../services/apiClient'
import type { CreateHabitPayload, Habit, TodayDashboard, TodayHabit, UpdateHabitPayload } from '../types/habit.types'

interface HabitApiDto {
  id: string
  name: string
  icon: string
  color: string
  active_weekdays: number[]
  weekly_frequency: number | null
  monthly_target: number | null
}

interface TodayHabitApiDto {
  habit: HabitApiDto
  is_completed: boolean
  week_completions: number
}

interface TodayDashboardApiDto {
  date: string
  habits: TodayHabitApiDto[]
  streak: number
}

function mapHabit(dto: HabitApiDto): Habit {
  return {
    id: dto.id,
    name: dto.name,
    icon: dto.icon,
    color: dto.color,
    activeWeekdays: dto.active_weekdays,
    weeklyFrequency: dto.weekly_frequency,
    monthlyTarget: dto.monthly_target,
  }
}

function mapTodayHabit(dto: TodayHabitApiDto): TodayHabit {
  return {
    habit: mapHabit(dto.habit),
    isCompleted: dto.is_completed,
    weekCompletions: dto.week_completions,
  }
}

export const habitService = {
  async getToday(): Promise<TodayDashboard> {
    const { data } = await apiClient.get<TodayDashboardApiDto>('/habits/today')
    return { date: data.date, streak: data.streak, habits: data.habits.map(mapTodayHabit) }
  },

  async listAll(): Promise<Habit[]> {
    const { data } = await apiClient.get<HabitApiDto[]>('/habits')
    return data.map(mapHabit)
  },

  async create(payload: CreateHabitPayload): Promise<Habit> {
    const { data } = await apiClient.post<HabitApiDto>('/habits', {
      name: payload.name,
      icon: payload.icon,
      color: payload.color,
      active_weekdays: payload.activeWeekdays,
      weekly_frequency: payload.weeklyFrequency,
      monthly_target: payload.monthlyTarget,
    })
    return mapHabit(data)
  },

  async update(habitId: string, payload: UpdateHabitPayload): Promise<Habit> {
    const { data } = await apiClient.patch<HabitApiDto>(`/habits/${habitId}`, {
      name: payload.name,
      icon: payload.icon,
      color: payload.color,
      active_weekdays: payload.activeWeekdays,
      weekly_frequency: payload.weeklyFrequency,
      monthly_target: payload.monthlyTarget,
    })
    return mapHabit(data)
  },

  async toggleLog(habitId: string): Promise<boolean> {
    const { data } = await apiClient.post<{ is_completed: boolean }>(`/habits/${habitId}/toggle`)
    return data.is_completed
  },

  async remove(habitId: string): Promise<void> {
    await apiClient.delete(`/habits/${habitId}`)
  },

  async reorder(ids: string[]): Promise<void> {
    await apiClient.patch('/habits/reorder', { ids })
  },
}
