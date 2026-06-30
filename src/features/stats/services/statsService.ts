import { apiClient } from '../../../services/apiClient'
import type {
  CalendarDay,
  CalendarHabit,
  CalendarSummary,
  DailyStatus,
  HabitProgress,
  PeriodOverview,
  PeriodType,
  TrendPoint,
} from '../types/stats.types'

interface HabitProgressApiDto {
  habit_id: string
  name: string
  icon: string
  color: string
  required_count: number
  completed_count: number
  percentage: number
}

interface PeriodOverviewApiDto {
  period_type: PeriodType
  offset: number
  start_date: string
  end_date: string
  overall_percentage: number
  required_total: number
  completed_total: number
  habits: HabitProgressApiDto[]
}

interface TrendPointApiDto {
  label: string
  percentage: number
}

interface CalendarHabitApiDto {
  id: string
  name: string
  icon: string
  color: string
}

interface CalendarDayApiDto {
  date: string
  status: string
  required_count: number
  completed_count: number
  completed_habit_ids: string[]
}

interface DailyStatusApiDto {
  date: string
  required_count: number
  completed_count: number
  percentage: number
}

interface CalendarApiDto {
  days: CalendarDayApiDto[]
  active_days: number
  perfect_days: number
  total_checks: number
  total_habits: number
  habits: CalendarHabitApiDto[]
}

function mapHabitProgress(dto: HabitProgressApiDto): HabitProgress {
  return {
    habitId: dto.habit_id,
    name: dto.name,
    icon: dto.icon,
    color: dto.color,
    requiredCount: dto.required_count,
    completedCount: dto.completed_count,
    percentage: dto.percentage,
  }
}

function mapCalendarDay(dto: CalendarDayApiDto): CalendarDay {
  return {
    date: dto.date,
    status: dto.status as CalendarDay['status'],
    requiredCount: dto.required_count,
    completedCount: dto.completed_count,
    completedHabitIds: dto.completed_habit_ids,
  }
}

function mapCalendarHabit(dto: CalendarHabitApiDto): CalendarHabit {
  return { id: dto.id, name: dto.name, icon: dto.icon, color: dto.color }
}

export const statsService = {
  async getOverview(periodType: PeriodType, offset: number): Promise<PeriodOverview> {
    const { data } = await apiClient.get<PeriodOverviewApiDto>('/stats/overview', {
      params: { period: periodType, offset },
    })
    return {
      periodType: data.period_type,
      offset: data.offset,
      startDate: data.start_date,
      endDate: data.end_date,
      overallPercentage: data.overall_percentage,
      requiredTotal: data.required_total,
      completedTotal: data.completed_total,
      habits: data.habits.map(mapHabitProgress),
    }
  },

  async getTrend(periodType: PeriodType, count: number): Promise<TrendPoint[]> {
    const { data } = await apiClient.get<TrendPointApiDto[]>('/stats/trend', {
      params: { period: periodType, count },
    })
    return data.map((d) => ({ label: d.label, percentage: d.percentage }))
  },

  async getCalendar(year: number, month: number): Promise<CalendarSummary> {
    const { data } = await apiClient.get<CalendarApiDto>('/stats/calendar', { params: { year, month } })
    return {
      days: data.days.map(mapCalendarDay),
      activeDays: data.active_days,
      perfectDays: data.perfect_days,
      totalChecks: data.total_checks,
      totalHabits: data.total_habits,
      habits: data.habits.map(mapCalendarHabit),
    }
  },

  async getDailyBreakdown(periodType: PeriodType, offset: number): Promise<DailyStatus[]> {
    const { data } = await apiClient.get<DailyStatusApiDto[]>('/stats/daily', {
      params: { period: periodType, offset },
    })
    return data.map((d) => ({
      date: d.date,
      requiredCount: d.required_count,
      completedCount: d.completed_count,
      percentage: d.percentage,
    }))
  },
}
