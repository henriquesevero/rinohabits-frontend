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
     * position:fixed + bottom:0 anchors the bar to the CSS viewport bottom.
     * It is a sibling of MacWindow in the DOM — NOT a descendant of the
     * backdrop-blur-xl element — so the WebKit containing-block bug does not
     * apply and the bar anchors to the viewport correctly.
     *
     * #root has no overflow:hidden (see globals.css), which prevents the
     * other WebKit quirk where overflow:hidden on a fixed element clips its
     * fixed children.
     *
     * Compact height ~44 px: icon (18) + gap (2) + label (13) + py (4+4) + pb (4) = 45 px.
     * bg-[#0f1024] matches body background-color so the iOS home-indicator
     * strip below the viewport renders the same colour — the strip is invisible.
     */
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.08] bg-white/95 px-2 dark:bg-[#0f1024]"
      style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom, 0px))' }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-1 flex-col items-center gap-px rounded-lg py-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-black/90 dark:text-white/90' : 'text-black/40 dark:text-white/40'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 2} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
