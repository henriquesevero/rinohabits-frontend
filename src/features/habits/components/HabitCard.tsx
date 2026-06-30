import { motion } from 'framer-motion'
import { Check, Trash2 } from 'lucide-react'
import type { TodayHabit } from '../types/habit.types'

interface HabitCardProps {
  item: TodayHabit
  onToggle: (habitId: string) => void
  onDelete: (habitId: string) => void
}

export function HabitCard({ item, onToggle, onDelete }: HabitCardProps) {
  const { habit, isCompleted } = item

  return (
    <div
      className="group flex w-full items-center gap-2 rounded-xl border border-white/20 bg-white/40 px-4 py-3 backdrop-blur-md transition-colors dark:bg-black/30"
      style={{ backgroundColor: isCompleted ? `${habit.color}26` : undefined }}
    >
      <motion.button
        type="button"
        onClick={() => onToggle(habit.id)}
        whileTap={{ scale: 0.97 }}
        animate={{ scale: isCompleted ? [1, 1.04, 1] : 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-1 items-center justify-between gap-3 text-left"
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

      <button
        type="button"
        onClick={() => onDelete(habit.id)}
        title="Excluir hábito"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/30 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 dark:text-white/30"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
