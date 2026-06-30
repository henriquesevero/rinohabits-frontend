import { SafeAreaFiller } from '../components/layout/SafeAreaFiller'
import { Wallpaper } from '../components/layout/Wallpaper'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { AppContent } from './AppContent'

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Wallpaper>
          <AppContent />
        </Wallpaper>
        <SafeAreaFiller />
      </AuthProvider>
    </ThemeProvider>
  )
}
