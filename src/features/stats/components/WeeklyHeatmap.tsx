import { motion } from 'framer-motion'
import { useDailyBreakdown } from '../hooks/useDailyBreakdown'
import type { DailyStatus } from '../types/stats.types'
import { parseDateOnly } from '../utils/parseDateOnly'

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const MAX_BAR_HEIGHT_PX = 48

function barColor(day: DailyStatus | undefined): string {
  if (!day || day.requiredCount === 0) return 'bg-black/10 dark:bg-white/15'
  if (day.percentage >= 60) return 'bg-emerald-400'
  if (day.percentage >= 40) return 'bg-amber-400'
  return 'bg-red-400'
}

export function WeeklyHeatmap() {
  const { days, isLoading } = useDailyBreakdown('week', 0)

  const activeDays = days.filter((d) => d.requiredCount > 0)
  const average =
    activeDays.length === 0 ? 0 : Math.round(activeDays.reduce((sum, d) => sum + d.percentage, 0) / activeDays.length)

  const byWeekdayIndex = new Map<number, DailyStatus>()
  for (const day of days) {
    const date = parseDateOnly(day.date)
    const index = (date.getDay() + 6) % 7
    byWeekdayIndex.set(index, day)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-black/80 dark:text-white/80">Esta Semana</p>
        <p className="text-xs text-black/50 dark:text-white/50">
          Média <span className="font-bold text-black/80 dark:text-white/80">{average}%</span>
        </p>
      </div>

      {isLoading ? (
        <p className="text-center text-xs text-black/40 dark:text-white/40">Carregando…</p>
      ) : (
        <div className="flex items-end justify-between gap-2">
          {WEEKDAY_LABELS.map((label, index) => {
            const day = byWeekdayIndex.get(index)
            const barHeight = day ? Math.max((day.percentage / 100) * MAX_BAR_HEIGHT_PX, 4) : 4

            return (
              <div key={label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                <motion.div
                  className={`w-full rounded-md ${barColor(day)}`}
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                <span className="text-[10px] text-black/40 dark:text-white/40">{label}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-black/10 pt-2 text-[11px] text-black/50 dark:border-white/10 dark:text-white/50">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> 60%+ Excelente
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> 40-60% Bom
        </div>
      </div>
    </div>
  )
}
