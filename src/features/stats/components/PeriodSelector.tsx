import type { PeriodType } from '../types/stats.types'

const OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'year', label: 'Ano' },
]

interface PeriodSelectorProps {
  value: PeriodType
  onChange: (value: PeriodType) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            value === option.value
              ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
              : 'text-black/50 dark:text-white/50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
