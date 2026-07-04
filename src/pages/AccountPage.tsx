import axios from 'axios'
import md5 from 'blueimp-md5'
import { Bell, BellOff, Camera, KeyRound, Mail, Moon, Sun, Trash2 } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { authService } from '../features/auth/services/authService'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useAuthContext } from '../context/AuthContext'
import { useThemeContext } from '../context/ThemeContext'
import { usePushNotifications } from '../features/notifications/usePushNotifications'
import { accountService } from '../features/profile/services/accountService'

export function AccountPage() {
  const { user, logout, refreshUser } = useAuthContext()
  const { theme, setTheme } = useThemeContext()
  const emailHash = user ? md5(user.email.trim().toLowerCase()) : ''
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=mp&s=128`
  const avatarUrl = user?.avatarUrl ?? gravatarUrl

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingAvatar(true)
    try {
      await authService.uploadAvatar(file)
      await refreshUser()
    } catch {
      // silently ignore
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Minha Conta</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/20 bg-white/40 p-6 backdrop-blur-md dark:bg-black/30">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          className="relative h-20 w-20 shrink-0"
        >
          <img src={avatarUrl} alt={user?.name} className="h-20 w-20 rounded-full border border-white/30 object-cover" />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity hover:opacity-100">
            {isUploadingAvatar ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <div className="text-center">
          <p className="text-sm font-semibold text-black/80 dark:text-white/80">{user?.name}</p>
          <p className="text-xs text-black/50 dark:text-white/50">{user?.email}</p>
          <p className="mt-1 text-[11px] text-black/35 dark:text-white/35">Toque na foto para alterar</p>
        </div>
      </div>

      {/* Aparência */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
        <p className="text-sm font-semibold text-black/80 dark:text-white/80">Aparência</p>
        <div className="flex gap-2 rounded-xl bg-black/5 p-1 dark:bg-white/10">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              theme === 'light' ? 'bg-white text-black/80 shadow-sm' : 'text-black/50 dark:text-white/50'
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            Claro
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              theme === 'dark' ? 'bg-black/60 text-white/90 shadow-sm' : 'text-black/50 dark:text-white/50'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            Escuro
          </button>
        </div>
      </div>

      {/* Notificações */}
      <NotificationSection />

      {/* Alterar e-mail */}
      <ChangeEmailForm currentEmail={user?.email ?? ''} onSuccess={refreshUser} />

      {/* Alterar senha */}
      <ChangePasswordForm />

      {/* Excluir conta */}
      <DeleteAccountSection onDeleted={logout} />

      <button
        type="button"
        onClick={logout}
        className="rounded-lg border border-white/30 px-3 py-1.5 text-xs text-black/60 hover:bg-white/20 dark:text-white/60"
      >
        Sair
      </button>
    </div>
  )
}


function NotificationSection() {
  const { status, subscribe, unsubscribe } = usePushNotifications()

  if (status === 'unsupported') return null

  const isSubscribed = status === 'subscribed'
  const isLoading = status === 'loading'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <div className="flex items-center gap-2">
        {isSubscribed ? (
          <Bell className="h-4 w-4 text-[#007a4c] dark:text-[#3CFFB0]" />
        ) : (
          <BellOff className="h-4 w-4 text-black/50 dark:text-white/50" />
        )}
        <span className="flex-1 text-sm font-semibold text-black/80 dark:text-white/80">Lembretes de hábitos</span>
        <button
          type="button"
          disabled={isLoading || status === 'denied'}
          onClick={() => (isSubscribed ? unsubscribe() : subscribe())}
          className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
            isSubscribed ? 'bg-[#00E08A]' : 'bg-black/20 dark:bg-white/20'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              isSubscribed ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {status === 'denied' && (
        <p className="text-xs text-red-500">
          Permissão negada. Ative as notificações nas configurações do seu celular.
        </p>
      )}

      {isSubscribed && (
        <p className="text-xs text-[#005c35]/70 dark:text-[#3CFFB0]/60">
          Você receberá lembretes às 09h, 15h e 21h quando houver hábitos pendentes.
        </p>
      )}

      {!isSubscribed && status !== 'denied' && (
        <p className="text-xs text-black/40 dark:text-white/40">
          Ative para receber lembretes automáticos ao longo do dia.
        </p>
      )}
    </div>
  )
}

function ChangeEmailForm({ currentEmail, onSuccess }: { currentEmail: string; onSuccess: () => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await accountService.changeEmail(password, newEmail)
      await onSuccess()
      setSuccess(true)
      setNewEmail('')
      setPassword('')
      setTimeout(() => { setIsOpen(false); setSuccess(false) }, 1500)
    } catch (err) {
      setError(resolveError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setError(null) }}
        className="flex w-full items-center gap-2 text-left"
      >
        <Mail className="h-4 w-4 text-black/50 dark:text-white/50" />
        <span className="flex-1 text-sm font-medium text-black/80 dark:text-white/80">Alterar e-mail</span>
        <span className="text-xs text-black/40 dark:text-white/40">{currentEmail}</span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Novo e-mail"
            required
            className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha atual para confirmar"
            required
            className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600 dark:text-emerald-400">E-mail atualizado!</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="flex-1 rounded-lg border border-white/30 px-3 py-2 text-xs text-black/60 dark:text-white/60">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-black/80 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/80">
              Salvar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) {
      setError('Nova senha deve ter pelo menos 8 caracteres.')
      return
    }
    setIsSubmitting(true)
    try {
      await accountService.changePassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => { setIsOpen(false); setSuccess(false) }, 1500)
    } catch (err) {
      setError(resolveError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setError(null) }}
        className="flex w-full items-center gap-2 text-left"
      >
        <KeyRound className="h-4 w-4 text-black/50 dark:text-white/50" />
        <span className="text-sm font-medium text-black/80 dark:text-white/80">Alterar senha</span>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Senha atual"
            required
            className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nova senha (mín. 8 caracteres)"
            required
            className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600 dark:text-emerald-400">Senha atualizada!</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="flex-1 rounded-lg border border-white/30 px-3 py-2 text-xs text-black/60 dark:text-white/60">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-black/80 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/80">
              Salvar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function DeleteAccountSection({ onDeleted }: { onDeleted: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleDelete() {
    setError(null)
    setIsSubmitting(true)
    try {
      await accountService.deleteAccount(password)
      onDeleted()
    } catch (err) {
      setError(resolveError(err))
      setShowConfirm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setError(null) }}
        className="flex w-full items-center gap-2 text-left"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-red-600 dark:text-red-400">Excluir conta</span>
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs text-black/50 dark:text-white/50">
            Esta ação é irreversível. Todos os seus hábitos, livros e cursos serão excluídos permanentemente.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Confirme sua senha"
            className="rounded-lg border border-red-300/40 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-red-400/30 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="flex-1 rounded-lg border border-white/30 px-3 py-2 text-xs text-black/60 dark:text-white/60">
              Cancelar
            </button>
            <button
              type="button"
              disabled={!password || isSubmitting}
              onClick={() => setShowConfirm(true)}
              className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              Excluir conta
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        title="Excluir conta permanentemente"
        description="Tem certeza absoluta? Todos os seus dados serão removidos e não há como recuperá-los."
        confirmLabel="Sim, excluir tudo"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

function resolveError(err: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(err)) {
    return err.response?.data?.error ?? 'Algo deu errado. Tente novamente.'
  }
  return 'Algo deu errado. Tente novamente.'
}
