import { motion } from 'framer-motion'
import { Flame, RefreshCw, Trophy } from 'lucide-react'
import { useRanking } from '../features/gamification/hooks/useRanking'
import { MEDAL_CONFIG, levelTitle, type RankEntry } from '../features/gamification/types/gamification.types'

export function RankingPage() {
  const { ranking, isLoading } = useRanking()

  const top3 = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Ranking</h1>
        <span className="text-xs text-black/40 dark:text-white/40">{ranking.length} jogadores</span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-5 w-5 animate-spin text-black/30 dark:text-white/30" />
        </div>
      )}

      {!isLoading && ranking.length === 0 && (
        <p className="text-center text-sm text-black/40 dark:text-white/40">Nenhum jogador ainda.</p>
      )}

      {!isLoading && top3.length > 0 && <Podium entries={top3} />}

      {!isLoading && rest.length > 0 && (
        <div className="flex flex-col gap-2">
          {rest.map((entry) => (
            <RankRow key={entry.userId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

function Podium({ entries }: { entries: RankEntry[] }) {
  const ordered = [entries[1], entries[0], entries[2]].filter(Boolean)
  const heights = { 0: 'h-24', 1: 'h-32', 2: 'h-20' }
  const positionInOrdered: Record<number, number> = {}
  ordered.forEach((e, i) => { if (e) positionInOrdered[e.rank - 1] = i })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-center gap-3">
        {ordered.map((entry, orderedIdx) => {
          if (!entry) return null
          const isCenter = orderedIdx === 1
          const heightClass = isCenter ? heights[1] : orderedIdx === 0 ? heights[0] : heights[2]

          return (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isCenter ? 0 : 0.1, duration: 0.4 }}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative">
                <Avatar entry={entry} size={isCenter ? 56 : 44} />
                {isCenter && (
                  <Trophy className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 text-amber-400" />
                )}
              </div>

              <div className="text-center">
                <p className={`font-semibold text-black/80 dark:text-white/80 ${isCenter ? 'text-sm' : 'text-xs'}`}>
                  {firstName(entry.name)}
                </p>
                <p className="text-[10px] text-black/40 dark:text-white/40">
                  {entry.totalXP.toLocaleString('pt-BR')} XP
                </p>
              </div>

              <div
                className={`${heightClass} w-full rounded-t-xl flex flex-col items-center justify-start pt-3 ${
                  isCenter
                    ? 'bg-amber-400/20 dark:bg-amber-400/15'
                    : entry.rank === 2
                    ? 'bg-slate-400/15 dark:bg-slate-400/10'
                    : 'bg-amber-700/15 dark:bg-amber-700/10'
                }`}
              >
                <span className={`font-black ${isCenter ? 'text-2xl text-amber-500' : 'text-lg text-black/40 dark:text-white/30'}`}>
                  {entry.rank}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function RankRow({ entry }: { entry: RankEntry }) {
  const medal = MEDAL_CONFIG[entry.monthlyMedal]

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        entry.isCurrentUser
          ? 'border-violet-400/40 bg-violet-500/10 dark:bg-violet-400/10'
          : 'border-white/15 bg-white/30 dark:bg-black/20'
      }`}
    >
      <span className="w-5 text-center text-sm font-bold text-black/40 dark:text-white/30">
        {entry.rank}
      </span>

      <Avatar entry={entry} size={36} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-semibold truncate ${entry.isCurrentUser ? 'text-violet-700 dark:text-violet-300' : 'text-black/80 dark:text-white/80'}`}>
            {entry.name}
            {entry.isCurrentUser && <span className="ml-1 text-[10px] font-normal opacity-60">(você)</span>}
          </p>
          {entry.monthlyMedal !== 'none' && (
            <span className="text-sm">{medal.emoji}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-black/40 dark:text-white/40">
            Nível {entry.level} · {levelTitle(entry.level)}
          </p>
          {entry.currentStreak > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
              <Flame className="h-3 w-3" strokeWidth={2.5} />
              {entry.currentStreak}
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-black/70 dark:text-white/70">
          {entry.totalXP.toLocaleString('pt-BR')}
        </p>
        <p className="text-[10px] text-black/35 dark:text-white/35">XP</p>
      </div>
    </motion.div>
  )
}

function Avatar({ entry, size }: { entry: RankEntry; size: number }) {
  if (entry.avatarUrl) {
    return (
      <img
        src={entry.avatarUrl}
        alt={entry.name}
        className="rounded-full object-cover ring-2 ring-white/30"
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
      className="flex items-center justify-center rounded-full font-bold text-white ring-2 ring-white/20"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.38 }}
    >
      {entry.name.charAt(0).toUpperCase()}
    </div>
  )
}

function firstName(name: string) {
  return name.split(' ')[0]
}
