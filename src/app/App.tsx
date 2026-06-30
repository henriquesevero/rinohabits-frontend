import { useEffect, useState } from 'react'
import { Wallpaper } from '../components/layout/Wallpaper'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { AppContent } from './AppContent'

function DebugOverlay() {
  const [info, setInfo] = useState('')
  useEffect(() => {
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;bottom:0;padding-bottom:env(safe-area-inset-bottom,0px)'
    document.body.appendChild(probe)
    const safeBottom = parseInt(getComputedStyle(probe).paddingBottom) || 0
    document.body.removeChild(probe)
    setInfo(
      `ih=${window.innerHeight} sh=${screen.height} dpr=${window.devicePixelRatio} safe=${safeBottom}px`
    )
  }, [])
  if (!info) return null
  return (
    <div style={{
      position: 'fixed', top: 60, left: 8, right: 8, zIndex: 9999,
      background: 'rgba(255,0,0,0.85)', color: '#fff', fontSize: 11,
      padding: '4px 8px', borderRadius: 6, textAlign: 'center', fontFamily: 'monospace',
    }}>
      {info}
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Wallpaper>
          <DebugOverlay />
          <AppContent />
        </Wallpaper>
      </AuthProvider>
    </ThemeProvider>
  )
}
