import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  angle: number
  speed: number
}

const COLORS = ['#FF6B6B', '#FFD166', '#06D6A0', '#4D96FF', '#9D4EDD', '#FF9A3C', '#00C9FF']

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    angle: Math.random() * 360,
    speed: Math.random() * 1.5 + 0.8,
  }))
}

interface HabitsCompleteConfettiProps {
  show: boolean
}

export function HabitsCompleteConfetti({ show }: HabitsCompleteConfettiProps) {
  const [particles] = useState(() => createParticles(48))

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{
                left: `${p.x}%`,
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                rotate: p.angle,
              }}
              initial={{ y: '-10%', opacity: 1 }}
              animate={{
                y: '110vh',
                x: `${(Math.random() - 0.5) * 200}px`,
                rotate: p.angle + 720 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2.5 / p.speed,
                ease: 'easeIn',
                delay: Math.random() * 0.5,
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute inset-x-0 top-1/3 flex flex-col items-center gap-2"
          >
            <div className="rounded-2xl border border-white/20 bg-white/80 px-8 py-5 text-center shadow-2xl backdrop-blur-xl dark:bg-black/80">
              <p className="text-3xl">🎉</p>
              <p className="mt-1 text-lg font-bold text-black/90 dark:text-white/90">Dia perfeito!</p>
              <p className="text-sm text-black/60 dark:text-white/60">Todos os hábitos completados</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
