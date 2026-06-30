import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Sparkles, Trophy } from 'lucide-react'
import { useMemo } from 'react'

interface Particle {
  id: number
  x: number
  color: string
  size: number
  angle: number
  speed: number
  delay: number
  emoji?: string
}

const COLORS = ['#FFD166', '#FF9A3C', '#06D6A0', '#4D96FF', '#9D4EDD', '#FF6B6B', '#FFC857']
const EMOJIS = ['📖', '✨', '⭐️', '📚']

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 9 + 5,
    angle: Math.random() * 360,
    speed: Math.random() * 1.2 + 0.6,
    delay: Math.random() * 1.4,
    emoji: Math.random() < 0.22 ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : undefined,
  }))
}

interface BookCompleteCelebrationProps {
  show: boolean
  bookTitle: string | null
  onDismiss: () => void
}

export function BookCompleteCelebration({ show, bookTitle, onDismiss }: BookCompleteCelebrationProps) {
  const particles = useMemo(() => createParticles(70), [bookTitle])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-sm"
          onClick={onDismiss}
        >
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="pointer-events-none absolute flex items-center justify-center rounded-sm"
              style={{
                left: `${p.x}%`,
                width: p.size,
                height: p.emoji ? p.size * 1.6 : p.size * 0.6,
                backgroundColor: p.emoji ? 'transparent' : p.color,
                fontSize: p.emoji ? p.size * 1.6 : undefined,
                rotate: p.angle,
              }}
              initial={{ y: '-10%', opacity: 1 }}
              animate={{
                y: '110vh',
                x: `${(Math.random() - 0.5) * 260}px`,
                rotate: p.angle + 720 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 4.5 / p.speed,
                ease: 'easeIn',
                delay: p.delay,
              }}
            >
              {p.emoji}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute inset-x-0 top-1/3 flex flex-col items-center gap-3 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -6, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg shadow-amber-500/40"
            >
              <Trophy className="h-10 w-10 text-white" />
              <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-amber-200" />
            </motion.div>

            <div className="max-w-xs rounded-2xl border border-white/20 bg-white/85 px-7 py-5 text-center shadow-2xl backdrop-blur-xl dark:bg-black/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Grande conquista</p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-lg font-bold text-black/90 dark:text-white/90">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                Livro concluído!
              </p>
              {bookTitle && (
                <p className="mt-1 truncate text-sm font-medium text-black/70 dark:text-white/70">"{bookTitle}"</p>
              )}
              <p className="mt-2 text-xs text-black/50 dark:text-white/50">
                Mais uma jornada de leitura completa. Continue assim! 🎉
              </p>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full border border-white/30 bg-white/40 px-4 py-1.5 text-xs font-medium text-black/60 backdrop-blur-md hover:bg-white/60 dark:bg-black/30 dark:text-white/60"
            >
              Continuar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
