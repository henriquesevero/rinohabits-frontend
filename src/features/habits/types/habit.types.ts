export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  activeWeekdays: number[]
  monthlyTarget: number | null
}

export interface TodayHabit {
  habit: Habit
  isCompleted: boolean
}

export interface TodayDashboard {
  date: string
  habits: TodayHabit[]
  streak: number
}

export interface CreateHabitPayload {
  name: string
  icon: string
  color: string
  activeWeekdays: number[]
  monthlyTarget: number | null
}

export interface UpdateHabitPayload {
  name: string
  icon: string
  color: string
  activeWeekdays: number[]
  monthlyTarget: number | null
}
