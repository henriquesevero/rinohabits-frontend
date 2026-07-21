import { COLOR_PRESETS, WEEKDAYS } from '../constants'
import type { HabitFormValue } from '../types/habit.types'

interface HabitFormFieldsProps {
  value: HabitFormValue
  onChange: (value: HabitFormValue) => void
}

export function HabitFormFields({ value, onChange }: HabitFormFieldsProps) {
  const isFrequency = value.weeklyFrequency !== null

  function toggleWeekday(iso: number) {
    onChange({
      ...value,
      activeWeekdays: value.activeWeekdays.includes(iso)
        ? value.activeWeekdays.filter((d) => d !== iso)
        : [...value.activeWeekdays, iso],
    })
  }

  function switchToFrequency() {
    onChange({ ...value, weeklyFrequency: 3, activeWeekdays: [] })
  }

  function switchToWeekdays() {
    onChange({ ...value, weeklyFrequency: null, activeWeekdays: [] })
  }

  function setFrequency(n: number) {
    onChange({ ...value, weeklyFrequency: Math.min(7, Math.max(1, n)) })
  }

  return (
    <>
      <div className="flex gap-2">
        <input
          value={value.icon}
          onChange={(event) => {
            const segments = [...new Intl.Segmenter().segment(event.target.value)]
            onChange({ ...value, icon: segments[0]?.segment ?? '' })
          }}
          className="w-12 rounded-lg border border-white/30 bg-white/40 px-2 py-2 text-center text-lg outline-none dark:bg-black/30"
        />
        <input
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder="Nome do hábito"
          className="flex-1 rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          required
        />
      </div>

      <div className="flex gap-1 rounded-lg bg-black/5 p-0.5 dark:bg-white/10">
        <button
          type="button"
          onClick={switchToWeekdays}
          className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors ${
            !isFrequency
              ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
              : 'text-black/50 dark:text-white/50'
          }`}
        >
          Dias da semana
        </button>
        <button
          type="button"
          onClick={switchToFrequency}
          className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors ${
            isFrequency
              ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
              : 'text-black/50 dark:text-white/50'
          }`}
        >
          Vezes por semana
        </button>
      </div>

      {isFrequency ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white/30 px-4 py-2.5 dark:border-white/10 dark:bg-black/20">
          <span className="text-xs text-black/60 dark:text-white/60">Frequência semanal</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFrequency((value.weeklyFrequency ?? 1) - 1)}
              disabled={(value.weeklyFrequency ?? 1) <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-sm font-bold text-black/70 disabled:opacity-30 dark:bg-white/10 dark:text-white/70"
            >
              −
            </button>
            <span className="w-16 text-center text-sm font-semibold text-black/80 dark:text-white/80">
              {value.weeklyFrequency}× /sem
            </span>
            <button
              type="button"
              onClick={() => setFrequency((value.weeklyFrequency ?? 1) + 1)}
              disabled={(value.weeklyFrequency ?? 7) >= 7}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-sm font-bold text-black/70 disabled:opacity-30 dark:bg-white/10 dark:text-white/70"
            >
              +
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between gap-1">
          {WEEKDAYS.map(({ iso, label }) => (
            <button
              key={iso}
              type="button"
              onClick={() => toggleWeekday(iso)}
              className={`flex-1 rounded-lg px-1 py-1.5 text-xs font-medium transition-colors ${
                value.activeWeekdays.includes(iso)
                  ? 'bg-black/80 text-white dark:bg-white/90 dark:text-black/80'
                  : 'bg-white/30 text-black/50 dark:bg-black/20 dark:text-white/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange({ ...value, color: preset })}
            className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
              value.color === preset ? 'border-black/60 scale-110 dark:border-white/80' : 'border-transparent'
            }`}
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>
    </>
  )
}
