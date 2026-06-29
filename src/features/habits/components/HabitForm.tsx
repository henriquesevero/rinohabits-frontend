import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { CreateHabitPayload } from '../types/habit.types'

const WEEKDAYS = [
  { iso: 1, label: 'Seg' },
  { iso: 2, label: 'Ter' },
  { iso: 3, label: 'Qua' },
  { iso: 4, label: 'Qui' },
  { iso: 5, label: 'Sex' },
  { iso: 6, label: 'Sáb' },
  { iso: 7, label: 'Dom' },
]

const COLOR_PRESETS = ['#FF6B6B', '#FFD166', '#06D6A0', '#4D96FF', '#9D4EDD']

interface HabitFormProps {
  onCreate: (payload: CreateHabitPayload) => Promise<void>
}

export function HabitForm({ onCreate }: HabitFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('✅')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [activeWeekdays, setActiveWeekdays] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function toggleWeekday(iso: number) {
    setActiveWeekdays((current) => (current.includes(iso) ? current.filter((d) => d !== iso) : [...current, iso]))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name || activeWeekdays.length === 0) return

    setIsSubmitting(true)
    try {
      await onCreate({ name, icon, color, activeWeekdays })
      setName('')
      setIcon('✅')
      setColor(COLOR_PRESETS[0])
      setActiveWeekdays([])
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/30 px-4 py-2.5 text-sm text-black/50 hover:bg-white/20 dark:text-white/50"
      >
        <Plus className="h-4 w-4" />
        Novo hábito
      </button>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30"
    >
      <div className="flex gap-2">
        <input
          value={icon}
          onChange={(event) => setIcon(event.target.value)}
          className="w-12 rounded-lg border border-white/30 bg-white/40 px-2 py-2 text-center text-lg outline-none dark:bg-black/30"
          maxLength={2}
        />
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome do hábito"
          className="flex-1 rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
          required
        />
      </div>

      <div className="flex justify-between gap-1">
        {WEEKDAYS.map(({ iso, label }) => (
          <button
            key={iso}
            type="button"
            onClick={() => toggleWeekday(iso)}
            className={`flex-1 rounded-lg px-1 py-1.5 text-xs font-medium transition-colors ${
              activeWeekdays.includes(iso)
                ? 'bg-black/80 text-white dark:bg-white/90 dark:text-black/80'
                : 'bg-white/30 text-black/50 dark:bg-black/20 dark:text-white/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setColor(preset)}
            className={`h-6 w-6 rounded-full border-2 ${
              color === preset ? 'border-black/60 dark:border-white/80' : 'border-transparent'
            }`}
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>

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
          disabled={isSubmitting || !name || activeWeekdays.length === 0}
          className="flex-1 rounded-lg bg-black/80 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/80"
        >
          Criar
        </button>
      </div>
    </motion.form>
  )
}
