import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type FormEvent } from 'react'
import type { Habit, UpdateHabitPayload } from '../types/habit.types'
import { HabitFormFields, type HabitFormValue } from './HabitFormFields'

interface EditHabitModalProps {
  habit: Habit | null
  onSave: (habitId: string, payload: UpdateHabitPayload) => Promise<void>
  onClose: () => void
}

function toFormValue(habit: Habit): HabitFormValue {
  return {
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    activeWeekdays: habit.activeWeekdays,
    weeklyFrequency: habit.weeklyFrequency,
  }
}

export function EditHabitModal({ habit, onSave, onClose }: EditHabitModalProps) {
  const [value, setValue] = useState<HabitFormValue | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (habit) setValue(toFormValue(habit))
  }, [habit])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const hasSchedule = value && (value.weeklyFrequency !== null || value.activeWeekdays.length > 0)
    if (!habit || !value || !value.name || !hasSchedule) return

    setIsSubmitting(true)
    try {
      await onSave(habit.id, {
        name: value.name,
        icon: value.icon,
        color: value.color,
        activeWeekdays: value.activeWeekdays,
        weeklyFrequency: value.weeklyFrequency,
        monthlyTarget: null,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {habit && value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/85 p-6 shadow-2xl backdrop-blur-xl dark:bg-black/85"
          >
            <p className="text-base font-semibold text-black/90 dark:text-white/90">Editar hábito</p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <HabitFormFields value={value} onChange={setValue} />

              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-black/70 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !value.name || (value.weeklyFrequency === null && value.activeWeekdays.length === 0)}
                  className="flex-1 rounded-xl bg-black/80 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/90"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
