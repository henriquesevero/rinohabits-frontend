import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Loader2, Lock, Mail, User } from 'lucide-react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

export function LockScreen() {
  const { mode, setMode, name, setName, email, setEmail, password, setPassword, error, isSubmitting, submit } =
    useAuth()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit()
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-8">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/90 shadow-lg shadow-purple-500/20 backdrop-blur-md">
          <img src="/favicon.svg" alt="RinoHabits" className="h-11 w-11" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-black/85 dark:text-white/90">RinoHabits</h1>
          <p className="mt-0.5 text-xs text-black/45 dark:text-white/45">
            Construa hábitos. Viva melhor. Sem desculpas.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <AnimatePresence initial={false}>
          {mode === 'register' && (
            <motion.div
              key="name"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/40 px-4 py-2.5 backdrop-blur-md dark:bg-black/30">
                <User className="h-4 w-4 text-black/40 dark:text-white/40" />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nome"
                  className="w-full bg-transparent text-sm text-black/80 outline-none placeholder:text-black/40 dark:text-white/80 dark:placeholder:text-white/40"
                  required
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/40 px-4 py-2.5 backdrop-blur-md dark:bg-black/30">
          <Mail className="h-4 w-4 text-black/40 dark:text-white/40" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail"
            className="w-full bg-transparent text-sm text-black/80 outline-none placeholder:text-black/40 dark:text-white/80 dark:placeholder:text-white/40"
            required
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/40 px-4 py-2.5 backdrop-blur-md dark:bg-black/30">
          <Lock className="h-4 w-4 text-black/40 dark:text-white/40" />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha"
            className="w-full bg-transparent text-sm text-black/80 outline-none placeholder:text-black/40 dark:text-white/80 dark:placeholder:text-white/40"
            required
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-red-500"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.96 }}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-black/80 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 dark:bg-white/90 dark:text-black/80"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>

        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-center text-xs text-black/50 underline-offset-2 hover:underline dark:text-white/50"
        >
          {mode === 'login' ? 'Não tem conta? Criar uma agora' : 'Já tem conta? Entrar'}
        </button>
      </form>
    </div>
  )
}
