import { useState } from 'react'
import axios from 'axios'
import { useAuthContext } from '../../../context/AuthContext'

type Mode = 'login' | 'register'

export function useAuth() {
  const { login, register, isAuthenticated, isLoading, user, logout } = useAuthContext()

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit() {
    setError(null)
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        await register({ name, email, password, timezone })
      }
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    mode,
    setMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    submit,
    isAuthenticated,
    isLoading,
    user,
    logout,
  }
}

function resolveErrorMessage(err: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(err)) {
    return err.response?.data?.error ?? 'Não foi possível autenticar. Tente novamente.'
  }
  return 'Não foi possível autenticar. Tente novamente.'
}
