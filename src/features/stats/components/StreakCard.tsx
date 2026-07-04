import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface StreakCardProps {
  streak: number
  activeDays: number
  perfectDays: number
  totalChecks: number
}

function AnimatedFlame() {
  const turbRef = useRef<SVGFETurbulenceElement>(null)

  useEffect(() => {
    let frame: number
    let seed = 0
    let last = 0
    function tick(t: number) {
      if (t - last > 55) {
        seed = (seed + 1) % 500
        turbRef.current?.setAttribute('seed', String(seed))
        last = t
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <svg viewBox="0 0 512 512" className="h-10 w-10 drop-shadow-[0_0_14px_rgba(0,224,138,0.75)]">
      <defs>
        <filter id="flame-fx" x="-28%" y="-18%" width="156%" height="136%">
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency="0.022 0.075"
            numOctaves="3"
            seed="0"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <linearGradient id="sc-outer" x1="256" y1="382" x2="256" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E08A" />
          <stop offset="100%" stopColor="#3CFFB0" />
        </linearGradient>
        <linearGradient id="sc-mid" x1="256" y1="352" x2="256" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7CFFCB" />
          <stop offset="100%" stopColor="#CFFFE9" />
        </linearGradient>
        <linearGradient id="sc-tip" x1="256" y1="286" x2="256" y2="158" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CFFFE9" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      <g filter="url(#flame-fx)">
        {/* Outer flame — moves slowest */}
        <motion.path
          d="M256 125 C215 175 170 225 170 290 C170 345 210 382 256 382
             C302 382 342 345 342 290 C342 232 308 206 290 168
             C287 206 268 222 264 196 C262 170 256 148 256 125 Z"
          fill="url(#sc-outer)"
          style={{ transformOrigin: '256px 382px' }}
          animate={{
            rotate: [0, -5, 4, -3, 6, -2, 3, -5, 0],
            scaleX: [1, 0.90, 1.08, 0.93, 1.06, 0.94, 1.04, 0.91, 1],
          }}
          transition={{ duration: 2.7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mid core — medium speed, opposite phase */}
        <motion.path
          d="M256 220 C232 254 213 278 213 308 C213 335 232 352 256 352
             C280 352 299 335 299 308 C299 282 282 265 272 246
             C269 265 255 272 254 253 C252 238 256 232 256 220 Z"
          fill="url(#sc-mid)"
          style={{ transformOrigin: '256px 352px' }}
          animate={{
            rotate: [0, 7, -6, 5, -8, 3, -5, 6, 0],
            scaleX: [1, 1.11, 0.87, 1.09, 0.89, 1.07, 0.91, 1.06, 1],
            scaleY: [1, 1.06, 0.94, 1.07, 0.93, 1.05, 0.96, 1],
          }}
          transition={{ duration: 1.55, repeat: Infinity, ease: 'easeInOut', delay: 0.28 }}
        />

        {/* Tip — fastest, flickering */}
        <motion.path
          d="M256 158 C242 186 228 210 228 240 C228 268 240 285 256 286
             C272 285 284 268 284 240 C284 210 270 186 256 158 Z"
          fill="url(#sc-tip)"
          style={{ transformOrigin: '256px 286px' }}
          animate={{
            rotate: [0, 9, -10, 7, -8, 11, -6, 9, -7, 0],
            scaleY: [1, 1.16, 0.80, 1.19, 0.83, 1.13, 0.86, 1.11, 0.88, 1],
            opacity: [0.88, 1, 0.72, 1, 0.78, 1, 0.70, 1, 0.82, 0.88],
          }}
          transition={{ duration: 0.88, repeat: Infinity, ease: 'easeInOut', delay: 0.14 }}
        />
      </g>
    </svg>
  )
}

export function StreakCard({ streak, activeDays, perfectDays, totalChecks }: StreakCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#00E08A]/25 bg-gradient-to-br from-[#e6f9f1] to-[#cff2e4] p-4 shadow-sm dark:border-[#00E08A]/20 dark:from-[#0c2016] dark:to-[#071209]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#00E08A]/15 blur-2xl dark:bg-[#00E08A]/10" />

      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00E08A]/15 dark:bg-[#00E08A]/10">
          <AnimatedFlame />
        </div>
        <div>
          <p className="text-xs font-medium text-[#005c35]/70 dark:text-[#3CFFB0]/60">Sequência Atual</p>
          <p className="text-2xl font-bold leading-tight text-[#004d2e] dark:text-[#3CFFB0]">
            {streak}{' '}
            <span className="text-sm font-semibold">{streak === 1 ? 'dia' : 'dias'}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 divide-x divide-[#00E08A]/20 border-t border-[#00E08A]/20 pt-3 text-center dark:divide-[#00E08A]/15 dark:border-[#00E08A]/15">
        <div>
          <p className="text-lg font-bold text-[#004d2e] dark:text-[#3CFFB0]">{activeDays}</p>
          <p className="text-[11px] text-[#005c35]/60 dark:text-[#3CFFB0]/50">Dias Ativos</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[#004d2e] dark:text-[#3CFFB0]">{perfectDays}</p>
          <p className="text-[11px] text-[#005c35]/60 dark:text-[#3CFFB0]/50">Dias Perfeitos</p>
        </div>
        <div>
          <p className="text-lg font-bold text-[#004d2e] dark:text-[#3CFFB0]">{totalChecks}</p>
          <p className="text-[11px] text-[#005c35]/60 dark:text-[#3CFFB0]/50">Checks</p>
        </div>
      </div>
    </div>
  )
}
