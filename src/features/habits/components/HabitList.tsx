import type { TodayHabit } from '../types/habit.types'
import { HabitCard } from './HabitCard'

interface HabitListProps {
  habits: TodayHabit[]
  onToggle: (habitId: string) => void
}

export function HabitList({ habits, onToggle }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <p className="text-center text-sm text-black/50 dark:text-white/50">
        Nenhum hábito obrigatório hoje. Adicione um para começar.
      </p>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {habits.map((item) => (
        <HabitCard key={item.habit.id} item={item} onToggle={onToggle} />
      ))}
    </div>
  )
}
