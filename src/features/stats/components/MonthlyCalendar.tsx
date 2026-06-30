import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarSummary } from '../types/stats.types'

const WEEKDAY_HEADERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

interface MonthlyCalendarProps {
  year: number
  month: number
  summary: CalendarSummary | null
  onPrevious: () => void
  onNext: () => void
}

export function MonthlyCalendar({ year, month, summary, onPrevious, onNext }: MonthlyCalendarProps) {
  const leadingBlanks = new Date(year, month - 1, 1).getDay()
  const todayKey = new Date().toLocaleDateString('en-CA')
  const habitById = new Map(summary?.habits.map((h) => [h.id, h]) ?? [])

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <p className="text-sm font-semibold text-black/80 dark:text-white/80">Calendário Mensal</p>

      <div className="flex items-center justify-between">
        <button type="button" onClick={onPrevious} className="rounded-full p-1 hover:bg-white/30">
          <ChevronLeft className="h-4 w-4 text-black/60 dark:text-white/60" />
        </button>
        <p className="text-sm font-bold text-black/80 dark:text-white/80">
          {MONTH_NAMES[month - 1]} de {year}
        </p>
        <button type="button" onClick={onNext} className="rounded-full p-1 hover:bg-white/30">
          <ChevronRight className="h-4 w-4 text-black/60 dark:text-white/60" />
        </button>
      </div>

      <div className="grid grid-cols-3 divide-x divide-black/10 border-y border-black/10 py-2 text-center dark:divide-white/10 dark:border-white/10">
        <div>
          <p className="text-lg font-bold text-amber-500">{summary?.activeDays ?? 0}</p>
          <p className="text-[11px] text-black/50 dark:text-white/50">Dias Ativos</p>
        </div>
        <div>
          <p className="text-lg font-bold text-emerald-500">{summary?.perfectDays ?? 0}</p>
          <p className="text-[11px] text-black/50 dark:text-white/50">Dias Perfeitos</p>
        </div>
        <div>
          <p className="text-lg font-bold text-black/80 dark:text-white/80">{summary?.totalHabits ?? 0}</p>
          <p className="text-[11px] text-black/50 dark:text-white/50">Total Hábitos</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-black/40 dark:text-white/40">
        {WEEKDAY_HEADERS.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, index) => (
          <div key={`blank-${index}`} />
        ))}

        {summary?.days.map((day) => {
          const dayNumber = Number(day.date.slice(8, 10))
          const isToday = day.date === todayKey

          return (
            <div
              key={day.date}
              className={`flex flex-col items-center gap-0.5 rounded-lg py-1 ${isToday ? 'ring-2 ring-amber-400' : ''} ${
                day.status === 'perfect'
                  ? 'bg-emerald-400/20'
                  : day.status === 'failed'
                    ? 'bg-red-400/15'
                    : 'bg-transparent'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  day.status === 'future' ? 'text-black/25 dark:text-white/25' : 'text-black/70 dark:text-white/70'
                }`}
              >
                {dayNumber}
              </span>
              {day.completedHabitIds.length > 0 && (
                <div className="flex gap-0.5">
                  {day.completedHabitIds.slice(0, 4).map((id) => (
                    <span
                      key={id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: habitById.get(id)?.color ?? '#999' }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-2 dark:border-white/10">
        {summary?.habits.map((h) => (
          <div key={h.id} className="flex items-center gap-1 text-[11px] text-black/50 dark:text-white/50">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
            {h.name.length > 10 ? `${h.name.slice(0, 9)}.` : h.name}
          </div>
        ))}
      </div>
    </div>
  )
}
