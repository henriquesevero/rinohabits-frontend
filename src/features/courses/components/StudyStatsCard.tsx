import { useState } from 'react'
import { useStudyStats } from '../hooks/useStudyStats'

type Period = 'week' | 'month' | 'year'

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
}

export function StudyStatsCard() {
  const [period, setPeriod] = useState<Period>('month')
  const { stats, isLoading } = useStudyStats(period, 0)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-black/80 dark:text-white/80">Cursos</p>
        <div className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                period === p
                  ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                  : 'text-black/50 dark:text-white/50'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-xs text-black/40 dark:text-white/40">Carregando…</p>
      ) : (
        <div className="grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10">
          <div className="flex flex-col items-center gap-0.5 pr-4">
            <p className="text-3xl font-bold text-[#007a4c] dark:text-[#00E08A]">
              {(stats?.hoursStudied ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
            </p>
            <p className="text-xs text-black/50 dark:text-white/50">Horas estudadas</p>
          </div>
          <div className="flex flex-col items-center gap-0.5 pl-4">
            <p className="text-3xl font-bold text-emerald-500">{stats?.coursesFinished ?? 0}</p>
            <p className="text-xs text-black/50 dark:text-white/50">Cursos concluídos</p>
          </div>
        </div>
      )}
    </div>
  )
}
