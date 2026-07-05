import { apiClient } from '../../../services/apiClient'
import type { GamificationStats, MonthlyMedal, RankEntry } from '../types/gamification.types'

interface GamificationApiDto {
  total_xp: number
  level: number
  xp_in_current_level: number
  xp_for_next_level: number
  current_streak: number
  perfect_days_this_month: number
  active_days_this_month: number
  monthly_pct: number
  monthly_medal: string
  total_pages_read: number
}

interface RankEntryApiDto {
  user_id: string
  name: string
  avatar_url: string | null
  total_xp: number
  level: number
  current_streak: number
  monthly_medal: string
  rank: number
  is_current_user: boolean
}

function mapStats(d: GamificationApiDto): GamificationStats {
  return {
    totalXP:              d.total_xp,
    level:                d.level,
    xpInCurrentLevel:     d.xp_in_current_level,
    xpForNextLevel:       d.xp_for_next_level,
    currentStreak:        d.current_streak,
    perfectDaysThisMonth: d.perfect_days_this_month,
    activeDaysThisMonth:  d.active_days_this_month,
    monthlyPct:           d.monthly_pct,
    monthlyMedal:         d.monthly_medal as MonthlyMedal,
    totalPagesRead:       d.total_pages_read,
  }
}

function mapEntry(d: RankEntryApiDto): RankEntry {
  return {
    userId:        d.user_id,
    name:          d.name,
    avatarUrl:     d.avatar_url,
    totalXP:       d.total_xp,
    level:         d.level,
    currentStreak: d.current_streak,
    monthlyMedal:  d.monthly_medal as MonthlyMedal,
    rank:          d.rank,
    isCurrentUser: d.is_current_user,
  }
}

export const gamificationService = {
  async getMyStats(): Promise<GamificationStats> {
    const { data } = await apiClient.get<GamificationApiDto>('/me/gamification')
    return mapStats(data)
  },

  async getRanking(): Promise<RankEntry[]> {
    const { data } = await apiClient.get<RankEntryApiDto[]>('/gamification/ranking')
    return data.map(mapEntry)
  },
}
