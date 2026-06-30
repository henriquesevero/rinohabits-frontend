import type { ReactNode } from 'react'

export function Wallpaper({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-[radial-gradient(circle_at_top,_#7c83fd,_#3a3d98_45%,_#000_100%)]">
      {children}
    </div>
  )
}
