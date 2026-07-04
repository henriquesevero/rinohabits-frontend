import type { ReactNode } from 'react'

export function Wallpaper({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-[radial-gradient(circle_at_top,_#d8f2e6,_#f2fcf6_55%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,_#0c2016,_#08100b_58%,_#050a07_100%)]">
      {children}
    </div>
  )
}
