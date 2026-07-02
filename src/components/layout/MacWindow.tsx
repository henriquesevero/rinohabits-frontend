import type { ReactNode } from 'react'

interface MacWindowProps {
  children: ReactNode
  footer?: ReactNode
}

export function MacWindow({ children, footer }: MacWindowProps) {
  return (
    /*
     * min-h-0 is required on this outer div. Without it, a flex-1 child's
     * minimum height resolves to "auto" (its content height), which lets
     * MacWindow expand beyond its parent and pushes the tab bar out of view.
     * With min-h-0 the flex chain compresses correctly at every level.
     */
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 md:px-6"
        style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top, 3.5rem))' }}
      >
        {children}
      </div>
      {footer}
    </div>
  )
}
