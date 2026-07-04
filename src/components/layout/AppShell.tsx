import { BarChart3, BookOpen, Flame, GraduationCap, User } from 'lucide-react'
import { useRef, type ReactNode } from 'react'
import type { TabKey } from '../../app/tabs'

const MAIN_TABS = [
  { key: 'habits' as TabKey, label: 'Hábitos', icon: Flame },
  { key: 'stats' as TabKey, label: 'Stats', icon: BarChart3 },
  { key: 'books' as TabKey, label: 'Livros', icon: BookOpen },
  { key: 'courses' as TabKey, label: 'Cursos', icon: GraduationCap },
]

interface AppShellProps {
  children: ReactNode
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  showNav: boolean
  onSwipe?: (dir: -1 | 1) => void
}

export function AppShell({ children, activeTab, onTabChange, showNav, onSwipe }: AppShellProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current || !onSwipe) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    // require 70 px + clearly 2.5:1 horizontal ratio to avoid false triggers
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2.5) return
    onSwipe(dx < 0 ? 1 : -1)
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      {/* top safe-area spacer */}
      <div
        className="shrink-0"
        style={{ height: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}
      />

      {showNav && (
        <>
          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between px-5 py-2">
            <div className="flex items-center gap-2.5">
              <img src="/favicon.svg" alt="" className="h-7 w-7 drop-shadow-lg" />
              <span className="text-[17px] font-bold tracking-tight text-white">RinoHabits</span>
            </div>

            <button
              type="button"
              onClick={() => onTabChange('account')}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                activeTab === 'account'
                  ? 'border-violet-400/50 bg-violet-500/30 text-violet-300'
                  : 'border-white/20 bg-white/10 text-white/60 active:bg-white/20'
              }`}
            >
              <User className="h-[18px] w-[18px]" strokeWidth={activeTab === 'account' ? 2.5 : 1.8} />
            </button>
          </div>

          {/* ── Tab pills ── */}
          <div className="shrink-0 overflow-x-auto px-5 pb-4 pt-1">
            <div className="flex gap-2">
              {MAIN_TABS.map(({ key, label, icon: Icon }) => {
                const isActive = activeTab === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onTabChange(key)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all ${
                      isActive
                        ? 'bg-violet-500 text-white shadow-[0_2px_16px_rgba(109,40,217,0.6)]'
                        : 'bg-white/15 text-white/60 active:bg-white/25 active:text-white/90'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={isActive ? 2.5 : 1.8} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/*
       * Glass content panel — rounded top creates the "sheet" feel.
       * bg-black/35 + backdrop-blur-xl restores the premium glass look that
       * was previously provided by MacWindow's glass panel.
       */}
      <div
        className="relative min-h-0 flex-1 rounded-t-3xl bg-white/60 backdrop-blur-xl dark:bg-black/35"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* subtle top border to frame the glass panel */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-white/20" />

        <div className="h-full overflow-y-auto overscroll-contain px-4 pb-10 pt-4">
          {children}
        </div>

        {/* fade at bottom so content dissolves rather than hard-clips */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-3xl"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(10,8,28,0.6))' }}
        />
      </div>
    </div>
  )
}
