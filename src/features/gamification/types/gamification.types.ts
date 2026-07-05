export type MonthlyMedal = 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'none'

export interface GamificationStats {
  totalXP: number
  level: number
  xpInCurrentLevel: number
  xpForNextLevel: number
  currentStreak: number
  perfectDaysThisMonth: number
  activeDaysThisMonth: number
  monthlyPct: number
  monthlyMedal: MonthlyMedal
  totalPagesRead: number
}

export interface RankEntry {
  userId: string
  name: string
  avatarUrl: string | null
  totalXP: number
  level: number
  currentStreak: number
  monthlyMedal: MonthlyMedal
  rank: number
  isCurrentUser: boolean
}

export const MEDAL_CONFIG: Record<MonthlyMedal, { label: string; emoji: string; color: string }> = {
  diamond: { label: 'Diamante', emoji: '🔥', color: '#00e0ff' },
  platinum: { label: 'Platina',  emoji: '💎', color: '#a78bfa' },
  gold:     { label: 'Ouro',     emoji: '🥇', color: '#f59e0b' },
  silver:   { label: 'Prata',    emoji: '🥈', color: '#94a3b8' },
  bronze:   { label: 'Bronze',   emoji: '🥉', color: '#b45309' },
  none:     { label: '',         emoji: '',   color: 'transparent' },
}

export function levelTitle(level: number): string {
  if (level >= 50) return 'Lenda'
  if (level >= 30) return 'Mestre'
  if (level >= 20) return 'Veterano'
  if (level >= 15) return 'Dedicado'
  if (level >= 10) return 'Praticante'
  if (level >= 5)  return 'Aprendiz'
  return 'Iniciante'
}
