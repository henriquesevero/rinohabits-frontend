import { motion } from 'framer-motion'

interface StreakCardProps {
  streak: number
  activeDays: number
  perfectDays: number
  totalChecks: number
}

function AnimatedFlame() {
  return (
    <motion.svg
      viewBox="0 0 512 512"
      className="h-10 w-10 drop-shadow-[0_0_10px_rgba(0,224,138,0.6)]"
      animate={{
        y: [0, -4, 1, -3, 0],
        scaleX: [1, 0.95, 1.03, 0.97, 1],
        rotate: [0, -2, 2, -1, 0],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <defs>
        <linearGradient id="sc-outer" x1="256" y1="378" x2="256" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00E08A" />
          <stop offset="1" stopColor="#3CFFB0" />
        </linearGradient>
        <linearGradient id="sc-inner" x1="256" y1="346" x2="256" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#CFFFE9" />
          <stop offset="1" stopColor="#7CFFCB" />
        </linearGradient>
      </defs>
      <path
        d="M256 122
           C214 176 174 220 174 286
           C174 340 209 380 256 380
           C303 380 338 340 338 286
           C338 236 308 210 290 174
           C287 208 268 222 266 194
           C264 168 256 146 256 122 Z"
        fill="url(#sc-outer)"
      />
      <path
        d="M256 224
           C234 254 216 276 216 306
           C216 332 233 350 256 350
           C279 350 296 332 296 306
           C296 282 280 266 270 246
           C267 264 254 270 253 252
           C252 238 256 232 256 224 Z"
        fill="url(#sc-inner)"
      />
    </motion.svg>
  )
}

export function StreakCard({ streak, activeDays, perfectDays, totalChecks }: StreakCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#00E08A]/25 bg-gradient-to-br from-[#e6f9f1] to-[#cff2e4] p-4 shadow-sm dark:border-[#00E08A]/20 dark:from-[#0c2016] dark:to-[#071209]">
      {/* Glow background */}
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
