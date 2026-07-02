import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, BookOpen, Flame, GraduationCap, User } from 'lucide-react'
import type { TabKey } from '../../app/tabs'

const TABS = [
  { key: 'habits' as TabKey, label: 'Hábitos', icon: Flame },
  { key: 'stats' as TabKey, label: 'Stats', icon: BarChart3 },
  { key: 'books' as TabKey, label: 'Livros', icon: BookOpen },
  { key: 'courses' as TabKey, label: 'Cursos', icon: GraduationCap },
  { key: 'account' as TabKey, label: 'Conta', icon: User },
]

interface FloatingNavProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function FloatingNav({ active, onChange }: FloatingNavProps) {
  return (
    /*
     * Floating pill — anchored to the visual-viewport bottom via position:fixed.
     * Sitting 20 px above the viewport edge means the home-indicator strip is
     * always visible below it (gradient fading to dark), which looks intentional
     * and premium instead of a "thick stuck bar".
     *
     * No backdrop-filter on this element so there is no containing-block trap.
     * It is a sibling of MacWindow (not a descendant), so the MacWindow's
     * backdrop-blur-xl does not affect its fixed positioning.
     */
    <div
      className="fixed left-1/2 z-50 -translate-x-1/2"
      style={{ bottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
        className="flex items-center gap-0.5 rounded-full border border-white/[0.14] bg-black/70 px-1.5 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <motion.button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors duration-150 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/45 active:bg-white/10 active:text-white/70'
              }`}
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    className="overflow-hidden whitespace-nowrap text-[11px] font-semibold"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
