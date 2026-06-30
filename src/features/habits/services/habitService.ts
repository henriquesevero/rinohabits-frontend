import { apiClient } from '../../../services/apiClient'
import type { CreateHabitPayload, Habit, TodayDashboard, TodayHabit } from '../types/habit.types'

interface HabitApiDto {
  id: string
  name: string
  icon: string
  color: string
  active_weekdays: number[]
  monthly_target: number | null
}

interface TodayHabitApiDto {
  habit: HabitApiDto
  is_completed: boolean
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
    monthlyTarget: dto.monthly_target,
  }
}

function mapTodayHabit(dto: TodayHabitApiDto): TodayHabit {
  return { habit: mapHabit(dto.habit), isCompleted: dto.is_completed }
}

export const habitService = {
  async getToday(): Promise<TodayDashboard> {
    const { data } = await apiClient.get<TodayDashboardApiDto>('/habits/today')
    return { date: data.date, streak: data.streak, habits: data.habits.map(mapTodayHabit) }
  },

  async create(payload: CreateHabitPayload): Promise<Habit> {
    const { data } = await apiClient.post<HabitApiDto>('/habits', {
      name: payload.name,
      icon: payload.icon,
      color: payload.color,
      active_weekdays: payload.activeWeekdays,
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
}
