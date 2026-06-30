import type { ReactNode } from 'react'

interface MacWindowProps {
  children: ReactNode
  footer?: ReactNode
}

export function MacWindow({ children, footer }: MacWindowProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col bg-white/70 backdrop-blur-xl dark:bg-black/60">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] md:px-6 md:pt-6">
        {children}
      </div>
      {footer}
    </div>
  )
}
