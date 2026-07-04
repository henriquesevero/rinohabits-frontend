import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, KeyRound, Loader2, Lock, Mail, User } from 'lucide-react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

function AnimatedLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className}>
      <defs>
        <linearGradient id="al-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#221b3f" />
          <stop offset="0.55" stopColor="#161226" />
          <stop offset="1" stopColor="#0a0913" />
        </linearGradient>
        <radialGradient id="al-sheen" cx="28%" cy="20%" r="65%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id="al-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="al-outer" x1="256" y1="382" x2="256" y2="122" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00C97A" />
          <stop offset="100%" stopColor="#3CFFB0" />
        </linearGradient>
        <linearGradient id="al-mid" x1="256" y1="352" x2="256" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7CFFCB" />
          <stop offset="100%" stopColor="#CBFFE8" />
        </linearGradient>
        <linearGradient id="al-tip" x1="256" y1="286" x2="256" y2="148" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CBFFE8" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="al-tongue" x1="256" y1="340" x2="256" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E08A" stopOpacity="0" />
          <stop offset="100%" stopColor="#3CFFB0" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Squircle background — static */}
      <rect width="512" height="512" rx="124" fill="url(#al-bg)" />
      <rect width="512" height="512" rx="124" fill="url(#al-sheen)" />
      <rect x="8" y="8" width="496" height="496" rx="118" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="2" />

      {/* Animated flame inside */}
      <g filter="url(#al-glow)">
        {/* Outer flame — slow */}
        <motion.path
          d="M256 125 C215 175 170 225 170 290 C170 345 210 382 256 382
             C302 382 342 345 342 290 C342 232 308 206 290 168
             C287 206 268 222 264 196 C262 170 256 148 256 125 Z"
          fill="url(#al-outer)"
          style={{ transformOrigin: '256px 382px' }}
          animate={{
            rotate:  [0, -5,  4, -3,  6, -2,  4, -5,  0],
            scaleX:  [1, 0.89, 1.09, 0.92, 1.07, 0.93, 1.05, 0.90, 1],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.12, 0.27, 0.42, 0.56, 0.68, 0.80, 0.91, 1] }}
        />

        {/* Left tongue */}
        <motion.path
          d="M256 210 C242 238 222 262 220 292 C218 314 230 334 248 338
             C240 322 238 304 244 284 C250 264 256 248 256 230 Z"
          fill="url(#al-tongue)"
          style={{ transformOrigin: '252px 338px' }}
          animate={{
            rotate:  [0, -14,  4, -10,  2, -16,  6, -8,  0],
            scaleY:  [1,  1.18, 0.82, 1.14, 0.88, 1.20, 0.78, 1.10, 1],
            opacity: [0.6, 1, 0.3, 0.9, 0.4, 1, 0.25, 0.85, 0.6],
          }}
          transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut', times: [0, 0.10, 0.24, 0.38, 0.52, 0.64, 0.76, 0.88, 1] }}
        />

        {/* Right tongue */}
        <motion.path
          d="M256 210 C270 238 290 262 292 292 C294 314 282 334 264 338
             C272 322 274 304 268 284 C262 264 256 248 256 230 Z"
          fill="url(#al-tongue)"
          style={{ transformOrigin: '260px 338px' }}
          animate={{
            rotate:  [0,  12, -5,  9, -3,  14, -7,  8,  0],
            scaleY:  [1, 1.14, 0.85, 1.12, 0.84, 1.18, 0.80, 1.08, 1],
            opacity: [0.5, 0.3, 0.95, 0.35, 1, 0.28, 0.9, 0.4, 0.5],
          }}
          transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut', delay: 0.38, times: [0, 0.11, 0.25, 0.40, 0.53, 0.65, 0.77, 0.89, 1] }}
        />

        {/* Mid core — medium */}
        <motion.path
          d="M256 220 C232 254 213 278 213 308 C213 335 232 352 256 352
             C280 352 299 335 299 308 C299 282 282 265 272 246
             C269 265 255 272 254 253 C252 238 256 232 256 220 Z"
          fill="url(#al-mid)"
          style={{ transformOrigin: '256px 352px' }}
          animate={{
            rotate:  [0,  8, -7,  5, -9,  4, -5,  7,  0],
            scaleX:  [1, 1.12, 0.86, 1.10, 0.88, 1.08, 0.91, 1.07, 1],
            scaleY:  [1, 1.07, 0.93, 1.08, 0.92, 1.06, 0.95, 1],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.22, times: [0, 0.11, 0.26, 0.41, 0.55, 0.68, 0.81, 0.92, 1] }}
        />

        {/* Tip — fast flicker */}
        <motion.path
          d="M256 158 C242 186 228 210 228 240 C228 268 240 285 256 286
             C272 285 284 268 284 240 C284 210 270 186 256 158 Z"
          fill="url(#al-tip)"
          style={{ transformOrigin: '256px 286px' }}
          animate={{
            rotate:  [0,  12, -13,  9, -11,  14, -9,  11, -10,  0],
            scaleY:  [1, 1.20, 0.76, 1.18, 0.80, 1.16, 0.82, 1.14, 0.84, 1],
            opacity: [0.9, 1, 0.62, 1, 0.70, 1, 0.65, 1, 0.75, 0.9],
          }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.14, times: [0, 0.10, 0.22, 0.34, 0.46, 0.57, 0.68, 0.78, 0.89, 1] }}
        />
      </g>
    </svg>
  )
}

export function LockScreen() {
  const { mode, setMode, name, setName, email, setEmail, password, setPassword, inviteCode, setInviteCode, error, isSubmitting, submit } =
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
        <AnimatedLogo className="h-20 w-20 drop-shadow-xl" />
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
              key="register-fields"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3">
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
                <div className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/40 px-4 py-2.5 backdrop-blur-md dark:bg-black/30">
                  <KeyRound className="h-4 w-4 text-black/40 dark:text-white/40" />
                  <input
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    placeholder="Código de acesso"
                    className="w-full bg-transparent text-sm text-black/80 outline-none placeholder:text-black/40 dark:text-white/80 dark:placeholder:text-white/40"
                    required
                  />
                </div>
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
