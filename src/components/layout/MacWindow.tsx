import type { ReactNode } from 'react'

interface MacWindowProps {
  children: ReactNode
}

export function MacWindow({ children }: MacWindowProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white/70 backdrop-blur-xl dark:bg-black/60">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 md:px-8"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
          /* 5rem ≈ 80 px clears the floating pill (≈ 54 px) + 20 px gap + breathing room */
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </div>
    </div>
  )
}
