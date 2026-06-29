import type { ReactNode } from 'react'

interface MacWindowProps {
  title: string
  children: ReactNode
}

export function MacWindow({ title, children }: MacWindowProps) {
  return (
    <div className="mx-auto flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/60 shadow-2xl backdrop-blur-lg dark:bg-black/60">
      <div className="flex items-center gap-2 border-b border-white/20 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
        <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
        <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
        <span className="ml-2 text-sm font-medium text-black/60 dark:text-white/60">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  )
}
