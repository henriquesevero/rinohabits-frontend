import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTrend } from '../hooks/useTrend'

type TrendPeriod = 'week' | 'month'

const MAX_BAR_HEIGHT_PX = 112

export function TrendChart() {
  const [periodType, setPeriodType] = useState<TrendPeriod>('week')
  const { points, isLoading } = useTrend(periodType, periodType === 'week' ? 8 : 6)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-black/80 dark:text-white/80">Estatísticas</p>
        <div className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
          {(['week', 'month'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriodType(option)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                periodType === option
                  ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                  : 'text-black/50 dark:text-white/50'
              }`}
            >
              {option === 'week' ? 'Semanas' : 'Meses'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-center text-xs text-black/40 dark:text-white/40">Carregando…</p>}

      {!isLoading && (
        <div className="flex w-full items-end gap-2">
          {points.map((point) => {
            const barHeight = (Math.max(point.percentage, 2) / 100) * MAX_BAR_HEIGHT_PX

            return (
              <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-1">
                <motion.div
                  className="w-full rounded-t-md bg-indigo-400"
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <span className="text-[10px] text-black/40 dark:text-white/40">{point.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
