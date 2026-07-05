import { AnimatePresence, motion } from 'framer-motion'

interface XPGainToastProps {
  show: boolean
  xp: number
  label?: string
}

export function XPGainToast({ show, xp, label = 'Dia perfeito!' }: XPGainToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="xp-toast"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2"
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-600/90 px-4 py-2.5 shadow-lg backdrop-blur-md">
            <span className="text-base">⚡</span>
            <div className="text-left">
              <p className="text-xs font-semibold text-violet-100">{label}</p>
              <p className="text-sm font-black text-white">+{xp} XP</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
