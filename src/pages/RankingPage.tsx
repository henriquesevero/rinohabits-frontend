import { motion } from 'framer-motion'
import { Flame, RefreshCw } from 'lucide-react'
import { useRanking } from '../features/gamification/hooks/useRanking'
import { MEDAL_CONFIG, levelTitle, type RankEntry } from '../features/gamification/types/gamification.types'

const RANK_COLORS: Record<number, string> = {
  1: 'text-amber-500 dark:text-amber-400',
  2: 'text-slate-400 dark:text-slate-300',
  3: 'text-amber-700 dark:text-amber-600',
}

export function RankingPage() {
  const { ranking, isLoading } = useRanking()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Ranking</h1>
        <span className="text-xs text-black/40 dark:text-white/40">{ranking.length} jogadores</span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-5 w-5 animate-spin text-black/25 dark:text-white/25" />
        </div>
      )}

      {!isLoading && ranking.length === 0 && (
        <p className="py-12 text-center text-sm text-black/40 dark:text-white/40">Nenhum jogador ainda.</p>
      )}

      {!isLoading && (
        <div className="flex flex-col gap-2">
          {ranking.map((entry, i) => (
            <RankRow key={entry.userId} entry={entry} delay={i * 0.04} />
          ))}
        </div>
      )}
    </div>
  )
}

function RankRow({ entry, delay }: { entry: RankEntry; delay: number }) {
  const medal = MEDAL_CONFIG[entry.monthlyMedal]
  const rankColor = RANK_COLORS[entry.rank] ?? 'text-black/30 dark:text-white/30'
  const isTop3 = entry.rank <= 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        entry.isCurrentUser
          ? 'border-violet-400/40 bg-violet-500/10 dark:bg-violet-400/10'
          : 'border-white/15 bg-white/35 dark:bg-black/20'
      }`}
    >
      <span
        className={`w-6 shrink-0 text-center text-sm font-black ${isTop3 ? rankColor : 'text-black/30 dark:text-white/25'}`}
      >
        {entry.rank}
      </span>

      <Avatar entry={entry} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={`truncate text-sm font-semibold ${
              entry.isCurrentUser ? 'text-violet-700 dark:text-violet-300' : 'text-black/85 dark:text-white/85'
            }`}
          >
            {entry.name}
          </p>
          {entry.isCurrentUser && (
            <span className="shrink-0 text-[9px] font-medium text-violet-500 dark:text-violet-400">você</span>
          )}
          {entry.monthlyMedal !== 'none' && (
            <span className="shrink-0 text-sm" title={medal.label}>{medal.emoji}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-black/40 dark:text-white/40">
            Nv. {entry.level} · {levelTitle(entry.level)}
          </span>
          {entry.currentStreak > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] font-medium text-orange-500 dark:text-orange-400">
              <Flame className="h-3 w-3" strokeWidth={2.5} />
              {entry.currentStreak}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className={`text-base font-black ${isTop3 ? rankColor : 'text-black/70 dark:text-white/60'}`}>
          {entry.totalXP.toLocaleString('pt-BR')}
        </p>
        <p className="text-[10px] text-black/35 dark:text-white/30">XP</p>
      </div>
    </motion.div>
  )
}

function Avatar({ entry }: { entry: RankEntry }) {
  const size = 40

  if (entry.avatarUrl) {
    return (
      <img
        src={entry.avatarUrl}
        alt={entry.name}
        className="shrink-0 rounded-full object-cover ring-2 ring-white/20 dark:ring-white/10"
        style={{ width: size, height: size }}
      />
    )
  }

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']
  let hash = 0
  for (let i = 0; i < entry.name.length; i++) hash = entry.name.charCodeAt(i) + ((hash << 5) - hash)
  const bg = colors[Math.abs(hash) % colors.length]

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white/10"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.38 }}
    >
      {entry.name.charAt(0).toUpperCase()}
    </div>
  )
}
