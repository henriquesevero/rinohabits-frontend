import { BarChart3, BookOpen, Flame, GraduationCap, User } from 'lucide-react'
import type { ReactNode } from 'react'
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
}

export function AppShell({ children, activeTab, onTabChange, showNav }: AppShellProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      {/*
       * Safe-area spacer: max(12px, env(safe-area-inset-top)) gives comfortable
       * breathing room below the status bar now, and adapts automatically when
       * viewport-fit=cover activates after a clean reinstall.
       */}
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
              <span className="text-[17px] font-bold tracking-tight text-white/90">
                RinoHabits
              </span>
            </div>

            <button
              type="button"
              onClick={() => onTabChange('account')}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                activeTab === 'account'
                  ? 'border-violet-400/40 bg-violet-500/30 text-violet-300'
                  : 'border-white/[0.12] bg-white/[0.07] text-white/55 active:bg-white/[0.14]'
              }`}
            >
              <User
                className="h-[18px] w-[18px]"
                strokeWidth={activeTab === 'account' ? 2.5 : 1.8}
              />
            </button>
          </div>

          {/* ── Tab pills ── */}
          <div className="shrink-0 overflow-x-auto px-5 pb-3 pt-0.5">
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
                        ? 'bg-violet-500 text-white shadow-[0_2px_14px_rgba(109,40,217,0.55)]'
                        : 'bg-white/[0.09] text-white/55 active:bg-white/[0.15] active:text-white/80'
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

      {/* ── Scrollable content ── */}
      <div className="relative min-h-0 flex-1">
        <div className="h-full overflow-y-auto overscroll-contain px-4 pb-10">
          {children}
        </div>
        {/* fade-out at the bottom so content dissolves instead of hard-clipping */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #0f1024)' }}
        />
      </div>
    </div>
  )
}
