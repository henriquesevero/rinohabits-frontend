import { BarChart3, BookOpen, Flame, GraduationCap, User } from 'lucide-react'
import md5 from 'blueimp-md5'
import { useRef, type ReactNode } from 'react'
import type { TabKey } from '../../app/tabs'
import { useAuthContext } from '../../context/AuthContext'

const MAIN_TABS = [
  { key: 'habits' as TabKey, label: 'Hábitos', icon: Flame },
  { key: 'stats' as TabKey, label: 'Status', icon: BarChart3 },
  { key: 'books' as TabKey, label: 'Livros', icon: BookOpen },
  { key: 'courses' as TabKey, label: 'Cursos', icon: GraduationCap },
]

interface AppShellProps {
  children: ReactNode
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  showNav: boolean
  onSwipe?: (dir: -1 | 1) => void
  scrollRef?: React.RefObject<HTMLDivElement | null>
}

export function AppShell({ children, activeTab, onTabChange, showNav, onSwipe, scrollRef }: AppShellProps) {
  const { user } = useAuthContext()
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const firstName = user?.name?.split(' ')[0] ?? ''
  const gravatarUrl = user ? `https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}?d=mp&s=80` : null
  const avatarUrl = user?.avatarUrl ?? gravatarUrl

  function handleTouchStart(e: React.TouchEvent) {
    // Skip swipe tracking if the touch originated inside a horizontally scrollable element
    let el = e.target as HTMLElement | null
    const boundary = e.currentTarget as HTMLElement
    while (el && el !== boundary) {
      if (el.scrollWidth > el.clientWidth) return
      el = el.parentElement
    }
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current || !onSwipe) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2.5) return
    onSwipe(dx < 0 ? 1 : -1)
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div
        className="shrink-0"
        style={{ height: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}
      />

      {showNav && (
        <>
          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between px-5 py-2">
            <span className="text-[17px] font-bold tracking-tight text-black/85 dark:text-white">
              {firstName ? `Olá, ${firstName}` : 'RinoHabits'}
            </span>

            <button
              type="button"
              onClick={() => onTabChange('account')}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                activeTab === 'account'
                  ? 'border-[#00E08A]/60 ring-2 ring-[#00E08A]/40 dark:border-[#3CFFB0]/50 dark:ring-[#3CFFB0]/30'
                  : 'border-black/15 dark:border-white/20'
              }`}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-[18px] w-[18px] text-black/50 dark:text-white/60" strokeWidth={activeTab === 'account' ? 2.5 : 1.8} />
              )}
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
                        ? 'bg-[#00E08A]/20 text-[#007a4c] shadow-[inset_0_1px_0_rgba(0,224,138,0.2)] dark:bg-[#3CFFB0]/15 dark:text-[#3CFFB0] dark:shadow-[inset_0_1px_0_rgba(60,255,176,0.15)]'
                        : 'bg-black/[0.07] text-black/55 dark:bg-white/10 dark:text-white/55 active:bg-black/12 dark:active:bg-white/20'
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

      {/* ── Glass content panel ── */}
      <div
        className="relative min-h-0 flex-1 rounded-t-3xl bg-white/75 backdrop-blur-xl dark:bg-[#050a07]/60"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-black/10 dark:bg-white/15" />

        <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain px-4 pb-10 pt-4">
          {children}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-3xl bg-gradient-to-b from-transparent to-white/90 dark:to-[#050a07]/80" />
      </div>
    </div>
  )
}
