import type { ReactNode } from 'react'

export function Wallpaper({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-orange-500 md:flex md:items-center md:justify-center md:p-3">
      {children}
    </div>
  )
}
