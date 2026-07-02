import type { ReactNode } from 'react'

interface MacWindowProps {
  children: ReactNode
  footer?: ReactNode
}

export function MacWindow({ children, footer }: MacWindowProps) {
  return (
    /*
     * min-h-0 is mandatory on this outer div. Without it, a flex-1 child's
     * minimum height defaults to "auto" (its content height), which causes
     * MacWindow to grow taller than its parent (Wallpaper) when the page has
     * lots of content. The overflow:hidden on #root then clips the bottom of
     * MacWindow — cutting the tab bar off the screen.
     * With min-h-0, flex layout can shrink MacWindow to fit, the content div
     * (also min-h-0) scrolls internally, and the tab bar stays fully visible.
     */
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white/70 backdrop-blur-xl dark:bg-black/60">
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 md:px-8"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' }}
      >
        {children}
      </div>
      {footer}
    </div>
  )
}
