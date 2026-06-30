import type { ReactNode } from 'react'

interface MacWindowProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function MacWindow({ title, children, footer }: MacWindowProps) {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white/70 backdrop-blur-xl dark:bg-black/60 md:h-[95vh] md:max-w-5xl md:rounded-2xl md:border md:border-white/20 md:shadow-2xl">
      <div className="hidden items-center gap-2 border-b border-white/20 px-4 py-3 md:flex">
        <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
        <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
        <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
        <span className="ml-2 text-sm font-medium text-black/60 dark:text-white/60">{title}</span>
      </div>
      <div
        className="flex-1 overflow-y-auto p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] md:p-6 md:pt-6"
        style={footer ? { paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' } : undefined}
      >
        {children}
      </div>
      {footer}
    </div>
  )
}
