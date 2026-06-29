import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { TodayHabit } from '../types/habit.types'

interface HabitCardProps {
  item: TodayHabit
  onToggle: (habitId: string) => void
}

export function HabitCard({ item, onToggle }: HabitCardProps) {
  const { habit, isCompleted } = item

  return (
    <motion.button
      type="button"
      onClick={() => onToggle(habit.id)}
      whileTap={{ scale: 0.97 }}
      animate={{ scale: isCompleted ? [1, 1.04, 1] : 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/20 bg-white/40 px-4 py-3 text-left backdrop-blur-md transition-colors dark:bg-black/30"
      style={{ backgroundColor: isCompleted ? `${habit.color}26` : undefined }}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{habit.icon}</span>
        <span className="text-sm font-medium text-black/80 dark:text-white/80">{habit.name}</span>
      </div>

      <motion.span
        initial={false}
        animate={{
          backgroundColor: isCompleted ? habit.color : 'transparent',
          borderColor: isCompleted ? habit.color : 'rgba(0,0,0,0.2)',
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2"
      >
        {isCompleted && <Check className="h-3.5 w-3.5 text-white" />}
      </motion.span>
    </motion.button>
  )
}
