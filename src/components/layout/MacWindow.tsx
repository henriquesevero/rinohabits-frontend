import type { ReactNode } from 'react'

interface MacWindowProps {
  children: ReactNode
  footer?: ReactNode
}

export function MacWindow({ children, footer }: MacWindowProps) {
  return (
    <div className="flex w-full flex-1 flex-col bg-white/70 backdrop-blur-xl dark:bg-black/60">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 md:px-8"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}
      >
        {children}
      </div>
      {footer}
    </div>
  )
}
