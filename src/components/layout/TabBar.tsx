import { BarChart3, BookOpen, Flame, GraduationCap, User } from 'lucide-react'
import type { TabKey } from '../../app/tabs'

const TABS: { key: TabKey; label: string; icon: typeof Flame }[] = [
  { key: 'habits', label: 'Hábitos', icon: Flame },
  { key: 'stats', label: 'Stats', icon: BarChart3 },
  { key: 'books', label: 'Livros', icon: BookOpen },
  { key: 'courses', label: 'Cursos', icon: GraduationCap },
  { key: 'account', label: 'Conta', icon: User },
]

interface TabBarProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    /*
     * shrink-0 keeps this in the normal flex flow — the content div (flex-1
     * above) fills all remaining space, and this bar takes only what it needs.
     * Content can never overlap or scroll behind it.
     *
     * bg-[#1c1d3e] matches body background-color exactly.
     * The ~35 px iOS home-indicator strip below the CSS viewport renders in the
     * body colour, so it blends seamlessly with the tab bar — no visible strip.
     *
     * paddingBottom: max(6px, env(safe-area-inset-bottom)) — when viewport-fit=cover
     * activates after a reinstall, this absorbs the safe area automatically.
     */
    <div
      className="flex shrink-0 items-end justify-around border-t border-white/[0.08] bg-white px-1 dark:bg-[#1c1d3e]"
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom, 0px))' }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2"
          >
            <span
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${
                isActive
                  ? 'bg-white/15 dark:bg-white/10'
                  : ''
              }`}
            >
              <Icon
                className={`h-[22px] w-[22px] transition-colors ${
                  isActive
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-black/35 dark:text-white/35'
                }`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-semibold leading-none transition-colors ${
                  isActive
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-black/35 dark:text-white/35'
                }`}
              >
                {label}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
