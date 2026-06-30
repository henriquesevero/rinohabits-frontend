import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { usePeriodOverview } from '../hooks/usePeriodOverview'
import type { PeriodOverview, PeriodType } from '../types/stats.types'
import { parseDateOnly } from '../utils/parseDateOnly'
import { HabitProgressBar } from './HabitProgressBar'
import { PeriodSelector } from './PeriodSelector'

export function EvolutionSection() {
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const { overview, isLoading, goToPrevious, goToNext, canGoNext } = usePeriodOverview(periodType)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-black/80 dark:text-white/80">Evolução</p>
        <PeriodSelector value={periodType} onChange={setPeriodType} />
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={goToPrevious} className="rounded-full p-1 hover:bg-white/30">
          <ChevronLeft className="h-4 w-4 text-black/60 dark:text-white/60" />
        </button>
        <span className="text-xs text-black/50 dark:text-white/50">
          {overview ? formatRangeLabel(overview) : '—'}
        </span>
        <button
          type="button"
          onClick={goToNext}
          disabled={!canGoNext}
          className="rounded-full p-1 hover:bg-white/30 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4 text-black/60 dark:text-white/60" />
        </button>
      </div>

      {overview && (
        <p className="text-center text-2xl font-bold text-black/80 dark:text-white/80">
          {overview.overallPercentage.toFixed(0)}%
        </p>
      )}

      {isLoading && <p className="text-center text-xs text-black/40 dark:text-white/40">Carregando…</p>}

      {overview && overview.habits.length === 0 && (
        <p className="text-center text-xs text-black/40 dark:text-white/40">Nenhum hábito cadastrado ainda.</p>
      )}

      <div className="flex flex-col gap-2.5">
        {overview?.habits.map((habitProgress) => (
          <HabitProgressBar key={habitProgress.habitId} progress={habitProgress} />
        ))}
      </div>
    </div>
  )
}

function formatRangeLabel(overview: PeriodOverview): string {
  const start = parseDateOnly(overview.startDate)
  const end = parseDateOnly(overview.endDate)

  if (overview.periodType === 'year') {
    return start.getFullYear().toString()
  }

  if (overview.periodType === 'month') {
    return start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${fmt(start)} – ${fmt(end)}`
}
