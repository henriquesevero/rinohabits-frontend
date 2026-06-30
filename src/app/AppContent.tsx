import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactElement } from 'react'
import { MacWindow } from '../components/layout/MacWindow'
import { TabBar } from '../components/layout/TabBar'
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

  if (isLoading) {
    return (
      <MacWindow>
        <div className="flex h-full items-center justify-center text-sm text-black/50 dark:text-white/50">
          Carregando…
        </div>
      </MacWindow>
    )
  }

  const ActivePage = PAGES[activeTab]

  return (
    <MacWindow footer={isAuthenticated ? <TabBar active={activeTab} onChange={setActiveTab} /> : undefined}>
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
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
            className="h-full"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="h-full"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <ActivePage />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </MacWindow>
  )
}
