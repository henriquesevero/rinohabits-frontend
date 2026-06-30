/**
 * Patch for a WebKit standalone-PWA bug (confirmed on-device): the measured
 * viewport height (window.innerHeight / 100dvh / position:fixed inset:0) is
 * shorter than the real screen, leaving a gap at the very bottom. Instead of
 * trying to compute the "right" height, this element starts exactly where
 * that measurement ends and extends well past the physical screen edge —
 * it gets clipped by the hardware boundary regardless of how wrong the
 * viewport measurement is.
 */
export function SafeAreaFiller() {
  return (
    <div
      className="fixed left-0 w-full bg-white dark:bg-black"
      style={{ top: 'var(--app-height, 100dvh)', height: '200px' }}
    />
  )
}
