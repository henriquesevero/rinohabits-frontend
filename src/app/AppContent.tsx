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

// ordered list used for swipe direction calculation
const MAIN_TABS: TabKey[] = ['habits', 'stats', 'books', 'courses']

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: -dir * 80, opacity: 0 }),
}

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabKey>('habits')
  const direction = useRef(0)

  function changeTab(tab: TabKey) {
    const currIdx = MAIN_TABS.indexOf(activeTab)
    const nextIdx = MAIN_TABS.indexOf(tab)
    // account tab fades (dir=0); moving right in list slides left, moving left slides right
    direction.current = nextIdx === -1 || currIdx === -1 ? 0 : nextIdx > currIdx ? 1 : -1
    setActiveTab(tab)
  }

  function handleSwipe(dir: -1 | 1) {
    const currIdx = MAIN_TABS.indexOf(activeTab)
    if (currIdx === -1) return
    const nextIdx = currIdx + dir
    if (nextIdx >= 0 && nextIdx < MAIN_TABS.length) {
      direction.current = dir
      setActiveTab(MAIN_TABS[nextIdx])
    }
  }

  const ActivePage = PAGES[activeTab]

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={changeTab}
      showNav={isAuthenticated && !isLoading}
      onSwipe={isAuthenticated && !isLoading ? handleSwipe : undefined}
    >
      <AnimatePresence mode="wait" custom={direction.current}>
        {isLoading ? (
          <motion.div
            key="loading"
            className="flex h-full items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm text-white/40">Carregando…</p>
          </motion.div>
        ) : !isAuthenticated ? (
          <motion.div
            key="lock-screen"
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            <LockScreen />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            custom={direction.current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ActivePage />
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
