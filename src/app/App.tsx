import { MacWindow } from '../components/layout/MacWindow'
import { Wallpaper } from '../components/layout/Wallpaper'
import { AuthProvider } from '../context/AuthContext'
import { AppContent } from './AppContent'

export function App() {
  return (
    <AuthProvider>
      <Wallpaper>
        <MacWindow title="RinoHabits">
          <AppContent />
        </MacWindow>
      </Wallpaper>
    </AuthProvider>
  )
}
