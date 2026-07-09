import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { SplashOverlay } from '../components/ui/SplashOverlay'
import { useAuthContext } from '../context/AuthContext'
import { LockScreen } from '../features/auth/components/LockScreen'
import { AccountPage } from '../pages/AccountPage'
import { BooksPage } from '../pages/BooksPage'
import { CoursesPage } from '../pages/CoursesPage'
import { HabitsPage } from '../pages/HabitsPage'
import { RankingPage } from '../pages/RankingPage'
import { StatsPage } from '../pages/StatsPage'
import type { TabKey } from './tabs'

type NoPropsPage = () => ReactElement
const PAGES: Partial<Record<TabKey, NoPropsPage>> = {
  habits:  HabitsPage,
  stats:   StatsPage,
  books:   BooksPage,
  courses: CoursesPage,
  ranking: RankingPage,
  account: AccountPage,
}

const MAIN_TABS: TabKey[] = ['habits', 'stats', 'books', 'courses', 'ranking']

const pageVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -48 : 48, opacity: 0 }),
}

const pageTransition = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }

const SPLASH_DURATION = 2000
// Full exit + enter animation + buffer before allowing another tab switch
const TAB_LOCK_MS = pageTransition.duration * 2000 + 150

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabKey>('habits')
  const directionRef = useRef(0)

  // Start with splash visible on every app load (standard PWA startup behaviour)
  const [showSplash, setShowSplash] = useState(true)
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevAuthRef = useRef<boolean | null>(null)

  // Tab-transition lock — prevents rapid switches from confusing AnimatePresence mode="wait"
  const tabLockRef = useRef(false)

  // Startup splash: dismiss after SPLASH_DURATION
  useEffect(() => {
    splashTimerRef.current = setTimeout(() => setShowSplash(false), SPLASH_DURATION)
    return () => { if (splashTimerRef.current) clearTimeout(splashTimerRef.current) }
  }, [])

  // Login splash: also show when the user explicitly logs in after the app is open
  useEffect(() => {
    if (isLoading) return
    if (prevAuthRef.current === null) {
      prevAuthRef.current = isAuthenticated
      return
    }
    if (!prevAuthRef.current && isAuthenticated) {
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current)
      setShowSplash(true)
      splashTimerRef.current = setTimeout(() => setShowSplash(false), SPLASH_DURATION)
    }
    prevAuthRef.current = isAuthenticated
  }, [isAuthenticated, isLoading])

  function lockTab() {
    tabLockRef.current = true
    setTimeout(() => { tabLockRef.current = false }, TAB_LOCK_MS)
  }

  function changeTab(next: TabKey) {
    if (tabLockRef.current || next === activeTab) return
    lockTab()
    const currIdx = MAIN_TABS.indexOf(activeTab)
    const nextIdx = MAIN_TABS.indexOf(next)
    // account tab is conceptually to the right of all main tabs
    if (nextIdx === -1) directionRef.current = 1
    else if (currIdx === -1) directionRef.current = -1
    else directionRef.current = nextIdx >= currIdx ? 1 : -1
    setActiveTab(next)
  }

  function handleSwipe(dir: -1 | 1) {
    if (tabLockRef.current) return
    const currIdx = MAIN_TABS.indexOf(activeTab)
    if (currIdx === -1) return
    const nextIdx = currIdx + dir
    if (nextIdx >= 0 && nextIdx < MAIN_TABS.length) {
      lockTab()
      directionRef.current = dir
      setActiveTab(MAIN_TABS[nextIdx])
    }
  }

  function renderPage() {
    const Page = PAGES[activeTab]
    return Page ? <Page /> : <HabitsPage />
  }

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={changeTab}
      showNav={isAuthenticated && !isLoading && !showSplash}
      onSwipe={isAuthenticated && !isLoading && !showSplash ? handleSwipe : undefined}
    >
      <AnimatePresence>
        {showSplash && <SplashOverlay key="login-splash" />}
      </AnimatePresence>
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
            <AnimatePresence mode="wait" custom={directionRef.current}>
              <motion.div
                key={activeTab}
                custom={directionRef.current}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTransition}
                className="h-full"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
