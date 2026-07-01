import type { ReactNode } from 'react'

export function Wallpaper({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Fixed gradient layer — covers the full physical screen (incl. home indicator area) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#7c83fd,_#3a3d98_45%,_#0f1024_100%)]"
      />
      {children}
    </>
  )
}
