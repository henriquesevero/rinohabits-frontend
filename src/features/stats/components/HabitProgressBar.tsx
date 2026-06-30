import { motion } from 'framer-motion'
import type { HabitProgress } from '../types/stats.types'

export function HabitProgressBar({ progress }: { progress: HabitProgress }) {
  const width = Math.min(progress.percentage, 100)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-black/70 dark:text-white/70">
          <span>{progress.icon}</span>
          {progress.name}
        </span>
        <span className="text-black/50 dark:text-white/50">
          {progress.completedCount}/{progress.requiredCount} · {progress.percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: progress.color }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
