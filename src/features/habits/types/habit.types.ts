export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  activeWeekdays: number[]
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
}
