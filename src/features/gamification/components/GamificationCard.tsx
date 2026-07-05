import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import type { GamificationStats } from '../types/gamification.types'
import { MEDAL_CONFIG, levelTitle } from '../types/gamification.types'

interface GamificationCardProps {
  stats: GamificationStats
  onNavigateToRanking?: () => void
}

export function GamificationCard({ stats, onNavigateToRanking }: GamificationCardProps) {
  const pct = stats.xpForNextLevel > 0 ? (stats.xpInCurrentLevel / stats.xpForNextLevel) * 100 : 100
  const medal = MEDAL_CONFIG[stats.monthlyMedal]
  const title = levelTitle(stats.level)

  return (
    <motion.button
      type="button"
      onClick={onNavigateToRanking}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-2xl border border-white/20 bg-white/40 p-4 text-left backdrop-blur-md dark:bg-black/30"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 dark:bg-violet-400/15">
            <span className="text-lg font-black text-violet-600 dark:text-violet-300">{stats.level}</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-black/60 dark:text-white/60">{title}</p>
            <p className="text-[11px] text-black/40 dark:text-white/40">{stats.totalXP.toLocaleString('pt-BR')} XP</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stats.monthlyMedal !== 'none' && (
            <span className="text-xl" title={medal.label}>{medal.emoji}</span>
          )}
          <Zap className="h-4 w-4 text-black/20 dark:text-white/20" />
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] text-black/40 dark:text-white/40">
            {stats.xpInCurrentLevel} / {stats.xpForNextLevel} XP
          </span>
          <span className="text-[10px] text-black/40 dark:text-white/40">
            Nível {stats.level + 1}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <motion.div
            className="h-full rounded-full bg-violet-500 dark:bg-violet-400"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.button>
  )
}
