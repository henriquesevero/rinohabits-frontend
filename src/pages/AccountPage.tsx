import md5 from 'blueimp-md5'
import { Moon, Sun } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { useThemeContext } from '../context/ThemeContext'

export function AccountPage() {
  const { user, logout } = useAuthContext()
  const { theme, setTheme } = useThemeContext()
  const emailHash = user ? md5(user.email.trim().toLowerCase()) : ''
  const avatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=mp&s=128`

  return (
    <div className="flex h-full flex-col gap-4">
      <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Minha Conta</h1>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/20 bg-white/40 p-6 backdrop-blur-md dark:bg-black/30">
        <img src={avatarUrl} alt={user?.name} className="h-20 w-20 rounded-full border border-white/30" />
        <div className="text-center">
          <p className="text-sm font-semibold text-black/80 dark:text-white/80">{user?.name}</p>
          <p className="text-xs text-black/50 dark:text-white/50">{user?.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
        <p className="text-sm font-semibold text-black/80 dark:text-white/80">Aparência</p>
        <div className="flex gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/10">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              theme === 'light'
                ? 'bg-white text-black/80 shadow-sm'
                : 'text-black/50 dark:text-white/50'
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            Claro
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-black/60 text-white/90 shadow-sm'
                : 'text-black/50 dark:text-white/50'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            Escuro
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-white/30 p-6 text-center">
        <p className="text-sm text-black/50 dark:text-white/50">
          Em breve: alterar e-mail, alterar senha e excluir conta permanentemente.
        </p>
      </div>

      <button
        onClick={logout}
        className="rounded-lg border border-white/30 px-3 py-1.5 text-xs text-black/60 hover:bg-white/20 dark:text-white/60"
      >
        Sair
      </button>
    </div>
  )
}
