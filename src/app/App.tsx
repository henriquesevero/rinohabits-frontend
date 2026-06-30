import { Wallpaper } from '../components/layout/Wallpaper'
import { AuthProvider } from '../context/AuthContext'
import { AppContent } from './AppContent'

export function App() {
  return (
    <AuthProvider>
      <Wallpaper>
        <AppContent />
      </Wallpaper>
    </AuthProvider>
  )
}
