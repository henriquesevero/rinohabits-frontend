import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactElement } from 'react'
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

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuthContext()
  const [activeTab, setActiveTab] = useState<TabKey>('habits')

  const ActivePage = PAGES[activeTab]

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showNav={isAuthenticated && !isLoading}
    >
      <AnimatePresence mode="wait">
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
            key="authenticated"
            initial={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <ActivePage />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
