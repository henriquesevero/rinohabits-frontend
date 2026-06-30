export const WEEKDAYS = [
  { iso: 1, label: 'Seg' },
  { iso: 2, label: 'Ter' },
  { iso: 3, label: 'Qua' },
  { iso: 4, label: 'Qui' },
  { iso: 5, label: 'Sex' },
  { iso: 6, label: 'Sáb' },
  { iso: 7, label: 'Dom' },
]

export const COLOR_PRESETS = [
  '#FF6B6B', '#FF9A3C', '#FFD166', '#06D6A0', '#00C9A7',
  '#4D96FF', '#5C6BC0', '#9D4EDD', '#E91E8C', '#607D8B',
  '#26A69A', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC',
]

export interface HabitFormValue {
  name: string
  icon: string
  color: string
  activeWeekdays: number[]
  monthlyTarget: string
}

interface HabitFormFieldsProps {
  value: HabitFormValue
  onChange: (value: HabitFormValue) => void
}

export function HabitFormFields({ value, onChange }: HabitFormFieldsProps) {
  function toggleWeekday(iso: number) {
    onChange({
      ...value,
      activeWeekdays: value.activeWeekdays.includes(iso)
        ? value.activeWeekdays.filter((d) => d !== iso)
        : [...value.activeWeekdays, iso],
    })
  }

  return (
    <>
      <div className="flex gap-2">
        <input
          value={value.icon}
          onChange={(event) => onChange({ ...value, icon: event.target.value })}
          className="w-12 rounded-lg border border-white/30 bg-white/40 px-2 py-2 text-center text-lg outline-none dark:bg-black/30"
          maxLength={2}
        />
        <input
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
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
              value.activeWeekdays.includes(iso)
                ? 'bg-black/80 text-white dark:bg-white/90 dark:text-black/80'
                : 'bg-white/30 text-black/50 dark:bg-black/20 dark:text-white/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        type="number"
        min={1}
        value={value.monthlyTarget}
        onChange={(event) => onChange({ ...value, monthlyTarget: event.target.value })}
        placeholder="Meta no mês (opcional, ex: 12)"
        className="w-full rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
      />

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
