import type { ReactNode } from 'react'

interface MacWindowProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function MacWindow({ title, children, footer }: MacWindowProps) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-white/70 dark:bg-black/60 md:h-full md:max-w-5xl md:overflow-hidden md:rounded-2xl md:border md:border-white/20 md:shadow-2xl md:backdrop-blur-xl">
      {/* iOS WebKit bug: backdrop-filter on an ancestor makes position:fixed children
          anchor to that ancestor instead of the viewport. Blur lives here as a sibling
          of the tab bar so the tab bar's fixed position always refers to the real viewport. */}
      <div className="absolute inset-0 -z-10 backdrop-blur-xl md:hidden" />
      <div className="hidden items-center gap-2 border-b border-white/20 px-4 py-3 md:flex">
        <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
        <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
        <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
        <span className="ml-2 text-sm font-medium text-black/60 dark:text-white/60">{title}</span>
      </div>
      <div className="flex-1 px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:overflow-y-auto md:p-6 md:pt-6">
        {children}
      </div>
      {footer}
    </div>
  )
}
