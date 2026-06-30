import { useLayoutEffect } from 'react'
import { Wallpaper } from '../components/layout/Wallpaper'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { AppContent } from './AppContent'

export function App() {
  // iOS standalone PWA reports wrong dvh on the first CSS frame.
  // We measure the real height via JS before the first paint (useLayoutEffect)
  // and write it into --app-h so all layout uses reliable pixel values.
  useLayoutEffect(() => {
    function update() {
      const h = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-h', `${h}px`)
    }
    update()
    window.visualViewport?.addEventListener('resize', update)
    return () => window.visualViewport?.removeEventListener('resize', update)
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <Wallpaper>
          <AppContent />
        </Wallpaper>
      </AuthProvider>
    </ThemeProvider>
  )
}
