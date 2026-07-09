import { motion } from 'framer-motion'
import { AnimatedLogo } from './AnimatedLogo'

interface SplashOverlayProps {
  message?: string
}

export function SplashOverlay({ message }: SplashOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_top,_#d8f2e6,_#f2fcf6_55%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,_#0c2016,_#08100b_58%,_#050a07_100%)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.05 }}
        className="flex flex-col items-center gap-4"
      >
        <AnimatedLogo className="h-24 w-24 drop-shadow-2xl" />
        <div className="text-center">
          <p className="text-xl font-bold tracking-tight text-black/85 dark:text-white/90">RinoHabits</p>
          {message && (
            <p className="mt-1 text-xs text-black/45 dark:text-white/45">{message}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
