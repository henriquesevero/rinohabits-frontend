import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { SplashOverlay } from '../components/ui/SplashOverlay'
import { useAuthContext } from '../context/AuthContext'
import { LockScreen } from '../features/auth/components/LockScreen'
import { HabitsPage } from '../pages/HabitsPage'
import type { TabKey } from './tabs'

const StatsPage = lazy(() => import('../pages/StatsPage').then((m) => ({ default: m.StatsPage })))
const BooksPage = lazy(() => import('../pages/BooksPage').then((m) => ({ default: m.BooksPage })))
const CoursesPage = lazy(() => import('../pages/CoursesPage').then((m) => ({ default: m.CoursesPage })))
const RankingPage = lazy(() => import('../pages/RankingPage').then((m) => ({ default: m.RankingPage })))
const AccountPage = lazy(() => import('../pages/AccountPage').then((m) => ({ default: m.AccountPage })))

const PAGES: Partial<Record<TabKey, ComponentType>> = {
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
const TRANSITION_PHASE_MS = pageTransition.duration * 1000
const TAB_LOCK_BUFFER_MS = 150
const TAB_LOCK_MS = TRANSITION_PHASE_MS * 2 + TAB_LOCK_BUFFER_MS

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabKey>('habits')
  const directionRef = useRef(0)

  const [showSplash, setShowSplash] = useState(true)
  const splashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevAuthRef = useRef<boolean | null>(null)

  // Blocks tab switches mid-transition so a rapid second swipe can't interrupt
  // AnimatePresence's mode="wait" and leave it stuck between pages.
  const tabLockRef = useRef(false)

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
                <Suspense fallback={null}>{renderPage()}</Suspense>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
