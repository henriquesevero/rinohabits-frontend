import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../features/auth/services/authService'
import { TOKEN_STORAGE_KEY } from '../services/apiClient'
import type { AuthUser, LoginCredentials, RegisterPayload } from '../features/auth/types/auth.types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    authService
      .me()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setIsLoading(false))
  }, [logout])

  // Listen for 401s emitted by the apiClient interceptor
  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { token } = await authService.login(credentials)
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setUser(await authService.me())
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const { token } = await authService.register(payload)
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setUser(await authService.me())
  }, [])

  const refreshUser = useCallback(async () => {
    const updated = await authService.me()
    setUser(updated)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, register, logout, refreshUser }),
    [user, isLoading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
