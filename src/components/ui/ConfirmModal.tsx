import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={onCancel}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:bg-black/80"
          >
            <p className="text-base font-semibold text-black/90 dark:text-white/90">{title}</p>
            <p className="mt-1.5 text-sm text-black/60 dark:text-white/60">{description}</p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-black/70 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${
                  destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-black/80 hover:bg-black dark:bg-white/90 dark:text-black/90'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
