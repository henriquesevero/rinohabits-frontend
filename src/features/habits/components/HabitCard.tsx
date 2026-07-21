import { motion } from 'framer-motion'
import { Check, Pencil, Trash2 } from 'lucide-react'
import type { TodayHabit } from '../types/habit.types'

const WEEKDAY_LABELS: Record<number, string> = {
  1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb', 7: 'Dom',
}

interface HabitCardProps {
  item: TodayHabit
  onToggle: (habitId: string) => void
  onEdit: (habitId: string) => void
  onDelete: (habitId: string) => void
  isScheduledToday?: boolean
}

export function HabitCard({ item, onToggle, onEdit, onDelete, isScheduledToday = true }: HabitCardProps) {
  const { habit, isCompleted, weekCompletions } = item

  function subtitle() {
    if (habit.weeklyFrequency !== null) {
      const quotaAlreadyMet = !isScheduledToday
      const done = quotaAlreadyMet ? habit.weeklyFrequency : (weekCompletions ?? 0)
      return `${done}/${habit.weeklyFrequency} essa semana`
    }
    if (!isScheduledToday) {
      return habit.activeWeekdays.map((d) => WEEKDAY_LABELS[d]).join(' · ')
    }
    return null
  }

  const sub = subtitle()

  return (
    <div
      className="flex w-full items-center gap-2 rounded-xl border border-white/20 bg-white/40 px-4 py-3 backdrop-blur-md transition-colors dark:bg-black/30"
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
          <span className={`text-lg ${!isScheduledToday ? 'opacity-50' : ''}`}>{habit.icon}</span>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${isScheduledToday ? 'text-black/80 dark:text-white/80' : 'text-black/40 dark:text-white/40'}`}>
              {habit.name}
            </span>
            {sub && (
              <span className="text-[10px] text-black/35 dark:text-white/35">{sub}</span>
            )}
          </div>
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
        onClick={() => onEdit(habit.id)}
        title="Editar hábito"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/25 transition-colors hover:bg-[#00E08A]/10 hover:text-[#007a4c] active:bg-[#00E08A]/10 active:text-[#007a4c] dark:hover:text-[#3CFFB0] dark:active:text-[#3CFFB0] dark:text-white/25"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onDelete(habit.id)}
        title="Excluir hábito"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/25 transition-colors hover:bg-red-500/10 hover:text-red-500 active:bg-red-500/10 active:text-red-500 dark:text-white/25"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
