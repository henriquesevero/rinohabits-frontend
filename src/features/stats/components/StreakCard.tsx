interface StreakCardProps {
  streak: number
  activeDays: number
  perfectDays: number
  totalChecks: number
}

export function StreakCard({ streak, activeDays, perfectDays, totalChecks }: StreakCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-300/40 bg-gradient-to-br from-amber-300/80 to-orange-400/80 p-4 text-amber-950 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 text-2xl">🔥</div>
        <div>
          <p className="text-xs font-medium text-amber-900/70">Sequência Atual</p>
          <p className="text-2xl font-bold leading-tight">
            {streak} <span className="text-sm font-semibold">{streak === 1 ? 'dia' : 'dias'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-amber-900/15 border-t border-amber-900/15 pt-3 text-center">
        <div>
          <p className="text-lg font-bold">{activeDays}</p>
          <p className="text-[11px] text-amber-900/70">Dias Ativos</p>
        </div>
        <div>
          <p className="text-lg font-bold">{perfectDays}</p>
          <p className="text-[11px] text-amber-900/70">Dias Perfeitos</p>
        </div>
        <div>
          <p className="text-lg font-bold">{totalChecks}</p>
          <p className="text-[11px] text-amber-900/70">Checks</p>
        </div>
      </div>
    </div>
  )
}
