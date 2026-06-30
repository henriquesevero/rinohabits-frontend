import type { ReactNode } from 'react'

export function Wallpaper({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#7c83fd,_#3a3d98_45%,_#0f1024_100%)] md:p-3">
      {children}
    </div>
  )
}
