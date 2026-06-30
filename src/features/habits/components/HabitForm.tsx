import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import type { CreateHabitPayload } from '../types/habit.types'
import { COLOR_PRESETS, HabitFormFields, type HabitFormValue } from './HabitFormFields'

const EMPTY_VALUE: HabitFormValue = {
  name: '',
  icon: '✅',
  color: COLOR_PRESETS[0],
  activeWeekdays: [],
  monthlyTarget: '',
}

interface HabitFormProps {
  onCreate: (payload: CreateHabitPayload) => Promise<void>
  formRef?: React.RefObject<HTMLDivElement | null>
}

export function HabitForm({ onCreate, formRef }: HabitFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<HabitFormValue>(EMPTY_VALUE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleOpen() {
    setIsOpen(true)
    setTimeout(() => {
      const el = formRef?.current ?? containerRef.current
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!value.name || value.activeWeekdays.length === 0) return

    const parsedTarget = Number.parseInt(value.monthlyTarget, 10)

    setIsSubmitting(true)
    try {
      await onCreate({
        name: value.name,
        icon: value.icon,
        color: value.color,
        activeWeekdays: value.activeWeekdays,
        monthlyTarget: Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : null,
      })
      setValue(EMPTY_VALUE)
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/30 px-4 py-2.5 text-sm text-black/50 hover:bg-white/20 dark:text-white/50"
      >
        <Plus className="h-4 w-4" />
        Novo hábito
      </button>
    )
  }

  return (
    <motion.div ref={containerRef} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30"
      >
        <HabitFormFields value={value} onChange={setValue} />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-lg border border-white/30 px-3 py-2 text-xs text-black/60 dark:text-white/60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !value.name || value.activeWeekdays.length === 0}
            className="flex-1 rounded-lg bg-black/80 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/80"
          >
            Criar
          </button>
        </div>
      </form>
    </motion.div>
  )
}
