import type { ReactNode } from 'react'

export function Wallpaper({ children }: { children: ReactNode }) {
  return (
    <div className="h-[var(--app-h)] w-full bg-[radial-gradient(circle_at_top,_#7c83fd,_#3a3d98_45%,_#0f1024_100%)]">
      {children}
    </div>
  )
}
