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
     * shrink-0 keeps this in the normal flex flow at the bottom of MacWindow.
     * No position:fixed needed — the parent flex chain (with min-h-0 at every
     * level) guarantees the tab bar is always fully visible and never clipped.
     * bg-[#0f1024] matches both the gradient's bottom colour stop and the body
     * background-color, so the iOS home-indicator strip below the CSS viewport
     * renders the same colour — the strip is invisible.
     */
    <div
      className="flex shrink-0 items-center justify-around border-t border-white/[0.08] bg-white/95 px-2 dark:bg-[#0f1024]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-black/90 dark:text-white/90' : 'text-black/40 dark:text-white/40'
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
