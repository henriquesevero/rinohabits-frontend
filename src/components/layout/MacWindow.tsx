import type { ReactNode } from 'react'

interface MacWindowProps {
  children: ReactNode
}

export function MacWindow({ children }: MacWindowProps) {
  return (
    <div className="flex w-full flex-1 flex-col bg-white/70 backdrop-blur-xl dark:bg-black/60">
      {/*
       * Extra bottom padding reserves space for the fixed TabBar.
       * calc(4.5rem + safe-area) ≈ 72 px + home indicator on devices where
       * viewport-fit=cover is active and env() returns a real value.
       */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:px-8 lg:px-12"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}
      >
        {children}
      </div>
    </div>
  )
}
