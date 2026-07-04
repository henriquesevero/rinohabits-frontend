import { motion } from 'framer-motion'
import { useState } from 'react'
import type { TodayHabit } from '../types/habit.types'

interface TodayHabitsGridProps {
  habits: TodayHabit[]
  onToggle: (habitId: string) => void
}

const BURST_ANGLES = Array.from({ length: 8 }, (_, i) => (i * 360) / 8)

function HabitBurst({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Ring pulse */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{ borderColor: color }}
        initial={{ width: 24, height: 24, opacity: 0.9 }}
        animate={{ width: 72, height: 72, opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* Spark particles */}
      {BURST_ANGLES.map((angle) => {
        const rad = (angle * Math.PI) / 180
        return (
          <motion.div
            key={angle}
            className="absolute h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: Math.cos(rad) * 30,
              y: Math.sin(rad) * 30,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

export function TodayHabitsGrid({ habits, onToggle }: TodayHabitsGridProps) {
  const [burstId, setBurstId] = useState<string | null>(null)
  const completed = habits.filter((h) => h.isCompleted).length
  const total = habits.length
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  function handleTap(habitId: string, isCompleted: boolean) {
    if (!isCompleted) {
      setBurstId(habitId)
      setTimeout(() => setBurstId(null), 550)
    }
    onToggle(habitId)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-black/80 dark:text-white/80">Hábitos de Hoje</p>
          <p className="text-xs text-black/50 dark:text-white/50">
            {completed}/{total} completados
          </p>
        </div>
        <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-bold text-black/70 dark:bg-white/10 dark:text-white/70">
          {percentage}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {total === 0 ? (
        <p className="text-center text-xs text-black/40 dark:text-white/40">Nenhum hábito para hoje.</p>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {habits.map(({ habit, isCompleted }) => (
            <button
              key={habit.id}
              type="button"
              onClick={() => handleTap(habit.id, isCompleted)}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="relative flex h-14 w-14 items-center justify-center">
                <motion.span
                  whileTap={{ scale: 0.82 }}
                  animate={
                    isCompleted
                      ? { scale: [1, 1.25, 0.95, 1.08, 1], rotate: [0, -8, 8, -4, 0] }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-colors ${
                    isCompleted ? '' : 'bg-black/5 dark:bg-white/10'
                  }`}
                  style={
                    isCompleted
                      ? {
                          backgroundColor: `${habit.color}33`,
                          boxShadow: `0 0 0 2.5px ${habit.color}, 0 0 16px ${habit.color}55`,
                        }
                      : undefined
                  }
                >
                  {habit.icon}
                </motion.span>

                {burstId === habit.id && <HabitBurst color={habit.color} />}
              </div>

              <span className="line-clamp-2 max-w-[5rem] text-center text-[11px] leading-tight break-words text-black/60 dark:text-white/60">
                {habit.name}
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-black/40 dark:text-white/40">Toque em um hábito para registrar</p>
    </div>
  )
}
