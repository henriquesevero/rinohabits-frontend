import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState, type ReactElement } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { useAuthContext } from '../context/AuthContext'
import { LockScreen } from '../features/auth/components/LockScreen'
import { AccountPage } from '../pages/AccountPage'
import { BooksPage } from '../pages/BooksPage'
import { CoursesPage } from '../pages/CoursesPage'
import { HabitsPage } from '../pages/HabitsPage'
import { StatsPage } from '../pages/StatsPage'
import type { TabKey } from './tabs'

const PAGES: Record<TabKey, () => ReactElement> = {
  habits: HabitsPage,
  stats: StatsPage,
  books: BooksPage,
  courses: CoursesPage,
  account: AccountPage,
}

const MAIN_TABS: TabKey[] = ['habits', 'stats', 'books', 'courses']

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabKey>('habits')
  // Lazy-mount: pages are only created the first time they're visited.
  // Once mounted, they stay in the DOM — switching tabs is just a CSS class toggle.
  const [mountedTabs, setMountedTabs] = useState<Set<TabKey>>(new Set(['habits']))
  const scrollRef = useRef<HTMLDivElement>(null)

  function changeTab(next: TabKey) {
    // Reset scroll before React re-renders so there's never a flash of wrong position
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setMountedTabs(prev => { const s = new Set(prev); s.add(next); return s })
    setActiveTab(next)
  }

  function handleSwipe(dir: -1 | 1) {
    const currIdx = MAIN_TABS.indexOf(activeTab)
    if (currIdx === -1) return
    const nextIdx = currIdx + dir
    if (nextIdx >= 0 && nextIdx < MAIN_TABS.length) {
      changeTab(MAIN_TABS[nextIdx])
    }
  }

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={changeTab}
      showNav={isAuthenticated && !isLoading}
      onSwipe={isAuthenticated && !isLoading ? handleSwipe : undefined}
      scrollRef={scrollRef}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="flex h-full items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-sm text-white/40">Carregando…</p>
          </motion.div>
        ) : !isAuthenticated ? (
          <motion.div
            key="lock"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <LockScreen />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {(Object.keys(PAGES) as TabKey[]).map((tab) => {
              if (!mountedTabs.has(tab)) return null
              const Page = PAGES[tab]
              return (
                <div key={tab} className={tab !== activeTab ? 'hidden' : ''}>
                  <Page />
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
