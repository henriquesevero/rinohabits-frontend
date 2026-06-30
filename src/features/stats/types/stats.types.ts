export type PeriodType = 'week' | 'month' | 'year'

export interface HabitProgress {
  habitId: string
  name: string
  icon: string
  color: string
  requiredCount: number
  completedCount: number
  percentage: number
}

export interface PeriodOverview {
  periodType: PeriodType
  offset: number
  startDate: string
  endDate: string
  overallPercentage: number
  requiredTotal: number
  completedTotal: number
  habits: HabitProgress[]
}

export interface TrendPoint {
  label: string
  percentage: number
}

export interface DailyStatus {
  date: string
  requiredCount: number
  completedCount: number
  percentage: number
}

export type DayStatus = 'perfect' | 'failed' | 'neutral' | 'future'

export interface CalendarHabit {
  id: string
  name: string
  icon: string
  color: string
}

export interface CalendarDay {
  date: string
  status: DayStatus
  requiredCount: number
  completedCount: number
  completedHabitIds: string[]
}

export interface CalendarSummary {
  days: CalendarDay[]
  activeDays: number
  perfectDays: number
  totalChecks: number
  totalHabits: number
  habits: CalendarHabit[]
}
