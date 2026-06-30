import type { ReactNode } from 'react'

export function Wallpaper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-[radial-gradient(circle_at_top,_#7c83fd,_#3a3d98_45%,_#0f1024_100%)] md:fixed md:inset-0 md:flex md:items-center md:justify-center md:overflow-hidden md:px-3">
      {children}
    </div>
  )
}
